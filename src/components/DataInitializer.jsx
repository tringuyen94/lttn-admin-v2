import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBrands } from '@/redux/slices/brandSlice';
import { fetchProducts } from '@/redux/slices/productSlice';
import { fetchCategories } from '@/redux/slices/categorySlice';
import { fetchProjects } from '@/redux/slices/projectSlice';
import { useAuth } from '@/context/AuthContext';

export default function DataInitializer({ children }) {
   const dispatch = useDispatch();
   const { isAuthenticated } = useAuth();

   useEffect(() => {
      if (isAuthenticated) {
         dispatch(fetchBrands());
         dispatch(fetchProducts());
         dispatch(fetchCategories());
         dispatch(fetchProjects());
      }
   }, [dispatch, isAuthenticated]);

   return children;
}
