
import { useState } from "react";
import { useService } from "@/context/ServiceContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon, Plus, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ServiceManagement = () => {
  const { services, createService, updateService, deleteService, selectService, currentService } = useService();
  const { isPlanner } = useAuth();
  const [newService, setNewService] = useState({
    title: "",
    date: new Date(),
  });
  const [editingService, setEditingService] = useState<{
    id: string;
    title: string;
    date: Date;
  } | null>(null);

  if (!isPlanner()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have permission to manage services. Please contact an administrator or planner.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateService = () => {
    if (!newService.title) return;

    createService({
      title: newService.title,
      date: format(newService.date, "yyyy-MM-dd"),
      items: [],
      editableBy: [],
      createdBy: "",
    });

    setNewService({
      title: "",
      date: new Date(),
    });
  };

  const handleUpdateService = () => {
    if (!editingService) return;

    updateService(editingService.id, {
      title: editingService.title,
      date: format(editingService.date, "yyyy-MM-dd"),
    });

    setEditingService(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Services</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-1" /> New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service to the schedule.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="Sunday Morning Service"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Service Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !newService.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newService.date ? (
                        format(newService.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newService.date}
                      onSelect={(date) => date && setNewService({ ...newService, date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewService({ title: "", date: new Date() })}>
                Cancel
              </Button>
              <Button onClick={handleCreateService} disabled={!newService.title}>
                Create Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No services have been created yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "New Service" to create your first service.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`border rounded-lg p-4 ${
                  currentService?.id === service.id
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit size={18} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Service</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-title">Service Title</Label>
                            <Input
                              id="edit-title"
                              placeholder="Service title"
                              value={editingService?.title || ""}
                              onChange={(e) =>
                                setEditingService(
                                  editingService
                                    ? {
                                        ...editingService,
                                        title: e.target.value,
                                      }
                                    : null
                                )
                              }
                              onFocus={() =>
                                !editingService &&
                                setEditingService({
                                  id: service.id,
                                  title: service.title,
                                  date: new Date(service.date),
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Service Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="justify-start text-left font-normal"
                                  onFocus={() =>
                                    !editingService &&
                                    setEditingService({
                                      id: service.id,
                                      title: service.title,
                                      date: new Date(service.date),
                                    })
                                  }
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editingService ? (
                                    format(editingService.date, "PPP")
                                  ) : (
                                    <span>{service.date}</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={
                                    editingService?.date ||
                                    new Date(service.date)
                                  }
                                  onSelect={(date) =>
                                    date &&
                                    setEditingService(
                                      editingService
                                        ? { ...editingService, date }
                                        : {
                                            id: service.id,
                                            title: service.title,
                                            date,
                                          }
                                    )
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingService(null)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateService}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash size={18} />
                    </Button>
                    <Button
                      variant={
                        currentService?.id === service.id ? "default" : "outline"
                      }
                      onClick={() => selectService(service.id)}
                    >
                      {currentService?.id === service.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceManagement;
