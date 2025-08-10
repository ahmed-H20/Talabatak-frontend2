import React, { useEffect, useState } from 'react';
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
import { MapContainer, TileLayer, Marker, useMapEvents ,Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationSelector = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
};

const LocationMarker = ({ setFormData }: { setFormData }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            lat,
            lng,
          },
        },
      }));
    },
  });
  return null;
};

interface WorkingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// interface Store {
//   id: string;
//   name: string;
//   description: string;
//   address: string;
//   phone: string;
//   deliveryRange: string;
//   productCount: number;
//   isActive: boolean;
//   location: {
//     lat: number;
//     lng: number;
//   };
//   workingHours: WorkingHours[];
//   products: Product[];
// }

interface Store {
  _id: string;
  name: string;
  description: string;
  phone: string;
  workingHours: WorkingHours[]
  isOpen: boolean;
  location: {
    coordinates: { lat: number; lng: number };
    address?: string;
  };
  products: Product []
  city?: string;
  deliveryRangeKm?: number; // in km
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  discountedPrice: number;
  category: string;
  subcategory: string;
  image?: string;
}

 const getCityNameFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) throw new Error("Failed to fetch city name");

    const data = await response.json();
    const city : string =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.state ||
      data.address?.county || ''

    return city || "فشل ايجاد المدينة";
  } catch (error) {
    console.error("Error in getCityNameFromCoordinates:", error);
    return "فشل ايجاد المدينة";
  }
};


const AdminStoresPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([
    {
      _id: '1',
      name: 'متجر الإلكترونيات الحديثة',
      description: 'متجر متخصص في بيع الأجهزة الإلكترونية والتقنية',
      phone: '+966501234567',
      isOpen: true,
      city: "القاهرة",
      location: { 
        address:'',
        coordinates: {
          lat: 30.0444, lng: 31.2357
        }
       },
        workingHours: [
        { day: 'Saturday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Sunday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Friday', open: '09:00', close: '22:00', isClosed: false },
      ],
      products: [
        {
          id: '1',
          name: 'آيفون 15 برو',
          description: 'هاتف ذكي متطور بأحدث التقنيات',
          price: 4500,
          category: 'الإلكترونيات',
          subcategory: 'هواتف ذكية',
          quantity: 10,
          discount: 0,
          discountedPrice: 5000
        }
      ]
    }
  ]);  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',    
    phone: '',
    deliveryRangeKm: 0,
    isOpen: true,
    city: '',
    location: { 
        address:'',
        coordinates: {
          lat: 30.0444, lng: 31.2357
        }
    },
    workingHours: [
      { day: 'Saturday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Sunday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Friday', open: '09:00', close: '22:00', isClosed: false },
    ]

  });
  const token = localStorage.getItem("token")

  const fetchStores = async () => {
        try {
            const res = await fetch('https://talabatak-backend2-zw4i.onrender.com/api/stores',{
                headers: {
                    'Content-Type': 'application/json',                    
                      ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            const data = await res.json();
            setStores(data.data);
        } catch (error) {
        toast({ title: 'فشل في تحميل المتاجر', description: String(error) });
        }
    };

  //Fetsh stores
  useEffect(() => {
    fetchStores();
  }, []);

  console.log(stores)

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData)
    if (editingStore) {
     try {
        const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/stores/${editingStore._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({...formData, city: await getCityNameFromCoordinates(formData.location.coordinates.lat, formData.location.coordinates.lng)}),
        });
        if(!res){
          console.log("Store not updated");
        }
        const data = await res.json();
        console.log("Store updated successfully", data);
        toast({ title: 'تم تحديث المتجر'});
        setIsDialogOpen(false);
        fetchStores()
        setEditingStore(null);               
      }
      catch (error) {
          toast({ title: 'فشل في تحديث المتجر', description: String(error) });
      }
    } else {
      try {
        const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/stores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({...formData, city: await getCityNameFromCoordinates(formData.location.coordinates.lat, formData.location.coordinates.lng)}),
        });
        if(!res){
          console.log("Store not Created");
        }
        const data = await res.json();
        console.log("Store updated successfully", data);
        toast({ title: 'تم اضافة المتجر'});
        setIsDialogOpen(false);
        fetchStores()
        setEditingStore(null);               
      }
      catch (error) {
          toast({ title: 'فشل في تحديث المتجر', description: String(error) });
      }
    }
    
    setIsDialogOpen(false);
    setEditingStore(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      deliveryRangeKm: 0,
      city:'',
      isOpen: true,
      location: {
        coordinates:{ lat: 30.0444, lng: 31.2357 },
        address:''
      },
      workingHours: [
        { day: 'Saturday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Sunday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Friday', open: '09:00', close: '22:00', isClosed: false },
      ]
    });
  };

  const handleEdit = async(store: Store) => {
    const cityName = await getCityNameFromCoordinates(store.location.coordinates.lat, store.location.coordinates.lng)
    setEditingStore(store);
    setFormData({
      name: store.name,
      description: store.description,
      phone: store.phone,
      deliveryRangeKm: store.deliveryRangeKm,
      isOpen: store.isOpen,
      city: cityName || '',
      location: {
        coordinates:{
          lat: store.location.coordinates.lat,
          lng: store.location.coordinates.lng,
        },
        address:store.location.address,
      },
      workingHours: store.workingHours
    });    
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // Call API to delete store
    fetch(`https://talabatak-backend2-zw4i.onrender.com/api/stores/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    .then(() => {
      setStores(stores.filter(store => store._id !== id));
      toast({ title: "تم حذف المتجر بنجاح" });
    })
    .catch((error) => {
      toast({ title: "فشل في حذف المتجر", description: String(error) });
    });
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
    <BaseLayout dir="rtl" className="bg-surface">
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
                        <Badge variant={selectedStore.isOpen ? "default" : "secondary"}>
                          {selectedStore.isOpen ? 'مفتوح الآن' : 'مغلق'}
                        </Badge>
                      </div>
                      
                      <div>
                        <span className="font-medium">الوصف:</span>
                        <p className="text-muted-foreground mt-1">{selectedStore.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedStore.location.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedStore.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>نطاق التوصيل: {selectedStore.deliveryRangeKm}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedStore.products.length} منتج متاح</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Map Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>موقع المتجر على الخريطة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* <div className="h-64 bg-muted rounded-lg flex items-center justify-center"> */}
                        {/* <div className="text-center"> */}
                          {/* <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" /> */}
                          {/* <p className="text-muted-foreground">خريطة الموقع</p> */}
                          <MapContainer className='h-64 bg-muted rounded-lg flex items-center justify-center'
                            center={[selectedStore.location.coordinates.lat, selectedStore.location.coordinates.lng]} // latitude, longitude
                            zoom={13}
                            style={{ height: '400px', width: '100%', marginTop: '1rem' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[selectedStore.location.coordinates.lat, selectedStore.location.coordinates.lng]}>
                              <Popup>
                                موقع المتجر 
                              </Popup>
                            </Marker>
                          </MapContainer>
                          {/* <p className="text-sm text-muted-foreground">
                            {selectedStore.location.coordinates.lat}, {selectedStore.location.coordinates.lng}
                          </p> */}
                        {/* </div> */}
                      {/* </div> */}
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
                              <TableHead>الكمية</TableHead>
                              <TableCell> % نسبة الخصم </TableCell>
                              <TableCell>السعر بعد الخصم</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStore.products.map((product,index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.subcategory}</TableCell>
                                <TableCell>{product.price} ر.س</TableCell>
                                {/* <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell> */}
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{product.discount}</TableCell>
                                <TableCell>{product.discountedPrice}</TableCell>                                
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
    <BaseLayout dir="rtl" className="bg-surface">
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
                        value={formData.location.address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              address: e.target.value, 
                            },
                          })
                        }
                        placeholder="أدخل عنوان المتجر"
                        rows={2}
                        required
                      />

                    </div>

                    <div>
                      <Label htmlFor="deliveryRange">نطاق التوصيل</Label>
                      <Input
                        type='number'
                        id="deliveryRange"
                        value={formData.deliveryRangeKm}
                        onChange={(e) => setFormData({ ...formData, deliveryRangeKm:  parseInt(e.target.value) })}
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
                          value={formData.location.coordinates.lat}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location,
                                coordinates: {
                                  ...formData.location.coordinates,
                                  lat: parseFloat(e.target.value) || 0
                                }
                              }
                            })
                          }

                          placeholder="24.7136"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng">خط الطول</Label>
                        <Input
                          id="lng"
                          type="number"
                          step="any"
                          value={formData.location.coordinates.lng}                          
                          onChange={(e) =>setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              coordinates: {
                                ...formData.location.coordinates,
                                lng: parseFloat(e.target.value) || 0
                              }
                            }
                          })}
                          placeholder="46.6753"
                        />
                      </div>
                      <MapContainer
                        center={[formData.location.coordinates.lat, formData.location.coordinates.lng]}
                        zoom={13}
                        style={{ height: '400px', width: '100%', marginTop: '1rem' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />

                        <LocationSelector
                          onSelect={(lat, lng) => {
                            setFormData((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                coordinates: { lat, lng },
                              },
                            }));
                          }}
                        />

                        <Marker position={[formData.location.coordinates.lat, formData.location.coordinates.lng]}>
                          <Popup>موقع المتجر</Popup>
                        </Marker>
                      </MapContainer>
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
                        checked={formData.isOpen}
                        onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
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
                <Card key={store._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <Badge variant={store.isOpen ? "default" : "secondary"} className="bg-green-100 text-green-800">
                        {store.isOpen ? 'مفتوح الآن' : 'مغلق'}
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
                        <span>{store.location.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <span>نطاق التوصيل: {store.deliveryRangeKm}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span>{store.products.length} منتج</span>
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
                        onClick={() => handleDelete(store._id)}
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