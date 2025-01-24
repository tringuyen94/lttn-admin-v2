import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }) {
   const navigate = useNavigate()
   const [isAuthenticated, setIsAuthenticated] = useState(false)
   const [userData, setUserData] = useState()
   const [loading, setLoading] = useState(true);
   useEffect(() => {
      const validateSession = async () => {
         try {
            const response = await api.get('api/v1/auth', {
               withCredentials: true, // Include cookies in the request
            });
            setIsAuthenticated(response.data.status === 'success'); // If session is valid, set logged-in state
         } catch (error) {
            setIsAuthenticated(false); // If validation fails, set logged-out state
            navigate('/login')
         } finally {
            setLoading(false); // Set loading to false after validation
         }
      };
      validateSession();
   }, [])
   const login = async (username, password) => {
      try {
         const res = await api.post('api/v1/auth/signin', { username, password }, { withCredentials: true })
         setIsAuthenticated(true)
         setUserData(res.data.user)
         navigate('/dashboard')
         toast.success('Đăng nhập thành công')
      } catch (error) {
         toast.error(error.response.data.message)
      }
   }
   const logout = async () => {
      const res = await api.get('api/v1/auth/signout', { withCredentials: true })
      setIsAuthenticated(false)
      navigate('/login')
      toast.success(res.data.message)
   }
   if (loading) {
      return <div>Loading...</div>; // Show a loading spinner while validating session
   }

   return (
      <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
         {children}
      </AuthContext.Provider>
   )
}
