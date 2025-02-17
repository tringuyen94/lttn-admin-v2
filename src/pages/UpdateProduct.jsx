// src/pages/ProductForm.js

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { baseURL } from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import _ from 'lodash'
import { fetchProductById, updateImage, updateProduct } from '../redux/slices/productSlice';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const infoFields = ['brand', 'category', 'product_capacity', 'product_description', 'product_name', 'product_isnew']
const imageFields = ['product_images', 'product_cover_image']
const UpdateProduct = () => {
   const { id } = useParams();
   const navigate = useNavigate()
   const dispatch = useDispatch()

   //Get Brands From Redux
   const productData = useSelector(state => state.products.item)
   const brands = useSelector(state => state.brands.items)

   //Data inital
   const [initProduct, setInitProduct] = useState(null)
   const [initImageProduct, setInitImageProduct] = useState(null)

   //Image Privew State
   const [imagesPreview, setImagesPreview] = useState([])
   const [coverImagePreview, setCoverImagePreview] = useState('')



   //Init useForm
   const { register, handleSubmit, control, reset, formState: { errors }, watch } = useForm({
   });

   const watchedFields = watch();


   //Check If Image Change
   const hasImageChanged = useMemo(() => {
      if (!initImageProduct) return false
      const watchImageFields = _.pick(watchedFields, imageFields)
      return !_.isEqual(watchImageFields, initImageProduct)
   }, [watchedFields, initImageProduct])

   //Check If Info Change
   const hasChanged = useMemo(() => {
      if (!initProduct) return false;
      const watchInfoFields = _.pick(watchedFields, infoFields)
      return !_.isEqual(watchInfoFields, initProduct)
   }, [watchedFields, initProduct]);

   // Update preview when a new cover image is selected
   const handleCoverImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setCoverImagePreview(reader.result);
         reader.readAsDataURL(file);
      }
   };

   // Update preview when new product images are selected
   const handleProductImagesChange = (event) => {
      const files = Array.from(event.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagesPreview(previews);
   };

   useEffect(() => {
      dispatch(fetchProductById(id))
   }, [id]);

   useEffect(() => {
      if (productData) {
         reset({ ...productData, product_isnew: productData.product_isnew ? 'true' : 'false' })
         const initData = _.pick(productData, ['brand', 'category', 'product_capacity', 'product_description', 'product_name', 'product_isnew'])
         setInitProduct({ ...initData, product_isnew: productData.product_isnew ? 'true' : 'false' })
         const initImageData = _.pick(productData, ['product_images', 'product_cover_image'])
         setInitImageProduct(initImageData)
      }
   }, [productData])

   /**
    * Update Image
   */
   const onUpdateImageSubmit = async (data) => {
      const formData = new FormData()

      // Append cover image if a new file is selected
      if (!_.isEqual(data.product_cover_image, initImageProduct.product_cover_image)) {
         formData.append('product_cover_image', data.product_cover_image[0]);
      }

      // Append only new additional images if they are selected
      if (!_.isEqual(data.product_images, initImageProduct.product_images)) {
         for (const file of data.product_images) {
            formData.append('product_images', file);
         }
      }
      try {
         await dispatch(updateImage({ productId: id, productInfo: formData })).unwrap()
         toast.success('Cập nhật ảnh thành công')
         setTimeout(() => navigate(0), 1000)
      } catch (error) {
         toast.error(error);
      }
   }
   /**
    *
    * Update Info
    */
   const onSubmit = async (data) => {

      try {
         await dispatch(updateProduct(data)).unwrap()
         toast.success('Cập nhật thành công')
         setTimeout(() => navigate(0), 1000)
      } catch (error) {
         toast.error(error);
      }
   };
   return (
      <div className='flex justify-evenly gap-4'>
         <div className="max-w-md h-fit my-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
               CẬP NHẬT THÔNG TIN
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Loại sản phẩm:</label>
                  <input
                     type="text"
                     {...register('category.category_name')}
                     disabled
                     className="w-full p-2 border cursor-not-allowed  border-gray-300 bg-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Tên sản phẩm:</label>
                  <input
                     type="text"
                     {...register('product_name', { required: 'Tên sản phẩm không được để trống' })}
                     className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.product_name && <p className="text-red-500 text-sm mt-1">{errors.product_name.message}</p>}
               </div>
               {
                  initProduct?.category?.category_slug === 'bien-tan' && <div>
                     <label className="block text-gray-700 font-medium mb-1">Công suất:</label>
                     <input
                        type="number"
                        {...register('product_capacity', {
                           min: { value: 1, message: 'Price must be at least 1' },
                        })}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                     {errors.product_capacity && <p className="text-red-500 text-sm mt-1">{errors.product_capacity.message}</p>}
                  </div>
               }

               <div>
                  <label className="block text-gray-700 font-medium mb-1">Là sản phẩm mới?</label>
                  <div className="flex space-x-4">
                     <label className="flex items-center space-x-2">
                        <input
                           type="radio"
                           value='true'
                           {...register('product_isnew')}
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
               </div>

               <div>
                  <label className="block text-gray-700 font-medium mb-1">Nhãn hàng:</label>
                  <select
                     {...register('brand._id', { required: 'Brand is required' })}
                     className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                           {brand.brand_name}
                        </option>
                     ))}
                  </select>
                  {/* {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>} */}
               </div>
               <div>
                  <label className="block text-gray-700 font-medium mb-1">Mô tả sản phẩm:</label>
                  <Controller
                     control={control}
                     name="product_description"
                     rules={{ required: 'Mô tả sản phẩm không được để trống' }}

                     render={({ field }) => (
                        <ReactQuill
                           {...field}
                           theme="snow"
                           className="mb-[50px] w-full h-48 rounded-lg"
                        />
                     )}
                  />
                  {errors.product_description && <p className="text-red-500 text-xs mt-2">{errors.product_description.message}</p>}

                  {/* {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>} */}
               </div>

               <button
                  type="submit"
                  className={`w-full py-2 font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasChanged ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
                  disabled={!hasChanged} // Disable button if no changes detected
               >
                  Cập nhật
               </button>
            </form >

         </div >
         <div className='max-w-md h-fit my-auto p-6 bg-white shadow-md rounded-lg mt-10'>
            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
               CẬP NHẬT HÌNH ẢNH
            </h2>
            <form onSubmit={handleSubmit(onUpdateImageSubmit)} className="space-y-4">
               <div className="relative inline-block">
                  <label className="block text-gray-700 font-medium mb-1">Ảnh bìa sản phẩm:</label>
                  <input
                     type="file"
                     {...register('product_cover_image')}
                     onChange={handleCoverImageChange}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                     Chọn ảnh bìa khác
                  </button>
               </div>
               <div className="mt-2 flex space-x-4">
                  {initImageProduct?.product_cover_image && (
                     <img src={baseURL + '/' + `${initImageProduct.product_cover_image}`} alt="Cover" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                  {coverImagePreview && (
                     <img src={coverImagePreview} alt="Cover Preview" className="mt-2 p-2 w-32 h-32 object-cover rounded border-2 border-dashed border-gray-500" />
                  )}

               </div>

               {/* Additional Images */}
               <div className="relative inline-block">
                  <label className="block text-gray-700 font-medium mb-1">Ảnh sản phẩm</label>
                  <input type="file"
                     {...register('product_images')}
                     multiple
                     onChange={handleProductImagesChange}
                     id="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                     Chọn ảnh sản phẩm
                  </button>
               </div>
               <div className="mt-2 flex space-x-2">
                  {initImageProduct?.product_images?.map((image, index) => (
                     <img key={image} src={baseURL + '/' + image} alt={`Product ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                  ))}
               </div>
               <div className="mt-2 flex space-x-2  ">
                  {imagesPreview.map((image, index) => (
                     <img key={image} src={image} alt={`Product ${index + 1}`} className="w-16 h-16 object-cover rounded border-dashed border-gray-500 border-2 p-2" />
                  ))}
               </div>
               <button
                  type="submit"
                  className={`w-full py-2 font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasImageChanged ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
                  disabled={!hasImageChanged}
               >
                  Cập nhật hình ảnh
               </button>
            </form >
         </div >

      </div >

   );
};

export default UpdateProduct;