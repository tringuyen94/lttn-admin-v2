// src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Project from './pages/Project';
import Category from './pages/Category';
import Brand from './pages/Brand';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateProduct from './pages/CreateProduct';
import UpdateProduct from './pages/UpdateProduct';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './context/AuthContext';
import ProductList from './pages/ProductList';
import UpdatePassword from './pages/UpdatePassword';
import { HelmetProvider } from 'react-helmet-async';


function App() {


  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Protect the Dashboard route using PrivateRoute */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            {/* Redirect to login if no match */}
            <Route path="/danh-sach-san-pham" element={<ProtectedRoute element={<ProductList />} />} />
            <Route path="/san-pham/cap-nhat-san-pham/:id" element={<ProtectedRoute element={<UpdateProduct />} />} />
            <Route path="/them-san-pham" element={<ProtectedRoute element={<CreateProduct />} />} />
            <Route path="/du-an-thi-cong" element={<ProtectedRoute element={<Project />} />} />
            <Route path="/hang" element={<ProtectedRoute element={<Brand />} />} />
            <Route path="/loai-san-pham" element={<ProtectedRoute element={<Category />} />} />
            <Route path="/cap-nhat-mat-khau" element={<ProtectedRoute element={<UpdatePassword />} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer hideProgressBar={true} />
        </AuthProvider >
      </Router >
    </HelmetProvider>
  );
}

export default App;