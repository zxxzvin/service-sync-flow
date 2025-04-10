import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // In seconds
  notes?: string;
  personInCharge?: string;
  songList?: string[];
}

export interface Service {
  id: string;
  title: string;
  date: string;
  items: ServiceItem[];
  editableBy: string[]; // Array of user IDs who can edit this service
  createdBy: string;
}

export interface TimerState {
  isRunning: boolean;
  currentItemId: string | null;
  startTime: number | null;
  elapsedTime: number;
}

interface ServiceContextType {
  services: Service[];
  currentService: Service | null;
  timer: TimerState;
  createService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Omit<Service, 'id'>>) => void;
  deleteService: (id: string) => void;
  selectService: (id: string | null) => void;
  addServiceItem: (item: Omit<ServiceItem, 'id'>) => void;
  updateServiceItem: (id: string, item: Partial<Omit<ServiceItem, 'id'>>) => void;
  deleteServiceItem: (id: string) => void;
  startTimer: (itemId: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToItem: (itemId: string) => void;
  canEditService: (serviceId: string) => boolean;
  addEditorToService: (serviceId: string, userId: string) => void;
  removeEditorFromService: (serviceId: string, userId: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Mock service data
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Sunday Morning Service',
    date: '2025-04-14',
    items: [
      {
        id: '101',
        title: 'Welcome & Announcements',
        description: 'Brief welcome and weekly announcements',
        duration: 300, // 5 minutes
        personInCharge: 'Pastor John'
      },
      {
        id: '102',
        title: 'Opening Prayer',
        duration: 120, // 2 minutes
        personInCharge: 'Elder Sarah'
      },
      {
        id: '103',
        title: 'Worship Set',
        description: 'Praise and worship',
        duration: 1200, // 20 minutes
        personInCharge: 'Worship Leader Mike',
        songList: ['How Great Is Our God', 'Good Good Father', 'Way Maker']
      },
      {
        id: '104',
        title: 'Scripture Reading',
        duration: 300, // 5 minutes
        personInCharge: 'Deacon Rachel'
      },
      {
        id: '105',
        title: 'Sermon',
        description: 'Main message',
        duration: 1800, // 30 minutes
        personInCharge: 'Pastor John',
        notes: 'Topic: Grace and Mercy'
      },
      {
        id: '106',
        title: 'Closing Song & Prayer',
        duration: 300, // 5 minutes
        personInCharge: 'Worship Leader Mike',
        songList: ['Amazing Grace']
      }
    ],
    editableBy: ['1', '2'], // Admin and Planner can edit
    createdBy: '1'
  }
];

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    currentItemId: null,
    startTime: null,
    elapsedTime: 0
  });

  // Subscribe to real-time timer updates when current service is selected
  useEffect(() => {
    if (!currentService) return;
    
    // Subscribe to timer_state changes for the current service
    const channel = supabase
      .channel('timer_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_state',
          filter: `service_id=eq.${currentService.id}`
        },
        async (payload) => {
          // Get the updated timer state
          if (payload.new) {
            const newTimerState = payload.new as any;
            
            // Convert to our timer state format
            let updatedTimer: TimerState = {
              isRunning: newTimerState.is_running,
              currentItemId: newTimerState.current_item_id,
              startTime: newTimerState.is_running ? Date.now() - (newTimerState.elapsed_time * 1000) : null,
              elapsedTime: newTimerState.elapsed_time
            };
            
            // Update local timer state without triggering more database updates
            setTimer(updatedTimer);
          }
        }
      )
      .subscribe();
    
    // Get initial timer state
    const fetchTimerState = async () => {
      const { data, error } = await supabase
        .from('timer_state')
        .select('*')
        .eq('service_id', currentService.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching timer state:', error);
        return;
      }
      
      if (data) {
        // Set initial timer state
        setTimer({
          isRunning: data.is_running,
          currentItemId: data.current_item_id,
          startTime: data.is_running ? Date.now() - (data.elapsed_time * 1000) : null,
          elapsedTime: data.elapsed_time
        });
      } else {
        // Create initial timer state for this service
        await supabase.from('timer_state').insert({
          service_id: currentService.id,
          is_running: false,
          current_item_id: null,
          elapsed_time: 0
        });
      }
    };
    
    fetchTimerState();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentService]);

  // Timer update interval - only for displaying correct time locally
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning && timer.startTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timer.startTime) / 1000);
        
        setTimer(prev => ({
          ...prev,
          elapsedTime: elapsed
        }));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  const createService = (service: Omit<Service, 'id'>) => {
    if (!user) return;
    
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      editableBy: [user.id],
      createdBy: user.id
    };
    
    setServices(prev => [...prev, newService]);
    toast({
      title: "Service created",
      description: `${newService.title} has been created successfully.`
    });
  };

  const updateService = (id: string, serviceUpdate: Partial<Omit<Service, 'id'>>) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, ...serviceUpdate } 
          : service
      )
    );
    
    if (currentService?.id === id) {
      setCurrentService(prev => prev ? { ...prev, ...serviceUpdate } : null);
    }
    
    toast({
      title: "Service updated",
      description: "The service details have been updated."
    });
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
    
    if (currentService?.id === id) {
      setCurrentService(null);
    }
    
    toast({
      title: "Service deleted",
      description: "The service has been deleted."
    });
  };

  const selectService = (id: string | null) => {
    if (id === null) {
      setCurrentService(null);
      return;
    }
    
    const service = services.find(s => s.id === id);
    setCurrentService(service || null);
    
    // Reset local timer state when changing services
    setTimer({
      isRunning: false,
      currentItemId: null,
      startTime: null,
      elapsedTime: 0
    });
  };

  const addServiceItem = (item: Omit<ServiceItem, 'id'>) => {
    if (!currentService) return;
    
    const newItem: ServiceItem = {
      ...item,
      id: Date.now().toString()
    };
    
    const updatedItems = [...currentService.items, newItem];
    
    updateService(currentService.id, { items: updatedItems });
    
    toast({
      title: "Item added",
      description: `${newItem.title} has been added to the service.`
    });
  };

  const updateServiceItem = (id: string, itemUpdate: Partial<Omit<ServiceItem, 'id'>>) => {
    if (!currentService) return;
    
    const updatedItems = currentService.items.map(item => 
      item.id === id 
        ? { ...item, ...itemUpdate } 
        : item
    );
    
    updateService(currentService.id, { items: updatedItems });
  };

  const deleteServiceItem = (id: string) => {
    if (!currentService) return;
    
    const updatedItems = currentService.items.filter(item => item.id !== id);
    
    updateService(currentService.id, { items: updatedItems });
    
    toast({
      title: "Item removed",
      description: "The item has been removed from the service."
    });
  };

  // Update timer state in the database
  const updateTimerState = async (updates: {
    is_running?: boolean,
    current_item_id?: string | null,
    elapsed_time?: number
  }) => {
    if (!currentService) return;
    
    try {
      await supabase
        .from('timer_state')
        .update(updates)
        .eq('service_id', currentService.id);
    } catch (error) {
      console.error('Error updating timer state:', error);
    }
  };

  const startTimer = async (itemId: string) => {
    if (!currentService) return;
    
    const item = currentService.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Update timer in database
    await updateTimerState({
      is_running: true,
      current_item_id: itemId,
      elapsed_time: 0
    });
    
    // Update local state
    const newTimerState = {
      isRunning: true,
      currentItemId: itemId,
      startTime: Date.now(),
      elapsedTime: 0
    };
    
    setTimer(newTimerState);
    
    toast({
      title: "Timer started",
      description: `Started timing: ${item.title}`
    });
  };

  const pauseTimer = async () => {
    if (!currentService) return;
    
    // Update timer in database
    await updateTimerState({
      is_running: false,
      elapsed_time: timer.elapsedTime
    });
    
    // Update local state
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      startTime: null
    }));
  };

  const resetTimer = async () => {
    if (!currentService) return;
    
    // Update timer in database
    await updateTimerState({
      is_running: false,
      current_item_id: null,
      elapsed_time: 0
    });
    
    // Update local state
    setTimer({
      isRunning: false,
      currentItemId: null,
      startTime: null,
      elapsedTime: 0
    });
    
    toast({
      title: "Timer reset",
      description: "The timer has been reset."
    });
  };

  const skipToItem = async (itemId: string) => {
    if (!currentService) return;
    
    const item = currentService.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Update timer in database
    await updateTimerState({
      is_running: true,
      current_item_id: itemId,
      elapsed_time: 0
    });
    
    // Update local state
    setTimer({
      isRunning: true,
      currentItemId: itemId,
      startTime: Date.now(),
      elapsedTime: 0
    });
    
    toast({
      title: "Skipped to item",
      description: `Now timing: ${item.title}`
    });
  };

  const canEditService = (serviceId: string) => {
    if (!user) return false;
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return false;
    
    return (
      user.role === 'admin' || 
      user.role === 'planner' || 
      service.editableBy.includes(user.id)
    );
  };

  const addEditorToService = (serviceId: string, userId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    if (service.editableBy.includes(userId)) return;
    
    const updatedEditableBy = [...service.editableBy, userId];
    updateService(serviceId, { editableBy: updatedEditableBy });
    
    toast({
      title: "Editor added",
      description: "The user can now edit this service."
    });
  };

  const removeEditorFromService = (serviceId: string, userId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    const updatedEditableBy = service.editableBy.filter(id => id !== userId);
    updateService(serviceId, { editableBy: updatedEditableBy });
    
    toast({
      title: "Editor removed",
      description: "The user can no longer edit this service."
    });
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        currentService,
        timer,
        createService,
        updateService,
        deleteService,
        selectService,
        addServiceItem,
        updateServiceItem,
        deleteServiceItem,
        startTimer,
        pauseTimer,
        resetTimer,
        skipToItem,
        canEditService,
        addEditorToService,
        removeEditorFromService
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
