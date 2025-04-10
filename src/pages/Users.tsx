
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
import { supabase } from "@/integrations/supabase/client";

const Users = () => {
  const { user, isAdmin, createUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer" as UserRole,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch users from Supabase - improved to work with profiles table
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the data into the User interface format
        const usersData = data.map((profile) => ({
          id: profile.id,
          name: profile.name,
          role: profile.role as UserRole,
          email: '' // We'll fill this with an empty string initially
        }));
        
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "There was a problem loading the users. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!(isAdmin() || user.role === "planner")) {
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [user, isAdmin, navigate]);

  if (!user || !(isAdmin() || user.role === "planner")) {
    return null;
  }
  
  const handleCreateUser = async () => {
    if (!isAdmin()) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only administrators can create new users.",
      });
      return;
    }
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    try {
      await createUser(
        newUser.email,
        newUser.password,
        newUser.name,
        newUser.role
      );
      
      // Refresh the users list
      fetchUsers();
      
      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "volunteer",
      });
      setDialogOpen(false);
      
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        variant: "destructive",
        title: "User Creation Failed", 
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (!isAdmin()) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only administrators can change user roles.",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the user role.",
      });
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
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
    
    try {
      // This will be handled by the Admin API in our edge function
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== userId));
      
      toast({
        title: "User Deleted",
        description: "User has been removed successfully.",
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "There was a problem deleting the user.",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          {isAdmin() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        {/* Email might not be available, so displaying username/name instead */}
                        <p className="text-sm text-muted-foreground">{u.email || u.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAdmin() && (
                        <Select
                          value={u.role}
                          onValueChange={(value: UserRole) => handleChangeRole(u.id, value as UserRole)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Users;
