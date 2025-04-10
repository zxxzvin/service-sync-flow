
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, User, UserRole } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash, User as UserIcon } from "lucide-react";

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "planner@example.com",
    name: "Planner User",
    role: "planner",
  },
  {
    id: "3",
    email: "volunteer@example.com",
    name: "Volunteer User",
    role: "volunteer",
  },
  {
    id: "4",
    email: "jane@example.com",
    name: "Jane Smith",
    role: "volunteer",
  },
  {
    id: "5",
    email: "mark@example.com",
    name: "Mark Johnson",
    role: "planner",
  },
];

const Users = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "volunteer" as UserRole,
  });
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!(isAdmin() || user.role === "planner")) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !(isAdmin() || user.role === "planner")) {
    return null;
  }
  
  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    const newUserObj: User = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    
    setUsers([...users, newUserObj]);
    
    toast({
      title: "User Created",
      description: `${newUser.name} has been created successfully.`,
    });
    
    setNewUser({
      name: "",
      email: "",
      role: "volunteer",
    });
  };
  
  const handleChangeRole = (userId: string, newRole: UserRole) => {
    if (!isAdmin()) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only administrators can change user roles.",
      });
      return;
    }
    
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    
    setUsers(updatedUsers);
    
    toast({
      title: "Role Updated",
      description: `User role has been updated to ${newRole}.`,
    });
  };
  
  const handleDeleteUser = (userId: string) => {
    if (!isAdmin()) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only administrators can delete users.",
      });
      return;
    }
    
    // Prevent deleting yourself
    if (userId === user.id) {
      toast({
        variant: "destructive",
        title: "Action Prohibited",
        description: "You cannot delete your own account.",
      });
      return;
    }
    
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    
    toast({
      title: "User Deleted",
      description: "User has been removed successfully.",
    });
  };

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          {isAdmin() && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-1" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="planner">Planner</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewUser({ name: "", email: "", role: "volunteer" })}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAdmin() && (
                      <Select
                        value={u.role}
                        onValueChange={(value: UserRole) => handleChangeRole(u.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="planner">Planner</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {!isAdmin() && (
                      <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium capitalize">
                        {u.role}
                      </span>
                    )}
                    
                    {isAdmin() && u.id !== user.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Users;
