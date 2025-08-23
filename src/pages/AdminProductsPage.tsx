// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Package, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Search,
//   Star,
//   Upload,
//   Download,
//   FileSpreadsheet
// } from 'lucide-react';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';
// import { BaseLayout } from '@/components/layout/BaseLayout';
// import { Container } from '@/components/layout/Container';
// import { AdminSidebar } from '@/components/admin/AdminSidebar';
// import { useToast } from '@/hooks/use-toast';
// import { mockProducts, categories } from '@/data/mockData';
// import { Product } from '@/components/store/ProductCard';

// const AdminProductsPage = () => {
//   const [products, setProducts] = useState<Product[]>(mockProducts);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
//   const { toast } = useToast();

//   const [formData, setFormData] = useState({
//     name: '',
//     price: '',
//     originalPrice: '',
//     image: '',
//     unit: '',
//     description: '',
//     category: '',
//     subCategory: '',
//     store: ''
//   });

//   const filteredProducts = products.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
//     // For category filtering, we'd need to add category field to Product interface
//     return matchesSearch;
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const productData: Product = {
//       id: editingProduct?.id || `product-${Date.now()}`,
//       name: formData.name,
//       description: formData.description,
//       price: parseFloat(formData.price),
//       originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
//       image: formData.image || '📦',
//       unit: formData.unit,
//       category: formData.category,
//       subCategory: formData.subCategory,
//       store: formData.store,
//       rating: editingProduct?.rating || 4.5,
//       reviewCount: editingProduct?.reviewCount || 0,
//       isNew: !editingProduct,
//       isFavorite: editingProduct?.isFavorite || false,
//       inStock: true,
//       discount: formData.originalPrice && formData.price ? 
//         Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100) : 
//         undefined
//     };

//     if (editingProduct) {
//       setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
//       toast({
//         title: "تم تحديث المنتج",
//         description: `تم تحديث ${productData.name} بنجاح`,
//         className: "bg-success text-success-foreground"
//       });
//     } else {
//       setProducts(prev => [...prev, productData]);
//       toast({
//         title: "تم إضافة المنتج",
//         description: `تم إضافة ${productData.name} بنجاح`,
//         className: "bg-success text-success-foreground"
//       });
//     }

//     setIsDialogOpen(false);
//     setEditingProduct(null);
//     setFormData({ name: '', price: '', originalPrice: '', image: '', unit: '', description: '', category: '', subCategory: '', store: '' });
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name,
//       price: product.price.toString(),
//       originalPrice: product.originalPrice?.toString() || '',
//       image: product.image,
//       unit: product.unit,
//       description: product.description || '',
//       category: product.category || '',
//       subCategory: product.subCategory || '',
//       store: product.store || ''
//     });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = (productId: string) => {
//     setProducts(prev => prev.filter(p => p.id !== productId));
//     toast({
//       title: "تم حذف المنتج",
//       description: "تم حذف المنتج بنجاح",
//       className: "bg-destructive text-destructive-foreground"
//     });
//   };

//   const openAddDialog = () => {
//     setEditingProduct(null);
//     setFormData({ name: '', price: '', originalPrice: '', image: '', unit: '', description: '', category: '', subCategory: '', store: '' });
//     setIsDialogOpen(true);
//   };

//   const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const fileExtension = file.name.split('.').pop()?.toLowerCase();

//     if (fileExtension === 'csv') {
//       Papa.parse(file, {
//         header: true,
//         complete: (results) => {
//           const importedProducts = results.data.map((row: any, index: number) => ({
//             id: `imported-${Date.now()}-${index}`,
//             name: row.name || row['اسم المنتج'] || '',
//             price: parseFloat(row.price || row['السعر']) || 0,
//             originalPrice: parseFloat(row.originalPrice || row['السعر الأصلي']) || undefined,
//             image: row.image || row['الصورة'] || '📦',
//             unit: row.unit || row['الوحدة'] || 'قطعة',
//             rating: parseFloat(row.rating || row['التقييم']) || 4.5,
//             reviewCount: parseInt(row.reviewCount || row['عدد التقييمات']) || 0,
//             isNew: false,
//             isFavorite: false,
//             inStock: true,
//             discount: row.originalPrice && row.price ? 
//               Math.round(((parseFloat(row.originalPrice) - parseFloat(row.price)) / parseFloat(row.originalPrice)) * 100) : 
//               undefined
//           })).filter(product => product.name && product.price > 0);

//           setProducts(prev => [...prev, ...importedProducts]);
//           toast({ title: `تم استيراد ${importedProducts.length} منتج بنجاح` });
//           setIsImportDialogOpen(false);
//         },
//         error: (error) => {
//           toast({ title: "خطأ في قراءة الملف", variant: "destructive" });
//           console.error('CSV parsing error:', error);
//         }
//       });
//     } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const data = new Uint8Array(e.target?.result as ArrayBuffer);
//           const workbook = XLSX.read(data, { type: 'array' });
//           const sheetName = workbook.SheetNames[0];
//           const worksheet = workbook.Sheets[sheetName];
//           const jsonData = XLSX.utils.sheet_to_json(worksheet);

//           const importedProducts = jsonData.map((row: any, index: number) => ({
//             id: `imported-${Date.now()}-${index}`,
//             name: row.name || row['اسم المنتج'] || '',
//             price: parseFloat(row.price || row['السعر']) || 0,
//             originalPrice: parseFloat(row.originalPrice || row['السعر الأصلي']) || undefined,
//             image: row.image || row['الصورة'] || '📦',
//             unit: row.unit || row['الوحدة'] || 'قطعة',
//             rating: parseFloat(row.rating || row['التقييم']) || 4.5,
//             reviewCount: parseInt(row.reviewCount || row['عدد التقييمات']) || 0,
//             isNew: false,
//             isFavorite: false,
//             inStock: true,
//             discount: row.originalPrice && row.price ? 
//               Math.round(((parseFloat(row.originalPrice) - parseFloat(row.price)) / parseFloat(row.originalPrice)) * 100) : 
//               undefined
//           })).filter(product => product.name && product.price > 0);

//           setProducts(prev => [...prev, ...importedProducts]);
//           toast({ title: `تم استيراد ${importedProducts.length} منتج بنجاح` });
//           setIsImportDialogOpen(false);
//         } catch (error) {
//           toast({ title: "خطأ في قراءة ملف Excel", variant: "destructive" });
//           console.error('Excel parsing error:', error);
//         }
//       };
//       reader.readAsArrayBuffer(file);
//     } else {
//       toast({ title: "نوع الملف غير مدعوم. يرجى استخدام CSV أو Excel", variant: "destructive" });
//     }

//     // Reset input
//     event.target.value = '';
//   };

//   const downloadTemplate = () => {
//     const template = [
//       {
//         'اسم المنتج': 'مثال على المنتج',
//         'السعر': 100,
//         'السعر الأصلي': 120,
//         'الصورة': '📦',
//         'الوحدة': 'قطعة',
//         'التقييم': 4.5,
//         'عدد التقييمات': 25
//       }
//     ];

//     const csv = Papa.unparse(template);
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'template_products.csv';
//     link.click();
//   };

//   return (
//     <BaseLayout dir="rtl" className="bg-surface">
//       <div className="flex h-screen">
//         <AdminSidebar />
        
//         <main className="flex-1 overflow-auto">
//           {/* Header */}
//           <div className="bg-white border-b border-border p-4">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-3">
//                 <Package className="h-6 w-6 text-primary" />
//                 <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
//               </div>
              
//               <div className="flex gap-3">
//                 <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button variant="outline" className="gap-2">
//                       <Upload className="h-4 w-4" />
//                       استيراد من ملف
//                     </Button>
//                   </DialogTrigger>
                  
//                   <DialogContent className="max-w-md">
//                     <DialogHeader>
//                       <DialogTitle>استيراد المنتجات</DialogTitle>
//                     </DialogHeader>
                    
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="importFile">اختر ملف CSV أو Excel</Label>
//                         <Input
//                           id="importFile"
//                           type="file"
//                           accept=".csv,.xlsx,.xls"
//                           onChange={handleFileImport}
//                           className="mt-2"
//                         />
//                       </div>
                      
//                       <div className="text-sm text-muted-foreground">
//                         <p>الأعمدة المطلوبة:</p>
//                         <ul className="list-disc list-inside mt-1 space-y-1">
//                           <li>اسم المنتج أو name</li>
//                           <li>السعر أو price</li>
//                           <li>الوحدة أو unit</li>
//                           <li>الصورة أو image (اختياري)</li>
//                           <li>التقييم أو rating (اختياري)</li>
//                         </ul>
//                       </div>
                      
//                       <Button 
//                         variant="outline" 
//                         onClick={downloadTemplate}
//                         className="w-full gap-2"
//                       >
//                         <Download className="h-4 w-4" />
//                         تحميل ملف نموذج
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>

//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button onClick={openAddDialog}>
//                       <Plus className="h-4 w-4 ml-2" />
//                       إضافة منتج جديد
//                     </Button>
//                   </DialogTrigger>
                
//                 <DialogContent className="max-w-md">
//                   <DialogHeader>
//                     <DialogTitle>
//                       {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
//                     </DialogTitle>
//                   </DialogHeader>
                  
//                   <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                       <Label htmlFor="name">اسم المنتج</Label>
//                       <Input
//                         id="name"
//                         value={formData.name}
//                         onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                         placeholder="أدخل اسم المنتج"
//                         required
//                       />
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="price">السعر</Label>
//                         <Input
//                           id="price"
//                           type="number"
//                           step="0.01"
//                           value={formData.price}
//                           onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
//                           placeholder="0.00"
//                           required
//                         />
//                       </div>
                      
//                       <div>
//                         <Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label>
//                         <Input
//                           id="originalPrice"
//                           type="number"
//                           step="0.01"
//                           value={formData.originalPrice}
//                           onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
//                           placeholder="0.00"
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="unit">الوحدة</Label>
//                         <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
//                           <SelectTrigger>
//                             <SelectValue placeholder="اختر الوحدة" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="كيلو">كيلو</SelectItem>
//                             <SelectItem value="حبة">حبة</SelectItem>
//                             <SelectItem value="علبة">علبة</SelectItem>
//                             <SelectItem value="كيس">كيس</SelectItem>
//                             <SelectItem value="لتر">لتر</SelectItem>
//                             <SelectItem value="زجاجة">زجاجة</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
                      
//                       <div>
//                         <Label htmlFor="image">رمز المنتج</Label>
//                         <Input
//                           id="image"
//                           value={formData.image}
//                           onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
//                           placeholder="🍎"
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="category">الفئة الرئيسية</Label>
//                         <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
//                           <SelectTrigger>
//                             <SelectValue placeholder="اختر الفئة الرئيسية" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {categories.filter(cat => cat.id !== 'all').map(category => (
//                               <SelectItem key={category.id} value={category.name}>
//                                 {category.icon} {category.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
                      
//                       <div>
//                         <Label htmlFor="subCategory">الفئة الفرعية</Label>
//                         <Input
//                           id="subCategory"
//                           value={formData.subCategory}
//                           onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
//                           placeholder="أدخل الفئة الفرعية"
//                         />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <Label htmlFor="store">المتجر</Label>
//                       <Select value={formData.store} onValueChange={(value) => setFormData(prev => ({ ...prev, store: value }))}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="اختر المتجر" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="متجر الرياض">متجر الرياض</SelectItem>
//                           <SelectItem value="متجر جدة">متجر جدة</SelectItem>
//                           <SelectItem value="متجر الدمام">متجر الدمام</SelectItem>
//                           <SelectItem value="متجر مكة">متجر مكة</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
                    
//                     <div>
//                       <Label htmlFor="description">الوصف (اختياري)</Label>
//                       <Textarea
//                         id="description"
//                         value={formData.description}
//                         onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                         placeholder="وصف المنتج..."
//                         rows={3}
//                       />
//                     </div>
                    
//                     <div className="flex gap-2 pt-4">
//                       <Button type="submit" className="flex-1">
//                         {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
//                       </Button>
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         onClick={() => setIsDialogOpen(false)}
//                       >
//                         إلغاء
//                       </Button>
//                     </div>
//                   </form>
//                 </DialogContent>
//                 </Dialog>
//               </div>
//             </div>
            
//             {/* Search */}
//             <div className="relative max-w-md">
//               <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="البحث عن منتج..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pr-10"
//               />
//             </div>
//           </div>

//           <Container size="full" className="p-6">
//             <div className="bg-white rounded-lg border border-border overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-surface border-b border-border">
//                     <tr>
//                       <th className="text-right p-4 font-medium">الصورة</th>
//                       <th className="text-right p-4 font-medium">اسم المنتج</th>
//                       <th className="text-right p-4 font-medium">الوصف</th>
//                       <th className="text-right p-4 font-medium">السعر</th>
//                       <th className="text-right p-4 font-medium">الفئة الرئيسية</th>
//                       <th className="text-right p-4 font-medium">الفئة الفرعية</th>
//                       <th className="text-right p-4 font-medium">المتجر</th>
//                       <th className="text-right p-4 font-medium">العمليات</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProducts.map((product) => (
//                       <tr key={product.id} className="border-b border-border hover:bg-surface/50">
//                         <td className="p-4">
//                           <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-xl">
//                             {product.image}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="font-medium">{product.name}</div>
//                           <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
//                             <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                             <span>{product.rating}</span>
//                             <span>({product.reviewCount})</span>
//                           </div>
//                         </td>
//                         <td className="p-4 max-w-xs">
//                           <div className="text-sm text-muted-foreground line-clamp-2">
//                             {product.description || 'لا يوجد وصف'}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="font-bold text-primary">{product.price} ر.س</div>
//                           <div className="text-sm text-muted-foreground">/ {product.unit}</div>
//                           {product.originalPrice && (
//                             <div className="text-xs text-muted-foreground line-through">
//                               {product.originalPrice} ر.س
//                             </div>
//                           )}
//                         </td>
//                         <td className="p-4">
//                           <Badge variant="outline">
//                             {product.category || 'غير محدد'}
//                           </Badge>
//                         </td>
//                         <td className="p-4">
//                           <Badge variant="secondary">
//                             {product.subCategory || 'غير محدد'}
//                           </Badge>
//                         </td>
//                         <td className="p-4">
//                           <div className="text-sm">{product.store || 'غير محدد'}</div>
//                         </td>
//                         <td className="p-4">
//                           <div className="flex gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleEdit(product)}
//                             >
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="destructive"
//                               size="sm"
//                               onClick={() => handleDelete(product.id)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {filteredProducts.length === 0 && (
//               <Card className="text-center py-12">
//                 <CardContent>
//                   <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
//                   <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث</p>
//                 </CardContent>
//               </Card>
//             )}
//           </Container>
//         </main>
//       </div>
//     </BaseLayout>
//   );
// };

// export default AdminProductsPage;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Star,
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  TrendingUp,
  ImageIcon
} from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service with proper backend integration
const apiService = {
  // Get auth token from session storage (memory-based alternative)
  getToken() {
    // In a real app, this would come from your auth system
    // For demo purposes, you can set this manually or through login
    return localStorage.getItem("token")
  },

  async getAllProducts() {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const productData = await res.json();
      return productData;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      
      // Add text fields
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && key !== 'imageCover') {
          formData.append(key, productData[key]);
        }
      });
      
      // Handle images - if they're URLs, send as body data
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((img, index) => {
          if (typeof img === 'string' && img.startsWith('http')) {
            formData.append(`images[${index}].url`, img);
          } else if (img.url && img.url.startsWith('http')) {
            formData.append(`images[${index}].url`, img.url);
          }
        });
      }

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async uploadExcelFile(file) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/products/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      throw error;
    }
  },

  async increasePrices(storeId, percentage) {
    console.log(storeId,percentage)
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/products/increasePrices/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ percentage }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Error increasing prices:', error);
      throw error;
    }
  },

  async getAllStores() {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/stores`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const storeData = await res.json();
      return storeData;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  },

  async getAllCategories() {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const categoryData = await res.json();
      return categoryData;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getAllSubCategories() {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE_URL}/subcategories`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const subcategoryData = await res.json();
      return subcategoryData;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};


const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([
    { _id: '1', name: 'متجر الرياض' },
    { _id: '2', name: 'متجر جدة' },
    { _id: '3', name: 'متجر الدمام' }
  ]);
  const [categories, setCategories] = useState([
    { _id: '1', name: 'فواكه' },
    { _id: '2', name: 'خضروات' },
    { _id: '3', name: 'مخبوزات' }
  ]);
  const [subcategories, setSubcategories] = useState([
    { _id: '1', name: 'فواكه' },
    { _id: '2', name: 'خضروات' },
    { _id: '3', name: 'مخبوزات' }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPriceUpdateDialogOpen, setIsPriceUpdateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    discount: '',
    store: '',
    category: '',
    subCategory: '',
    images: []
  });

  // Image handling functions
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const [priceUpdateData, setPriceUpdateData] = useState({
    store: '',
    percentage: ''
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
    loadStores();
    loadCategories();
    loadSubCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllProducts();
      setProducts(response.data || []);
      setError('');
    } catch (err) {
      setError('خطأ في تحميل المنتجات - تأكد من تشغيل الخادم على localhost:5000');
      console.error('Error loading products:', err);
      // Set some demo data if API fails
      setProducts([
        {
          _id: 'demo1',
          name: 'منتج تجريبي',
          description: 'هذا منتج تجريبي لعرض الواجهة',
          price: 25.99,
          quantity: 100,
          discount: 10,
          discountedPrice: 23.39,
          store: { name: 'متجر تجريبي' },
          category: { name: 'فئة تجريبية' },
          images: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllStores();
      setStores(response.data || []);
      setError('');
    } catch (err) {
      setError('خطأ في تحميل المنتجات - تأكد من تشغيل الخادم على localhost:5000');
      console.error('Error loading products:', err);     
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllCategories();
      setCategories(response.data || []);
      setError('');
    } catch (err) {
      setError('خطأ في تحميل المنتجات - تأكد من تشغيل الخادم على localhost:5000');
      console.error('Error loading products:', err);
      // Set some demo data if API fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllSubCategories();
      setSubcategories(response.data || []);
      setError('');
    } catch (err) {
      setError('خطأ في تحميل المنتجات - تأكد من تشغيل الخادم على localhost:5000');
      console.error('Error loading products:', err);
      // Set some demo data if API fails
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (product.category && product.category.name === selectedCategory);
    const matchesSubCategory = selectedSubCategory === 'all' || 
      (product.subcategory && product.subcategory.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      // Prepare form data for API
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        discount: parseFloat(formData.discount) || 0,
        store: formData.store,
        category: formData.category,
        subCategory: formData.subCategory || null,
        images: formData.images.length > 0 ? formData.images : []
      };

      let response;
      if (editingProduct) {
        response = await apiService.updateProduct(editingProduct._id, productData);
        // Handle response - your backend returns the updated product directly
        const updatedProduct = {
          ...response,
          discountedPrice: response.discount ? 
            response.price * (1 - response.discount / 100) : response.price
        };
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? updatedProduct : p));
        showToast('تم تحديث المنتج بنجاح', 'success');
      } else {
        response = await apiService.createProduct(productData);
        setProducts(prev => [...prev, response.data]);
        showToast('تم إضافة المنتج بنجاح', 'success');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError('خطأ في حفظ المنتج: ' + err.message);
      console.error('Error saving product:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      discount: product.discount?.toString() || '0',
      store: product.store?._id || '',
      category: product.category?._id || '',
      subCategory: product.subCategory?.name || '',
      images: product.images || []
    });
    setIsDialogOpen(true);    
  };

  const handleDelete = async (productId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
      showToast('تم حذف المنتج بنجاح', 'success');
    } catch (err) {
      setError('خطأ في حذف المنتج: ' + err.message);
      console.error('Error deleting product:', err);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      setError('نوع الملف غير مدعوم. يرجى استخدام CSV أو Excel');
      return;
    }

    setImportLoading(true);
    setError('');

    try {
      await apiService.uploadExcelFile(file);
      showToast('تم استيراد المنتجات بنجاح', 'success');
      setIsImportDialogOpen(false);
      loadProducts(); // Reload products
    } catch (err) {
      setError('خطأ في استيراد الملف: ' + err.message);
      console.error('Error importing file:', err);
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    if (!priceUpdateData.store || !priceUpdateData.percentage) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      await apiService.increasePrices(priceUpdateData.store, parseFloat(priceUpdateData.percentage));
      showToast(`تم رفع الأسعار بنسبة ${priceUpdateData.percentage}% بنجاح`, 'success');
      setIsPriceUpdateDialogOpen(false);
      setPriceUpdateData({ store: '', percentage: '' });
      loadProducts(); // Reload products to show updated prices
    } catch (err) {
      setError('خطأ في تحديث الأسعار: ' + err.message);
      console.error('Error updating prices:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      discount: '',
      store: '',
      category: '',
      subCategory: '',
      images: []
    });
  };

  const showToast = (message, type = 'info') => {
    // Simple alert for demo - replace with your toast implementation
    alert(message);
  };

  const downloadTemplate = () => {
    const template = `name,description,price,quantity,discount,store,category,subCategory,images[0].url
مثال على المنتج,وصف المنتج,100,50,10,متجر الرياض,فواكه,فواكه حمراء,🍎`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_products.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <BaseLayout dir="rtl" className="bg-surface">
      <div className="flex min-h-screen">
          <AdminSidebar />
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
                <Badge variant="secondary">{products.length} منتج</Badge>
              </div>
              
              <div className="flex gap-3">
                {/* Price Update Dialog */}
                <Dialog open={isPriceUpdateDialogOpen} onOpenChange={setIsPriceUpdateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      تحديث الأسعار
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>تحديث أسعار المنتجات</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handlePriceUpdate} className="space-y-4">
                      <div>
                        <Label htmlFor="priceStore">المتجر</Label>
                        <Select 
                          value={priceUpdateData.store} 
                          onValueChange={(value) => setPriceUpdateData(prev => ({ ...prev, store: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المتجر" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map(store => (
                              <SelectItem key={store._id} value={store._id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="percentage">نسبة الزيادة (%)</Label>
                        <Input
                          id="percentage"
                          type="number"
                          step="0.1"
                          value={priceUpdateData.percentage}
                          onChange={(e) => setPriceUpdateData(prev => ({ ...prev, percentage: e.target.value }))}
                          placeholder="10"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1" 
                          disabled={submitLoading}
                        >
                          {submitLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                          تحديث الأسعار
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPriceUpdateDialogOpen(false)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Import Dialog */}
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      استيراد من ملف
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>استيراد المنتجات</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="importFile">اختر ملف CSV أو Excel</Label>
                        <Input
                          id="importFile"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileImport}
                          className="mt-2"
                          disabled={importLoading}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">الأعمدة المطلوبة:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>name - اسم المنتج</li>
                          <li>description - الوصف</li>
                          <li>price - السعر</li>
                          <li>quantity - الكمية</li>
                          <li>discount - نسبة الخصم (اختياري)</li>
                          <li>store - المتجر</li>
                          <li>category - الفئة الرئيسية</li>
                          <li>images[0].url - رابط الصورة (اختياري)</li>
                        </ul>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={downloadTemplate}
                        className="w-full gap-2"
                      >
                        <Download className="h-4 w-4" />
                        تحميل ملف نموذج
                      </Button>
                      
                      {importLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin ml-2" />
                          <span>جاري الاستيراد...</span>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add Product Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button onClick={openAddDialog} className="gap-2">
      <Plus className="h-4 w-4" />
      إضافة منتج جديد
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
      </DialogTitle>
    </DialogHeader>
    
    {error && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
    
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">اسم المنتج *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="أدخل اسم المنتج"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">السعر *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="quantity">الكمية *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="discount">نسبة الخصم (%)</Label>
          <Input
            id="discount"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
            placeholder="0"
          />
        </div>
        
        <div>
          <Label htmlFor="store">المتجر *</Label>
          <Select 
            value={formData.store} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, store: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المتجر" />
            </SelectTrigger>
            <SelectContent>
              {stores.map(store => (
                <SelectItem key={store._id} value={store._id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="category">الفئة الرئيسية *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="subCategory">الفئة الفرعية</Label>
          <Select 
            required
            value={formData.subCategory} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, subCategory: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder=" اختر الفئة الفرعية " />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map(subCategory => (
                <SelectItem key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="وصف المنتج..."
          rows={4}
        />
      </div>
      
      {/* Image Upload Section */}
      {
        !editingProduct? 
        <div className="space-y-4">
        <Label htmlFor="images">صور المنتج</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="images" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  اسحب الصور هنا أو انقر للاختيار
                </span>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, JPEG حتى 10MB لكل صورة
            </p>
          </div>
        </div>
        
        {/* Image Preview */}
      {formData.images.map((image = [], index) => {
        const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;

        return (
          <div key={index} className="relative">
            <img
              src={imageUrl}
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        );
      })}

      </div>
      :
      <></>
      }
      
      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={submitLoading}
        >
          {submitLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsDialogOpen(false)}
        >
          إلغاء
        </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Table */}
          <div className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-right p-4 font-medium text-gray-900">الصورة</th>
                      <th className="text-right p-4 font-medium text-gray-900">اسم المنتج</th>
                      <th className="text-right p-4 font-medium text-gray-900">الوصف</th>
                      <th className="text-right p-4 font-medium text-gray-900">السعر</th>
                      <th className="text-right p-4 font-medium text-gray-900">الكمية</th>
                      <th className="text-right p-4 font-medium text-gray-900">الخصم</th>
                      <th className="text-right p-4 font-medium text-gray-900">الفئة</th>
                      <th className="text-right p-4 font-medium text-gray-900">المتجر</th>
                      <th className="text-right p-4 font-medium text-gray-900">العمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                            {product.images[0] ? <img src={product.images[0]} alt="Product image" /> : '📦'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product._id}</div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {product.description || 'لا يوجد وصف'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-green-600">
                            {product.discountedPrice} ر.س
                          </div>
                          {product.discount > 0 && (
                            <div className="text-xs text-gray-400 line-through">
                              {product.price.toFixed(2)} ر.س
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant={product.quantity > 10 ? "default" : product.quantity > 0 ? "secondary" : "destructive"}>
                            {product.quantity}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {product.discount > 0 ? (
                            <Badge variant="destructive">{product.discount}%</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="font-medium">{product.category?.name || 'غير محدد'}</div>
                            {product.subCategory?.name && (
                              <div className="text-gray-500">{product.subCategory.name}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">{product.store?.name || 'غير محدد'}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredProducts.length === 0 && (
              <Card className="text-center py-12 mt-6">
                <CardContent>
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-500">لم يتم العثور على منتجات تطابق معايير البحث</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>        
      </div>    
    </BaseLayout>
  );
};

export default AdminProductsPage;