import React, { useState, useEffect } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Ticket, Calendar, Percent, Users, Store } from 'lucide-react';

interface Store {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
}

interface Coupon {
  id: string;
  name: string;
  expire: string;
  discount: number;
  stores: Store[];
  usageLimit: number;
  allStores: boolean;
  usedBy: User[];
  allUsers: boolean;
  createdAt: string;
}

const AdminCouponsPage = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    expire: '',
    couponDiscount: 0,
    stores: [] as string[],
    usageLimit: 1,
    allStores: false,
    usedBy: [] as string[],
    allUsers: true
  });

  const token = localStorage.getItem('token');

  const filteredCoupons = coupons.filter(coupon =>
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons/getCoupons', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) {
        throw new Error('فشل في تحميل الكوبونات');
      }
      const data = await res.json();
      setCoupons(data.data);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الكوبونات',
        variant: 'destructive',
      });
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stores', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data.data || []);
      }
    } catch (error) {
      console.log('Failed to fetch stores');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCoupons(), fetchStores()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(editingCoupon)
    e.preventDefault();
    
    try {
      const url = editingCoupon 
        ? `http://localhost:5000/api/coupons/update/${editingCoupon.id}`
        : 'http://localhost:5000/api/coupons/create';
      
      const method = editingCoupon ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(editingCoupon ? 'فشل في تحديث الكوبون' : 'فشل في إنشاء الكوبون');
      }

      toast({
        title: editingCoupon ? 'تم تحديث الكوبون بنجاح' : 'تم إنشاء الكوبون بنجاح',
      });

      setIsDialogOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      expire: coupon.expire.split('T')[0], // Format date for input
      couponDiscount: coupon.discount,
      stores: coupon.stores.map(store => store._id) || [],
      usageLimit: coupon.usageLimit,
      allStores: coupon.allStores,
      usedBy: coupon?.usedBy.map(user => user?._id) || [],
      allUsers: coupon.allUsers
    });
    console.log(formData);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error('فشل في حذف الكوبون');
      }

      toast({ title: 'تم حذف الكوبون بنجاح' });
      fetchCoupons();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الكوبون',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      expire: '',
      couponDiscount: 0,
      stores: [],
      usageLimit: 1,
      allStores: false,
      usedBy: [],
      allUsers: true
    });
  };

  const openAddDialog = () => {
    setEditingCoupon(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <BaseLayout dir="rtl">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 p-8">
            <div className="text-center">جاري التحميل...</div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout dir="rtl">
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">إدارة الكوبونات</h1>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة كوبون جديد
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم الكوبون</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="أدخل اسم الكوبون"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="expire">تاريخ الانتهاء</Label>
                      <Input
                        id="expire"
                        type="date"
                        value={formData.expire}
                        onChange={(e) => setFormData({ ...formData, expire: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="couponDiscount">نسبة الخصم (%)</Label>
                      <Input
                        id="couponDiscount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.couponDiscount}
                        onChange={(e) => setFormData({ ...formData, couponDiscount: Number(e.target.value) })}
                        placeholder="أدخل نسبة الخصم"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="usageLimit">عدد مرات الاستخدام المسموح</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        min="0"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                        placeholder="0 = بلا حدود"
                      />
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="allStores"
                        checked={formData.allStores}
                        onChange={(e) => setFormData({ ...formData, allStores: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="allStores">جميع المتاجر</Label>
                    </div>

                    {!formData.allStores && stores.length > 0 && (
                      <div>
                        <Label>المتاجر المحددة</Label>
                        <div className="space-y-2">
                          {/* Selected stores display */}
                          {formData.stores.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.stores.map((storeId) => {
                                const store = stores.find(s => s._id === storeId);
                                return store ? (
                                  <Badge key={storeId} variant="secondary" className="flex items-center gap-1">
                                    {store.name}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData({
                                          ...formData,
                                          stores: formData.stores.filter(id => id !== storeId)
                                        });
                                      }}
                                      className="ml-1 text-xs hover:text-red-500"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                          
                          {/* Store selection dropdown */}
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (!formData.stores.includes(value)) {
                                setFormData({
                                  ...formData,
                                  stores: [...formData.stores, value]
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر متجر لإضافته" />
                            </SelectTrigger>
                            <SelectContent>
                              {stores
                                .filter(store => !formData.stores.includes(store._id))
                                .map((store) => (
                                  <SelectItem key={store._id} value={store._id}>
                                    {store.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Quick actions */}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  stores: stores.map(store => store._id)
                                });
                              }}
                              disabled={formData.stores.length === stores.length}
                            >
                              تحديد الكل
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  stores: []
                                });
                              }}
                              disabled={formData.stores.length === 0}
                            >
                              إلغاء التحديد
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingCoupon ? 'تحديث' : 'إضافة'}
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
                  placeholder="البحث في الكوبونات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        {coupon.name}
                      </CardTitle>
                      <Badge variant={isExpired(coupon.expire) ? "destructive" : "default"}>
                        {isExpired(coupon.expire) ? 'منتهي الصلاحية' : 'نشط'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Percent className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">{coupon.discount}% خصم</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>ينتهي في: {formatDate(coupon.expire)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          استُخدم {coupon.usedBy.length} مرة
                          {coupon.usageLimit > 0 && ` من ${coupon.usageLimit}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>
                          {coupon.allStores 
                            ? 'جميع المتاجر' 
                            : `${coupon.stores.length} متجر محدد`
                          }
                        </span>
                      </div>

                      {coupon.stores.length > 0 && !coupon.allStores && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex flex-wrap gap-1 mt-1">
                            {coupon.stores.slice(0, 3).map((store, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {typeof store === 'string' ? store : store.name}
                              </Badge>
                            ))}
                            {coupon.stores.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{coupon.stores.length - 3} أخرى
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
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

            {filteredCoupons.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد كوبونات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminCouponsPage;