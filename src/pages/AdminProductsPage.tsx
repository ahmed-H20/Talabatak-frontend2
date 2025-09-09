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
  Upload,
  Download,
  Loader2,
  AlertCircle,
  TrendingUp,
  ImageIcon
} from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toast } from '@/hooks/use-toast';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to extract error message from different error formats
const getErrorMessage = (error) => {
  // If it's already a string, return it
  if (typeof error === 'string') return error;
  
  // Try to extract message from different possible structures
  if (error?.error) return error.error;  
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0];
  }
  if (error?.data?.error) return error.data.error;
  if (error?.data?.message) return error.data.message;
  if (error?.message) return error.message;  
  // Default fallback
  return 'حدث خطأ غير متوقع';
};

// Updated toast function for better error display
const showToast = (message, type = 'info') => {
  if (type === 'success') {
    toast({
      title: 'نجح',
      description: message,
      variant: 'default',
    });
  } else if (type === 'error' || type === 'destructive') {
    toast({
      title: 'خطأ',
      description: message,
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'معلومة',
      description: message,
      variant: 'default',
    });
  }
};

// Fixed API Service with improved error handling
const apiService = {
  getToken() {
    // In-memory token storage (replace with your actual token management)
    return window.sessionStorage?.getItem("token") || localStorage?.getItem("token");
  },

  async handleApiResponse(response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      
      // Create error object with proper structure
      const error = new Error(getErrorMessage(errorData) || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return response.json();
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
      
      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'فشل فى جلب المنتجات ليس لديك صلاحيات كافية');
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
        if (key !== 'images' && productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      
      // Handle image files properly
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      }

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لإنشاء المنتج');
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const token = this.getToken();
      
      // For updates, send JSON data (as your backend expects JSON for PUT)
      const updateData = {
        ...productData,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        discount: Number(productData.discount) || 0,
      };

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      });

      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لتحديث المنتج');
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

      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لحذف المنتج');
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

      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لاستيراد المنتجات');
      console.error('Error uploading Excel file:', error);
      throw error;
    }
  },

  async increasePrices(storeId, percentage) {
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

      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لتحديث الأسعار');
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
      
      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لجلب المتاجر');
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
      
      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لجلب الفئات');
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
      
      return await this.handleApiResponse(res);
    } catch (error) {
      toast(error.message || 'ليس لديك صلاحيات كافية لجلب الفئات الفرعية');
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    images: [],
    unit: 'كيلو'
  });

  const [priceUpdateData, setPriceUpdateData] = useState({
    store: '',
    percentage: ''
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

  // Load data on component mount
  useEffect(() => {
    Promise.all([
      loadProducts(),
      loadStores(),
      loadCategories(),
      loadSubCategories()
    ]);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllProducts();
      setProducts(response.data || []);
      setError('');
    } catch (err) {
      toast({
        title: 'خطأ',
        description: err.message || 'فشل في تحميل المنتجات',
        variant: 'destructive',
      });
      setError('خطأ في تحميل المنتجات: ' + err.message);
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {      
      const response = await apiService.getAllStores();
      setStores(response.data || []);      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في جلب الطلبات لست ادمن',
        variant: 'destructive',
      });
      console.error('Error loading stores:', error);
      setStores([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحميل الفئات',
        variant: 'destructive',
      });
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadSubCategories = async () => {
    try {
      const response = await apiService.getAllSubCategories();
      setSubcategories(response.data || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحميل الفئات الفرعية',
        variant: 'destructive',
      });
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (product.category && product.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.name || !formData.price || !formData.category || !formData.store) {
        throw new Error('يرجى ملء جميع الحقول المطلوبة');
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        discount: parseFloat(formData.discount) || 0,
        store: formData.store,
        category: formData.category,
        subCategory: formData.subCategory || null,
        images: formData.images,
        unit: formData.unit
      };

      let response;
      if (editingProduct) {
        // For updates, don't send image files - handle separately if needed
        const updateData = { ...productData };
        delete updateData.images; // Remove images from update for now
        
        response = await apiService.updateProduct(editingProduct._id, updateData);
        
        // Update products list
        setProducts(prev => prev.map(p => 
          p._id === editingProduct._id 
            ? { ...response.data, discountedPrice: response.data.price * (1 - (response.data.discount || 0) / 100) }
            : p
        ));
        
        showToast('تم تحديث المنتج بنجاح', 'success');
      } else {
        response = await apiService.createProduct(productData);
        
        // Add new product to list
        const newProduct = {
          ...response.data,
          discountedPrice: response.data.price * (1 - (response.data.discount || 0) / 100)
        };
        setProducts(prev => [...prev, newProduct]);
        
        showToast('تم إضافة المنتج بنجاح', 'success');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حفظ المنتج',
        variant: 'destructive',
      });
      setError('خطأ في حفظ المنتج: ' + error.message);
      console.error('Error saving product:', error);
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
      discount: (product.discount || 0).toString(),
      store: product.store?._id || '',
      category: product.category?._id || '',
      subCategory: product.subCategory?._id || '',
      images: [],
      unit: product.unit || 'كيلو'
    });
    setIsDialogOpen(true);    
  };

  const handleDelete = async (productId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
      showToast('تم حذف المنتج بنجاح', 'success');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف المنتج',
        variant: 'destructive',
      });
      setError('خطأ في حذف المنتج: ' + error.message);
      console.error('Error deleting product:', error);
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
      loadProducts();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(`خطأ في استيراد الملف: ${errorMessage}`, 'error');
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
      loadProducts();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(`خطأ في تحديث الأسعار: ${errorMessage}`, 'error');
      setError('خطأ في تحديث الأسعار: ' + errorMessage);
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
      images: [],
      unit: 'كيلو'
    });
  };

  const downloadTemplate = () => {
    const template = `name,description,price,quantity,discount,store,category,subCategory,unit,images[0].url
مثال على المنتج,وصف المنتج,100,50,10,متجر الرياض,فواكه,فواكه حمراء,كيلو,https://example.com/image.jpg`;
    
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
      {formData.images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {formData.images.map((image, index) => {
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
      )}

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
                            {product.images && product.images[0] ? 
                              <img src={product.images[0]} alt="Product image" className="w-12 h-12 object-cover rounded-lg" /> 
                              : '📦'
                            }
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
                            {product.discountedPrice ? product.discountedPrice.toFixed(2) : product.price.toFixed(2)} ر.س
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