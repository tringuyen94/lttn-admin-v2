import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/api/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
   const navigate = useNavigate();
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [userData, setUserData] = useState();
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const responseInterceptor = api.interceptors.response.use(
         (response) => response,
         (error) => {
            if (error.response?.status === 401) {
               if (!isAuthenticated) return Promise.reject(error);
               setIsAuthenticated(false);
               navigate('/login');
               toast.error(error.response?.data?.message || 'Phiên đã hết hạn. Vui lòng đăng nhập lại.');
            }
            return Promise.reject(error);
         }
      );

      return () => {
         api.interceptors.response.eject(responseInterceptor);
      };
   }, [navigate, isAuthenticated]);

   useEffect(() => {
      const validateSession = async () => {
         try {
            setLoading(true);
            const response = await api.get('api/v1/auth/me', {
               withCredentials: true,
            });
            setIsAuthenticated(response.data.status === 'success');
            setUserData(response.data.user);
         } catch {
            setIsAuthenticated(false);
            navigate('/login');
         } finally {
            setLoading(false);
         }
      };
      validateSession();
   }, [navigate]);

   const login = async (username, password) => {
      try {
         const res = await api.post('api/v1/auth/signin', { username, password }, { withCredentials: true });
         setIsAuthenticated(true);
         setUserData(res.data.user);
         navigate('/dashboard', { replace: true });
         setTimeout(() => toast.success(res.data?.message || 'Đăng nhập thành công'), 200);
      } catch (error) {
         toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      }
   };

   const logout = async () => {
      try {
         const res = await api.get('api/v1/auth/signout', { withCredentials: true });
         setIsAuthenticated(false);
         navigate('/login', { replace: true });
         setTimeout(() => toast.success(res.data?.message || 'Đã đăng xuất'), 200);
      } catch {
         toast.error('Đăng xuất thất bại');
      }
   };

   if (loading) {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
         </div>
      );
   }

   return (
      <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
}
