import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { OrderStatus } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interface for User location
interface Location {
  coordinates: [number, number];  // Array of latitude and longitude
  type: "Point";  // Indicates the type of the location
}

// Interface for User
interface User {
  _id: string;  // User's unique identifier
  name: string;  // User's name
  location: Location;  // User's location
  phone: string;
}

// Interface for Store location
interface StoreLocation {
  coordinates: {
    lat: number;  // Latitude of the store
    lng: number;  // Longitude of the store
  };
  address: string;  // Address of the store
}

// Interface for Store
interface Store {
  _id: string;  // Store's unique identifier
  name: string;  // Store's name
  location: StoreLocation;  // Store's location
}

interface Product {
  name: string;
  description: string;
}

// Interface for Order Item
interface OrderItem {
  product: Product;  // Product ID (Assumed to be a string)
  quantity: number;  // Quantity of the product
  price: number;  // Price per unit of the product
}

// Main Order Interface
interface Order {
  _id: string;  // Order's unique identifier
  user: User;  // User who placed the order
  store: Store;  // Store that fulfilled the order
  orderItems: OrderItem[];  // List of items in the order
  deliveryAddress: string;  // Delivery address
  deliveryFee: number;  // Delivery fee
  totalPrice: number;  // Total price of the order
  groupOrderId: string;  // Group order ID
  status: "processing" | "pending"  | "cancelled" | "delivered";  // Order status
  createdAt: string;  // Order creation timestamp
  updatedAt: string;  // Order update timestamp
  __v: number;  // Version key (Mongoose internal)
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);  
  const { toast } = useToast();
  const token = localStorage.getItem("token")

  // fetch orders 
  useEffect(()=>{
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) {
          throw new Error('فشل في تحميل الطلبات');
        }
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل الطلبات',
          variant: 'destructive',
        });
      }
    };

    fetchOrders()
  },[token])

  console.log(orders)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
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
      case 'cancelled':
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
      case 'cancelled':
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

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground">لم تقم بتقديم أي طلبات بعد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">طلب رقم #{order._id}</CardTitle>
                      <Badge className={getStatusVariant(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="mr-1">{getStatusText(order.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">اليوم : { new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">الوقت : { new Date(order.createdAt).toLocaleTimeString()}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-muted-foreground mr-2">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border flex justify-between items-center font-bold">
                        <span>المجموع الكلي</span>
                        <span className="text-primary text-lg">{order.totalPrice} ر.س</span>
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