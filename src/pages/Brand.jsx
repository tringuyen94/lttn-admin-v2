import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createBrand, deleteBrand } from '@/redux/slices/brandSlice';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
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
import { Trash2 } from 'lucide-react';

export default function Brand() {
   const { items } = useSelector((state) => state.brands);
   const dispatch = useDispatch();
   const [brandToDelete, setBrandToDelete] = useState(null);
   const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

   const onSubmit = async (data) => {
      try {
         await dispatch(createBrand(data)).unwrap();
         toast.success(`Đã thêm ${data.brand_name}`);
         reset();
      } catch (error) {
         toast.error(error);
      }
   };

   const handleDeleteConfirm = async () => {
      if (!brandToDelete) return;
      try {
         await dispatch(deleteBrand(brandToDelete._id)).unwrap();
         toast.success(`Đã xoá ${brandToDelete.brand_name}`);
      } catch (error) {
         toast.error(error);
      } finally {
         setBrandToDelete(null);
      }
   };

   return (
      <>
         <Title title="Nhãn hàng" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Nhãn hàng</h1>
               <p className="text-muted-foreground">Quản lý các nhãn hàng sản phẩm</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-2">
                  <Card>
                     <CardHeader>
                        <CardTitle>Danh sách nhãn hàng ({items.length})</CardTitle>
                     </CardHeader>
                     <CardContent>
                        {items.length === 0 ? (
                           <p className="py-8 text-center text-muted-foreground">Chưa có nhãn hàng nào.</p>
                        ) : (
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Tên nhãn hàng</TableHead>
                                    <TableHead className="w-16" />
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {items.map((brand) => (
                                    <TableRow key={brand._id}>
                                       <TableCell className="font-medium">{brand.brand_name}</TableCell>
                                       <TableCell>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setBrandToDelete(brand)}>
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        )}
                     </CardContent>
                  </Card>
               </div>

               <Card className="h-fit">
                  <CardHeader>
                     <CardTitle>Thêm nhãn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                           <Label>Tên nhãn hàng</Label>
                           <Input
                              {...register('brand_name', { required: 'Tên nhãn hàng không được để trống' })}
                              placeholder="Nhập tên nhãn hàng"
                           />
                           {errors.brand_name && <p className="text-sm text-destructive">{errors.brand_name.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? 'Đang thêm...' : 'Thêm'}
                        </Button>
                     </form>
                  </CardContent>
               </Card>
            </div>
         </div>

         <AlertDialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                  <AlertDialogDescription>
                     Bạn có chắc muốn xoá nhãn hàng <span className="font-semibold">{brandToDelete?.brand_name}</span>?
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
