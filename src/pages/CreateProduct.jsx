// src/pages/ProductForm.js

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import { createProduct } from '../redux/slices/productSlice';
import { useNavigate } from 'react-router-dom';
import 'react-quill-new/dist/quill.snow.css';

const CreateProduct = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const brands = useSelector(state => state.brands.items);
   const categories = useSelector(state => state.categories.items);
   const [imagesPreview, setImagesPreview] = useState([]);
   const [coverImagePreview, setCoverImagePreview] = useState('');

   const { register, handleSubmit, control, watch, formState: { errors, isValid } } = useForm({
      mode: 'onChange',
   });

   const categoryWatch = watch('category');

   const createFormData = (data) => {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('product_name', data.product_name);
      formData.append('product_isnew', data.product_isnew);
      formData.append('brand', data.brand);
      if (data.product_capacity) formData.append('product_capacity', data.product_capacity);
      formData.append('product_description', data.product_description);
      formData.append('product_cover_image', data.product_cover_image[0]);
      for (const file of data.product_images) {
         formData.append('product_images', file);
      }
      return formData;
   };

   const onSubmit = async (data) => {
      const formData = createFormData(data);
      try {
         await dispatch(createProduct(formData)).unwrap();
         toast.success(`Đã thêm ${data.product_name}`);
         setTimeout(() => navigate(0), 1000);
      } catch (error) {
         toast.error(error);
      }
   };

   const handleImagePreview = (event, setPreview) => {
      const files = Array.from(event.target.files);
      const previews = files.map(file => URL.createObjectURL(file));
      setPreview(previews.length === 1 ? previews[0] : previews);
   };

   return (
      <div className='flex justify-evenly gap-4'>
         <div className="max-w-md h-fit my-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">THÊM SẢN PHẨM</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               {/* Category */}
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Loại sản phẩm:</label>
                  <select
                     {...register('category', { required: 'Hãy chọn loại sản phẩm' })}
                     className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value=''>Chọn loại sản phẩm</option>
                     {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.category_name}</option>
                     ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
               </div>

               {/* Product Name */}
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Tên sản phẩm:</label>
                  <input
                     type="text"
                     {...register('product_name', { required: 'Tên sản phẩm không được để trống' })}
                     className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.product_name && <p className="text-red-500 text-sm mt-1">{errors.product_name.message}</p>}
               </div>

               {/* Product Capacity */}
               {categoryWatch === '5e67d1d3616a8d11cc4eacab' && (
                  <div>
                     <label className="block text-gray-700 font-medium mb-1">Công suất:</label>
                     <input
                        type="number"
                        step="any"
                        {...register('product_capacity', {
                           required: 'Công suất không được để trống',
                           valueAsNumber: true,
                           min: { value: 0, message: 'Công suất phải lớn hơn 0' },
                        })}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                     {errors.product_capacity && <p className="text-red-500 text-sm mt-1">{errors.product_capacity.message}</p>}
                  </div>
               )}

               {/* Is New Product */}
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Là sản phẩm mới?</label>
                  <div className="flex space-x-4">
                     <label className="flex items-center space-x-2">
                        <input
                           type="radio"
                           value='true'
                           {...register('product_isnew', { required: 'Là sản phẩm mới hay cũ' })}
                           className="text-blue-500 focus:ring-blue-500"
                        />
                        <span>Có</span>
                     </label>
                     <label className="flex items-center space-x-2">
                        <input
                           type="radio"
                           value='false'
                           {...register('product_isnew')}
                           className="text-blue-500 focus:ring-blue-500"
                        />
                        <span>Không</span>
                     </label>
                  </div>
                  {errors.product_isnew && <p className="text-red-500 text-sm mt-1">{errors.product_isnew.message}</p>}
               </div>

               {/* Brand */}
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Nhãn hàng:</label>
                  <select
                     {...register('brand', { required: 'Hãy chọn nhãn hàng' })}
                     className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value=''>Chọn nhãn hàng</option>
                     {brands.map(brand => (
                        <option key={brand._id} value={brand._id}>{brand.brand_name}</option>
                     ))}
                  </select>
                  {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
               </div>

               {/* Product Description */}
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Mô tả sản phẩm</label>
                  <Controller
                     control={control}
                     name="product_description"
                     rules={{ required: 'Mô tả sản phẩm không được để trống' }}
                     render={({ field }) => (
                        <ReactQuill {...field} theme="snow" className="mb-[50px] w-full h-48 rounded-lg" />
                     )}
                  />
                  {errors.product_description && <p className="text-red-500 text-xs mt-2">{errors.product_description.message}</p>}
               </div>

               {/* Cover Image */}
               <div className='relative'>
                  <label className="block text-gray-700 font-medium mb-1">Ảnh bìa sản phẩm:</label>
                  <input
                     type="file"
                     {...register('product_cover_image', { required: 'Bạn chưa chọn ảnh bìa sản phẩm' })}
                     onChange={(e) => handleImagePreview(e, setCoverImagePreview)}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700">Chọn ảnh bìa</button>
                  {errors.product_cover_image && <p className="text-red-500 text-xs mt-2">{errors.product_cover_image.message}</p>}
                  {coverImagePreview && (
                     <img src={coverImagePreview} alt="Cover Preview" className="mt-2 p-2 w-32 h-32 object-cover rounded border-2 border-dashed border-gray-500" />
                  )}
               </div>

               {/* Product Images */}
               <div className='relative'>
                  <label className="block text-gray-700 font-medium mb-1">Ảnh sản phẩm</label>
                  <input
                     type="file"
                     {...register('product_images', { required: 'Bạn chưa chọn ảnh sản phẩm' })}
                     multiple
                     onChange={(e) => handleImagePreview(e, setImagesPreview)}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700">Chọn ảnh sản phẩm</button>
                  {errors.product_images && <p className="text-red-500 text-xs mt-2">{errors.product_images.message}</p>}
                  <div className="mt-2 flex space-x-2">
                     {imagesPreview.map((image, index) => (
                        <img key={index} src={image} alt={`Product ${index + 1}`} className="w-16 h-16 object-cover rounded border-dashed border-gray-500 border-2 p-2" />
                     ))}
                  </div>
               </div>

               {/* Submit Button */}
               <button
                  type="submit"
                  className={`w-full py-2 font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isValid ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
                  disabled={!isValid}
               >
                  Thêm
               </button>
            </form>
         </div>
      </div>
   );
};

export default CreateProduct;