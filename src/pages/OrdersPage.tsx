import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { OrderStatus } from '@/data/mockData';

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

const mockOrders: Order[] = [
  {
    id: '12345',
    date: '2024-01-15',
    status: 'delivered',
    items: [
      { name: 'تفاح أحمر طازج', quantity: 2, price: 12 },
      { name: 'موز عضوي', quantity: 1, price: 8 }
    ],
    total: 32
  },
  {
    id: '12346',
    date: '2024-01-20',
    status: 'processing',
    items: [
      { name: 'برتقال طبيعي', quantity: 3, price: 10 }
    ],
    total: 30
  },
  {
    id: '12347',
    date: '2024-01-18',
    status: 'rejected',
    items: [
      { name: 'فراولة طازجة', quantity: 2, price: 18 }
    ],
    total: 36
  }
];

const OrdersPage = () => {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'تم التسليم';
      case 'processing':
        return 'قيد المعالجة';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'جديد';
    }
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      <Header />
      
      <main className="min-h-screen bg-surface">
        <Container size="full" className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">طلباتي</h1>
          </div>

          {mockOrders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground">لم تقم بتقديم أي طلبات بعد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">طلب رقم #{order.id}</CardTitle>
                      <Badge className={getStatusVariant(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="mr-1">{getStatusText(order.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{order.date}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground mr-2">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border flex justify-between items-center font-bold">
                        <span>المجموع الكلي</span>
                        <span className="text-primary text-lg">{order.total} ر.س</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>

      <BottomNav />
    </BaseLayout>
  );
};

export default OrdersPage;