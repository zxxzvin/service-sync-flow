import { useState } from "react";
import { useService, ServiceItem } from "@/context/ServiceContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Edit, 
  Move, 
  Play, 
  Plus, 
  Save, 
  Trash, 
  User, 
  X
} from "lucide-react";
import { formatTime } from "./ServiceTimer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ServiceRundownProps {
  serviceId?: string;
}

const ServiceRundown = ({ serviceId }: ServiceRundownProps) => {
  const { currentService, services, selectService, addServiceItem, updateServiceItem, deleteServiceItem, canEditService, startTimer, timer, updateService } = useService();
  const { user } = useAuth();
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<Omit<ServiceItem, 'id'>>>({
    title: '',
    description: '',
    duration: 300,
    personInCharge: '',
    notes: '',
  });

  const service = serviceId 
    ? services.find(s => s.id === serviceId) || currentService
    : currentService;

  if (!service) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Rundown</CardTitle>
          <CardDescription>Select a service to view its rundown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No service selected</p>
            {services.length > 0 && (
              <div className="mt-4">
                <select 
                  className="border rounded p-2"
                  onChange={(e) => selectService(e.target.value)}
                  value=""
                >
                  <option value="" disabled>Select a service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const canEdit = canEditService(service.id);
  const isItemActive = (itemId: string) => timer.currentItemId === itemId;

  const handleSaveNewItem = () => {
    if (!newItem.title) return;

    addServiceItem({
      title: newItem.title,
      description: newItem.description || '',
      duration: newItem.duration || 300,
      notes: newItem.notes || '',
      personInCharge: newItem.personInCharge || '',
      songList: newItem.songList || []
    });

    setNewItem({
      title: '',
      description: '',
      duration: 300,
      personInCharge: '',
      notes: '',
    });
  };

  const handleSaveEditedItem = () => {
    if (!editingItem) return;

    updateServiceItem(editingItem.id, {
      title: editingItem.title,
      description: editingItem.description,
      duration: editingItem.duration,
      notes: editingItem.notes,
      personInCharge: editingItem.personInCharge,
      songList: editingItem.songList
    });

    setEditingItem(null);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (!service) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= service.items.length) return;

    const newItems = [...service.items];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;

    updateService(service.id, { items: newItems });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{service.title}</CardTitle>
            <CardDescription>Date: {service.date}</CardDescription>
          </div>
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-1" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Service Item</DialogTitle>
                  <DialogDescription>
                    Create a new item for the service rundown.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Item title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description"
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={Math.floor((newItem.duration || 300) / 60)}
                        onChange={(e) => setNewItem({ ...newItem, duration: parseInt(e.target.value) * 60 })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="person">Person In Charge</Label>
                      <Input
                        id="person"
                        placeholder="Name"
                        value={newItem.personInCharge || ''}
                        onChange={(e) => setNewItem({ ...newItem, personInCharge: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes"
                      value={newItem.notes || ''}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewItem({ title: '', description: '', duration: 300 })}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNewItem} disabled={!newItem.title}>
                    Add Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {service.items.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <p>No items in this service yet</p>
              {canEdit && (
                <p className="mt-2 text-sm">Click "Add Item" to create your first service item</p>
              )}
            </div>
          ) : (
            service.items.map((item, index) => (
              <div
                key={item.id}
                className={`service-item ${isItemActive(item.id) ? 'active' : ''}`}
              >
                {editingItem && editingItem.id === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="Item title"
                      className="font-medium"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Duration (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={Math.floor(editingItem.duration / 60)}
                          onChange={(e) => setEditingItem({ 
                            ...editingItem, 
                            duration: parseInt(e.target.value) * 60 
                          })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Person In Charge</Label>
                        <Input
                          value={editingItem.personInCharge || ''}
                          onChange={(e) => setEditingItem({ 
                            ...editingItem, 
                            personInCharge: e.target.value 
                          })}
                          placeholder="Name"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          description: e.target.value 
                        })}
                        placeholder="Brief description"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={editingItem.notes || ''}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          notes: e.target.value 
                        })}
                        placeholder="Additional notes"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(null)}
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEditedItem}
                      >
                        <Save size={16} className="mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        {item.description && (
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock size={14} className="mr-1" />
                          {formatTime(item.duration)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startTimer(item.id)}
                          className="ml-2"
                        >
                          <Play size={16} />
                        </Button>
                      </div>
                    </div>

                    {(item.personInCharge || item.notes) && (
                      <div className="mt-2 space-y-1 text-sm">
                        {item.personInCharge && (
                          <div className="flex items-center text-muted-foreground">
                            <User size={14} className="mr-1" />
                            {item.personInCharge}
                          </div>
                        )}
                        
                        {item.notes && (
                          <p className="text-muted-foreground italic">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {canEdit && (
                      <div className="flex justify-between mt-3 pt-2 border-t">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveItem(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8"
                          >
                            <ChevronUp size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveItem(index, 'down')}
                            disabled={index === service.items.length - 1}
                            className="h-8 w-8"
                          >
                            <ChevronDown size={16} />
                          </Button>
                          <span className="text-xs text-muted-foreground mx-1">
                            {index + 1} of {service.items.length}
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(item)}
                            className="h-8 w-8"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteServiceItem(item.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRundown;
