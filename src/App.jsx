import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import AuthProvider from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DataInitializer from './components/DataInitializer';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProductList = lazy(() => import('./pages/ProductList'));
const CreateProduct = lazy(() => import('./pages/CreateProduct'));
const UpdateProduct = lazy(() => import('./pages/UpdateProduct'));
const Project = lazy(() => import('./pages/Project'));
const Brand = lazy(() => import('./pages/Brand'));
const Category = lazy(() => import('./pages/Category'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));

function PageLoader() {
   return (
      <div className="flex h-64 items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
   );
}

function App() {
   return (
      <ThemeProvider>
         <HelmetProvider>
            <Router>
               <AuthProvider>
               <DataInitializer>
                  <Suspense fallback={<PageLoader />}>
                     <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                        <Route path="/danh-sach-san-pham" element={<ProtectedRoute element={<ProductList />} />} />
                        <Route path="/san-pham/cap-nhat-san-pham/:id" element={<ProtectedRoute element={<UpdateProduct />} />} />
                        <Route path="/them-san-pham" element={<ProtectedRoute element={<CreateProduct />} />} />
                        <Route path="/du-an-thi-cong" element={<ProtectedRoute element={<Project />} />} />
                        <Route path="/hang" element={<ProtectedRoute element={<Brand />} />} />
                        <Route path="/loai-san-pham" element={<ProtectedRoute element={<Category />} />} />
                        <Route path="/cap-nhat-mat-khau" element={<ProtectedRoute element={<UpdatePassword />} />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                     </Routes>
                  </Suspense>
               </DataInitializer>
               <Toaster richColors position="top-right" />
               </AuthProvider>
            </Router>
         </HelmetProvider>
      </ThemeProvider>
   );
}

export default App;
