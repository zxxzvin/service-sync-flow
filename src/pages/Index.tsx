
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ServiceManagement from "@/components/service/ServiceManagement";
import ServiceRundown from "@/components/service/ServiceRundown";
import ServiceTimer from "@/components/service/ServiceTimer";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will be redirected by the useEffect above
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ServiceManagement />
          </div>
          <div>
            <ServiceTimer />
          </div>
        </div>
        
        <div>
          <ServiceRundown />
        </div>
      </div>
      
      <ServiceTimer minimal />
    </MainLayout>
  );
};

export default Index;
