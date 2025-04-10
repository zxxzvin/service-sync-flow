
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyServiceStateProps {
  canEdit: boolean;
  services: any[];
  onSelectService: (id: string) => void;
  onAddItemClick: () => void;
}

const EmptyServiceState = ({ 
  canEdit, 
  services, 
  onSelectService,
  onAddItemClick 
}: EmptyServiceStateProps) => {
  return (
    <div className="py-10 text-center text-muted-foreground">
      <p>No items in this service yet</p>
      {canEdit && (
        <>
          <p className="mt-2 text-sm">Click "Add Item" to create your first service item</p>
          <Button onClick={onAddItemClick} className="mt-4">
            <Plus size={18} className="mr-1" /> Add Item
          </Button>
        </>
      )}
      {services.length > 0 && (
        <div className="mt-4">
          <select 
            className="border rounded p-2"
            onChange={(e) => onSelectService(e.target.value)}
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
  );
};

export default EmptyServiceState;
