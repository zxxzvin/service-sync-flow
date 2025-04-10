
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceItem } from "@/context/ServiceContext";

interface ServiceItemFormProps {
  initialValues: Partial<Omit<ServiceItem, 'id'>>;
  onSave: (item: Partial<Omit<ServiceItem, 'id'>>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const ServiceItemForm = ({ 
  initialValues, 
  onSave, 
  onCancel, 
  submitLabel = "Save" 
}: ServiceItemFormProps) => {
  const [values, setValues] = useState<Partial<Omit<ServiceItem, 'id'>>>({
    title: initialValues.title || '',
    description: initialValues.description || '',
    duration: initialValues.duration || 300,
    personInCharge: initialValues.personInCharge || '',
    notes: initialValues.notes || '',
    songList: initialValues.songList || []
  });

  const handleSubmit = () => {
    if (!values.title) return;
    onSave(values);
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          placeholder="Item title"
          className="font-medium"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Duration (minutes)</Label>
          <Input
            type="number"
            min="1"
            value={Math.floor((values.duration || 300) / 60)}
            onChange={(e) => setValues({ 
              ...values, 
              duration: parseInt(e.target.value) * 60 
            })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label className="text-xs">Person In Charge</Label>
          <Input
            value={values.personInCharge || ''}
            onChange={(e) => setValues({ 
              ...values, 
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
          value={values.description || ''}
          onChange={(e) => setValues({ 
            ...values, 
            description: e.target.value 
          })}
          placeholder="Brief description"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea
          value={values.notes || ''}
          onChange={(e) => setValues({ 
            ...values, 
            notes: e.target.value 
          })}
          placeholder="Additional notes"
          className="mt-1"
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-3">
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!values.title}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default ServiceItemForm;
