import { useState, useMemo } from 'react';
import {
   useReactTable,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   flexRender,
} from '@tanstack/react-table';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Pencil, Trash2, ArrowUpDown, Search } from 'lucide-react';
import { deleteProduct } from '@/redux/slices/productSlice';
import { baseURL } from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';

export default function ProductTable({ products }) {
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const [sorting, setSorting] = useState([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [productToDelete, setProductToDelete] = useState(null);

   const handleDeleteConfirm = async () => {
      if (!productToDelete) return;
      try {
         await dispatch(deleteProduct(productToDelete._id)).unwrap();
         toast.success(`Đã xoá ${productToDelete.product_name}`);
      } catch (error) {
         toast.error(error);
      } finally {
         setProductToDelete(null);
      }
   };

   const columns = useMemo(() => [
      {
         id: 'image',
         header: 'Ảnh',
         cell: ({ row }) => {
            const src = row.original.product_images?.[0] || row.original.product_cover_image;
            return src ? (
               <img src={baseURL + src} alt={row.original.product_name} className="h-10 w-10 rounded object-cover" />
            ) : (
               <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">N/A</div>
            );
         },
         enableSorting: false,
         enableGlobalFilter: false,
      },
      {
         accessorFn: (row) => row.category?.category_name ?? '',
         id: 'category',
         header: 'Loại SP',
         cell: ({ getValue }) => (
            <Badge variant="secondary" className="font-normal">
               {getValue()}
            </Badge>
         ),
      },
      {
         accessorKey: 'product_name',
         header: ({ column }) => (
            <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
               Tên sản phẩm
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         ),
      },
      {
         accessorKey: 'product_isnew',
         header: ({ column }) => (
            <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
               Trạng thái
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         ),
         cell: ({ getValue }) => (
            <Badge variant={getValue() ? 'default' : 'outline'}>
               {getValue() ? 'Mới' : 'Cũ'}
            </Badge>
         ),
      },
      {
         accessorFn: (row) => row.brand?.brand_name ?? '',
         id: 'brand',
         header: ({ column }) => (
            <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
               Hãng
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         ),
      },
      {
         accessorKey: 'createdAt',
         header: ({ column }) => (
            <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
               Ngày tạo
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         ),
         cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('vi-VN'),
      },
      {
         id: 'actions',
         header: '',
         cell: ({ row }) => (
            <div className="flex justify-end gap-1">
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/san-pham/cap-nhat-san-pham/${row.original._id}`)}
               >
                  <Pencil className="h-4 w-4" />
               </Button>
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setProductToDelete(row.original)}
               >
                  <Trash2 className="h-4 w-4" />
               </Button>
            </div>
         ),
      },
   ], [navigate]);

   const table = useReactTable({
      data: products,
      columns,
      state: { sorting, globalFilter },
      onSortingChange: setSorting,
      onGlobalFilterChange: setGlobalFilter,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize: 15 } },
   });

   return (
      <div className="space-y-4">
         <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
               placeholder="Tìm kiếm sản phẩm..."
               value={globalFilter}
               onChange={(e) => setGlobalFilter(e.target.value)}
               className="pl-9"
            />
         </div>

         <div className="rounded-md border">
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <TableHead key={header.id}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                           </TableHead>
                        ))}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {table.getRowModel().rows.length ? (
                     table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                           Không có sản phẩm nào.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
               {table.getFilteredRowModel().rows.length} sản phẩm
            </p>
            <div className="flex gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
               >
                  Trước
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
               >
                  Sau
               </Button>
            </div>
         </div>

         <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                  <AlertDialogDescription>
                     Bạn có chắc muốn xoá <span className="font-semibold">{productToDelete?.product_name}</span>?
                     Hành động này không thể hoàn tác.
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
      </div>
   );
}
