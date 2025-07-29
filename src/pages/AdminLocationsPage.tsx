import React, { useState } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, MapPin, Truck } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  city: string;
  region: string;
  deliveryFee: number;
  estimatedTime: string;
  isActive: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const AdminLocationsPage = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'وسط الرياض',
      city: 'الرياض',
      region: 'منطقة الرياض',
      deliveryFee: 15,
      estimatedTime: '2-4 ساعات',
      isActive: true,
      coordinates: { lat: 24.7136, lng: 46.6753 }
    },
    {
      id: '2',
      name: 'شمال الرياض',
      city: 'الرياض',
      region: 'منطقة الرياض',
      deliveryFee: 20,
      estimatedTime: '3-5 ساعات',
      isActive: true,
      coordinates: { lat: 24.8000, lng: 46.6753 }
    },
    {
      id: '3',
      name: 'جدة المدينة',
      city: 'جدة',
      region: 'منطقة مكة المكرمة',
      deliveryFee: 25,
      estimatedTime: '1-2 أيام',
      isActive: true,
      coordinates: { lat: 21.4858, lng: 39.1925 }
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    deliveryFee: 0,
    estimatedTime: '',
    isActive: true,
    coordinates: { lat: 0, lng: 0 }
  });

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLocation) {
      setLocations(locations.map(location => 
        location.id === editingLocation.id 
          ? { ...location, ...formData }
          : location
      ));
      toast({ title: "تم تحديث الموقع بنجاح" });
    } else {
      const newLocation: Location = {
        id: Date.now().toString(),
        ...formData,
      };
      setLocations([...locations, newLocation]);
      toast({ title: "تم إضافة الموقع بنجاح" });
    }
    
    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      city: '',
      region: '',
      deliveryFee: 0,
      estimatedTime: '',
      isActive: true,
      coordinates: { lat: 0, lng: 0 }
    });
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData(location);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLocations(locations.filter(location => location.id !== id));
    toast({ title: "تم حذف الموقع بنجاح" });
  };

  const openAddDialog = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      city: '',
      region: '',
      deliveryFee: 0,
      estimatedTime: '',
      isActive: true,
      coordinates: { lat: 0, lng: 0 }
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
              <h1 className="text-3xl font-bold">إدارة المواقع</h1>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة موقع جديد
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocation ? 'تعديل الموقع' : 'إضافة موقع جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم المنطقة</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: وسط الرياض"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">المدينة</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="الرياض"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="region">المنطقة</Label>
                        <Input
                          id="region"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          placeholder="منطقة الرياض"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deliveryFee">رسوم التوصيل (ريال)</Label>
                        <Input
                          id="deliveryFee"
                          type="number"
                          value={formData.deliveryFee}
                          onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                          placeholder="15"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="estimatedTime">الوقت المتوقع</Label>
                        <Input
                          id="estimatedTime"
                          value={formData.estimatedTime}
                          onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                          placeholder="2-4 ساعات"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lat">خط العرض</Label>
                        <Input
                          id="lat"
                          type="number"
                          step="any"
                          value={formData.coordinates.lat}
                          onChange={(e) => setFormData({
                            ...formData,
                            coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
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
                          value={formData.coordinates.lng}
                          onChange={(e) => setFormData({
                            ...formData,
                            coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
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
                      <Label htmlFor="isActive">منطقة نشطة</Label>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingLocation ? 'تحديث' : 'إضافة'}
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
                  placeholder="البحث في المواقع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <Badge variant={location.isActive ? "default" : "secondary"}>
                        {location.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{location.city}, {location.region}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>رسوم التوصيل</span>
                        </div>
                        <span className="font-semibold text-primary">{location.deliveryFee} ريال</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الوقت المتوقع:</span>
                        <span className="font-medium">{location.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(location)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
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

            {filteredLocations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد مواقع</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminLocationsPage;