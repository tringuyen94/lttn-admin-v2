import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createCategory, deleteCategory } from '@/redux/slices/categorySlice';
import { baseURL } from '@/api/axios';
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

export default function Category() {
   const { items } = useSelector((state) => state.categories);
   const dispatch = useDispatch();
   const [categoryToDelete, setCategoryToDelete] = useState(null);

   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

   const onSubmit = async (data) => {
      const formData = new FormData();
      formData.append('category_name', data.category_name);
      formData.append('category_image', data.category_image[0]);

      try {
         await dispatch(createCategory(formData)).unwrap();
         toast.success(`Đã thêm ${data.category_name}`);
         reset();
      } catch (error) {
         toast.error(error);
      }
   };

   const handleDeleteConfirm = async () => {
      if (!categoryToDelete) return;
      try {
         await dispatch(deleteCategory(categoryToDelete._id)).unwrap();
         toast.success(`Đã xoá ${categoryToDelete.category_name}`);
      } catch (error) {
         toast.error(error);
      } finally {
         setCategoryToDelete(null);
      }
   };

   return (
      <>
         <Title title="Loại sản phẩm" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Loại sản phẩm</h1>
               <p className="text-muted-foreground">Quản lý các danh mục sản phẩm</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-2">
                  <Card>
                     <CardHeader>
                        <CardTitle>Danh sách ({items.length})</CardTitle>
                     </CardHeader>
                     <CardContent>
                        {items.length === 0 ? (
                           <p className="py-8 text-center text-muted-foreground">Chưa có loại sản phẩm nào.</p>
                        ) : (
                           <div className="grid gap-3 sm:grid-cols-2">
                              {items.map((category) => (
                                 <div key={category._id} className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                    <img
                                       src={baseURL + category.category_image}
                                       alt={category.category_name}
                                       className="h-12 w-12 shrink-0 rounded-md object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                       <p className="truncate font-medium">{category.category_name}</p>
                                    </div>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-8 w-8 shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                                       onClick={() => setCategoryToDelete(category)}
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
                     <CardTitle>Thêm loại sản phẩm</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                           <Label>Tên loại sản phẩm</Label>
                           <Input
                              {...register('category_name', { required: 'Tên loại sản phẩm không được để trống' })}
                              placeholder="Nhập tên loại sản phẩm"
                           />
                           {errors.category_name && <p className="text-sm text-destructive">{errors.category_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                           <Label>Ảnh danh mục</Label>
                           <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                              <input
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 {...register('category_image', {
                                    validate: (value) =>
                                       !value[0] || value[0].size <= 2 * 1024 * 1024 || 'Ảnh phải nhỏ hơn 2MB',
                                 })}
                              />
                              <ImagePlus className="h-6 w-6 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Chọn ảnh</span>
                           </label>
                           {errors.category_image && <p className="text-sm text-destructive">{errors.category_image.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? 'Đang thêm...' : 'Thêm'}
                        </Button>
                     </form>
                  </CardContent>
               </Card>
            </div>
         </div>

         <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                  <AlertDialogDescription>
                     Bạn có chắc muốn xoá loại sản phẩm <span className="font-semibold">{categoryToDelete?.category_name}</span>?
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
