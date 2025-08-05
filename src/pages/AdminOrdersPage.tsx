import { useState, useEffect } from 'react';
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
  Eye,
  RefreshCw,
  AlertCircle,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone?: string;
    location?: string | object;
  } | null;
  store: {
    _id: string;
    name: string;
    location?: string | object;
  } | null;
  orderItems: OrderItem[];
  deliveryAddress: string;
  deliveryFee: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'rejected';
  createdAt: string;
  updatedAt: string;
  groupOrderId?: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = async () => {
    if (!soundEnabled) return;
    
    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'عرض الطلب'
          },
          {
            action: 'dismiss',
            title: 'تجاهل'
          }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  };

  // Make screen flash for visual notification
  const flashScreen = () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(59, 130, 246, 0.3);
      z-index: 9999;
      pointer-events: none;
      animation: flash 0.5s ease-in-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    }, 500);
  };

  // Vibrate device (mobile)
  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // Comprehensive notification function
  const triggerNewOrderNotification = (order: Order) => {
    const title = '🔔 طلب جديد!';
    const body = `طلب جديد من ${order.user?.name || 'مستخدم'} - ${order.totalPrice.toFixed(2)} جنيه`;

    // 1. Browser notification
    showBrowserNotification(title, body);
    
    // 2. Sound notification
    playNotificationSound();
    
    // 3. Visual flash
    flashScreen();
    
    // 4. Device vibration (mobile)
    vibrateDevice();
    
    // 5. Toast notification
    toast({
      title: title,
      description: body,
      duration: 8000,
    });

    // 6. Browser alert (as backup)
    if (document.hidden) {
      alert(`طلب جديد! ${body}`);
    }

    // 7. Change page title for attention
    const originalTitle = document.title;
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      document.title = blinkCount % 2 === 0 ? '🔔 طلب جديد!' : originalTitle;
      blinkCount++;
      if (blinkCount >= 10) {
        clearInterval(blinkInterval);
        document.title = originalTitle;
      }
    }, 1000);
  };

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const socketInstance = io('http://localhost:5000', {
        auth: {
          token: token
        }
      });

      setSocket(socketInstance);

      // Listen for real-time order events
      socketInstance.on('orderCreated', (newOrder: Order) => {
        console.log('New order received:', newOrder);
        setOrders(prev => [newOrder, ...prev]);
        
        // Trigger comprehensive notification
        triggerNewOrderNotification(newOrder);
      });

      socketInstance.on('orderStatusUpdated', (updatedOrder: Order) => {
        console.log('Order status updated:', updatedOrder);
        setOrders(prev => prev.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
        
        toast({
          title: '✅ تم تحديث الطلب',
          description: `تم تحديث حالة الطلب #${updatedOrder._id} إلى ${getStatusText(updatedOrder.status)}`,
          duration: 3000,
        });
      });

      socketInstance.on('orderUpdated', (updatedOrder: Order) => {
        console.log('Order updated:', updatedOrder);
        setOrders(prev => prev.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
      });

      socketInstance.on('orderCancelled', (cancelledOrder: Order) => {
        console.log('Order cancelled:', cancelledOrder);
        setOrders(prev => prev.map(order => 
          order._id === cancelledOrder._id ? { ...order, status: 'cancelled' } : order
        ));
        
        toast({
          title: '❌ تم إلغاء الطلب',
          description: `تم إلغاء الطلب #${cancelledOrder._id.slice(-8)}`,
          duration: 3000,
        });
      });

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server');
        toast({
          title: '🔌 متصل',
          description: 'تم الاتصال بالخادم - ستتلقى التحديثات فوراً',
          duration: 2000,
        });
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        toast({
          title: '⚠️ انقطع الاتصال',
          description: 'انقطع الاتصال بالخادم - جاري المحاولة للاتصال مرة أخرى',
          variant: 'destructive',
          duration: 3000,
        });
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [toast, soundEnabled, notificationPermission]);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch('http://localhost:5000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();      
      setOrders(data.data);
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

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdatingStatus(orderId);
      const token = getAuthToken();
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast({
        title: '✅ تم التحديث',
        description: 'تم تحديث حالة الطلب بنجاح',
      });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الطلب',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const userName = order.user?.name || '';
    const storeName = order.store?.name || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order._id.includes(searchTerm) ||
                         storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <ShoppingCart className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': 
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'processing': return 'قيد المعالجة';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      case 'rejected': return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': 
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <BaseLayout dir="rtl" className="bg-surface">
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
                <Badge variant="secondary">{filteredOrders.length} طلب</Badge>
                {socket?.connected && (
                  <Badge className="bg-green-100 text-green-800">
                    <Bell className="h-3 w-3 mr-1" />
                    متصل
                  </Badge>
                )}
                {notificationPermission === 'granted' && (
                  <Badge className="bg-blue-100 text-blue-800">
                    التنبيهات مفعلة
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={soundEnabled ? 'bg-green-50' : 'bg-gray-50'}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  <span className="mr-2">{soundEnabled ? 'الصوت مفعل' : 'الصوت مغلق'}</span>
                </Button>
                
                {notificationPermission !== 'granted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => Notification.requestPermission().then(setNotificationPermission)}
                    className="text-orange-600 border-orange-200"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    تفعيل التنبيهات
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={fetchOrders}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو رقم الطلب أو المتجر..."
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
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="space-y-4 p-4">
                {filteredOrders.map((order) => (
                  <Card key={order._id} className="shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">طلب رقم #{order._id.slice(-8)}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(order.createdAt)} • متجر: {order.store?.name || 'متجر محذوف'}
                          </p>
                        </div>
                        <Badge className={getStatusVariant(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="mr-1">{getStatusText(order.status)}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-gray-900">معلومات العميل</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">الاسم:</span>
                              <span>{order.user?.name || 'مستخدم محذوف'}</span>
                            </div>
                            {order.user?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{order.user.phone}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                              <span>{order.deliveryAddress}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-gray-900">المنتجات</h4>
                          <div className="space-y-2">
                            {order.orderItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-medium">{item.product?.name || 'منتج محذوف'}</span>
                                  <span className="text-gray-500 mr-2">x{item.quantity}</span>
                                </div>
                                <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} جنيه</span>
                              </div>
                            ))}
                            
                            <div className="pt-2 space-y-1 border-t">
                              <div className="flex justify-between text-sm">
                                <span>رسوم التوصيل</span>
                                <span>{order.deliveryFee.toFixed(2)} جنيه</span>
                              </div>
                              <div className="flex justify-between items-center font-bold text-lg">
                                <span>المجموع الكلي</span>
                                <span className="text-blue-600">{order.totalPrice.toFixed(2)} جنيه</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6 pt-4 border-t">
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
                              onClick={() => updateOrderStatus(order._id, 'processing')}
                              disabled={updatingStatus === order._id}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {updatingStatus === order._id ? (
                                <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                              ) : null}
                              قبول الطلب
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'rejected')}
                              disabled={updatingStatus === order._id}
                            >
                              رفض الطلب
                            </Button>
                          </>
                        )}
                        
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            disabled={updatingStatus === order._id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {updatingStatus === order._id ? (
                              <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                            ) : null}
                            تم التسليم
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 && !loading && (
              <Card className="text-center py-12 mt-6">
                <CardContent>
                  {orders.length === 0 ? (
                    <>
                      <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
                      <p className="text-gray-500">لم يتم استلام أي طلبات بعد</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
                      <p className="text-gray-500">لم يتم العثور على طلبات تطابق معايير البحث</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>        
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تفاصيل الطلب #{selectedOrder._id.slice(-8)}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">معلومات الطلب</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">تاريخ الإنشاء:</span>
                      <p>{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">آخر تحديث:</span>
                      <p>{formatDate(selectedOrder.updatedAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">المتجر:</span>
                      <p>{selectedOrder.store?.name || 'متجر محذوف'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">الحالة:</span>
                      <p>{getStatusText(selectedOrder.status)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">المنتجات المطلوبة</h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.product?.name || 'منتج محذوف'}</p>
                          <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                          <p className="text-sm text-gray-500">السعر الوحدة: {item.price.toFixed(2)} جنيه</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} جنيه</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">المجموع النهائي (شامل التوصيل):</span>
                    <span className="font-bold text-lg text-blue-600">
                      {selectedOrder.totalPrice.toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </BaseLayout>
  );
};

export default AdminOrdersPage;