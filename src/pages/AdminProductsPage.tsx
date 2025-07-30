import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Star,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useToast } from '@/hooks/use-toast';
import { mockProducts, categories } from '@/data/mockData';
import { Product } from '@/components/store/ProductCard';

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    unit: '',
    description: '',
    category: '',
    subCategory: '',
    store: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    // For category filtering, we'd need to add category field to Product interface
    return matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image || '📦',
      unit: formData.unit,
      category: formData.category,
      subCategory: formData.subCategory,
      store: formData.store,
      rating: editingProduct?.rating || 4.5,
      reviewCount: editingProduct?.reviewCount || 0,
      isNew: !editingProduct,
      isFavorite: editingProduct?.isFavorite || false,
      inStock: true,
      discount: formData.originalPrice && formData.price ? 
        Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100) : 
        undefined
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
      toast({
        title: "تم تحديث المنتج",
        description: `تم تحديث ${productData.name} بنجاح`,
        className: "bg-success text-success-foreground"
      });
    } else {
      setProducts(prev => [...prev, productData]);
      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة ${productData.name} بنجاح`,
        className: "bg-success text-success-foreground"
      });
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', originalPrice: '', image: '', unit: '', description: '', category: '', subCategory: '', store: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      image: product.image,
      unit: product.unit,
      description: product.description || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      store: product.store || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "تم حذف المنتج",
      description: "تم حذف المنتج بنجاح",
      className: "bg-destructive text-destructive-foreground"
    });
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', originalPrice: '', image: '', unit: '', description: '', category: '', subCategory: '', store: '' });
    setIsDialogOpen(true);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const importedProducts = results.data.map((row: any, index: number) => ({
            id: `imported-${Date.now()}-${index}`,
            name: row.name || row['اسم المنتج'] || '',
            price: parseFloat(row.price || row['السعر']) || 0,
            originalPrice: parseFloat(row.originalPrice || row['السعر الأصلي']) || undefined,
            image: row.image || row['الصورة'] || '📦',
            unit: row.unit || row['الوحدة'] || 'قطعة',
            rating: parseFloat(row.rating || row['التقييم']) || 4.5,
            reviewCount: parseInt(row.reviewCount || row['عدد التقييمات']) || 0,
            isNew: false,
            isFavorite: false,
            inStock: true,
            discount: row.originalPrice && row.price ? 
              Math.round(((parseFloat(row.originalPrice) - parseFloat(row.price)) / parseFloat(row.originalPrice)) * 100) : 
              undefined
          })).filter(product => product.name && product.price > 0);

          setProducts(prev => [...prev, ...importedProducts]);
          toast({ title: `تم استيراد ${importedProducts.length} منتج بنجاح` });
          setIsImportDialogOpen(false);
        },
        error: (error) => {
          toast({ title: "خطأ في قراءة الملف", variant: "destructive" });
          console.error('CSV parsing error:', error);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedProducts = jsonData.map((row: any, index: number) => ({
            id: `imported-${Date.now()}-${index}`,
            name: row.name || row['اسم المنتج'] || '',
            price: parseFloat(row.price || row['السعر']) || 0,
            originalPrice: parseFloat(row.originalPrice || row['السعر الأصلي']) || undefined,
            image: row.image || row['الصورة'] || '📦',
            unit: row.unit || row['الوحدة'] || 'قطعة',
            rating: parseFloat(row.rating || row['التقييم']) || 4.5,
            reviewCount: parseInt(row.reviewCount || row['عدد التقييمات']) || 0,
            isNew: false,
            isFavorite: false,
            inStock: true,
            discount: row.originalPrice && row.price ? 
              Math.round(((parseFloat(row.originalPrice) - parseFloat(row.price)) / parseFloat(row.originalPrice)) * 100) : 
              undefined
          })).filter(product => product.name && product.price > 0);

          setProducts(prev => [...prev, ...importedProducts]);
          toast({ title: `تم استيراد ${importedProducts.length} منتج بنجاح` });
          setIsImportDialogOpen(false);
        } catch (error) {
          toast({ title: "خطأ في قراءة ملف Excel", variant: "destructive" });
          console.error('Excel parsing error:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({ title: "نوع الملف غير مدعوم. يرجى استخدام CSV أو Excel", variant: "destructive" });
    }

    // Reset input
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const template = [
      {
        'اسم المنتج': 'مثال على المنتج',
        'السعر': 100,
        'السعر الأصلي': 120,
        'الصورة': '📦',
        'الوحدة': 'قطعة',
        'التقييم': 4.5,
        'عدد التقييمات': 25
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_products.csv';
    link.click();
  };

  return (
    <BaseLayout dir="rtl" className="bg-surface">
      <div className="flex h-screen">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
              </div>
              
              <div className="flex gap-3">
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
                        />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>الأعمدة المطلوبة:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>اسم المنتج أو name</li>
                          <li>السعر أو price</li>
                          <li>الوحدة أو unit</li>
                          <li>الصورة أو image (اختياري)</li>
                          <li>التقييم أو rating (اختياري)</li>
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
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة منتج جديد
                    </Button>
                  </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم المنتج</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="أدخل اسم المنتج"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">السعر</Label>
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
                        <Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="unit">الوحدة</Label>
                        <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الوحدة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="كيلو">كيلو</SelectItem>
                            <SelectItem value="حبة">حبة</SelectItem>
                            <SelectItem value="علبة">علبة</SelectItem>
                            <SelectItem value="كيس">كيس</SelectItem>
                            <SelectItem value="لتر">لتر</SelectItem>
                            <SelectItem value="زجاجة">زجاجة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="image">رمز المنتج</Label>
                        <Input
                          id="image"
                          value={formData.image}
                          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="🍎"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">الفئة الرئيسية</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفئة الرئيسية" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(cat => cat.id !== 'all').map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.icon} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="subCategory">الفئة الفرعية</Label>
                        <Input
                          id="subCategory"
                          value={formData.subCategory}
                          onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                          placeholder="أدخل الفئة الفرعية"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="store">المتجر</Label>
                      <Select value={formData.store} onValueChange={(value) => setFormData(prev => ({ ...prev, store: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المتجر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="متجر الرياض">متجر الرياض</SelectItem>
                          <SelectItem value="متجر جدة">متجر جدة</SelectItem>
                          <SelectItem value="متجر الدمام">متجر الدمام</SelectItem>
                          <SelectItem value="متجر مكة">متجر مكة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">الوصف (اختياري)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="وصف المنتج..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
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
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <Container size="full" className="p-6">
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      <th className="text-right p-4 font-medium">الصورة</th>
                      <th className="text-right p-4 font-medium">اسم المنتج</th>
                      <th className="text-right p-4 font-medium">الوصف</th>
                      <th className="text-right p-4 font-medium">السعر</th>
                      <th className="text-right p-4 font-medium">الفئة الرئيسية</th>
                      <th className="text-right p-4 font-medium">الفئة الفرعية</th>
                      <th className="text-right p-4 font-medium">المتجر</th>
                      <th className="text-right p-4 font-medium">العمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-surface/50">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-xl">
                            {product.image}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating}</span>
                            <span>({product.reviewCount})</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {product.description || 'لا يوجد وصف'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-primary">{product.price} ر.س</div>
                          <div className="text-sm text-muted-foreground">/ {product.unit}</div>
                          {product.originalPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              {product.originalPrice} ر.س
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {product.category || 'غير محدد'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">
                            {product.subCategory || 'غير محدد'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{product.store || 'غير محدد'}</div>
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
                              onClick={() => handleDelete(product.id)}
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
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث</p>
                </CardContent>
              </Card>
            )}
          </Container>
        </main>
      </div>
    </BaseLayout>
  );
};

export default AdminProductsPage;