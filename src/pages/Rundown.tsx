
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ServiceRundown from "@/components/service/ServiceRundown";
import ServiceTimer from "@/components/service/ServiceTimer";

const Rundown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-3xl font-bold">Service Rundown</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ServiceRundown />
          </div>
          <div>
            <ServiceTimer />
          </div>
        </div>
      </div>
      
      <ServiceTimer minimal />
    </MainLayout>
  );
};

export default Rundown;
