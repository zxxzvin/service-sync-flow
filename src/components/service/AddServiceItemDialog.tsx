
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServiceItemForm from "./ServiceItemForm";
import { ServiceItem } from "@/context/ServiceContext";
import { useState } from "react";

interface AddServiceItemDialogProps {
  onAddItem: (item: Omit<ServiceItem, 'id'>) => void;
}

const AddServiceItemDialog = ({ onAddItem }: AddServiceItemDialogProps) => {
  const [open, setOpen] = useState(false);

  const initialValues = {
    title: '',
    description: '',
    duration: 300,
    personInCharge: '',
    notes: '',
  };

  const handleSave = (item: Partial<Omit<ServiceItem, 'id'>>) => {
    onAddItem({
      title: item.title || '',
      description: item.description || '',
      duration: item.duration || 300,
      notes: item.notes || '',
      personInCharge: item.personInCharge || '',
      songList: item.songList || []
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        
        <ServiceItemForm 
          initialValues={initialValues}
          onSave={handleSave}
          submitLabel="Add Item"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceItemDialog;
