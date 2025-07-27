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
  LogOut
} from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'rejected';
  createdAt: string;
  location: string;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 127,
    pendingOrders: 8,
    totalProducts: 45,
    totalRevenue: 12450
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([
    {
      id: '12345',
      customerName: 'أحمد محمد',
      total: 125,
      status: 'pending',
      createdAt: '2024-01-20 14:30',
      location: 'الرياض، حي النخيل'
    },
    {
      id: '12346',
      customerName: 'فاطمة أحمد',
      total: 89,
      status: 'processing',
      createdAt: '2024-01-20 13:15',
      location: 'جدة، حي الصفا'
    },
    {
      id: '12347',
      customerName: 'محمد علي',
      total: 156,
      status: 'delivered',
      createdAt: '2024-01-20 11:45',
      location: 'الدمام، حي الشاطئ'
    }
  ]);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Mock new order notification
      if (Math.random() > 0.95) {
        const newOrder: RecentOrder = {
          id: `${Date.now()}`,
          customerName: 'عميل جديد',
          total: Math.floor(Math.random() * 200) + 50,
          status: 'pending',
          createdAt: new Date().toLocaleString('ar-SA'),
          location: 'موقع جديد'
        };
        
        setRecentOrders(prev => [newOrder, ...prev.slice(0, 4)]);
        setStats(prev => ({ ...prev, totalOrders: prev.totalOrders + 1, pendingOrders: prev.pendingOrders + 1 }));
        
        toast({
          title: "طلب جديد!",
          description: `طلب من ${newOrder.customerName} بقيمة ${newOrder.total} ر.س`,
          className: "bg-primary text-primary-foreground"
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'processing': return 'قيد المعالجة';
      case 'delivered': return 'تم التسليم';
      case 'rejected': return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'processing': return 'bg-info text-info-foreground';
      case 'delivered': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 ml-2" />
                الإشعارات
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>

          <Container size="full" className="p-6">
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
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{order.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-bold text-lg">{order.total} ر.س</p>
                        <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusVariant(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="mr-1">{getStatusText(order.status)}</span>
                        </Badge>
                        <Button variant="outline" size="sm">
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>
      </div>
    </BaseLayout>
  );
};

export default AdminDashboardPage;