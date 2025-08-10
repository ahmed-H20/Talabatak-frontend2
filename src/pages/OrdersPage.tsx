import { Package, Clock, CheckCircle, XCircle, Bell, RefreshCw, MapPin, User, Store, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

// Interface for User location
interface Location {
  coordinates: [number, number];
  type: "Point";
}

// Interface for User
interface User {
  _id: string;
  name: string;
  location: Location;
  phone: string;
}

// Interface for Store location
interface StoreLocation {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

// Interface for Store
interface Store {
  _id: string;
  name: string;
  location: StoreLocation;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
}

// Interface for Order Item
interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

// Main Order Interface
interface Order {
  _id: string;
  user: User;
  store: Store;
  orderItems: OrderItem[];
  deliveryAddress: string;
  deliveryFee: number;
  totalPrice: number;
  groupOrderId: string;
  status: "processing" | "pending" | "cancelled" | "delivered" | "rejected";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Function to create Google Maps link
  const createGoogleMapsLink = (lat: number, lng: number, label?: string) => {
    const baseUrl = 'https://www.google.com/maps';
    if (label) {
      return `${baseUrl}/search/?api=1&query=${encodeURIComponent(label)}&query_place_id=${lat},${lng}`;
    }
    return `${baseUrl}?q=${lat},${lng}`;
  };

  // Get user location Google Maps link
  const getUserLocationLink = (user: User | null) => {
    if (user?.location?.coordinates && user.location.coordinates.length === 2) {
      const [lng, lat] = user.location.coordinates; // GeoJSON format is [lng, lat]
      return createGoogleMapsLink(lat, lng, `موقع ${user.name}`);
    }
    return null;
  };

  // Get store location Google Maps link
  const getStoreLocationLink = (store: Store | null) => {
    if (store?.location?.coordinates) {
      const { lat, lng } = store.location.coordinates;
      return createGoogleMapsLink(lat, lng, store.name);
    }
    return null;
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token) {
      const socketInstance = io('https://talabatak-backend2-zw4i.onrender.com', {
        auth: {
          token: token
        }
      });

      setSocket(socketInstance);

      // Listen for real-time order status updates
      socketInstance.on('orderStatusUpdated', (updatedOrder: Order) => {
        console.log('Order status updated:', updatedOrder);
        
        // Update the specific order in the list
        setOrders(prev => prev.map(order => 
          order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order
        ));
        
        // Show notification based on status
        const statusMessages = {
          processing: '🔄 تم قبول طلبك وهو الآن قيد المعالجة',
          delivered: '✅ تم تسليم طلبك بنجاح!',
          cancelled: '❌ تم إلغاء طلبك',
          rejected: '⛔ تم رفض طلبك',
          pending: '⏳ طلبك في انتظار المراجعة'
        };

        toast({
          title: 'تحديث الطلب',
          description: `طلب #${updatedOrder._id.slice(-8)}: ${statusMessages[updatedOrder.status] || 'تم تحديث حالة الطلب'}`,
          duration: 5000,
        });
      });

      // Listen for order updates (quantity, items, etc.)
      socketInstance.on('orderUpdated', (updatedOrder: Order) => {
        console.log('Order updated:', updatedOrder);
        setOrders(prev => prev.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
        
        toast({
          title: '📝 تم تحديث الطلب',
          description: `تم تحديث تفاصيل طلب #${updatedOrder._id.slice(-8)}`,
          duration: 3000,
        });
      });

      // Listen for order cancellations
      socketInstance.on('orderCancelled', (cancelledOrder: Order) => {
        console.log('Order cancelled:', cancelledOrder);
        setOrders(prev => prev.map(order => 
          order._id === cancelledOrder._id ? { ...order, status: 'cancelled' } : order
        ));
        
        toast({
          title: '❌ تم إلغاء الطلب',
          description: `طلب #${cancelledOrder._id.slice(-8)} تم إلغاؤه`,
          duration: 3000,
        });
      });

      // Connection status handlers
      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server');
        toast({
          title: '🔌 متصل',
          description: 'ستتلقى تحديثات طلباتك فوراً',
          duration: 2000,
        });
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        toast({
          title: '⚠️ انقطع الاتصال',
          description: 'انقطع الاتصال بالخادم',
          variant: 'destructive',
          duration: 500,
        });
      });

      socketInstance.on('reconnect', () => {
        console.log('Reconnected to Socket.IO server');
        toast({
          title: '🔄 أعيد الاتصال',
          description: 'تم إعادة الاتصال بالخادم بنجاح',
          duration: 2000,
        });
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [token, toast]);

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://talabatak-backend2-zw4i.onrender.com/api/orders/', {
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
      console.error('Error fetching orders:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel order function
  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      return;
    }

    try {
      const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'فشل في إلغاء الطلب');
      }

      const data = await res.json();
      
      // Update the order in the state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));

      toast({
        title: '✅ تم إلغاء الطلب',
        description: `تم إلغاء طلب #${orderId.slice(-8)} بنجاح`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إلغاء الطلب',
        variant: 'destructive',
      });
    }
  };

  // Update order function (for demonstration - you might want to implement a modal with form)
  const updateOrder = async (orderId: string, order: Order) => {
    console.log(order)
    // This is a basic example - you might want to implement a proper form/modal
    const newAddress = window.prompt('أدخل عنوان التسليم الجديد:');
    if (!newAddress) return;

    try {
      const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/orders/${orderId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          deliveryAddress: newAddress,
          orderItems: order.orderItems
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'فشل في تحديث الطلب');
      }

      const updatedOrder = await res.json();
      
      // Update the order in the state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, deliveryAddress: newAddress } : order
      ));

      toast({
        title: '✅ تم تحديث الطلب',
        description: `تم تحديث طلب #${orderId.slice(-8)} بنجاح`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الطلب',
        variant: 'destructive',
      });
    }
  };

  // Check if order can be cancelled or updated (only pending orders)
  const canModifyOrder = (status: string) => {
    return status === 'pending';
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Refresh orders manually
  const handleRefresh = () => {
    fetchOrders();
    toast({
      title: '🔄 تحديث',
      description: 'جاري تحديث قائمة الطلبات...',
      duration: 1000,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'تم التسليم';
      case 'processing':
        return 'قيد المعالجة';
      case 'cancelled':
        return 'ملغي';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'بانتظار المراجعة';
      default:
        return 'جديد';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <BaseLayout dir="rtl" className="pb-16 md:pb-0">
        <Header />
        <main className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
          </div>
        </main>
        <BottomNav />
      </BaseLayout>
    );
  }

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      <Header />
      
      <main className="min-h-screen bg-surface">
        <Container size="full" className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">طلباتي</h1>
              {socket?.connected && (
                <Badge className="bg-green-100 text-green-800">
                  <Bell className="h-3 w-3 mr-1" />
                  متصل
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
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
                <Card key={order._id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        طلب رقم #{order._id.slice(-8)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusVariant(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="mr-1">{getStatusText(order.status)}</span>
                        </Badge>
                        
                        {/* Action buttons for pending orders */}
                        {canModifyOrder(order.status) && (
                          <div className="flex gap-1">
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrder(order._id, order)}
                              className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="تعديل الطلب"
                            >
                              <Edit className="h-3 w-3" />
                            </Button> */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelOrder(order._id)}
                              className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="إلغاء الطلب"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                      <p>الوقت: {new Date(order.createdAt).toLocaleTimeString('ar-SA')}</p>
                      
                      {/* Store Information with Google Maps Link */}
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>المتجر: {order.store?.name || 'غير محدد'}</span>
                        {order.store && getStoreLocationLink(order.store) && (
                          <a
                            href={getStoreLocationLink(order.store)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            عرض الموقع
                          </a>
                        )}
                      </div>

                      {/* User Information with Google Maps Link */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>العميل: {order.user?.name || 'غير محدد'}</span>
                        {order.user?.phone && <span>({order.user.phone})</span>}
                        {order.user && getUserLocationLink(order.user) && (
                          <a
                            href={getUserLocationLink(order.user)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            موقع العميل
                          </a>
                        )}
                      </div>

                      <p>عنوان التسليم: {order.deliveryAddress}</p>
                      {order.store?.location?.address && (
                        <p>عنوان المتجر: {order.store.location.address}</p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">المنتجات:</h4>
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {item.product?.images && item.product.images[0] && (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <span className="font-medium block">{item.product?.name}</span>
                                  <span className="text-muted-foreground text-sm">الكمية: {item.quantity}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">
                                {(item.price * item.quantity).toFixed(2)} جنيه
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.price.toFixed(2)} جنيه / قطعة
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-border space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>رسوم التوصيل:</span>
                          <span>{order.deliveryFee.toFixed(2)} جنيه</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>المجموع الكلي:</span>
                          <span className="text-primary">{order.totalPrice.toFixed(2)} جنيه</span>
                        </div>
                      </div>
                      
                      {/* Order timestamps */}
                      <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>تم الإنشاء: {new Date(order.createdAt).toLocaleString('ar-SA')}</span>
                          <span>آخر تحديث: {new Date(order.updatedAt).toLocaleString('ar-SA')}</span>
                        </div>
                        {order.groupOrderId && (
                          <div className="mt-1">
                            <span>معرف المجموعة: {order.groupOrderId}</span>
                          </div>
                        )}
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