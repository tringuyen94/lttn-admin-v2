import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '@/redux/slices/productSlice';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus, X } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

export default function CreateProduct() {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const brands = useSelector((state) => state.brands.items);
   const categories = useSelector((state) => state.categories.items);
   const [imagesPreview, setImagesPreview] = useState([]);
   const [coverImagePreview, setCoverImagePreview] = useState('');

   const { register, handleSubmit, control, watch, setValue, formState: { errors, isValid, isSubmitting } } = useForm({
      mode: 'onChange',
   });

   const categoryWatch = watch('category');
   const selectedCategory = useMemo(
      () => categories.find((c) => c._id === categoryWatch),
      [categories, categoryWatch]
   );

   const createFormData = (data) => {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('product_name', data.product_name);
      formData.append('product_isnew', data.product_isnew);
      formData.append('brand', data.brand);
      if (data.product_capacity) formData.append('product_capacity', data.product_capacity);
      formData.append('product_description', data.product_description);
      formData.append('product_cover_image', data.product_cover_image[0]);
      for (const file of data.product_images) {
         formData.append('product_images', file);
      }
      return formData;
   };

   const onSubmit = async (data) => {
      const formData = createFormData(data);
      try {
         await dispatch(createProduct(formData)).unwrap();
         toast.success(`Đã thêm ${data.product_name}`);
         navigate('/danh-sach-san-pham');
      } catch (error) {
         toast.error(error);
      }
   };

   const revokeUrls = (urls) => {
      (Array.isArray(urls) ? urls : [urls]).forEach((u) => u && URL.revokeObjectURL(u));
   };

   const handleImagePreview = (event, setPreview) => {
      const files = Array.from(event.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreview((prev) => {
         revokeUrls(prev);
         return previews.length === 1 ? previews[0] : previews;
      });
   };

   const coverImageRegister = register('product_cover_image', { required: 'Bạn chưa chọn ảnh bìa sản phẩm' });
   register('product_images', { validate: (v) => (v && v.length > 0) || 'Bạn chưa chọn ảnh sản phẩm' });

   const removeProductImage = (index) => {
      const currentFiles = watch('product_images') || [];
      const newFiles = [...currentFiles].filter((_, i) => i !== index);
      setValue('product_images', newFiles, { shouldValidate: true });
      setImagesPreview((prev) => {
         URL.revokeObjectURL(prev[index]);
         return prev.filter((_, i) => i !== index);
      });
   };

   return (
      <>
         <Title title="Thêm sản phẩm" />
         <div className="space-y-6">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Thêm sản phẩm</h1>
               <p className="text-muted-foreground">Tạo sản phẩm mới trong hệ thống</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
               <Card>
                  <CardHeader>
                     <CardTitle>Thông tin sản phẩm</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                           <Label>Loại sản phẩm</Label>
                           <select
                              {...register('category', { required: 'Hãy chọn loại sản phẩm' })}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                           >
                              <option value="">Chọn loại sản phẩm</option>
                              {categories.map((cat) => (
                                 <option key={cat._id} value={cat._id}>{cat.category_name}</option>
                              ))}
                           </select>
                           {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>Tên sản phẩm</Label>
                           <Input
                              {...register('product_name', { required: 'Tên sản phẩm không được để trống' })}
                              placeholder="Nhập tên sản phẩm"
                           />
                           {errors.product_name && <p className="text-sm text-destructive">{errors.product_name.message}</p>}
                        </div>

                        {selectedCategory?.category_slug === 'bien-tan' && (
                           <div className="space-y-2">
                              <Label>Công suất</Label>
                              <Input
                                 type="number"
                                 step="any"
                                 {...register('product_capacity', {
                                    required: 'Công suất không được để trống',
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Công suất phải lớn hơn 0' },
                                 })}
                              />
                              {errors.product_capacity && <p className="text-sm text-destructive">{errors.product_capacity.message}</p>}
                           </div>
                        )}

                        <div className="space-y-2">
                           <Label>Sản phẩm mới?</Label>
                           <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="radio" value="true" {...register('product_isnew', { required: 'Vui lòng chọn' })} className="accent-primary" />
                                 <span className="text-sm">Mới</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="radio" value="false" {...register('product_isnew')} className="accent-primary" />
                                 <span className="text-sm">Cũ</span>
                              </label>
                           </div>
                           {errors.product_isnew && <p className="text-sm text-destructive">{errors.product_isnew.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>Nhãn hàng</Label>
                           <select
                              {...register('brand', { required: 'Hãy chọn nhãn hàng' })}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                           >
                              <option value="">Chọn nhãn hàng</option>
                              {brands.map((brand) => (
                                 <option key={brand._id} value={brand._id}>{brand.brand_name}</option>
                              ))}
                           </select>
                           {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>Mô tả sản phẩm</Label>
                           <Controller
                              control={control}
                              name="product_description"
                              rules={{ required: 'Mô tả sản phẩm không được để trống' }}
                              render={({ field }) => (
                                 <ReactQuill {...field} theme="snow" className="[&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px]" />
                              )}
                           />
                           {errors.product_description && <p className="text-sm text-destructive">{errors.product_description.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
                           {isSubmitting ? 'Đang tạo...' : 'Thêm sản phẩm'}
                        </Button>
                     </form>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Hình ảnh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label>Ảnh bìa sản phẩm</Label>
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                           <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              name={coverImageRegister.name}
                              ref={coverImageRegister.ref}
                              onBlur={coverImageRegister.onBlur}
                              onChange={(e) => { coverImageRegister.onChange(e); handleImagePreview(e, setCoverImagePreview); }}
                           />
                           {coverImagePreview ? (
                              <img src={coverImagePreview} alt="Cover Preview" className="h-40 w-40 rounded-lg object-cover" />
                           ) : (
                              <>
                                 <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                 <span className="text-sm text-muted-foreground">Chọn ảnh bìa</span>
                              </>
                           )}
                        </label>
                        {errors.product_cover_image && <p className="text-sm text-destructive">{errors.product_cover_image.message}</p>}
                     </div>

                     <div className="space-y-2">
                        <Label>Ảnh sản phẩm</Label>
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                           <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                 const files = Array.from(e.target.files);
                                 if (!files.length) return;
                                 const currentFiles = watch('product_images') || [];
                                 const newFiles = [...currentFiles, ...files].slice(0, 10);
                                 setValue('product_images', newFiles, { shouldValidate: true });
                                 const newPreviews = files.map((f) => URL.createObjectURL(f));
                                 setImagesPreview((prev) => [...prev, ...newPreviews].slice(0, 10));
                                 e.target.value = '';
                              }}
                           />
                           <ImagePlus className="h-8 w-8 text-muted-foreground" />
                           <span className="text-sm text-muted-foreground">Chọn ảnh sản phẩm (từ 1 đến 10 ảnh)</span>
                        </label>
                        {imagesPreview.length > 0 && (
                           <div className="flex flex-wrap gap-2">
                              {imagesPreview.map((image, index) => (
                                 <div key={index} className="relative">
                                    <img src={image} alt={`Product ${index + 1}`} className="h-20 w-20 rounded-md object-cover" />
                                    <button
                                       type="button"
                                       onClick={() => removeProductImage(index)}
                                       className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80"
                                    >
                                       <X className="h-3 w-3" />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                        {errors.product_images && <p className="text-sm text-destructive">{errors.product_images.message}</p>}
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </>
   );
}
