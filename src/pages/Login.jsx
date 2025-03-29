import React, { Fragment, useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // Use for navigation after successful login
import { useAuth } from '../context/AuthContext.jsx';

import { useForm } from 'react-hook-form'
import Title from '../components/Title';
import { Helmet } from 'react-helmet-async';
const Login = () => {
   const { login, isAuthenticated } = useAuth()
   const { register, handleSubmit, formState: { errors }, setError } = useForm();

   const onSubmit = async (data) => {
      await login(data.username, data.password)
   }

   useEffect(() => {
      if (isAuthenticated) {
         // Redirect to dashboard if already authenticated
         <Navigate to="/dashboard" />
      }
   }, [isAuthenticated])
   return (
      <Fragment>
         <Title title="Đăng nhập" />

         <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">

            <h2 className="text-2xl font-semibold mb-4">Đăng nhập</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
               <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                  <input
                     {...register('username', {
                        required: 'Tên đăng nhập không được để trống',
                     })}
                     className={`mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
               </div>

               <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <input
                     type="password"
                     {...register('password', {
                        required: 'Mật khẩu không được để trống'
                     })}
                     className={`mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
               </div>

               {errors.email && !errors.password && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}

               <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50" disabled={Object.keys(errors).length > 0}>
                  Đăng nhập
               </button>
            </form>
         </div>
      </Fragment>
   );
};

export default Login;