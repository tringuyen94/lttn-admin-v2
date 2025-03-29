import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
   const navigate = useNavigate();
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [userData, setUserData] = useState();
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      // Intercept API responses to handle token expiration
      const responseInterceptor = api.interceptors.response.use(
         (response) => response,
         (error) => {
            if (error.response?.status === 401) {
               if (!isAuthenticated) return Promise.reject(error); // Avoid duplicate navigation
               setIsAuthenticated(false);
               navigate('/login');
               toast.error(error.response?.data?.message || 'Session expired. Please log in again.');
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
               withCredentials: true, // Include cookies in the request
            });
            setIsAuthenticated(response.data.status === 'success'); // If session is valid, set logged-in state
            setUserData(response.data.user);
         } catch (error) {
            setIsAuthenticated(false); // If validation fails, set logged-out state
            navigate('/login');
         } finally {
            setLoading(false); // Set loading to false after validation
         }
      };
      validateSession();
   }, [navigate]);

   const login = async (username, password) => {
      try {
         const res = await api.post('api/v1/auth/signin', { username, password }, { withCredentials: true });
         setIsAuthenticated(true);
         setUserData(res.data.user);
         navigate('/dashboard', { replace: true }); // Delay navigation
         setTimeout(() => toast.success(res.data?.message || 'Đăng nhập thành công'), 200); // Show success message
      } catch (error) {
         toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      }
   };

   const logout = async () => {
      try {
         const res = await api.get('api/v1/auth/signout', { withCredentials: true });
         setIsAuthenticated(false);
         navigate('/login', { replace: true }); // Delay navigation
         setTimeout(() => toast.success(res.data?.message || 'Đã đăng xuất'), 200); // Show success message
      } catch (error) {
         toast.error('Đăng xuất thất bại');
      }
   };

   if (loading) {
      return <div>Loading...</div>; // Show a loading spinner while validating session
   }

   return (
      <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
         {children}
      </AuthContext.Provider>
   )
}
