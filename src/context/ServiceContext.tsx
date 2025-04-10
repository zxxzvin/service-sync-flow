
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

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

  // Timer update interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning && timer.startTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timer.startTime) / 1000) + timer.elapsedTime;
        
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
    
    // Reset timer when changing services
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

  const startTimer = (itemId: string) => {
    if (!currentService) return;
    
    const item = currentService.items.find(i => i.id === itemId);
    if (!item) return;
    
    setTimer({
      isRunning: true,
      currentItemId: itemId,
      startTime: Date.now(),
      elapsedTime: 0
    });
    
    toast({
      title: "Timer started",
      description: `Started timing: ${item.title}`
    });
  };

  const pauseTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      startTime: null
    }));
  };

  const resetTimer = () => {
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

  const skipToItem = (itemId: string) => {
    if (!currentService) return;
    
    const item = currentService.items.find(i => i.id === itemId);
    if (!item) return;
    
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
