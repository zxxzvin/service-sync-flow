
import { useState } from "react";
import { ServiceItem as ServiceItemType } from "@/context/ServiceContext";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Play, Trash, User, ChevronUp, ChevronDown } from "lucide-react";
import { formatTime } from "./ServiceTimer";
import ServiceItemForm from "./ServiceItemForm";

interface ServiceItemProps {
  item: ServiceItemType;
  index: number;
  totalItems: number;
  isActive: boolean;
  canEdit: boolean;
  onStartTimer: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onUpdateItem: (itemId: string, updates: Partial<Omit<ServiceItemType, 'id'>>) => void;
}

const ServiceItemComponent = ({
  item,
  index,
  totalItems,
  isActive,
  canEdit,
  onStartTimer,
  onDeleteItem,
  onMoveItem,
  onUpdateItem
}: ServiceItemProps) => {
  const [editing, setEditing] = useState(false);

  const handleSaveEdit = (updates: Partial<Omit<ServiceItemType, 'id'>>) => {
    onUpdateItem(item.id, updates);
    setEditing(false);
  };

  if (editing) {
    return (
      <ServiceItemForm
        initialValues={item}
        onSave={handleSaveEdit}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className={`service-item ${isActive ? 'active' : ''}`}>
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
            onClick={() => onStartTimer(item.id)}
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
              onClick={() => onMoveItem(index, 'up')}
              disabled={index === 0}
              className="h-8 w-8"
            >
              <ChevronUp size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveItem(index, 'down')}
              disabled={index === totalItems - 1}
              className="h-8 w-8"
            >
              <ChevronDown size={16} />
            </Button>
            <span className="text-xs text-muted-foreground mx-1">
              {index + 1} of {totalItems}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
              className="h-8 w-8"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteItem(item.id)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceItemComponent;
