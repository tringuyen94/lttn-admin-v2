import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import { createProject, deleteProject } from '@/redux/slices/projectSlice';
import { useSelector, useDispatch } from 'react-redux';
import { baseURL } from '@/api/axios';
import { toast } from 'sonner';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, ImagePlus } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

export default function Project() {
   const projects = useSelector((state) => state.projects.items);
   const dispatch = useDispatch();
   const [imagePreview, setImagePreview] = useState();
   const [projectToDelete, setProjectToDelete] = useState(null);

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      control,
      reset,
   } = useForm();

   const onSubmit = async (data) => {
      const formData = new FormData();
      formData.append('project_title', data.project_title);
      formData.append('project_content', data.project_content);
      if (data.project_thumbnail?.[0]) {
         formData.append('project_thumbnail', data.project_thumbnail[0]);
      }

      try {
         await dispatch(createProject(formData)).unwrap();
         toast.success(`Đã thêm ${data.project_title}`);
         reset();
         setImagePreview(null);
      } catch (error) {
         toast.error(error);
      }
   };

   const handleDeleteConfirm = async () => {
      if (!projectToDelete) return;
      try {
         await dispatch(deleteProject(projectToDelete._id)).unwrap();
         toast.success(`Đã xoá ${projectToDelete.project_title}`);
      } catch (error) {
         toast.error(error);
      } finally {
         setProjectToDelete(null);
      }
   };

   const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setImagePreview(reader.result);
         reader.readAsDataURL(file);
      }
   };

   return (
      <>
         <Title title="Dự án thi công" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Dự án thi công</h1>
               <p className="text-muted-foreground">Quản lý các dự án thi công đã thực hiện</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-2">
                  <Card>
                     <CardHeader>
                        <CardTitle>Danh sách dự án ({projects.length})</CardTitle>
                     </CardHeader>
                     <CardContent>
                        {projects.length === 0 ? (
                           <p className="py-8 text-center text-muted-foreground">Chưa có dự án nào.</p>
                        ) : (
                           <div className="grid gap-3 sm:grid-cols-2">
                              {projects.map((project) => (
                                 <div key={project._id} className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                    {project.project_thumbnail && (
                                       <img
                                          src={baseURL + project.project_thumbnail}
                                          alt={project.project_title}
                                          className="h-16 w-16 shrink-0 rounded-md object-cover"
                                       />
                                    )}
                                    <div className="min-w-0 flex-1">
                                       <p className="font-medium leading-tight">{project.project_title}</p>
                                    </div>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-8 w-8 shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                                       onClick={() => setProjectToDelete(project)}
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              ))}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>

               <Card className="h-fit">
                  <CardHeader>
                     <CardTitle>Thêm dự án</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                           <Label>Tiêu đề</Label>
                           <Input
                              {...register('project_title', { required: 'Tiêu đề không được để trống' })}
                              placeholder="Nhập tiêu đề dự án"
                           />
                           {errors.project_title && <p className="text-sm text-destructive">{errors.project_title.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>Ảnh đại diện</Label>
                           <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                              <input
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 {...register('project_thumbnail', {
                                    required: 'Ảnh đại diện không được để trống',
                                    validate: (value) =>
                                       !value[0] || value[0].size <= 2 * 1024 * 1024 || 'Ảnh phải nhỏ hơn 2MB',
                                 })}
                                 onChange={handleImageChange}
                              />
                              {imagePreview ? (
                                 <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                              ) : (
                                 <>
                                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Chọn ảnh</span>
                                 </>
                              )}
                           </label>
                           {errors.project_thumbnail && <p className="text-sm text-destructive">{errors.project_thumbnail.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>Nội dung dự án</Label>
                           <Controller
                              control={control}
                              name="project_content"
                              rules={{ required: 'Nội dung không được để trống' }}
                              render={({ field }) => (
                                 <ReactQuill {...field} theme="snow" className="[&_.ql-container]:min-h-[100px] [&_.ql-editor]:min-h-[100px]" />
                              )}
                           />
                           {errors.project_content && <p className="text-sm text-destructive">{errors.project_content.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? 'Đang thêm...' : 'Thêm dự án'}
                        </Button>
                     </form>
                  </CardContent>
               </Card>
            </div>
         </div>

         <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                  <AlertDialogDescription>
                     Bạn có chắc muốn xoá dự án <span className="font-semibold">{projectToDelete?.project_title}</span>?
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                     Xoá
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
