import { useSelector } from 'react-redux';
import Title from '@/components/Title';
import ProductTable from '@/components/ProductTable';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductList() {
   const { items, total, status } = useSelector((state) => state.products);

   return (
      <>
         <Title title="Danh sách sản phẩm" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Danh sách sản phẩm</h1>
               <p className="text-muted-foreground">
                  Quản lý tất cả sản phẩm trong hệ thống — Tổng cộng: <strong>{total}</strong> sản phẩm
               </p>
            </div>

            {status === 'loading' ? (
               <div className="space-y-3">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-[400px] w-full" />
               </div>
            ) : (
               <ProductTable products={items} />
            )}
         </div>
      </>
   );
}
