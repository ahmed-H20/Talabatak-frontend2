import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'rejected';
  createdAt: string;
  coordinates?: { lat: number; lng: number };
}

const mockOrders: Order[] = [
  {
    id: '12345',
    customerName: 'أحمد محمد علي',
    customerPhone: '0501234567',
    customerAddress: 'الرياض، حي النخيل، شارع الملك فهد، بجوار مسجد النور',
    items: [
      { name: 'تفاح أحمر طازج', quantity: 2, price: 12 },
      { name: 'موز عضوي', quantity: 1, price: 8 }
    ],
    total: 32,
    status: 'pending',
    createdAt: '2024-01-20 14:30',
    coordinates: { lat: 24.7136, lng: 46.6753 }
  },
  {
    id: '12346',
    customerName: 'فاطمة أحمد حسن',
    customerPhone: '0559876543',
    customerAddress: 'جدة، حي الصفا، طريق الأمير سلطان',
    items: [
      { name: 'برتقال طبيعي', quantity: 3, price: 10 },
      { name: 'جبن أبيض طبيعي', quantity: 1, price: 20 }
    ],
    total: 50,
    status: 'processing',
    createdAt: '2024-01-20 13:15'
  },
  {
    id: '12347',
    customerName: 'محمد علي خالد',
    customerPhone: '0557894561',
    customerAddress: 'الدمام، حي الشاطئ، شارع الخليج العربي',
    items: [
      { name: 'لحم غنم طازج', quantity: 1, price: 65 },
      { name: 'خبز عربي طازج', quantity: 2, price: 3 }
    ],
    total: 71,
    status: 'delivered',
    createdAt: '2024-01-20 11:45'
  }
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast({
      title: "تم تحديث حالة الطلب",
      description: `تم تغيير حالة الطلب #${orderId}`,
      className: "bg-success text-success-foreground"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <ShoppingCart className="h-4 w-4" />;
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
          <div className="bg-white border-b border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو رقم الطلب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطلبات</SelectItem>
                  <SelectItem value="pending">بانتظار المراجعة</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Container size="full" className="p-6">
            <div className="grid gap-6">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">طلب رقم #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                      </div>
                      <Badge className={getStatusVariant(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="mr-1">{getStatusText(order.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium mb-3">معلومات العميل</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">الاسم:</span>
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <span>{order.customerAddress}</span>
                          </div>
                          {order.coordinates && (
                            <Button variant="outline" size="sm" className="mt-2">
                              <MapPin className="h-4 w-4 ml-2" />
                              عرض على الخريطة
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-3">المنتجات</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground mr-2">x{item.quantity}</span>
                              </div>
                              <span className="font-semibold">{item.price * item.quantity} ر.س</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-border flex justify-between items-center font-bold">
                            <span>المجموع الكلي</span>
                            <span className="text-primary text-lg">{order.total} ر.س</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                      
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="bg-info text-info-foreground hover:bg-info/90"
                          >
                            قبول الطلب
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                          >
                            رفض الطلب
                          </Button>
                        </>
                      )}
                      
                      {order.status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="bg-success text-success-foreground hover:bg-success/90"
                        >
                          تم التسليم
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
                  <p className="text-muted-foreground">لم يتم العثور على طلبات تطابق معايير البحث</p>
                </CardContent>
              </Card>
            )}
          </Container>
        </main>
      </div>
    </BaseLayout>
  );
};

export default AdminOrdersPage;