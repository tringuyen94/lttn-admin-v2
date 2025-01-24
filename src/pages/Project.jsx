
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createProject } from '../redux/slices/projectSlice';
import { useSelector } from 'react-redux';
import { baseURL } from '../api/axios';
import { toast } from 'react-toastify';

const Project = () => {
   const projects = useSelector(state => state.projects.items)
   const [imagePreview, setImagePreview] = useState()
   const {
      register,
      handleSubmit,
      formState: { errors },
      control,
      reset,
   } = useForm();

   const onSubmit = async (data) => {
      const formData = new FormData();
      formData.append('project_title', data.project_title);
      formData.append('project_content', data.project_content);

      // Append thumbnail file if selected
      if (data.project_thumbnail && data.project_thumbnail[0]) {
         formData.append('project_thumbnail', data.project_thumbnail[0]);
      }

      try {
         await dispatch(createProject(formData)).unwrap()
         toast.success(`Đã thêm ${data.project_title}`)
         reset()
      } catch (error) {
         toast.error(error)
      }
   };
   const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setImagePreview(reader.result);
         reader.readAsDataURL(file);
      }
   }
   return (
      <div className='max-w-2xl mx-auto space-y-8'>
         <div className="space-y-4">
            {projects.length === 0 ? (
               <p className="text-gray-500">No projects available.</p>
            ) : (
               <ul className="space-y-2 flex justify-around">
                  {projects.map((project) => (
                     <li
                        key={project._id}
                        className="border p-4 rounded shadow-sm bg-white"
                     >
                        <h3 className="text-lg font-bold">{project.project_title}</h3>
                        {project.project_thumbnail && (
                           <img
                              src={baseURL + '/' + `${project.project_thumbnail}`}
                              alt={project.project_title}
                              className="mt-4 w-20 h-20 object-cover rounded"
                           />
                        )}
                     </li>
                  ))}
               </ul>
            )}
         </div>
         <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-center">Thêm dự án</h2>

            {/* Project Title */}
            <div>
               <label htmlFor="project_title" className="block text-sm font-medium text-gray-700">
                  Tiêu đề
               </label>
               <input
                  type="text"
                  id="project_title"
                  {...register('project_title', {
                     required: 'Tiêu đề không được để trống',
                  })}
                  className={`mt-1 block w-full p-2 border rounded ${errors.project_title ? 'border-red-500' : 'border-gray-300'
                     }`}
               />
               {errors.project_title && <p className="text-red-500">{errors.project_title.message}</p>}
            </div>

            {/* Project Thumbnail */}
            <div>
               <label htmlFor="project_thumbnail" className="block text-sm font-medium text-gray-700">
                  Ảnh tiêu đề
               </label>
               <input
                  type="file"
                  id="project_thumbnail"
                  {...register('project_thumbnail', {
                     required: "Không được để trống",
                     validate: (value) =>
                        !value[0] || value[0].size <= 2 * 1024 * 1024 || 'Image size must be under 2MB',
                  })}
                  onChange={handleImageChange}
                  className={`mt-1 block w-full p-2 border rounded ${errors.project_thumbnail ? 'border-red-500' : 'border-gray-300'
                     }`}
                  accept="image/*"
               />
               {errors.project_thumbnail && (
                  <p className="text-red-500">{errors.project_thumbnail.message}</p>
               )}
               <div className="mt-2 flex space-x-2  ">
                  {imagePreview && (
                     <img src={imagePreview} alt="Cover Preview" className="mt-2 p-2 w-32 h-32 object-cover rounded border-2 border-dashed border-gray-500" />
                  )}
               </div>
            </div>

            {/* Project Content */}
            <div >
               <label className="block text-gray-700 font-medium mb-1">Mô tả sản phẩm</label>
               <Controller
                  control={control}
                  name="project_content"
                  rules={{ required: 'Nội dung Không được để trống' }}

                  render={({ field }) => (
                     <ReactQuill
                        {...field}
                        theme="snow"
                        className="mb-[50px] w-full h-48 rounded-lg"
                     />
                  )}
               />
               {errors.product_description && <p className="text-red-500 text-xs mt-2">{errors.product_description.message}</p>}
            </div>

            {/* Submit Button */}
            <button
               type="submit"
               className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
               Thêm
            </button>
         </form>
      </div>

   );
};

export default Project;
