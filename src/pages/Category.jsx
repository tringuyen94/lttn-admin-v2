import { useState, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux"
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import { createCategory, deleteCategory } from "../redux/slices/categorySlice";
import Modal from "../components/Modal";
import api, { baseURL } from "../api/axios";


export default function Category() {
   const { items } = useSelector(state => state.categories)
   const dispatch = useDispatch()
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [categoryToDelete, setCategoryToDelete] = useState(null)

   const { register, handleSubmit, reset, formState: { errors } } = useForm({
   });

   const onSubmit = async (data) => {
      const formData = new FormData();
      formData.append('category_name', data.category_name);
      formData.append('category_image', data.category_image[0]);

      try {
         await dispatch(createCategory(formData)).unwrap()
         toast.success(`Đã thêm ${data.category_name}`)
         reset()
      } catch (error) {
         toast.error(error)
      }
   }
   const handleModalClose = () => {
      setIsModalOpen(false);
      setCategoryToDelete(null);
   };
   const handleDelete = (category) => {
      setCategoryToDelete(category)
      setIsModalOpen(true);
   };
   const handleDeleteConfirm = async () => {
      if (!categoryToDelete) return;
      try {

         await dispatch(deleteCategory(categoryToDelete._id)).unwrap()
         toast.success(`Đã xoá ${categoryToDelete.category_name}`)
      } catch (error) {
         toast.error(error)
      } finally {
         setIsModalOpen(false)
      }
   }
   return (
      <Fragment>
         <div className='flex justify-evenly gap-4'>
            <Modal isOpen={isModalOpen}
               onClose={handleModalClose}
               onConfirm={handleDeleteConfirm}
               productName={categoryToDelete ? categoryToDelete.category_name : ''}
            />
            <div className="space-y-4">
               <h3 className="text-xl font-semibold">Danh sách loại sản phẩm</h3>
               <div className="space-y-2">
                  {items.map((category) => (
                     <div key={category._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-100">
                        <div>
                           <p className="text-lg font-medium">{category.category_name}</p>
                           <img src={baseURL + '/' + category.category_image} alt={category.category_name} width={50} className="rounded" />
                        </div>
                        <div className="flex space-x-2">
                           <button className="bg-red-500 text-white px-3 py-1 rounded-md" onClick={() => handleDelete(category)}>Xoá</button>
                        </div>

                     </div>
                  ))}
               </div>
            </div>
            <div className="max-w-md h-fit my-auto p-6 bg-white shadow-md rounded-lg mt-10">
               <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                  THÊM LOẠI SẢN PHẨM
               </h2>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                     <div>
                        <label className="block text-gray-700 font-medium mb-1">Nhập tên loại sản phẩm:</label>
                        <input
                           type="text"
                           {...register('category_name', { required: 'Tên loại sản phẩm không được để trống' })}
                           className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.category_name && <p className="text-red-500 text-sm mt-1">{errors.category_name.message}</p>}
                     </div>
                  </div>
                  <div>
                     <label htmlFor="category_image" className="block text-sm font-medium text-gray-700">
                        Ảnh loại sản phẩm
                     </label>
                     <input
                        type="file"
                        id="category_image"
                        {...register('category_image', {
                           validate: (value) =>
                              !value[0] || value[0].size <= 2 * 1024 * 1024 || 'Image size must be under 2MB', // 2MB limit
                        })}
                        className={`mt-1 block w-full p-2 border rounded ${errors.category_image ? 'border-red-500' : 'border-gray-300'
                           }`}
                        accept="image/*"
                     />
                     {errors.category_image && <p className="text-red-500">{errors.category_image.message}</p>}
                  </div>
                  <button
                     type="submit"
                     className='w-full py-2 font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-500 hover:bg-blue-600 text-white'
                  >
                     Thêm
                  </button>
               </form >

            </div >
         </div >
      </Fragment>
   )
}
