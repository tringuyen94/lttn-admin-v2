import { useSelector } from 'react-redux';
import { Package, FolderKanban, Tags, Layers } from 'lucide-react';
import Title from './Title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATS = [
   { key: 'products', label: 'Sản phẩm', icon: Package, selector: (s) => s.products.total },
   { key: 'projects', label: 'Dự án', icon: FolderKanban, selector: (s) => s.projects.items.length },
   { key: 'brands', label: 'Nhãn hàng', icon: Tags, selector: (s) => s.brands.items.length },
   { key: 'categories', label: 'Loại SP', icon: Layers, selector: (s) => s.categories.items.length },
];

export default function Dashboard() {
   return (
      <>
         <Title title="Trang chủ" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
               <p className="text-muted-foreground">Tổng quan hệ thống quản lý LTTN Electric</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
               {STATS.map((stat) => (
                  <StatCard key={stat.key} stat={stat} />
               ))}
            </div>
         </div>
      </>
   );
}

function StatCard({ stat }) {
   const value = useSelector(stat.selector);
   const Icon = stat.icon;

   return (
      <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
               {stat.label}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
         </CardHeader>
         <CardContent>
            <div className="text-3xl font-bold">{value}</div>
         </CardContent>
      </Card>
   );
}
