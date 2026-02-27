import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function Login() {
   const { login, isAuthenticated } = useAuth();
   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

   const onSubmit = async (data) => {
      await login(data.username, data.password);
   };

   if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
   }

   return (
      <>
         <Title title="Đăng nhập" />
         <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
               <CardHeader className="items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                     <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">LTTN Electric</CardTitle>
                  <CardDescription>Đăng nhập để quản lý hệ thống</CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <Input
                           id="username"
                           placeholder="Nhập tên đăng nhập"
                           {...register('username', {
                              required: 'Tên đăng nhập không được để trống',
                           })}
                           className={errors.username ? 'border-destructive' : ''}
                        />
                        {errors.username && (
                           <p className="text-sm text-destructive">{errors.username.message}</p>
                        )}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                           id="password"
                           type="password"
                           placeholder="Nhập mật khẩu"
                           {...register('password', {
                              required: 'Mật khẩu không được để trống',
                           })}
                           className={errors.password ? 'border-destructive' : ''}
                        />
                        {errors.password && (
                           <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                     </div>

                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>
      </>
   );
}
