import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Bell,
  LogOut,
  Bike,
  Truck
} from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service Functions
const apiService = {
  // Orders
  async getOrders() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/all`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || 'خطأ في جلب الطلبات');
      throw new Error(data.message || 'Failed to fetch orders');      
    }
    
    return response.json();
  },

  async updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || 'خطأ في تحديث حالة الطلب');
      throw new Error(data.message || 'Failed to update order status');
    }
    
    return response.json();
  },

  // Products
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || 'خطأ في جلب المنتجات');
      throw new Error(data.message || 'Failed to fetch products');
    }
    
    return response.json();
  },

  // Categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || 'خطأ في جلب الفئات');
      throw new Error(data.message || 'Failed to fetch categories');
    }
    
    return response.json();
  },

  // Stores
  async getStores() {
    const response = await fetch(`${API_BASE_URL}/stores`);
    
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || 'خطأ في جلب المتاجر');
      throw new Error(data.message || 'Failed to fetch stores');
    }
    
    return response.json();
  }
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
            // Load data from APIs
      const [ordersRes, productsRes, storesRes, categoriesRes] = await Promise.all([
        apiService.getOrders().catch(err => ({ error: err.message, data: [] })),
        apiService.getProducts().catch(err => ({ error: err.message, data: [] })),
        apiService.getStores().catch(err => ({ error: err.message, data: [] })),
        apiService.getCategories().catch(err => ({ error: err.message, data: [] }))
      ]);

      // Process Orders Data
      let ordersList = [];
      if (ordersRes && !ordersRes.error) {
        ordersList = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data || []);
        setRecentOrders(ordersList.slice(0, 5)); // Get recent 5 orders
        
        // Calculate order statistics
        const pendingCount = ordersList.filter(order => order.status === 'pending').length;
        const totalRevenue = ordersList
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        setStats(prev => ({
          ...prev,
          totalOrders: ordersList.length,
          pendingOrders: pendingCount,
          totalRevenue: totalRevenue
        }));
      }

      // Process Products Data
      if (productsRes && !productsRes.error) {
        const productsList = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);
        setStats(prev => ({
          ...prev,
          totalProducts: productsList.length
        }));
      }

      setLoading(false);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(error.message || 'خطأ في تحميل البيانات من الخادم');
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Update the order in the local state
      setRecentOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Reload data to update stats
      loadDashboardData();
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'خطأ في تحديث حالة الطلب');
      setError('خطأ في تحديث حالة الطلب');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'assigned_to_delivery': return <Clock className="h-4 w-4" />;
      case 'on_the_way': return <Bike className="h-4 w-4" />;
      case 'delivery_failed': return <XCircle className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'processing': return 'قيد المعالجة';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'مرفوض';
      case 'assigned_to_delivery': return 'تم تعيينه للمندوب';
      case 'on_the_way': return 'في الطريق';
      case 'out_for_delivery': return 'خارج للتوصيل';
      case 'delivery_failed': return 'لايوجد مندوب للتوصيل (ملغى)';
      case 'picked_up': return 'تم الاستلام من المتجر';
      default: return 'غير معروف';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'processing': return 'bg-info text-info-foreground';
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'assigned_to_delivery': return 'bg-info text-info-foreground';
      case 'on_the_way': return 'bg-info text-info-foreground';
      case 'out_for_delivery': return 'bg-info text-info-foreground';
      case 'delivery_failed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const formatCustomerName = (order) => {
    // If user data is populated, use user name
    if (order.user && order.user.name) {
      return order.user.name;
    }
    
    // Otherwise, create a generic name with order ID
    return `عميل #${order._id?.slice(-6) || 'غير معروف'}`;
  };

  const formatLocation = (order) => {
    if (order.deliveryAddress) {
      return order.deliveryAddress;
    }
    
    if (order.user && order.user.location && order.user.location.coordinates) {
      return `${order.user.location.coordinates[1]?.toFixed(4)}, ${order.user.location.coordinates[0]?.toFixed(4)}`;
    }
    
    return 'عنوان غير محدد';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <BaseLayout dir="rtl" className="bg-surface">
      <div className="flex h-screen">
                  <AdminSidebar />       
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-border p-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">لوحة التحكم</h1>
              <p className="text-muted-foreground">مرحباً بك في لوحة تحكم المتجر</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <Bell className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">طلبات معلقة</p>
                      <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المنتجات</p>
                      <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الإيرادات</p>
                      <p className="text-2xl font-bold">{stats.totalRevenue} ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  الطلبات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات حالياً
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{formatCustomerName(order)}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{formatLocation(order)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-bold text-lg">{order.totalPrice || 0} ر.س</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusVariant(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="mr-1">{getStatusText(order.status)}</span>
                          </Badge>
                          
                          {order.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOrderStatusUpdate(order._id, 'processing')}
                              >
                                قبول
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleOrderStatusUpdate(order._id, 'cancelled')}
                              >
                                رفض
                              </Button>
                            </div>
                          )}
                          
                          {order.status === 'processing' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleOrderStatusUpdate(order._id, 'delivered')}
                            >
                              تم التسليم لمناديب التوصيل
                            </Button>
                          )}
                          {
                            order.status === 'assigned_to_delivery' && (
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleOrderStatusUpdate(order._id, 'on_the_way')}
                              >
                                في الطريق
                              </Button>
                            )
                          }
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
        </BaseLayout >
    
  );
};

export default AdminDashboardPage;