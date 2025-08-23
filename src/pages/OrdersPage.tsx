import { Package, Clock, CheckCircle, XCircle, Bell, RefreshCw, MapPin, User, Store, Edit, X, ThumbsUp, Truck, UserCheck, ShoppingBag, Star, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

interface ProductInfo {
  _id: string;
  name: string;
  images: []
}

interface OrderItem {
  product: ProductInfo;
  quantity: number;
  price: number;
}

interface StoreInfo {
  _id: string;
  name: string;
  phone: string
}

interface DeliveryPersonInfo {
  _id: string;
  name: string;
  phone: string;
}

interface Order {
  _id: string;
  user: {
    _id: string,
    name: string
    phone :string
  }; // user ID
  store: StoreInfo;
  orderItems: OrderItem[];
  deliveryAddress: string;
  deliveryFee: number;
  totalPrice: number;
  discountAmount: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'rejected' | 'assigned_to_delivery' | 'on_the_way';
  deliveryLocation: GeoPoint;
  storeLocation: GeoPoint;
  createdAt: string;
  updatedAt: string;
  assignedDeliveryPerson?: DeliveryPersonInfo;
  assignedAt?: string;
  failureReason?: string;
  groupOrderId?: string;
  // Rating fields
  customerRating?: number;
  customerFeedback?: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Create Link from coordinates
  const getGoogleMapsLink = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token) {
      const socketInstance = io('http://localhost:5000', {
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
          order._id === updatedOrder._id ? { 
            ...order, 
            status: updatedOrder.status,
            assignedDeliveryPerson: updatedOrder.assignedDeliveryPerson,
            assignedAt: updatedOrder.assignedAt,
            failureReason: updatedOrder.failureReason,
            // Add any other fields that might be updated
            updatedAt: updatedOrder.updatedAt
          } : order
        ));
        
        // Show notification based on status
        const statusMessages = {
          processing: '🔄 تم قبول طلبك وهو الآن قيد المعالجة',
          delivered: '✅ تم تسليم طلبك بنجاح!',
          cancelled: '❌ تم إلغاء طلبك',
          rejected: '⛔ تم رفض طلبك',
          pending: '⏳ طلبك في انتظار المراجعة',
          assigned_to_delivery: '🚚 تم تخصيص طلبك لمندوب التوصيل',
          on_the_way: '🛣️ طلبك في الطريق إليك'
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
      const res = await fetch('http://localhost:5000/api/orders/', {
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

  // Rate delivery function
  const rateDelivery = async (orderId: string, rating: number, feedback: string) => {
    try {
      setSubmittingRating(true);
      
      const res = await fetch(`http://localhost:5000/api/delivery/rate/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          rating,
          feedback
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'فشل في تقييم المندوب');
      }

      // Update the order in the state to show it has been rated
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { 
          ...order, 
          customerRating: rating, 
          customerFeedback: feedback 
        } : order
      ));

      toast({
        title: '✅ تم التقييم بنجاح',
        description: `تم تقييم مندوب توصيل طلب #${orderId.slice(-8)} بنجاح`,
        duration: 3000,
      });

      // Close the rating modal
      setSelectedOrderForRating(null);
      setRating(0);
      setFeedback('');
      
    } catch (error) {
      console.error('Error rating delivery:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تقييم المندوب',
        variant: 'destructive',
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  // Cancel order function
  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
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
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/update`, {
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

  // Check if order can be rated (delivered orders that haven't been rated yet)
  const canRateOrder = (order: Order) => {
    return order.status === 'delivered' && !order.customerRating && order.assignedDeliveryPerson;
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
      case 'delivery_failed':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Package className="h-4 w-4" />;
      case 'accepted': // قبل الطلب
        return <ThumbsUp className="h-4 w-4" />;
      case 'picked_up': // استلم من المتجر
        return <ShoppingBag className="h-4 w-4" />;
      case 'on_the_way': // في الطريق للعميل
        return <Truck className="h-4 w-4" />;
      case 'assigned_to_delivery': // لما يتخصص لمندوب
        return <UserCheck className="h-4 w-4" />;
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
      case 'delivery_failed':
        return 'ملغي';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'بانتظار المراجعة';
      case 'assigned_to_delivery':
        return 'تم تخصيص الطلب لمندوب';
      case 'accepted':
        return 'تم قبول الطلب من المندوب';
      case 'picked_up':
        return 'تم استلام الطلب من المتجر';
      case 'on_the_way':
        return 'الطلب في الطريق للعميل';
      default:
        return 'جديد';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'assigned_to_delivery':
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'rejected':
      case 'delivery_failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
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
                        
                        {/* Rate delivery button for delivered orders */}
                        {canRateOrder(order) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrderForRating(order)}
                            className="h-8 px-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                            title="تقييم مندوب التوصيل"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Action buttons for pending orders */}
                        {canModifyOrder(order.status) && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrder(order._id, order)}
                              className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="تعديل الطلب"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
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
                      <span className='bg-red-100 text-red-800 display-block'>{order.failureReason? "نأسف " + order.failureReason: ""}</span>
                      <p>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                      <p>الوقت: {new Date(order.createdAt).toLocaleTimeString('ar-SA')}</p>
                      
                      {/* Store Information with Google Maps Link */}
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>المتجر: {order.store?.name || 'غير محدد'}</span>
                        {order.store?.phone && <span>({order.store.phone})</span>}
                        {order.store && order.storeLocation ? 
                          <a
                            href={getGoogleMapsLink(
                              order.storeLocation.coordinates[1], 
                              order.storeLocation.coordinates[0]
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            موقع المتجر
                          </a>
                          :
                          ""
                        }
                      </div>

                      {/* User Information with Google Maps Link */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>العميل: {order.user?.name || 'غير محدد'}</span>                        
                        {order.user && order.deliveryLocation ? 
                          <a
                            href={getGoogleMapsLink(
                              order.deliveryLocation.coordinates[0], 
                              order.deliveryLocation.coordinates[1]
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            موقعك
                          </a>
                          :
                          ""
                        }
                      </div>

                      {/* Delivery Person Information (when assigned) */}
                      {order.assignedDeliveryPerson && (
                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">معلومات مندوب التوصيل:</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-blue-600" />
                              <span>الاسم: {order.assignedDeliveryPerson.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-blue-600" />
                              <span>الهاتف: {order.assignedDeliveryPerson.phone}</span>
                            </div>
                            {order.assignedAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-blue-600" />
                                <span>تم التخصيص: {new Date(order.assignedAt).toLocaleString('ar-SA')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Customer Rating Display (if already rated) */}
                      {order.customerRating && (
                        <div className="bg-yellow-50 rounded-lg p-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-600 fill-current" />
                            <span className="font-medium text-yellow-900">تقييمك لمندوب التوصيل:</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= order.customerRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="mr-2 font-medium">{order.customerRating}/5</span>
                            </div>
                            {order.customerFeedback && (
                              <div className="mt-2 text-yellow-800">
                                <span className="font-medium">تعليقك: </span>
                                <span>{order.customerFeedback}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

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

      {/* Rating Modal */}
      {selectedOrderForRating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="w-full sm:max-w-md sm:mx-4">
            <Card className="rounded-t-3xl sm:rounded-2xl border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">تقييم مندوب التوصيل</CardTitle>
                      <p className="text-sm text-gray-500">طلب #{selectedOrderForRating._id.slice(-6)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOrderForRating(null);
                      setRating(0);
                      setFeedback('');
                    }}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 pb-6">
                {/* Delivery Person Info */}
                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">مندوب التوصيل:</span>
                    <span className="font-medium">{selectedOrderForRating.assignedDeliveryPerson?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">رقم الهاتف:</span>
                    <span className="font-medium">{selectedOrderForRating.assignedDeliveryPerson?.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">المبلغ الإجمالي:</span>
                    <span className="font-bold text-green-600">{selectedOrderForRating.totalPrice.toFixed(2)} جنيه</span>
                  </div>
                </div>
                
                {/* Star Rating */}
                <div className="space-y-3 text-center">
                  <label className="text-sm font-medium text-gray-900">كيف تقيم خدمة التوصيل؟</label>
                  <StarRating rating={rating} onRatingChange={setRating} />
                  <p className="text-xs text-gray-500">
                    {rating === 0 && "اختر تقييمك"}
                    {rating === 1 && "سيء جداً"}
                    {rating === 2 && "سيء"}
                    {rating === 3 && "متوسط"}
                    {rating === 4 && "جيد"}
                    {rating === 5 && "ممتاز"}
                  </p>
                </div>
                
                {/* Feedback */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900">تعليقك (اختياري)</label>
                  <Textarea
                    placeholder="شاركنا تجربتك مع مندوب التوصيل..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="text-sm resize-none rounded-xl border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button 
                    onClick={() => rateDelivery(selectedOrderForRating._id, rating, feedback)}
                    disabled={rating === 0 || submittingRating}
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl shadow-lg"
                  >
                    {submittingRating ? (
                      <RefreshCw className="h-5 w-5 animate-spin ml-2" />
                    ) : (
                      <Star className="h-5 w-5 ml-2" />
                    )}
                    {submittingRating ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedOrderForRating(null);
                      setRating(0);
                      setFeedback('');
                    }}
                    disabled={submittingRating}
                    className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <BottomNav />
    </BaseLayout>
  );
};

export default OrdersPage;