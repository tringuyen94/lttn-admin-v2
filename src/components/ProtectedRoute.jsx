import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppSidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function ProtectedRoute({ element }) {
   const { isAuthenticated } = useAuth();
   const location = useLocation();

   if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
   }

   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset>
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6">
               {element}
            </main>
         </SidebarInset>
      </SidebarProvider>
   );
}
