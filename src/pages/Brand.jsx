import { useState, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux"
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import { createBrand, deleteBrand } from "../redux/slices/brandSlice";
import Modal from "../components/Modal";
export default function Brand() {
   const { items } = useSelector(state => state.brands)
   const dispatch = useDispatch()
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [brandToDelete, setBrandToDelete] = useState(null)
   const { register, handleSubmit, formState: { errors }, reset } = useForm({
   });

   const onSubmit = async (data) => {
      try {
         await dispatch(createBrand(data)).unwrap()
         toast.success(`Đã thêm ${data.brand_name}`)
         reset()
      } catch (error) {
         toast.error(error)
      }
   }

   const handleModalClose = () => {
      setIsModalOpen(false);
      setBrandToDelete(null);
   };

   const handleDelete = (brand) => {
      setBrandToDelete(brand)
      setIsModalOpen(true);
   };

   const handleDeleteConfirm = async () => {
      if (!brandToDelete) return;
      try {

         await dispatch(deleteBrand(brandToDelete._id)).unwrap()
         toast.success(`Đã xoá ${brandToDelete.brand_name}`)
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
               productName={brandToDelete ? brandToDelete.brand_name : ''}
            />
            <div className="space-y-4">
               <h3 className="text-xl font-semibold">Danh sách nhãn hàng</h3>
               <div className="space-y-2">
                  {items.map((brand) => (
                     <div key={brand._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-100">
                        <div>
                           <p className="text-lg font-medium">{brand.brand_name}</p>
                           <p className="text-sm text-gray-600">{brand.brand_slug}</p>
                        </div>
                        <div className="flex space-x-2">
                           <button className="bg-red-500 text-white px-3 py-1 rounded-md" onClick={() => handleDelete(brand)}>Xoá</button>
                        </div>

                     </div>
                  ))}
               </div>
            </div>
            <div className="max-w-md h-fit my-auto p-6 bg-white shadow-md rounded-lg mt-10">
               <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                  THÊM NHÃN HÀNG
               </h2>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                     <div>
                        <label className="block text-gray-700 font-medium mb-1">Tên nhãn hàng mới:</label>
                        <input
                           type="text"
                           {...register('brand_name', { required: 'Tên nhãn hàng không được để trống' })}
                           className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.brand_name && <p className="text-red-500 text-sm mt-1">{errors.brand_name.message}</p>}
                     </div>
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
