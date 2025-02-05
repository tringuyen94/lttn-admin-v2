import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { toast } from 'react-toastify';
export default function UpdatePassword() {
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
      reset,
   } = useForm()
   const onSubmit = async (data) => {
      try {
         // Replace with your API call logic
         const res = await api.patch('api/v1/auth/change-password', data, { withCredentials: true })
         toast.success(res.data.message)
         reset(); // Reset the form
      } catch (err) {
         toast.error(err.response.data.message || 'Something wrong')
      }
   };

   // Watch newPassword to validate confirmedPassword
   const newPassword = watch('newPassword', '');
   return (
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
         <h2 className="text-2xl font-bold text-center">Cập nhật mật khẩu</h2>
         {/* New Password Field */}
         <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
               Mật khẩu mới
            </label>
            <input
               type="password"
               id="newPassword"
               {...register('newPassword', {
                  required: 'Không được để trống ô này',
                  minLength: {
                     value: 8,
                     message: 'Mật khẩu yêu cầu phải dài 8 ký tự',
                  },
               })}
               className={`mt-1 block w-full p-2 border rounded ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
            />
            {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
         </div>

         {/* Confirm Password Field */}
         <div>
            <label htmlFor="confirmedPassword" className="block text-sm font-medium text-gray-700">
               Xác nhận mật khẩu
            </label>
            <input
               type="password"
               id="confirmedPassword"
               {...register('confirmedPassword', {
                  required: 'Không được để trống ô này',
                  validate: (value) =>
                     value === newPassword || 'Trường này phải giống với ô mật khẩu',
               })}
               className={`mt-1 block w-full p-2 border rounded ${errors.confirmedPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
            />
            {errors.confirmedPassword && (
               <p className="text-red-500">{errors.confirmedPassword.message}</p>
            )}
         </div>

         {/* Submit Button */}
         <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
         >
            Cập nhật
         </button>
      </form>
   )
}
