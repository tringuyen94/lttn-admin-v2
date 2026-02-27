import { useForm } from 'react-hook-form';
import api from '@/api/axios';
import { toast } from 'sonner';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';

export default function UpdatePassword() {
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors, isSubmitting },
      reset,
   } = useForm();

   const newPassword = watch('newPassword', '');

   const onSubmit = async (data) => {
      try {
         const res = await api.patch('api/v1/auth/change-password', data, { withCredentials: true });
         toast.success(res.data.message);
         reset();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Đã xảy ra lỗi');
      }
   };

   return (
      <>
         <Title title="Đổi mật khẩu" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Đổi mật khẩu</h1>
               <p className="text-muted-foreground">Cập nhật mật khẩu tài khoản của bạn</p>
            </div>

            <Card className="max-w-md">
               <CardHeader>
                  <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <KeyRound className="h-5 w-5 text-muted-foreground" />
                     </div>
                     <div>
                        <CardTitle>Mật khẩu mới</CardTitle>
                        <CardDescription>Mật khẩu phải có ít nhất 8 ký tự</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                           id="newPassword"
                           type="password"
                           placeholder="Nhập mật khẩu mới"
                           {...register('newPassword', {
                              required: 'Không được để trống',
                              minLength: {
                                 value: 8,
                                 message: 'Mật khẩu phải dài ít nhất 8 ký tự',
                              },
                           })}
                           className={errors.newPassword ? 'border-destructive' : ''}
                        />
                        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="confirmedPassword">Xác nhận mật khẩu</Label>
                        <Input
                           id="confirmedPassword"
                           type="password"
                           placeholder="Nhập lại mật khẩu"
                           {...register('confirmedPassword', {
                              required: 'Không được để trống',
                              validate: (value) =>
                                 value === newPassword || 'Mật khẩu xác nhận không khớp',
                           })}
                           className={errors.confirmedPassword ? 'border-destructive' : ''}
                        />
                        {errors.confirmedPassword && <p className="text-sm text-destructive">{errors.confirmedPassword.message}</p>}
                     </div>

                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>
      </>
   );
}
