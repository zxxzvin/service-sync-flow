
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useService, ServiceItem } from "@/context/ServiceContext";
import { useAuth } from "@/context/AuthContext";
import ServiceItemComponent from "./ServiceItem";
import AddServiceItemDialog from "./AddServiceItemDialog";
import EmptyServiceState from "./EmptyServiceState";

interface ServiceRundownProps {
  serviceId?: string;
}

const ServiceRundown = ({ serviceId }: ServiceRundownProps) => {
  const { 
    currentService, 
    services, 
    selectService, 
    addServiceItem, 
    updateServiceItem, 
    deleteServiceItem, 
    canEditService, 
    startTimer, 
    timer, 
    updateService 
  } = useService();
  
  const { user } = useAuth();

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
          <EmptyServiceState 
            canEdit={false} 
            services={services} 
            onSelectService={selectService}
            onAddItemClick={() => {}} // Not applicable in this state
          />
        </CardContent>
      </Card>
    );
  }

  const canEdit = canEditService(service.id);
  const isItemActive = (itemId: string) => timer.currentItemId === itemId;

  const handleAddItem = (newItem: Omit<ServiceItem, 'id'>) => {
    addServiceItem(newItem);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<Omit<ServiceItem, 'id'>>) => {
    updateServiceItem(itemId, updates);
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
            <AddServiceItemDialog onAddItem={handleAddItem} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {service.items.length === 0 ? (
            <EmptyServiceState 
              canEdit={canEdit} 
              services={[]}
              onSelectService={() => {}}
              onAddItemClick={() => {
                // Trigger dialog open (this is a simplified implementation)
                const addButton = document.querySelector('button:has(.lucide-plus)');
                if (addButton) {
                  (addButton as HTMLButtonElement).click();
                }
              }}
            />
          ) : (
            service.items.map((item, index) => (
              <ServiceItemComponent
                key={item.id}
                item={item}
                index={index}
                totalItems={service.items.length}
                isActive={isItemActive(item.id)}
                canEdit={canEdit}
                onStartTimer={startTimer}
                onDeleteItem={deleteServiceItem}
                onMoveItem={handleMoveItem}
                onUpdateItem={handleUpdateItem}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRundown;
