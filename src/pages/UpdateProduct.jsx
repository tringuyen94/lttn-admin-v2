import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { baseURL } from '@/api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import { fetchProductById, updateImage, updateProduct } from '@/redux/slices/productSlice';
import ReactQuill from 'react-quill-new';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ImagePlus } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

const infoFields = ['brand', 'category', 'product_capacity', 'product_description', 'product_name', 'product_isnew'];
const imageFields = ['product_images', 'product_cover_image'];

export default function UpdateProduct() {
   const { id } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const productData = useSelector((state) => state.products.item);
   const brands = useSelector((state) => state.brands.items);

   const [initProduct, setInitProduct] = useState(null);
   const [initImageProduct, setInitImageProduct] = useState(null);
   const [imagesPreview, setImagesPreview] = useState([]);
   const [coverImagePreview, setCoverImagePreview] = useState('');

   const { register, handleSubmit, control, reset, formState: { errors }, watch } = useForm();

   const watchedInfoFields = watch(infoFields);
   const watchedImageFields = watch(imageFields);

   const hasImageChanged = useMemo(() => {
      if (!initImageProduct) return false;
      const current = pick(Object.fromEntries(imageFields.map((f, i) => [f, watchedImageFields[i]])), imageFields);
      return !isEqual(current, initImageProduct);
   }, [watchedImageFields, initImageProduct]);

   const hasChanged = useMemo(() => {
      if (!initProduct) return false;
      const current = Object.fromEntries(infoFields.map((f, i) => [f, watchedInfoFields[i]]));
      return !isEqual(current, initProduct);
   }, [watchedInfoFields, initProduct]);

   const revokeUrls = (urls) => {
      urls.forEach((u) => u && URL.revokeObjectURL(u));
   };

   const handleCoverImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
         setCoverImagePreview(URL.createObjectURL(file));
      }
   };

   const handleProductImagesChange = (event) => {
      const files = Array.from(event.target.files);
      revokeUrls(imagesPreview);
      setImagesPreview(files.map((file) => URL.createObjectURL(file)));
   };

   const coverImageRegister = register('product_cover_image');
   const productImagesRegister = register('product_images');

   useEffect(() => {
      dispatch(fetchProductById(id));
   }, [id, dispatch]);

   useEffect(() => {
      if (productData && productData._id === id) {
         reset({ ...productData, product_isnew: productData.product_isnew ? 'true' : 'false' });
         const initData = pick(productData, infoFields);
         setInitProduct({ ...initData, product_isnew: productData.product_isnew ? 'true' : 'false' });
         setInitImageProduct(pick(productData, imageFields));
      }
   }, [productData, id, reset]);

   const onUpdateImageSubmit = async (data) => {
      const formData = new FormData();
      if (!isEqual(data.product_cover_image, initImageProduct.product_cover_image)) {
         formData.append('product_cover_image', data.product_cover_image[0]);
      }
      if (!isEqual(data.product_images, initImageProduct.product_images)) {
         for (const file of data.product_images) {
            formData.append('product_images', file);
         }
      }
      try {
         await dispatch(updateImage({ productId: id, productInfo: formData })).unwrap();
         toast.success('Cập nhật ảnh thành công');
         dispatch(fetchProductById(id));
      } catch (error) {
         toast.error(error);
      }
   };

   const onSubmit = async (data) => {
      try {
         const payload = {
            _id: id,
            product_name: data.product_name,
            product_description: data.product_description,
            product_isnew: data.product_isnew === 'true',
            brand: data.brand?._id || data.brand,
         };
         if (data.product_capacity != null && data.product_capacity !== '') {
            payload.product_capacity = Number(data.product_capacity);
         }
         await dispatch(updateProduct(payload)).unwrap();
         toast.success('Cập nhật thành công');
         setTimeout(() => navigate(0), 1000);
      } catch (error) {
         toast.error(error);
      }
   };

   return (
      <>
         <Title title="Cập nhật sản phẩm" />
         <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">Cập nhật sản phẩm</h1>
                  <p className="text-muted-foreground">Chỉnh sửa thông tin và hình ảnh sản phẩm</p>
               </div>
               {hasChanged && <Badge>Đã thay đổi</Badge>}
            </div>

            <Tabs defaultValue="info">
               <TabsList>
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="images">
                     Hình ảnh
                     {hasImageChanged && <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />}
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="info">
                  <Card>
                     <CardContent className="pt-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                           <div className="space-y-2">
                              <Label>Loại sản phẩm</Label>
                              <Input {...register('category.category_name')} disabled className="bg-muted" />
                           </div>

                           <div className="space-y-2">
                              <Label>Tên sản phẩm</Label>
                              <Input
                                 {...register('product_name', { required: 'Tên sản phẩm không được để trống' })}
                              />
                              {errors.product_name && <p className="text-sm text-destructive">{errors.product_name.message}</p>}
                           </div>

                           {initProduct?.category?.category_slug === 'bien-tan' && (
                              <div className="space-y-2">
                                 <Label>Công suất</Label>
                                 <Input
                                    type="number"
                                    step="any"
                                    {...register('product_capacity', {
                                       min: { value: 0, message: 'Giá trị phải lớn hơn 0' },
                                    })}
                                 />
                                 {errors.product_capacity && <p className="text-sm text-destructive">{errors.product_capacity.message}</p>}
                              </div>
                           )}

                           <div className="space-y-2">
                              <Label>Sản phẩm mới?</Label>
                              <div className="flex gap-4">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="true" {...register('product_isnew')} className="accent-primary" />
                                    <span className="text-sm">Mới</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="false" {...register('product_isnew')} className="accent-primary" />
                                    <span className="text-sm">Cũ</span>
                                 </label>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <Label>Nhãn hàng</Label>
                              <select
                                 {...register('brand._id', { required: 'Hãy chọn nhãn hàng' })}
                                 className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                 {brands.map((brand) => (
                                    <option key={brand._id} value={brand._id}>{brand.brand_name}</option>
                                 ))}
                              </select>
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

                           <Button type="submit" className="w-full" disabled={!hasChanged}>
                              Cập nhật thông tin
                           </Button>
                        </form>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="images">
                  <Card>
                     <CardContent className="pt-6">
                        <form onSubmit={handleSubmit(onUpdateImageSubmit)} className="space-y-6">
                           <div className="space-y-3">
                              <Label>Ảnh bìa sản phẩm</Label>
                              <div className="flex items-start gap-4">
                                 {initImageProduct?.product_cover_image && (
                                    <div className="space-y-1">
                                       <p className="text-xs text-muted-foreground">Hiện tại</p>
                                       <img src={baseURL + initImageProduct.product_cover_image} alt="Cover" className="h-32 w-32 rounded-lg object-cover" />
                                    </div>
                                 )}
                                 <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                    <input
                                       type="file"
                                       accept="image/*"
                                       className="hidden"
                                       name={coverImageRegister.name}
                                       ref={coverImageRegister.ref}
                                       onBlur={coverImageRegister.onBlur}
                                       onChange={(e) => { coverImageRegister.onChange(e); handleCoverImageChange(e); }}
                                    />
                                    {coverImagePreview ? (
                                       <img src={coverImagePreview} alt="New cover" className="h-full w-full rounded-lg object-cover" />
                                    ) : (
                                       <>
                                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">Ảnh mới</span>
                                       </>
                                    )}
                                 </label>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <Label>Ảnh sản phẩm</Label>
                              <div className="flex flex-wrap gap-2">
                                 {initImageProduct?.product_images?.map((image, index) => (
                                    <div key={image} className="space-y-1">
                                       {index === 0 && <p className="text-xs text-muted-foreground">Hiện tại</p>}
                                       {index > 0 && <p className="text-xs text-transparent">.</p>}
                                       <img src={baseURL + image} alt={`Product ${index + 1}`} className="h-20 w-20 rounded-md object-cover" />
                                    </div>
                                 ))}
                              </div>
                              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                                 <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    name={productImagesRegister.name}
                                    ref={productImagesRegister.ref}
                                    onBlur={productImagesRegister.onBlur}
                                    onChange={(e) => { productImagesRegister.onChange(e); handleProductImagesChange(e); }}
                                 />
                                 {imagesPreview.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                       {imagesPreview.map((image, index) => (
                                          <img key={image} src={image} alt={`New ${index + 1}`} className="h-20 w-20 rounded-md object-cover" />
                                       ))}
                                    </div>
                                 ) : (
                                    <>
                                       <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                       <span className="text-sm text-muted-foreground">Chọn ảnh mới</span>
                                    </>
                                 )}
                              </label>
                           </div>

                           <Button type="submit" className="w-full" disabled={!hasImageChanged}>
                              Cập nhật hình ảnh
                           </Button>
                        </form>
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>
      </>
   );
}
