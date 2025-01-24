import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
// Protected route component
import { useDispatch } from 'react-redux';
import { fetchBrands } from '../redux/slices/brandSlice';
import { useEffect } from 'react';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import { fetchProjects } from '../redux/slices/projectSlice';
const ProtectedRoute = ({ element, ...rest }) => {
   const { isAuthenticated } = useAuth(); // Get authentication state from context
   const location = useLocation();

   const dispatch = useDispatch()


   useEffect(() => {
      dispatch(fetchBrands())
      dispatch(fetchProducts())
      dispatch(fetchCategories())
      dispatch(fetchProjects())
   }, [dispatch])


   if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />; // Redirect to login if not authenticated
   }

   return (
      <div className="bg-gray-100 min-h-screen">
         <Sidebar />
         <Header />
         <main className="ml-64 pt-16">
            {element}
         </main>
      </div >
   )
};

export default ProtectedRoute;