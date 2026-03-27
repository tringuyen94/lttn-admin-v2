import { useLocation } from 'react-router-dom';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const ROUTE_LABELS = {
   '/dashboard': 'Dashboard',
   '/danh-sach-san-pham': 'Danh sách sản phẩm',
   '/them-san-pham': 'Thêm sản phẩm',
   '/du-an-thi-cong': 'Dự án thi công',
   '/hang': 'Nhãn hàng',
   '/loai-san-pham': 'Loại sản phẩm',
   '/cap-nhat-mat-khau': 'Đổi mật khẩu',
};

export default function Header() {
   const { logout, userData } = useAuth();
   const { theme, toggleTheme } = useTheme();
   const location = useLocation();

   const currentLabel =
      ROUTE_LABELS[location.pathname] ||
      (location.pathname.includes('/cap-nhat-san-pham') ? 'Cập nhật sản phẩm' : 'Trang');

   const handleLogout = async () => {
      await logout();
   };

   return (
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
         <SidebarTrigger className="-ml-1" />
         <Separator orientation="vertical" className="mr-2 h-4" />

         <Breadcrumb className="flex-1">
            <BreadcrumbList>
               <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">LTTN Admin</BreadcrumbLink>
               </BreadcrumbItem>
               <BreadcrumbSeparator className="hidden md:block" />
               <BreadcrumbItem>
                  <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
               </BreadcrumbItem>
            </BreadcrumbList>
         </Breadcrumb>

         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
         </Button>

         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               {userData?.username && (
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                     {userData.username}
                  </DropdownMenuItem>
               )}
               <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </header>
   );
}
