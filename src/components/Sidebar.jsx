import { NavLink, useLocation } from 'react-router-dom';
import {
   LayoutDashboard,
   Package,
   Plus,
   FolderKanban,
   Tags,
   Layers,
   KeyRound,
   Zap,
} from 'lucide-react';
import {
   Sidebar as SidebarRoot,
   SidebarContent,
   SidebarGroup,
   SidebarGroupLabel,
   SidebarGroupContent,
   SidebarMenu,
   SidebarMenuItem,
   SidebarMenuButton,
   SidebarHeader,
   SidebarFooter,
   SidebarSeparator,
} from '@/components/ui/sidebar';

const NAV_GROUPS = [
   {
      label: 'Tổng quan',
      items: [
         { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      ],
   },
   {
      label: 'Sản phẩm',
      items: [
         { path: '/danh-sach-san-pham', name: 'Danh sách sản phẩm', icon: Package },
         { path: '/them-san-pham', name: 'Thêm sản phẩm', icon: Plus },
      ],
   },
   {
      label: 'Dữ liệu',
      items: [
         { path: '/du-an-thi-cong', name: 'Dự án thi công', icon: FolderKanban },
         { path: '/hang', name: 'Nhãn hàng', icon: Tags },
         { path: '/loai-san-pham', name: 'Loại sản phẩm', icon: Layers },
      ],
   },
   {
      label: 'Cài đặt',
      items: [
         { path: '/cap-nhat-mat-khau', name: 'Đổi mật khẩu', icon: KeyRound },
      ],
   },
];

export default function AppSidebar() {
   const location = useLocation();

   return (
      <SidebarRoot collapsible="icon">
         <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="h-4 w-4" />
               </div>
               <span className="truncate text-sm font-bold tracking-tight group-data-[collapsible=icon]:hidden">
                  LTTN Electric
               </span>
            </div>
         </SidebarHeader>

         <SidebarSeparator />

         <SidebarContent>
            {NAV_GROUPS.map((group) => (
               <SidebarGroup key={group.label}>
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  <SidebarGroupContent>
                     <SidebarMenu>
                        {group.items.map((item) => (
                           <SidebarMenuItem key={item.path}>
                              <SidebarMenuButton
                                 asChild
                                 isActive={location.pathname === item.path}
                                 tooltip={item.name}
                              >
                                 <NavLink to={item.path}>
                                    <item.icon />
                                    <span>{item.name}</span>
                                 </NavLink>
                              </SidebarMenuButton>
                           </SidebarMenuItem>
                        ))}
                     </SidebarMenu>
                  </SidebarGroupContent>
               </SidebarGroup>
            ))}
         </SidebarContent>

         <SidebarFooter>
            <p className="truncate px-2 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
               &copy; {new Date().getFullYear()} LTTN Electric
            </p>
         </SidebarFooter>
      </SidebarRoot>
   );
}
