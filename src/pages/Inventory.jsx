import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
   fetchInventory,
   fetchInventoryLots,
   createInventory,
   deleteInventory,
   processTransaction,
   fetchTransactions,
} from '@/redux/slices/inventorySlice';
import { fetchProducts } from '@/redux/slices/productSlice';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
   Trash2,
   ArrowDownToLine,
   ArrowUpFromLine,
   Plus,
   History,
   Package,
   Download,
   CalendarIcon,
   ChevronDown,
   ChevronRight,
} from 'lucide-react';
import XLSX from 'xlsx-js-style';

const LOW_STOCK_THRESHOLD = 5;

const formatPrice = (value) => {
   if (value === undefined || value === null || value === '') return '-';
   return Number(value).toLocaleString('vi-VN');
};

function MoneyInput({ control, name, rules, readOnly, displayValue, ...rest }) {
   if (readOnly) {
      const formatted =
         displayValue === undefined || displayValue === null || displayValue === ''
            ? ''
            : Number(displayValue).toLocaleString('vi-VN');
      return <Input readOnly value={formatted} {...rest} />;
   }
   return (
      <Controller
         control={control}
         name={name}
         rules={rules}
         render={({ field }) => {
            const display =
               field.value === '' || field.value === undefined || field.value === null
                  ? ''
                  : Number(String(field.value).replace(/\D/g, '')).toLocaleString('vi-VN');
            return (
               <Input
                  {...rest}
                  inputMode="numeric"
                  value={display}
                  onChange={(e) => {
                     const digits = e.target.value.replace(/\D/g, '');
                     field.onChange(digits);
                  }}
                  onBlur={field.onBlur}
               />
            );
         }}
      />
   );
}

export default function Inventory() {
   const dispatch = useDispatch();
   const { items, transactions, status } = useSelector((state) => state.inventory);
   const { items: products } = useSelector((state) => state.products);

   const [search, setSearch] = useState('');
   const [toDelete, setToDelete] = useState(null);
   const [txDialog, setTxDialog] = useState(null); // { type, inventory }
   const [addDialogOpen, setAddDialogOpen] = useState(false);
   const [txFilter, setTxFilter] = useState('all');
   const [txSearch, setTxSearch] = useState('');
   const [txDateFrom, setTxDateFrom] = useState(undefined);
   const [txDateTo, setTxDateTo] = useState(undefined);
   const [txLot, setTxLot] = useState('');
   const [activeTab, setActiveTab] = useState('inventory');
   const [expanded, setExpanded] = useState({});

   useEffect(() => {
      dispatch(fetchInventory());
      dispatch(fetchTransactions());
   }, [dispatch]);

   useEffect(() => {
      if (!products || products.length === 0) dispatch(fetchProducts());
   }, [dispatch, products]);

   const filteredTransactions = useMemo(() => {
      return transactions.filter((t) => {
         if (txFilter !== 'all' && t.transaction_type !== txFilter) return false;
         if (txSearch && !t.product?.product_name?.toLowerCase().includes(txSearch.toLowerCase())) return false;
         if (txLot && !t.lot_code?.toLowerCase().includes(txLot.toLowerCase())) return false;
         if (txDateFrom) {
            if (new Date(t.createdAt) < txDateFrom) return false;
         }
         if (txDateTo) {
            const endOfDay = new Date(txDateTo);
            endOfDay.setHours(23, 59, 59, 999);
            if (new Date(t.createdAt) > endOfDay) return false;
         }
         return true;
      });
   }, [transactions, txFilter, txSearch, txDateFrom, txDateTo, txLot]);

   const productsNotInStock = useMemo(() => {
      const ids = new Set(items.map((i) => i.product?._id));
      return (products || []).filter((p) => !ids.has(p._id));
   }, [items, products]);

   const filtered = useMemo(() => {
      if (!search.trim()) return items;
      const q = search.toLowerCase();
      return items.filter((i) => i.product?.product_name?.toLowerCase().includes(q));
   }, [items, search]);

   const stats = useMemo(() => {
      const total = items.length;
      const totalQty = items.reduce((s, i) => s + (i.total_quantity || 0), 0);
      const lowStock = items.filter((i) => (i.total_quantity || 0) > 0 && (i.total_quantity || 0) <= LOW_STOCK_THRESHOLD).length;
      const outOfStock = items.filter((i) => (i.total_quantity || 0) === 0).length;
      return { total, totalQty, lowStock, outOfStock };
   }, [items]);

   const refreshAfterTransaction = (productId) => {
      dispatch(fetchInventory());
      dispatch(fetchTransactions());
      if (productId) dispatch(fetchInventoryLots(productId));
   };

   const handleExportExcel = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const COLS = 7;

      const border = {
         top: { style: 'thin', color: { rgb: 'B0B0B0' } },
         bottom: { style: 'thin', color: { rgb: 'B0B0B0' } },
         left: { style: 'thin', color: { rgb: 'B0B0B0' } },
         right: { style: 'thin', color: { rgb: 'B0B0B0' } },
      };
      const titleStyle = {
         font: { bold: true, sz: 16, color: { rgb: '1A1A2E' } },
         alignment: { horizontal: 'left', vertical: 'center' },
      };
      const dateStyle = {
         font: { bold: true, sz: 11, color: { rgb: '555555' } },
         alignment: { horizontal: 'right', vertical: 'center' },
      };
      const headerStyle = {
         font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
         fill: { fgColor: { rgb: '1A1A2E' } },
         alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
         border,
      };
      const cellStyle = { font: { sz: 10 }, alignment: { vertical: 'center' }, border };
      const cellCenter = { ...cellStyle, alignment: { horizontal: 'center', vertical: 'center' } };
      const cellRight = { ...cellStyle, alignment: { horizontal: 'right', vertical: 'center' } };
      const numberFormat = { ...cellRight, numFmt: '#,##0' };
      const totalStyle = {
         font: { bold: true, sz: 11, color: { rgb: '1A1A2E' } },
         fill: { fgColor: { rgb: 'E8E8E8' } },
         alignment: { vertical: 'center' },
         border,
      };
      const totalRight = { ...totalStyle, alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };

      const ws = XLSX.utils.aoa_to_sheet([[]]);

      const setCellVal = (ref, val, style) => {
         const type = typeof val === 'number' ? 'n' : 's';
         ws[ref] = { v: val, t: type, s: style };
      };

      setCellVal('A1', 'DANH SÁCH HÀNG HÓA TRONG KHO (THEO LÔ)', titleStyle);
      setCellVal('G1', `Cập nhật: ${dateStr}`, dateStyle);

      const headers = ['STT', 'SẢN PHẨM', 'LÔ', 'TỒN', 'MUA VÀO', 'BÁN RA', 'GHI CHÚ'];
      const headerRow = 2;
      headers.forEach((h, c) => {
         setCellVal(XLSX.utils.encode_cell({ r: headerRow, c }), h, headerStyle);
      });

      const dataStartRow = 3;
      let rowIndex = 0;
      let totalQty = 0;

      items.forEach((item) => {
         const lots = item.lots || [];
         if (lots.length === 0) {
            const r = dataStartRow + rowIndex;
            const rowBg = rowIndex % 2 === 1 ? { fgColor: { rgb: 'F5F5F5' } } : undefined;
            const cs = rowBg ? { ...cellStyle, fill: rowBg } : cellStyle;
            const cc = rowBg ? { ...cellCenter, fill: rowBg } : cellCenter;
            setCellVal(XLSX.utils.encode_cell({ r, c: 0 }), rowIndex + 1, cc);
            setCellVal(XLSX.utils.encode_cell({ r, c: 1 }), item.product?.product_name || '(Đã xoá)', cs);
            setCellVal(XLSX.utils.encode_cell({ r, c: 2 }), '(Chưa có lô)', cc);
            setCellVal(XLSX.utils.encode_cell({ r, c: 3 }), 0, { ...cc, numFmt: '#,##0' });
            setCellVal(XLSX.utils.encode_cell({ r, c: 4 }), '', cs);
            setCellVal(XLSX.utils.encode_cell({ r, c: 5 }), '', cs);
            setCellVal(XLSX.utils.encode_cell({ r, c: 6 }), item.inventory_note || '', cs);
            rowIndex++;
            return;
         }
         lots.forEach((lot) => {
            const r = dataStartRow + rowIndex;
            const rowBg = rowIndex % 2 === 1 ? { fgColor: { rgb: 'F5F5F5' } } : undefined;
            const cs = rowBg ? { ...cellStyle, fill: rowBg } : cellStyle;
            const cc = rowBg ? { ...cellCenter, fill: rowBg } : cellCenter;
            const nf = rowBg ? { ...numberFormat, fill: rowBg } : numberFormat;
            setCellVal(XLSX.utils.encode_cell({ r, c: 0 }), rowIndex + 1, cc);
            setCellVal(XLSX.utils.encode_cell({ r, c: 1 }), item.product?.product_name || '(Đã xoá)', cs);
            setCellVal(XLSX.utils.encode_cell({ r, c: 2 }), lot.lot_code, cc);
            setCellVal(XLSX.utils.encode_cell({ r, c: 3 }), lot.lot_quantity || 0, nf);
            setCellVal(XLSX.utils.encode_cell({ r, c: 4 }), lot.lot_purchase_price || 0, nf);
            setCellVal(XLSX.utils.encode_cell({ r, c: 5 }), lot.lot_selling_price || 0, nf);
            setCellVal(XLSX.utils.encode_cell({ r, c: 6 }), lot.lot_note || item.inventory_note || '', cs);
            totalQty += lot.lot_quantity || 0;
            rowIndex++;
         });
      });

      const totalRow = dataStartRow + rowIndex + 1;
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 0 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 1 }), `TỔNG CỘNG: ${items.length} sản phẩm / ${rowIndex} dòng lô`, totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 2 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 3 }), totalQty, totalRight);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 4 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 5 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 6 }), '', totalStyle);

      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRow, c: COLS - 1 } });
      ws['!cols'] = [
         { wch: 6 }, { wch: 45 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 30 },
      ];
      ws['!rows'] = [{ hpt: 30 }, { hpt: 10 }, { hpt: 24 }];
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tồn kho theo lô');

      const fileName = `DANH-SACH-HANG-HOA-${dateStr.replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Đã xuất file Excel');
   };

   const handleExportTransactions = () => {
      if (filteredTransactions.length === 0) {
         toast.error('Không có dữ liệu để xuất');
         return;
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const COLS = 8;

      const filterLabel = txFilter === 'stock_in' ? 'NHẬP KHO' : txFilter === 'stock_out' ? 'XUẤT KHO' : 'NHẬP/XUẤT KHO';

      const border = {
         top: { style: 'thin', color: { rgb: 'B0B0B0' } },
         bottom: { style: 'thin', color: { rgb: 'B0B0B0' } },
         left: { style: 'thin', color: { rgb: 'B0B0B0' } },
         right: { style: 'thin', color: { rgb: 'B0B0B0' } },
      };
      const titleStyle = {
         font: { bold: true, sz: 16, color: { rgb: '1A1A2E' } },
         alignment: { horizontal: 'left', vertical: 'center' },
      };
      const dateStyle = {
         font: { bold: true, sz: 11, color: { rgb: '555555' } },
         alignment: { horizontal: 'right', vertical: 'center' },
      };
      const headerStyle = {
         font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
         fill: { fgColor: { rgb: '1A1A2E' } },
         alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
         border,
      };
      const cellStyle = { font: { sz: 10 }, alignment: { vertical: 'center' }, border };
      const cellCenter = { ...cellStyle, alignment: { horizontal: 'center', vertical: 'center' } };
      const cellRight = { ...cellStyle, alignment: { horizontal: 'right', vertical: 'center' } };
      const numberFormat = { ...cellRight, numFmt: '#,##0' };
      const stockInBadge = { ...cellCenter, font: { sz: 10, bold: true, color: { rgb: '16A34A' } } };
      const stockOutBadge = { ...cellCenter, font: { sz: 10, bold: true, color: { rgb: 'EA580C' } } };
      const totalStyle = {
         font: { bold: true, sz: 11, color: { rgb: '1A1A2E' } },
         fill: { fgColor: { rgb: 'E8E8E8' } },
         alignment: { vertical: 'center' },
         border,
      };
      const totalRight = { ...totalStyle, alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };

      const ws = XLSX.utils.aoa_to_sheet([[]]);
      const setCellVal = (ref, val, style) => {
         const type = typeof val === 'number' ? 'n' : 's';
         ws[ref] = { v: val, t: type, s: style };
      };

      setCellVal('A1', `LỊCH SỬ ${filterLabel}`, titleStyle);
      setCellVal('H1', `Cập nhật: ${dateStr}`, dateStyle);

      const headers = ['STT', 'THỜI GIAN', 'SẢN PHẨM', 'LOẠI', 'LÔ', 'SỐ LƯỢNG', 'MUA VÀO', 'BÁN RA'];
      const headerRow = 2;
      headers.forEach((h, c) => {
         setCellVal(XLSX.utils.encode_cell({ r: headerRow, c }), h, headerStyle);
      });

      const dataStartRow = 3;
      let totalQty = 0;
      filteredTransactions.forEach((tx, index) => {
         const r = dataStartRow + index;
         const isIn = tx.transaction_type === 'stock_in';
         const qty = tx.transaction_quantity || 0;
         totalQty += isIn ? qty : -qty;

         const rowBg = index % 2 === 1 ? { fgColor: { rgb: 'F5F5F5' } } : undefined;
         const cs = rowBg ? { ...cellStyle, fill: rowBg } : cellStyle;
         const cc = rowBg ? { ...cellCenter, fill: rowBg } : cellCenter;
         const nf = rowBg ? { ...numberFormat, fill: rowBg } : numberFormat;
         const badge = isIn
            ? (rowBg ? { ...stockInBadge, fill: rowBg } : stockInBadge)
            : (rowBg ? { ...stockOutBadge, fill: rowBg } : stockOutBadge);
         const qtyStyle = {
            ...nf,
            font: { sz: 10, bold: true, color: { rgb: isIn ? '16A34A' : 'EA580C' } },
         };

         setCellVal(XLSX.utils.encode_cell({ r, c: 0 }), index + 1, cc);
         setCellVal(XLSX.utils.encode_cell({ r, c: 1 }), new Date(tx.createdAt).toLocaleString('vi-VN'), cs);
         setCellVal(XLSX.utils.encode_cell({ r, c: 2 }), tx.product?.product_name || '(Đã xoá)', cs);
         setCellVal(XLSX.utils.encode_cell({ r, c: 3 }), isIn ? 'Nhập kho' : 'Xuất kho', badge);
         setCellVal(XLSX.utils.encode_cell({ r, c: 4 }), tx.lot_code || '', cc);
         setCellVal(XLSX.utils.encode_cell({ r, c: 5 }), isIn ? qty : -qty, qtyStyle);
         setCellVal(XLSX.utils.encode_cell({ r, c: 6 }), tx.transaction_purchase_price || 0, nf);
         setCellVal(XLSX.utils.encode_cell({ r, c: 7 }), tx.transaction_selling_price || 0, nf);
      });

      const totalRow = dataStartRow + filteredTransactions.length + 1;
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 0 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 1 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 2 }), `TỔNG CỘNG: ${filteredTransactions.length} giao dịch`, totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 3 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 4 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 5 }), totalQty, totalRight);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 6 }), '', totalStyle);
      setCellVal(XLSX.utils.encode_cell({ r: totalRow, c: 7 }), '', totalStyle);

      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRow, c: COLS - 1 } });
      ws['!cols'] = [
         { wch: 6 }, { wch: 20 }, { wch: 40 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
      ];
      ws['!rows'] = [{ hpt: 30 }, { hpt: 10 }, { hpt: 24 }];
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử');

      const filterSuffix = txFilter === 'stock_in' ? '-NHAP-KHO' : txFilter === 'stock_out' ? '-XUAT-KHO' : '';
      const fileName = `LICH-SU-NHAP-XUAT${filterSuffix}-${dateStr.replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Đã xuất file Excel');
   };

   const handleDeleteConfirm = async () => {
      if (!toDelete) return;
      try {
         await dispatch(deleteInventory(toDelete._id)).unwrap();
         dispatch(fetchTransactions());
         toast.success('Đã xoá khỏi kho');
      } catch (error) {
         toast.error(error);
      } finally {
         setToDelete(null);
      }
   };

   const toggleExpand = (id) => {
      setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
   };

   return (
      <>
         <Title title="Quản lý kho" />
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">Quản lý kho</h1>
                  <p className="text-muted-foreground">Theo dõi tồn kho theo lô và nhập/xuất hàng hóa</p>
               </div>
               <div className="flex gap-2">
                  {activeTab === 'inventory' && (
                     <>
                        <Button variant="outline" onClick={handleExportExcel}>
                           <Download className="mr-2 h-4 w-4" /> Xuất Excel
                        </Button>
                        <Button onClick={() => setAddDialogOpen(true)}>
                           <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm vào kho
                        </Button>
                     </>
                  )}
               </div>
            </div>

            <Tabs defaultValue="inventory" onValueChange={setActiveTab}>
               <TabsList>
                  <TabsTrigger value="inventory" className="gap-2">
                     <Package className="h-4 w-4" /> Tồn kho
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                     <History className="h-4 w-4" /> Lịch sử nhập/xuất
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="inventory" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-4">
                     <StatCard label="Tổng SKU" value={stats.total} />
                     <StatCard label="Tổng số lượng" value={stats.totalQty} />
                     <StatCard label="Sắp hết hàng" value={stats.lowStock} variant="warning" hint={`Tổng tồn ≤ ${LOW_STOCK_THRESHOLD}`} />
                     <StatCard label="Hết hàng" value={stats.outOfStock} variant="danger" />
                  </div>

                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Danh sách tồn kho ({filtered.length})</CardTitle>
                        <Input
                           placeholder="Tìm theo tên sản phẩm..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="max-w-xs"
                        />
                     </CardHeader>
                     <CardContent>
                        {status === 'loading' ? (
                           <p className="py-8 text-center text-muted-foreground">Đang tải...</p>
                        ) : filtered.length === 0 ? (
                           <p className="py-8 text-center text-muted-foreground">
                              {items.length === 0 ? 'Chưa có sản phẩm nào trong kho.' : 'Không tìm thấy sản phẩm.'}
                           </p>
                        ) : (
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead className="w-10" />
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className="text-right">Tổng tồn</TableHead>
                                    <TableHead className="text-right">Tổng số lô</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                    <TableHead className="w-48" />
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {filtered.map((item) => {
                                    const isOpen = expanded[item._id];
                                    const lots = item.lots || [];
                                    return (
                                       <ProductRows
                                          key={item._id}
                                          item={item}
                                          lots={lots}
                                          isOpen={isOpen}
                                          onToggle={() => toggleExpand(item._id)}
                                          onStockIn={() => setTxDialog({ type: 'stock_in', inventory: item })}
                                          onStockOut={() => setTxDialog({ type: 'stock_out', inventory: item })}
                                          onDelete={() => setToDelete(item)}
                                       />
                                    );
                                 })}
                              </TableBody>
                           </Table>
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="history" className="mt-4">
                  <Card>
                     <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between">
                           <CardTitle>Lịch sử nhập/xuất kho ({filteredTransactions.length})</CardTitle>
                           <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                              <Download className="mr-2 h-4 w-4" /> Xuất Excel
                           </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                           <Input
                              placeholder="Tìm sản phẩm..."
                              value={txSearch}
                              onChange={(e) => setTxSearch(e.target.value)}
                           />
                           <Select value={txFilter} onValueChange={setTxFilter}>
                              <SelectTrigger>
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">Tất cả</SelectItem>
                                 <SelectItem value="stock_in">Nhập kho</SelectItem>
                                 <SelectItem value="stock_out">Xuất kho</SelectItem>
                              </SelectContent>
                           </Select>
                           <Popover>
                              <PopoverTrigger asChild>
                                 <Button
                                    variant="outline"
                                    className={`justify-start text-left font-normal ${!txDateFrom ? 'text-muted-foreground' : ''}`}
                                 >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {txDateFrom ? format(txDateFrom, 'dd/MM/yyyy', { locale: vi }) : 'Từ ngày'}
                                 </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                 <Calendar mode="single" selected={txDateFrom} onSelect={setTxDateFrom} />
                              </PopoverContent>
                           </Popover>
                           <Popover>
                              <PopoverTrigger asChild>
                                 <Button
                                    variant="outline"
                                    className={`justify-start text-left font-normal ${!txDateTo ? 'text-muted-foreground' : ''}`}
                                 >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {txDateTo ? format(txDateTo, 'dd/MM/yyyy', { locale: vi }) : 'Đến ngày'}
                                 </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                 <Calendar mode="single" selected={txDateTo} onSelect={setTxDateTo} />
                              </PopoverContent>
                           </Popover>
                           <Input
                              placeholder="Lô..."
                              value={txLot}
                              onChange={(e) => setTxLot(e.target.value)}
                           />
                        </div>
                     </CardHeader>
                     <CardContent>
                        {filteredTransactions.length === 0 ? (
                           <p className="py-8 text-center text-muted-foreground">Chưa có giao dịch nào.</p>
                        ) : (
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Lô</TableHead>
                                    <TableHead className="text-right">Số lượng</TableHead>
                                    <TableHead className="text-right">Mua vào</TableHead>
                                    <TableHead className="text-right">Bán ra</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {filteredTransactions.map((tx) => (
                                    <TableRow key={tx._id}>
                                       <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                          {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                       </TableCell>
                                       <TableCell className="font-medium">
                                          {tx.product?.product_name || '(Đã xoá)'}
                                       </TableCell>
                                       <TableCell>
                                          <span
                                             className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                                                tx.transaction_type === 'stock_in'
                                                   ? 'bg-emerald-100 text-emerald-700'
                                                   : 'bg-orange-100 text-orange-700'
                                             }`}
                                          >
                                             {tx.transaction_type === 'stock_in' ? (
                                                <><ArrowDownToLine className="h-3 w-3" /> Nhập kho</>
                                             ) : (
                                                <><ArrowUpFromLine className="h-3 w-3" /> Xuất kho</>
                                             )}
                                          </span>
                                       </TableCell>
                                       <TableCell className="text-sm font-mono">
                                          {tx.lot_code || '-'}
                                       </TableCell>
                                       <TableCell className="text-right font-semibold">
                                          {tx.transaction_type === 'stock_in' ? '+' : '-'}{tx.transaction_quantity}
                                       </TableCell>
                                       <TableCell className="text-right">
                                          {formatPrice(tx.transaction_purchase_price)}
                                       </TableCell>
                                       <TableCell className="text-right">
                                          {formatPrice(tx.transaction_selling_price)}
                                       </TableCell>
                                       <TableCell className="text-sm text-muted-foreground">
                                          {tx.transaction_note || '-'}
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>

         <AddInventoryDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            products={productsNotInStock}
         />

         <TransactionDialog
            data={txDialog}
            onOpenChange={(open) => !open && setTxDialog(null)}
            onSuccess={refreshAfterTransaction}
         />

         <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                  <AlertDialogDescription>
                     Xoá <span className="font-semibold">{toDelete?.product?.product_name}</span> khỏi kho?
                     Toàn bộ lô và lịch sử nhập/xuất sẽ bị xoá.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDeleteConfirm}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     Xoá
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}

function ProductRows({ item, lots, isOpen, onToggle, onStockIn, onStockOut, onDelete }) {
   const totalQty = item.total_quantity || 0;
   return (
      <>
         <TableRow>
            <TableCell>
               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
               </Button>
            </TableCell>
            <TableCell className="font-medium">
               {item.product?.product_name || '(Sản phẩm đã xoá)'}
            </TableCell>
            <TableCell className="text-right">
               <QuantityBadge quantity={totalQty} />
            </TableCell>
            <TableCell className="text-right">{lots.length}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
               {item.inventory_note || '-'}
            </TableCell>
            <TableCell>
               <TooltipProvider delayDuration={200}>
                  <div className="flex justify-end gap-1">
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-600"
                              onClick={onStockIn}
                           >
                              <ArrowDownToLine className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>Nhập hàng</TooltipContent>
                     </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-orange-600 hover:text-orange-600"
                              disabled={lots.length === 0 || totalQty === 0}
                              onClick={onStockOut}
                           >
                              <ArrowUpFromLine className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xuất hàng</TooltipContent>
                     </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={onDelete}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xoá</TooltipContent>
                     </Tooltip>
                  </div>
               </TooltipProvider>
            </TableCell>
         </TableRow>
         {isOpen && (
            <TableRow className="bg-muted/30">
               <TableCell colSpan={6} className="p-0">
                  <div className="p-4">
                     {lots.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Chưa có lô nào — bấm “Nhập hàng” để tạo lô.</p>
                     ) : (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Mã lô</TableHead>
                                 <TableHead className="text-right">Tồn</TableHead>
                                 <TableHead className="text-right">Mua vào</TableHead>
                                 <TableHead className="text-right">Bán ra</TableHead>
                                 <TableHead>Ghi chú</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {lots.map((lot) => (
                                 <TableRow key={lot._id}>
                                    <TableCell className="font-mono text-sm">{lot.lot_code}</TableCell>
                                    <TableCell className="text-right">
                                       <QuantityBadge quantity={lot.lot_quantity} />
                                    </TableCell>
                                    <TableCell className="text-right">{formatPrice(lot.lot_purchase_price)}</TableCell>
                                    <TableCell className="text-right">{formatPrice(lot.lot_selling_price)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{lot.lot_note || '-'}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     )}
                  </div>
               </TableCell>
            </TableRow>
         )}
      </>
   );
}

function StatCard({ label, value, variant, hint }) {
   const color =
      variant === 'danger'
         ? 'text-destructive'
         : variant === 'warning'
            ? 'text-orange-600'
            : 'text-foreground';
   return (
      <Card>
         <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
         </CardContent>
      </Card>
   );
}

function QuantityBadge({ quantity }) {
   const color =
      quantity === 0
         ? 'bg-destructive/10 text-destructive'
         : quantity <= LOW_STOCK_THRESHOLD
            ? 'bg-orange-100 text-orange-700'
            : 'bg-emerald-100 text-emerald-700';
   return (
      <span className={`inline-flex min-w-[3rem] justify-center rounded-md px-2 py-1 text-sm font-semibold ${color}`}>
         {quantity}
      </span>
   );
}

function AddInventoryDialog({ open, onOpenChange, products }) {
   const dispatch = useDispatch();
   const { register, handleSubmit, reset, setValue, watch, control, formState: { isSubmitting, errors } } = useForm();
   const selectedProduct = watch('product');

   useEffect(() => {
      if (!open) reset();
   }, [open, reset]);

   const onSubmit = async (data) => {
      try {
         const payload = {
            product: data.product,
            inventory_note: data.inventory_note || '',
            initial_lot: {
               lot_code: data.lot_code?.trim(),
               lot_quantity: Number(data.lot_quantity),
               lot_purchase_price: Number(data.lot_purchase_price) || 0,
               lot_selling_price: Number(data.lot_selling_price) || 0,
            },
         };
         await dispatch(createInventory(payload)).unwrap();
         dispatch(fetchTransactions());
         toast.success('Đã thêm vào kho');
         onOpenChange(false);
      } catch (error) {
         toast.error(error);
      }
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-lg">
            <DialogHeader>
               <DialogTitle>Thêm sản phẩm vào kho</DialogTitle>
               <DialogDescription>Chọn sản phẩm và tạo lô đầu tiên.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <Label>Sản phẩm</Label>
                  <Select value={selectedProduct} onValueChange={(v) => setValue('product', v, { shouldValidate: true })}>
                     <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                     </SelectTrigger>
                     <SelectContent>
                        {products.length === 0 ? (
                           <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                              Tất cả sản phẩm đã có trong kho
                           </div>
                        ) : (
                           products.map((p) => (
                              <SelectItem key={p._id} value={p._id}>
                                 {p.product_name}
                              </SelectItem>
                           ))
                        )}
                     </SelectContent>
                  </Select>
                  <input type="hidden" {...register('product', { required: 'Vui lòng chọn sản phẩm' })} />
                  {errors.product && <p className="text-sm text-destructive">{errors.product.message}</p>}
               </div>

               <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea {...register('inventory_note')} placeholder="Tuỳ chọn" />
               </div>

               <div className="space-y-3 rounded-md border bg-muted/40 p-3">
                  <div className="space-y-2">
                     <Label>Mã lô</Label>
                     <Input
                        placeholder="1"
                        {...register('lot_code', {
                           validate: (v) => (v?.trim() ? true : 'Vui lòng nhập mã lô'),
                        })}
                     />
                     {errors.lot_code && <p className="text-sm text-destructive">{errors.lot_code.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <Label>Số lượng</Label>
                     <Input
                        type="number"
                        min="1"
                        {...register('lot_quantity', {
                           validate: (v) => {
                              const n = Number(v);
                              if (!n || n < 1) return 'Số lượng phải >= 1';
                              return true;
                           },
                        })}
                     />
                     {errors.lot_quantity && <p className="text-sm text-destructive">{errors.lot_quantity.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-2">
                        <Label>Mua vào (VNĐ)</Label>
                        <MoneyInput
                           control={control}
                           name="lot_purchase_price"
                           rules={{
                              validate: (v) => {
                                 if (v === '' || v === undefined) return 'Vui lòng nhập giá mua vào';
                                 if (Number(v) < 0) return 'Mua vào phải >= 0';
                                 return true;
                              },
                           }}
                        />
                        {errors.lot_purchase_price && <p className="text-sm text-destructive">{errors.lot_purchase_price.message}</p>}
                     </div>
                     <div className="space-y-2">
                        <Label>Bán ra (VNĐ)</Label>
                        <MoneyInput
                           control={control}
                           name="lot_selling_price"
                           rules={{
                              validate: (v) => {
                                 if (v === '' || v === undefined) return 'Vui lòng nhập giá bán ra';
                                 if (Number(v) < 0) return 'Bán ra phải >= 0';
                                 return true;
                              },
                           }}
                        />
                        {errors.lot_selling_price && <p className="text-sm text-destructive">{errors.lot_selling_price.message}</p>}
                     </div>
                  </div>
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? 'Đang lưu...' : 'Thêm'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

function TransactionDialog({ data, onOpenChange, onSuccess }) {
   const dispatch = useDispatch();
   const lotsByProduct = useSelector((state) => state.inventory.lotsByProduct);
   const { register, handleSubmit, reset, setValue, watch, control, formState: { isSubmitting, errors } } = useForm();

   const productId = data?.inventory?.product?._id;
   const lots = useMemo(
      () => (productId && lotsByProduct[productId]) || data?.inventory?.lots || [],
      [productId, lotsByProduct, data]
   );

   const isStockIn = data?.type === 'stock_in';
   const watchedLotCode = watch('lot_code');
   const watchedLotId = watch('lot');

   const matchedLot = useMemo(() => {
      if (!isStockIn || !watchedLotCode) return null;
      return lots.find((l) => l.lot_code === watchedLotCode.trim());
   }, [isStockIn, watchedLotCode, lots]);

   const selectedLot = useMemo(() => {
      if (isStockIn || !watchedLotId) return null;
      return lots.find((l) => l._id === watchedLotId);
   }, [isStockIn, watchedLotId, lots]);

   useEffect(() => {
      if (data) {
         reset({
            transaction_quantity: '',
            lot_code: '',
            lot: '',
            lot_purchase_price: '',
            lot_selling_price: '',
            transaction_note: '',
         });
         if (productId) dispatch(fetchInventoryLots(productId));
      }
   }, [data, reset, dispatch, productId]);

   if (!data) return null;
   const { inventory } = data;

   const onSubmit = async (formData) => {
      try {
         let payload;
         if (isStockIn) {
            payload = {
               product: inventory.product._id,
               transaction_type: 'stock_in',
               lot_code: formData.lot_code.trim(),
               transaction_quantity: Number(formData.transaction_quantity),
               transaction_note: formData.transaction_note || '',
            };
            if (!matchedLot) {
               payload.lot_purchase_price = Number(formData.lot_purchase_price) || 0;
               payload.lot_selling_price = Number(formData.lot_selling_price) || 0;
            }
         } else {
            payload = {
               transaction_type: 'stock_out',
               lot: formData.lot,
               transaction_quantity: Number(formData.transaction_quantity),
               transaction_note: formData.transaction_note || '',
            };
         }
         await dispatch(processTransaction(payload)).unwrap();
         toast.success(isStockIn ? 'Nhập kho thành công' : 'Xuất kho thành công');
         onSuccess?.(inventory.product._id);
         onOpenChange(false);
      } catch (error) {
         toast.error(error);
      }
   };

   const totalQty = (lots || []).reduce((s, l) => s + (l.lot_quantity || 0), 0);
   const lotsWithStock = (lots || []).filter((l) => (l.lot_quantity || 0) > 0);

   return (
      <Dialog open={!!data} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>{isStockIn ? 'Nhập kho' : 'Xuất kho'}</DialogTitle>
               <DialogDescription>
                  {inventory.product?.product_name} — Tổng tồn:{' '}
                  <span className="font-semibold">{totalQty}</span>
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               {isStockIn ? (
                  <>
                     <div className="space-y-2">
                        <Label>Mã lô</Label>
                        <Input
                           placeholder={String(lots.length + 1)}
                           list="existing-lots"
                           {...register('lot_code', {
                              validate: (v) => v?.trim() ? true : 'Vui lòng nhập mã lô',
                           })}
                        />
                        <datalist id="existing-lots">
                           {lots.map((l) => (
                              <option key={l._id} value={l.lot_code}>
                                 Tồn: {l.lot_quantity}
                              </option>
                           ))}
                        </datalist>
                        {matchedLot ? (
                           <p className="text-xs text-emerald-700">
                              Lô đã có trong kho (tồn {matchedLot.lot_quantity}, mua {formatPrice(matchedLot.lot_purchase_price)} / bán {formatPrice(matchedLot.lot_selling_price)}). Số lượng nhập sẽ được cộng dồn, giá giữ nguyên.
                           </p>
                        ) : watchedLotCode ? (
                           <p className="text-xs text-muted-foreground">Lô mới — vui lòng nhập giá mua/bán bên dưới.</p>
                        ) : null}
                        {errors.lot_code && <p className="text-sm text-destructive">{errors.lot_code.message}</p>}
                     </div>
                     <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input
                           type="number"
                           min="1"
                           {...register('transaction_quantity', {
                              required: 'Vui lòng nhập số lượng',
                              min: { value: 1, message: 'Số lượng phải >= 1' },
                           })}
                        />
                        {errors.transaction_quantity && <p className="text-sm text-destructive">{errors.transaction_quantity.message}</p>}
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Mua vào (VNĐ)</Label>
                           <MoneyInput
                              control={control}
                              name="lot_purchase_price"
                              readOnly={!!matchedLot}
                              displayValue={matchedLot?.lot_purchase_price}
                              rules={{
                                 validate: (v) => {
                                    if (matchedLot) return true;
                                    if (v === '' || v === undefined) return 'Vui lòng nhập giá mua vào';
                                    if (Number(v) < 0) return 'Mua vào phải >= 0';
                                    return true;
                                 },
                              }}
                           />
                           {errors.lot_purchase_price && <p className="text-sm text-destructive">{errors.lot_purchase_price.message}</p>}
                        </div>
                        <div className="space-y-2">
                           <Label>Bán ra (VNĐ)</Label>
                           <MoneyInput
                              control={control}
                              name="lot_selling_price"
                              readOnly={!!matchedLot}
                              displayValue={matchedLot?.lot_selling_price}
                              rules={{
                                 validate: (v) => {
                                    if (matchedLot) return true;
                                    if (v === '' || v === undefined) return 'Vui lòng nhập giá bán ra';
                                    if (Number(v) < 0) return 'Bán ra phải >= 0';
                                    return true;
                                 },
                              }}
                           />
                           {errors.lot_selling_price && <p className="text-sm text-destructive">{errors.lot_selling_price.message}</p>}
                        </div>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="space-y-2">
                        <Label>Chọn lô để xuất</Label>
                        <Select
                           value={watchedLotId || ''}
                           onValueChange={(v) => setValue('lot', v, { shouldValidate: true })}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder={lotsWithStock.length === 0 ? 'Không còn lô có hàng' : 'Chọn lô'} />
                           </SelectTrigger>
                           <SelectContent>
                              {lotsWithStock.map((l) => (
                                 <SelectItem key={l._id} value={l._id}>
                                    {l.lot_code} — Tồn: {l.lot_quantity} — Bán: {formatPrice(l.lot_selling_price)}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        <input type="hidden" {...register('lot', { required: 'Vui lòng chọn lô' })} />
                        {errors.lot && <p className="text-sm text-destructive">{errors.lot.message}</p>}
                     </div>
                     <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input
                           type="number"
                           min="1"
                           {...register('transaction_quantity', {
                              required: 'Vui lòng nhập số lượng',
                              min: { value: 1, message: 'Số lượng phải >= 1' },
                              validate: (v) => {
                                 if (!selectedLot) return true;
                                 if (Number(v) > selectedLot.lot_quantity) {
                                    return `Vượt quá tồn lô (còn ${selectedLot.lot_quantity})`;
                                 }
                                 return true;
                              },
                           })}
                        />
                        {selectedLot && (
                           <p className="text-xs text-muted-foreground">
                              Lô {selectedLot.lot_code} — tồn {selectedLot.lot_quantity}, mua {formatPrice(selectedLot.lot_purchase_price)} / bán {formatPrice(selectedLot.lot_selling_price)}
                           </p>
                        )}
                        {errors.transaction_quantity && <p className="text-sm text-destructive">{errors.transaction_quantity.message}</p>}
                     </div>
                  </>
               )}
               <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea {...register('transaction_note')} placeholder="Tuỳ chọn" />
               </div>
               <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
                  <Button
                     type="submit"
                     disabled={isSubmitting}
                     className={isStockIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}
                  >
                     {isSubmitting ? 'Đang xử lý...' : isStockIn ? 'Nhập kho' : 'Xuất kho'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
