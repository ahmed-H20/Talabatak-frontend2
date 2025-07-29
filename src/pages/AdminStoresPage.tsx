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
import { Plus, Search, Edit, Trash2, MapPin, Phone, Clock } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  workingHours: string;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

const AdminStoresPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([
    {
      id: '1',
      name: 'فرع الرياض',
      description: 'الفرع الرئيسي في العاصمة',
      address: 'شارع الملك فهد، الرياض',
      phone: '+966501234567',
      workingHours: '9:00 ص - 10:00 م',
      isActive: true,
      location: { lat: 24.7136, lng: 46.6753 }
    },
    {
      id: '2',
      name: 'فرع جدة',
      description: 'فرع المنطقة الغربية',
      address: 'كورنيش جدة، جدة',
      phone: '+966507654321',
      workingHours: '10:00 ص - 11:00 م',
      isActive: true,
      location: { lat: 21.4858, lng: 39.1925 }
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    workingHours: '',
    isActive: true,
    location: { lat: 0, lng: 0 }
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
          ? { ...store, ...formData }
          : store
      ));
      toast({ title: "تم تحديث المتجر بنجاح" });
    } else {
      const newStore: Store = {
        id: Date.now().toString(),
        ...formData,
      };
      setStores([...stores, newStore]);
      toast({ title: "تم إضافة المتجر بنجاح" });
    }
    
    setIsDialogOpen(false);
    setEditingStore(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      workingHours: '',
      isActive: true,
      location: { lat: 0, lng: 0 }
    });
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData(store);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setStores(stores.filter(store => store.id !== id));
    toast({ title: "تم حذف المتجر بنجاح" });
  };

  const openAddDialog = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      workingHours: '',
      isActive: true,
      location: { lat: 0, lng: 0 }
    });
    setIsDialogOpen(true);
  };

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
                
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStore ? 'تعديل المتجر' : 'إضافة متجر جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+966501234567"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="workingHours">ساعات العمل</Label>
                      <Input
                        id="workingHours"
                        value={formData.workingHours}
                        onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                        placeholder="9:00 ص - 10:00 م"
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
                      <Badge variant={store.isActive ? "default" : "secondary"}>
                        {store.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {store.description}
                    </p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{store.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{store.phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{store.workingHours}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(store)}
                        className="flex-1 gap-2"
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