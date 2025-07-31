import React, { useState } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, MapPin, Phone, Clock, Eye, Truck, Package, ArrowRight } from 'lucide-react';

interface WorkingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  deliveryRange: string;
  productCount: number;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
  workingHours: WorkingHours[];
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  image?: string;
}

const AdminStoresPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([
    {
      id: '1',
      name: 'متجر الإلكترونيات الحديثة',
      description: 'متجر متخصص في بيع الأجهزة الإلكترونية والتقنية',
      address: 'القاهرة، مصر الجديدة',
      phone: '+966501234567',
      deliveryRange: '15 كيلومتر من المتجر',
      productCount: 1,
      isActive: true,
      location: { lat: 24.7136, lng: 46.6753 },
      workingHours: [
        { day: 'السبت', open: '22:00', close: '09:00', isClosed: false },
        { day: 'الأحد', open: '22:00', close: '09:00', isClosed: false },
        { day: 'الاثنين', open: '22:00', close: '09:00', isClosed: false },
        { day: 'الثلاثاء', open: '22:00', close: '09:00', isClosed: false },
        { day: 'الأربعاء', open: '22:00', close: '09:00', isClosed: false },
        { day: 'الخميس', open: '22:00', close: '14:00', isClosed: false },
        { day: 'الجمعة', open: '22:00', close: '14:00', isClosed: false },
      ],
      products: [
        {
          id: '1',
          name: 'آيفون 15 برو',
          description: 'هاتف ذكي متطور بأحدث التقنيات',
          price: 4500,
          category: 'الإلكترونيات',
          subcategory: 'هواتف ذكية'
        }
      ]
    },
    {
      id: '2',
      name: 'متجر الأزياء العصرية',
      description: 'متجر للملابس والأزياء الحديثة',
      address: 'الإسكندرية، سموحة',
      phone: '+966507654321',
      deliveryRange: '20 كيلومتر من المتجر',
      productCount: 1,
      isActive: true,
      location: { lat: 21.4858, lng: 39.1925 },
      workingHours: [
        { day: 'السبت', open: '23:00', close: '10:00', isClosed: false },
        { day: 'الأحد', open: '23:00', close: '10:00', isClosed: false },
        { day: 'الاثنين', open: '23:00', close: '10:00', isClosed: false },
        { day: 'الثلاثاء', open: '23:00', close: '10:00', isClosed: false },
        { day: 'الأربعاء', open: '23:00', close: '10:00', isClosed: false },
        { day: 'الخميس', open: '23:00', close: '10:00', isClosed: false },
        { day: 'الجمعة', open: '23:00', close: '10:00', isClosed: false },
      ],
      products: []
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    deliveryRange: '',
    isActive: true,
    location: { lat: 0, lng: 0 },
    workingHours: [
      { day: 'السبت', open: '09:00', close: '22:00', isClosed: false },
      { day: 'الأحد', open: '09:00', close: '22:00', isClosed: false },
      { day: 'الاثنين', open: '09:00', close: '22:00', isClosed: false },
      { day: 'الثلاثاء', open: '09:00', close: '22:00', isClosed: false },
      { day: 'الأربعاء', open: '09:00', close: '22:00', isClosed: false },
      { day: 'الخميس', open: '09:00', close: '22:00', isClosed: false },
      { day: 'الجمعة', open: '09:00', close: '22:00', isClosed: false },
    ]
  });

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStore) {
      setStores(stores.map(store => 
        store.id === editingStore.id 
          ? { 
              ...store, 
              ...formData,
              productCount: store.productCount,
              products: store.products 
            }
          : store
      ));
      toast({ title: "تم تحديث المتجر بنجاح" });
    } else {
      const newStore: Store = {
        id: Date.now().toString(),
        ...formData,
        productCount: 0,
        products: []
      };
      setStores([...stores, newStore]);
      toast({ title: "تم إضافة المتجر بنجاح" });
    }
    
    setIsDialogOpen(false);
    setEditingStore(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      deliveryRange: '',
      isActive: true,
      location: { lat: 0, lng: 0 },
      workingHours: [
        { day: 'السبت', open: '09:00', close: '22:00', isClosed: false },
        { day: 'الأحد', open: '09:00', close: '22:00', isClosed: false },
        { day: 'الاثنين', open: '09:00', close: '22:00', isClosed: false },
        { day: 'الثلاثاء', open: '09:00', close: '22:00', isClosed: false },
        { day: 'الأربعاء', open: '09:00', close: '22:00', isClosed: false },
        { day: 'الخميس', open: '09:00', close: '22:00', isClosed: false },
        { day: 'الجمعة', open: '09:00', close: '22:00', isClosed: false },
      ]
    });
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      description: store.description,
      address: store.address,
      phone: store.phone,
      deliveryRange: store.deliveryRange,
      isActive: store.isActive,
      location: store.location,
      workingHours: store.workingHours
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setStores(stores.filter(store => store.id !== id));
    toast({ title: "تم حذف المتجر بنجاح" });
  };

  const handleView = (store: Store) => {
    setSelectedStore(store);
    setViewMode('detail');
  };

  const openAddDialog = () => {
    setEditingStore(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const updateWorkingHours = (index: number, field: keyof WorkingHours, value: string | boolean) => {
    const newWorkingHours = [...formData.workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    setFormData({ ...formData, workingHours: newWorkingHours });
  };

  if (viewMode === 'detail' && selectedStore) {
    return (
      <BaseLayout>
        <div className="flex min-h-screen">
          <AdminSidebar />
          
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('grid')}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    العودة للقائمة
                  </Button>
                  <h1 className="text-3xl font-bold">{selectedStore.name}</h1>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(selectedStore)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    تعديل المتجر
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Store Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        معلومات المتجر
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">الحالة:</span>
                        <Badge variant={selectedStore.isActive ? "default" : "secondary"}>
                          {selectedStore.isActive ? 'مفتوح الآن' : 'مغلق'}
                        </Badge>
                      </div>
                      
                      <div>
                        <span className="font-medium">الوصف:</span>
                        <p className="text-muted-foreground mt-1">{selectedStore.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedStore.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>نطاق التوصيل: {selectedStore.deliveryRange}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedStore.productCount} منتج متاح</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Map Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>موقع المتجر على الخريطة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">خريطة الموقع</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStore.location.lat}, {selectedStore.location.lng}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>منتجات المتجر</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedStore.products.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>الصورة</TableHead>
                              <TableHead>اسم المنتج</TableHead>
                              <TableHead>الفئة الرئيسية</TableHead>
                              <TableHead>الفئة الفرعية</TableHead>
                              <TableHead>السعر</TableHead>
                              <TableHead>العمليات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStore.products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.subcategory}</TableCell>
                                <TableCell>{product.price} ر.س</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">لا توجد منتجات في هذا المتجر</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Working Hours */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        ساعات العمل
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>اليوم</TableHead>
                            <TableHead>ساعات العمل</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedStore.workingHours.map((schedule, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{schedule.day}</TableCell>
                              <TableCell>
                                {schedule.isClosed ? (
                                  <span className="text-red-500">مغلق</span>
                                ) : (
                                  <span className="text-green-600">
                                    {schedule.open} - {schedule.close}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">إدارة المتاجر</h1>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة متجر جديد
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStore ? 'تعديل المتجر' : 'إضافة متجر جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">اسم المتجر</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="أدخل اسم المتجر"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+966501234567"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="أدخل وصف المتجر"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="أدخل عنوان المتجر"
                        rows={2}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="deliveryRange">نطاق التوصيل</Label>
                      <Input
                        id="deliveryRange"
                        value={formData.deliveryRange}
                        onChange={(e) => setFormData({ ...formData, deliveryRange: e.target.value })}
                        placeholder="15 كيلومتر من المتجر"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lat">خط العرض</Label>
                        <Input
                          id="lat"
                          type="number"
                          step="any"
                          value={formData.location.lat}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, lat: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="24.7136"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng">خط الطول</Label>
                        <Input
                          id="lng"
                          type="number"
                          step="any"
                          value={formData.location.lng}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, lng: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="46.6753"
                        />
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div>
                      <Label>ساعات العمل</Label>
                      <div className="space-y-3 mt-2">
                        {formData.workingHours.map((schedule, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 items-center">
                            <span className="text-sm font-medium">{schedule.day}</span>
                            <Input
                              type="time"
                              value={schedule.open}
                              onChange={(e) => updateWorkingHours(index, 'open', e.target.value)}
                              disabled={schedule.isClosed}
                              className="text-sm"
                            />
                            <Input
                              type="time"
                              value={schedule.close}
                              onChange={(e) => updateWorkingHours(index, 'close', e.target.value)}
                              disabled={schedule.isClosed}
                              className="text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={schedule.isClosed}
                                onChange={(e) => updateWorkingHours(index, 'isClosed', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">مغلق</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isActive">متجر نشط</Label>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingStore ? 'تحديث' : 'إضافة'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المتاجر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredStores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <Badge variant={store.isActive ? "default" : "secondary"} className="bg-green-100 text-green-800">
                        {store.isActive ? 'مفتوح الآن' : 'مغلق'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {store.description}
                    </p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>{store.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <span>نطاق التوصيل: {store.deliveryRange}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span>{store.productCount} منتج</span>
                      </div>
                    </div>

                    {/* Today's Working Hours */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">ساعات العمل اليوم</span>
                      </div>
                      <div className="text-sm text-green-600">
                        {store.workingHours[0]?.isClosed ? 'مغلق' : `${store.workingHours[0]?.open} - ${store.workingHours[0]?.close}`}
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div className="border-t pt-3 mb-4">
                      <span className="text-sm font-medium text-muted-foreground">المنتجات:</span>
                      {store.products.length > 0 ? (
                        <div className="mt-2">
                          <span className="text-sm">{store.products[0].name}</span>
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-muted-foreground">لا توجد منتجات</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(store)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(store)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(store.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStores.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد متاجر</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminStoresPage;