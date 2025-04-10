
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Menu,
  LogOut,
  Calendar,
  List,
  Clock,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout, isAdmin, isPlanner } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar trigger */}
      <div className="fixed bottom-6 left-6 z-20 lg:hidden">
        <Button
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full shadow-lg"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-10 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-primary">Worship Planner</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <ChevronLeft size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="flex flex-col space-y-1 px-2">
            <Link to="/" className="sidebar-nav-item">
              <Calendar size={20} />
              <span>Services</span>
            </Link>
            <Link to="/rundown" className="sidebar-nav-item">
              <List size={20} />
              <span>Rundown</span>
            </Link>
            <Link to="/timer" className="sidebar-nav-item">
              <Clock size={20} />
              <span>Live Timer</span>
            </Link>
            {(isAdmin() || isPlanner()) && (
              <Link to="/users" className="sidebar-nav-item">
                <Users size={20} />
                <span>Users</span>
              </Link>
            )}
            {isAdmin() && (
              <Link to="/settings" className="sidebar-nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-sidebar-foreground">{user.name}</span>
              <span className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={logout}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
      
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-5 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
