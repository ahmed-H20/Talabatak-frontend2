import { BottomNav } from '@/components/store/BottomNav';
import { Package, Clock, CheckCircle, XCircle, Bell, RefreshCw, MapPin, User, Store, Edit, X, ThumbsUp, Truck, UserCheck, ShoppingBag, Star, Phone } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

interface ProductInfo {
  _id: string;
  name: string;
  images: string[];
}

interface OrderItem {
  product: ProductInfo;
  quantity: number;
  price: number;
}

interface StoreInfo {
  _id: string;
  name: string;
  phone: string;
  location?: {
    address: string;
  };
}

interface DeliveryPersonInfo {
  _id: string;
  name: string;
  phone: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
  };
  store: StoreInfo;
  orderItems: OrderItem[];
  deliveryAddress: string;
  deliveryFee: number;
  totalPrice: number;
  discountAmount?: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'rejected' | 'assigned_to_delivery' | 'on_the_way';
  deliveryLocation: GeoPoint;
  storeLocation: GeoPoint;
  createdAt: string;
  updatedAt: string;
  assignedDeliveryPerson?: DeliveryPersonInfo;
  assignedAt?: string;
  failureReason?: string;
  groupOrderId?: string;
  cancelledAt?: string;
  estimatedDeliveryTime?: string;
  priority?: number;
  // Rating fields
  customerRating?: number;
  customerFeedback?: string;
}

interface ApiResponse {
  orders?: Order[];
  data?: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  success?: boolean;
}

// Toast hook replacement
const useToast = () => ({
  toast: ({ title, description, variant, duration }: any) => {
    const toastEl = document.createElement('div');
    toastEl.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
      variant === 'destructive' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
    }`;
    toastEl.innerHTML = `
      <div class="font-semibold">${title}</div>
      ${description ? `<div class="text-sm mt-1">${description}</div>` : ''}
    `;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toastEl), 300);
    }, duration || 3000);
  }
});

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  
  // Memoize the toast function to prevent recreation on every render
  const { toast } = useMemo(() => useToast(), []);

  // Get token from localStorage - memoized to prevent recreation
  const getToken = useCallback(() => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }, []);

  // Create Google Maps Link from coordinates - memoized
  const getGoogleMapsLink = useCallback((lat: number, lng: number) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }, []);

  // Fetch orders function with proper error handling - memoized to prevent infinite loops
  const fetchOrders = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على رمز المصادقة، يرجى تسجيل الدخول مرة أخرى',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📡 Fetching orders...');
      
      const res = await fetch('http://localhost:5000/api/orders/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('انتهت صلاحية جلسة المصادقة، يرجى تسجيل الدخول مرة أخرى');
        }
        throw new Error(`HTTP ${res.status}: فشل في تحميل الطلبات`);
      }
      
      const data: ApiResponse = await res.json();
      console.log('📦 Orders received:', data);
      
      // Handle different API response structures
      let ordersList: Order[] = [];
      if (data.orders) {
        ordersList = data.orders;
      } else if (data.data) {
        ordersList = data.data;
      } else if (Array.isArray(data)) {
        ordersList = data;
      }
      
      setOrders(ordersList);
      
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحميل الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]); // Only depend on stable functions

  // Rate delivery function - memoized
  const rateDelivery = useCallback(async (orderId: string, rating: number, feedback: string) => {
    const token = getToken();
    
    if (!token) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على رمز المصادقة',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingRating(true);
      
      const res = await fetch(`http://localhost:5000/api/delivery/rate/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

      setSelectedOrderForRating(null);
      setRating(0);
      setFeedback('');
      
    } catch (error: any) {
      console.error('❌ Error rating delivery:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تقييم المندوب',
        variant: 'destructive',
      });
    } finally {
      setSubmittingRating(false);
    }
  }, [getToken, toast]);

  // Cancel order function - memoized
  const cancelOrder = useCallback(async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      return;
    }

    const token = getToken();
    
    if (!token) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على رمز المصادقة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reason = window.prompt('سبب الإلغاء (اختياري):') || '';
      
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'فشل في إلغاء الطلب');
      }

      setOrders(prev => prev.map(order => 
        order._id === orderId ? { 
          ...order, 
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          failureReason: reason || 'تم الإلغاء بواسطة العميل'
        } : order
      ));

      toast({
        title: '✅ تم إلغاء الطلب',
        description: `تم إلغاء طلب #${orderId.slice(-8)} بنجاح`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('❌ Error cancelling order:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إلغاء الطلب',
        variant: 'destructive',
      });
    }
  }, [getToken, toast]);

  // Update order function - memoized
  const updateOrder = useCallback(async (orderId: string, order: Order) => {
    const newAddress = window.prompt('أدخل عنوان التسليم الجديد:', order.deliveryAddress);
    if (!newAddress) return;

    const token = getToken();
    
    if (!token) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على رمز المصادقة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

      setOrders(prev => prev.map(order => 
        order._id === orderId ? { 
          ...order, 
          deliveryAddress: newAddress,
          updatedAt: new Date().toISOString()
        } : order
      ));

      toast({
        title: '✅ تم تحديث الطلب',
        description: `تم تحديث طلب #${orderId.slice(-8)} بنجاح`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('❌ Error updating order:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الطلب',
        variant: 'destructive',
      });
    }
  }, [getToken, toast]);

  // Helper functions - memoized
  const canModifyOrder = useCallback((status: string) => {
    return status === 'pending';
  }, []);

  const canRateOrder = useCallback((order: Order) => {
    return order.status === 'delivered' && !order.customerRating && order.assignedDeliveryPerson;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Package className="h-4 w-4" />;
      case 'assigned_to_delivery': return <UserCheck className="h-4 w-4" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4" />;
      case 'on_the_way': return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'delivered': return 'تم التسليم';
      case 'processing': return 'قيد المعالجة';
      case 'cancelled': return 'ملغي';
      case 'delivery_failed': return 'ملغى (لايوجد مندوب)';
      case 'rejected': return 'مرفوض';
      case 'pending': return 'بانتظار المراجعة';
      case 'assigned_to_delivery': return 'تم تخصيص مندوب';
      case 'on_the_way': return 'في الطريق إليك';
      case 'picked_up': return 'تم الاستلام من المتجر';
      default: return 'جديد';
    }
  }, []);

  const getStatusVariant = useCallback((status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'assigned_to_delivery': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'on_the_way': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'delivery_failed': return 'bg-red-100 text-red-800 border border-red-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'picked_up': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }, []);

  // Initialize Socket.IO connection with proper error handling
  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    let socketInstance: any = null;
    
    const initializeSocket = async () => {
      try {
        // Import socket.io-client dynamically to avoid SSR issues
        const { io } = await import('socket.io-client');
        socketInstance = io('http://localhost:5000', {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
        });

        setSocket(socketInstance);

        // Connection event handlers
        socketInstance.on('connect', () => {
          console.log('✅ Connected to Socket.IO server');
          setSocketConnected(true);
          toast({
            title: '🔌 متصل',
            description: 'ستتلقى تحديثات طلباتك فوراً',
            duration: 2000,
          });
        });

        socketInstance.on('disconnect', (reason: string) => {
          console.log('❌ Disconnected from Socket.IO server:', reason);
          setSocketConnected(false);
          toast({
            title: '⚠️ انقطع الاتصال',
            description: 'انقطع الاتصال بالخادم',
            variant: 'destructive',
            duration: 500,
          });
        });

        socketInstance.on('reconnect', () => {
          console.log('🔄 Reconnected to Socket.IO server');
          setSocketConnected(true);
          toast({
            title: '🔄 أعيد الاتصال',
            description: 'تم إعادة الاتصال بالخادم بنجاح',
            duration: 2000,
          });
        });

        socketInstance.on('connect_error', (error: any) => {
          console.error('❌ Socket connection error:', error);
          setSocketConnected(false);
          
          // Handle specific authentication errors
          if (error.message?.includes('Session ID unknown') || error.message?.includes('Authentication error')) {
            toast({
              title: '🔐 خطأ في المصادقة',
              description: 'فشل في التحقق من الهوية، يرجى تسجيل الدخول مرة أخرى',
              variant: 'destructive',
              duration: 5000,
            });
          }
        });

        // Order event handlers
        socketInstance.on('orderStatusUpdated', (updatedOrder: Order) => {
          console.log('📱 Order status updated:', updatedOrder);
          
          setOrders(prev => prev.map(order => 
            order._id === updatedOrder._id ? { 
              ...order, 
              ...updatedOrder
            } : order
          ));
          
          const statusMessages: Record<string, string> = {
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

        socketInstance.on('orderUpdated', (updatedOrder: Order) => {
          console.log('📝 Order updated:', updatedOrder);
          setOrders(prev => prev.map(order => 
            order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
          ));
          
          toast({
            title: '📝 تم تحديث الطلب',
            description: `تم تحديث تفاصيل طلب #${updatedOrder._id.slice(-8)}`,
            duration: 3000,
          });
        });

        socketInstance.on('orderCancelled', (cancelledOrder: Order) => {
          console.log('❌ Order cancelled:', cancelledOrder);
          setOrders(prev => prev.map(order => 
            order._id === cancelledOrder._id ? { 
              ...order, 
              status: 'cancelled', 
              cancelledAt: cancelledOrder.cancelledAt,
              failureReason: cancelledOrder.failureReason 
            } : order
          ));
          
          toast({
            title: '❌ تم إلغاء الطلب',
            description: `طلب #${cancelledOrder._id.slice(-8)} تم إلغاؤه`,
            duration: 3000,
          });
        });

        socketInstance.on('orderCreated', (newOrder: Order) => {
          console.log('🆕 New order created:', newOrder);
          setOrders(prev => [newOrder, ...prev]);
          
          toast({
            title: '🆕 طلب جديد',
            description: `تم إنشاء طلب #${newOrder._id.slice(-8)} بنجاح`,
            duration: 3000,
          });
        });
      
      } catch (error) {
        console.error('Failed to load socket.io-client:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل مكتبة الاتصال',
          variant: 'destructive',
          duration: 3000,
        });
      }
    };

    initializeSocket();

    return () => {
      if (socketInstance) {
        console.log('🔌 Disconnecting socket...');
        socketInstance.disconnect();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Star Rating Component - memoized
  const StarRating = useMemo(() => ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => (
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
  ), []);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh orders manually - memoized
  const handleRefresh = useCallback(() => {
    fetchOrders();
    toast({
      title: '🔄 تحديث',
      description: 'جاري تحديث قائمة الطلبات...',
      duration: 1000,
    });
  }, [fetchOrders, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">طلباتي</h1>
            {socketConnected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Bell className="h-3 w-3 ml-1" />
                متصل
              </span>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500">لم تقم بتقديم أي طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        طلب رقم #{order._id.slice(-8)}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                        <p>الوقت: {new Date(order.createdAt).toLocaleTimeString('ar-SA')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusVariant(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="mr-1">{getStatusText(order.status)}</span>
                      </span>
                      
                      {/* Action buttons */}
                      {canRateOrder(order) && (
                        <button
                          onClick={() => setSelectedOrderForRating(order)}
                          className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors"
                          title="تقييم مندوب التوصيل"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canModifyOrder(order.status) && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateOrder(order._id, order)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="تعديل الطلب"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="إلغاء الطلب"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Failure reason */}
                  {order.failureReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">سبب الإلغاء: </span>
                        {order.failureReason} الان
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Content */}
                <div className="px-6 py-4 space-y-4">
                  {/* Store and User Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span>المتجر: {order.store?.name || 'غير محدد'}</span>
                        {order.store?.phone && <span>({order.store.phone})</span>}
                      </div>
                      {order.storeLocation && (
                        <a
                          href={getGoogleMapsLink(
                            order.storeLocation.coordinates[1], 
                            order.storeLocation.coordinates[0]
                          ) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-sm"
                        >
                          <MapPin className="h-3 w-3" />
                          موقع المتجر
                        </a>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>العميل: {order.user?.name || 'غير محدد'}</span>
                      </div>
                      {order.deliveryLocation && (
                        <a
                          href={getGoogleMapsLink(
                            order.deliveryLocation.coordinates[1], 
                            order.deliveryLocation.coordinates[0]
                          ) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-sm"
                        >
                          <MapPin className="h-3 w-3" />
                          موقعك
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="text-sm">
                    <span className="font-medium">عنوان التسليم: </span>
                    {order.deliveryAddress}
                  </div>

                  {/* Delivery Person Info */}
                  {order.assignedDeliveryPerson && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">معلومات مندوب التوصيل:</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-blue-600" />
                          <span>الاسم: {order.assignedDeliveryPerson.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-blue-600" />
                          <span>الهاتف: {order.assignedDeliveryPerson.phone}</span>
                        </div>
                        {order.assignedAt && (
                          <div className="flex items-center gap-2 col-span-full">
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span>تم التخصيص: {new Date(order.assignedAt).toLocaleString('ar-SA')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Rating Display */}
                  {order.customerRating && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-yellow-600 fill-current" />
                        <span className="font-medium text-yellow-900">تقييمك لمندوب التوصيل:</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= order.customerRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-sm">{order.customerRating}/5</span>
                        </div>
                        {order.customerFeedback && (
                          <div className="text-sm text-yellow-800">
                            <span className="font-medium">تعليقك: </span>
                            <span>{order.customerFeedback}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900">المنتجات:</h4>
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.product?.images && item.product.images[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{item.product?.name || 'منتج غير متوفر'}</div>
                              <div className="text-sm text-gray-500">الكمية: {item.quantity}</div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">
                              {(item.price * item.quantity).toFixed(2)} جنيه
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.price.toFixed(2)} جنيه / قطعة
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>رسوم التوصيل:</span>
                        <span>{order.deliveryFee.toFixed(2)} جنيه</span>
                      </div>
                      {order.discountAmount && order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>خصم:</span>
                          <span>-{order.discountAmount.toFixed(2)} جنيه</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-2">
                        <span>المجموع الكلي:</span>
                        <span className="text-blue-600">{order.totalPrice.toFixed(2)} جنيه</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Metadata */}
                  <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>تم الإنشاء: {new Date(order.createdAt).toLocaleString('ar-SA')}</span>
                      <span>آخر تحديث: {new Date(order.updatedAt).toLocaleString('ar-SA')}</span>
                    </div>
                    {order.cancelledAt && (
                      <div className="mt-1">
                        <span>تم الإلغاء: {new Date(order.cancelledAt).toLocaleString('ar-SA')}</span>
                      </div>
                    )}
                    {order.estimatedDeliveryTime && (
                      <div className="mt-1">
                        <span>الوقت المتوقع للتسليم: {new Date(order.estimatedDeliveryTime).toLocaleString('ar-SA')}</span>
                      </div>
                    )}
                    {order.groupOrderId && (
                      <div className="mt-1">
                        <span>معرف المجموعة: {order.groupOrderId}</span>
                      </div>
                    )}
                    {order.priority !== undefined && (
                      <div className="mt-1">
                        <span>الأولوية: {order.priority}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {selectedOrderForRating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="w-full sm:max-w-md sm:mx-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">تقييم مندوب التوصيل</h3>
                    <p className="text-sm text-gray-500">طلب #{selectedOrderForRating._id.slice(-6)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrderForRating(null);
                    setRating(0);
                    setFeedback('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
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
                  <label className="text-sm font-medium text-gray-900 block">كيف تقيم خدمة التوصيل؟</label>
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
                  <label className="text-sm font-medium text-gray-900 block">تعليقك (اختياري)</label>
                  <textarea
                    placeholder="شاركنا تجربتك مع مندوب التوصيل..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => rateDelivery(selectedOrderForRating._id, rating, feedback)}
                    disabled={rating === 0 || submittingRating}
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {submittingRating ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Star className="h-5 w-5" />
                    )}
                    {submittingRating ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedOrderForRating(null);
                      setRating(0);
                      setFeedback('');
                    }}
                    disabled={submittingRating}
                    className="w-full h-11 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default OrdersPage;