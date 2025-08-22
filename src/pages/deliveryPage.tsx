import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Truck, 
  Package, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone, 
  User, 
  Star,
  TrendingUp,
  RefreshCw,
  Navigation,
  AlertCircle,
  Bell,
  X,
  Menu,
  Home,
  DollarSign,
  Timer,
  Eye,
  Loader2,
  WifiOff,
  LogOut,
  Settings
} from 'lucide-react';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Auth helpers
const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch (error) {
    return '';
  }
};

// Mock data for fallback
const mockData = {
  user: { name: 'أحمد محمد', role: 'delivery' },
  availableOrders: [
    {
      _id: '672abc123def456789012345',
      user: { name: 'سارة أحمد', phone: '01123456789' },
      store: { 
        name: 'مطعم الأصالة',
        location: { coordinates: [31.2357, 30.0444] }
      },
      totalPrice: 185,
      deliveryFee: 30,
      deliveryAddress: 'شارع التحرير، الدقي، الجيزة، مصر',
      status: 'ready_for_pickup',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      distance: '1.2 كم',
      urgency: 'normal',
      minutesWaiting: 10,
      bonusFee: 0
    },
    {
      _id: '672abc123def456789012346',
      user: { name: 'خالد عبدالله', phone: '01098765432' },
      store: { 
        name: 'كافيه القاهرة',
        location: { coordinates: [31.2400, 30.0500] }
      },
      totalPrice: 95,
      deliveryFee: 30,
      bonusFee: 10,
      deliveryAddress: 'شارع النيل، المعادي، القاهرة، مصر',
      status: 'ready_for_pickup',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      distance: '2.1 كم',
      urgency: 'high',
      minutesWaiting: 25
    }
  ],
  myOrders: [
    {
      _id: '672abc123def456789012348',
      user: { name: 'محمود علي', phone: '01234567890' },
      store: { 
        name: 'مطعم الفراعنة',
        location: { coordinates: [31.2450, 30.0350] }
      },
      totalPrice: 275,
      deliveryFee: 30,
      deliveryAddress: 'شارع الهرم، الهرم، الجيزة، مصر',
      status: 'assigned_to_delivery',
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      distance: '1.8 كم'
    }
  ],
  stats: {
    totalOrders: 47,
    deliveredOrders: 3,
    totalEarnings: 285,
    rating: 4.7,
    todayOrders: 8,
    onlineTime: '4:25'
  }
};

// API helper with proper error handling
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('غير مصرح، لا يوجد رمز مميز');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('انتهت صلاحية جلستك، يرجى تسجيل الدخول مرة أخرى');
      } else if (response.status === 403) {
        throw new Error('غير مصرح لك بالوصول لهذا المورد');
      } else if (response.status === 404) {
        throw new Error('المورد المطلوب غير موجود');
      } else if (response.status >= 500) {
        throw new Error('خطأ في الخادم، يرجى المحاولة لاحقاً');
      }
      throw new Error(`خطأ في الشبكة (${response.status})`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      throw new Error('تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت');
    }
    throw error;
  }
};

// Mock data fallback helper
const getMockDataForEndpoint = (endpoint) => {
  console.warn(`Using mock data for: ${endpoint}`);
  
  if (endpoint.includes('/available-orders')) {
    return { 
      orders: mockData.availableOrders,
      totalOrders: mockData.availableOrders.length,
      totalPages: 1,
      currentPage: 1,
      hasMore: false
    };
  } else if (endpoint.includes('/my-orders')) {
    return { 
      orders: mockData.myOrders,
      totalOrders: mockData.myOrders.length,
      totalPages: 1,
      currentPage: 1,
      hasMore: false
    };
  } else if (endpoint.includes('/stats')) {
    return { 
      period: 'today',
      stats: {
        totalOrders: mockData.stats.todayOrders,
        deliveredOrders: mockData.stats.deliveredOrders,
        totalEarnings: mockData.stats.totalEarnings,
        averageDeliveryTime: 32.5
      },
      overallStats: { 
        totalDeliveries: mockData.stats.totalOrders,
        rating: mockData.stats.rating,
        isAvailable: true
      }
    };
  }
  
  return mockData;
};

// Main Dashboard Component
const DeliveryDashboard = () => {
  // Main state
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [user, setUser] = useState({ name: '', role: '' });
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    totalEarnings: 0,
    rating: 0,
    todayOrders: 0,
    onlineTime: '0:00',
    averageDeliveryTime: 0
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Pagination
  const [availableOrdersPage, setAvailableOrdersPage] = useState(1);
  const [myOrdersPage, setMyOrdersPage] = useState(1);
  const [hasMoreAvailable, setHasMoreAvailable] = useState(false);
  const [hasMoreMyOrders, setHasMoreMyOrders] = useState(false);
  
  // Location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Initialize dashboard
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      initializeDashboard();
      requestLocationPermission();
    } else {
      setError('لا يوجد رمز مميز في التخزين المحلي');
      setLoading(false);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    const token = getAuthToken();
    if (!token || !isAvailable) return;

    const interval = setInterval(() => {
      if (activeTab === 'available') {
        fetchAvailableOrders(1, false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAvailable, activeTab]);

  // Helper functions
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  // // دالة لحساب المسافة بالكيلومترات
  // function haversineDistance(coord1, coord2) {
  //   const toRad = (value) => (value * Math.PI) / 180;

  //   const [lng1, lat1] = coord1;
  //   const [lng2, lat2] = coord2;

  //   const R = 6371; // نصف قطر الأرض بالكيلومتر
  //   const dLat = toRad(lat2 - lat1);
  //   const dLng = toRad(lng2 - lng1);

  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(toRad(lat1)) *
  //       Math.cos(toRad(lat2)) *
  //       Math.sin(dLng / 2) *
  //       Math.sin(dLng / 2);

  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c; // المسافة بالكيلومتر
  // }

  const calculateDistance = (order) => {
    if (!currentLocation || !order.deliveryLocation?.coordinates) return "-- كم";

    const [lng, lat] = order.deliveryLocation.coordinates;
    console.log([lng, lat])
    console.log(currentLocation)
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lng - currentLocation.latitude);
    const dLng = toRad(lat - currentLocation.longitude);

    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(currentLocation.latitude)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return `${distance.toFixed(1)} كم`;
  };

  const calculateStoreDistance = (order) => {
    if (!currentLocation || !order.storeLocation?.coordinates) return "-- كم";

    const [lng, lat] = order.storeLocation.coordinates;
    console.log([lng, lat])
    console.log(currentLocation)
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat - currentLocation.latitude);
    const dLng = toRad(lng - currentLocation.longitude);

    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(currentLocation.latitude)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return `${distance.toFixed(1)} كم`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned_to_delivery': 'bg-blue-50 text-blue-700 border-blue-200',
      'on_the_way': 'bg-orange-50 text-orange-700 border-orange-200',
      'delivered': 'bg-green-50 text-green-700 border-green-200',
      'ready_for_pickup': 'bg-purple-50 text-purple-700 border-purple-200',
      'processing': 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'assigned_to_delivery': 'مخصص لك',
      'on_the_way': 'في الطريق',
      'delivered': 'تم التسليم',
      'ready_for_pickup': 'جاهز للاستلام',
      'processing': 'قيد التحضير'
    };
    return statusTexts[status] || status;
  };

  // Create Link from coordinates
  const getGoogleMapsLink = (lat, lng) => {
    console.log(lat, lng)
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Location functions
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        });
        setLocationError('');
      },
      (error) => {
        setLocationError('فشل في تحديد الموقع');
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  console.log(currentLocation)

  // API functions
  const initializeDashboard = async () => {
    setLoading(true);
    setUsingMockData(false);
    setError('');
    
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchAvailableOrders(),
        fetchMyOrders(),
        fetchDeliveryStats()
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError(error.message);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setUsingMockData(true);
    setUser(mockData.user);
    setAvailableOrders(mockData.availableOrders);
    setMyOrders(mockData.myOrders);
    setStats(mockData.stats);
    setIsAvailable(true);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await apiCall('/auth/profile');
      const userData = response.user;
      
      setUser({
        name: userData.name || 'مستخدم',
        role: userData.role || 'delivery',
        id: userData._id
      });
      
      if (userData.deliveryInfo) {
        setIsAvailable(userData.deliveryInfo.isAvailable || false);
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchAvailableOrders = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setLoadingAction('fetching-available');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      const response = await apiCall(`/delivery/available-orders`);
      
      if (page === 1) {
        setAvailableOrders(response.orders || []);
      } else {
        setAvailableOrders(prev => [...prev, ...(response.orders || [])]);
      }
      
      setHasMoreAvailable(response.hasMore || false);
      setAvailableOrdersPage(page);
      
    } catch (error) {
      if (page === 1) {
        setAvailableOrders(getMockDataForEndpoint('/available-orders').orders);
        setUsingMockData(true);
      }
      throw error;
    } finally {
      if (showLoading) setLoadingAction('');
    }
  };

  const fetchMyOrders = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setLoadingAction('fetching-my-orders');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      const response = await apiCall(`/delivery/my-orders`);
      
      if (page === 1) {
        setMyOrders(response.assignments || []);
      } else {
        setMyOrders(prev => [...prev, ...(response.assignments || [])]);
      }
      
      setHasMoreMyOrders(response.totalPages > page);
      setMyOrdersPage(page);
      
    } catch (error) {
      if (page === 1) {
        setMyOrders(getMockDataForEndpoint('/my-orders').orders);
        setUsingMockData(true);
      }
      throw error;
    } finally {
      if (showLoading) setLoadingAction('');
    }
  };

  const handleLogin = async (loginData) => {
    setLoadingAction('logging-in');
    setError('');

    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      setAuthToken(response.token);
      setIsAuthenticated(true);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingAction('');
    }
  };

  const fetchDeliveryStats = async () => {
    try {
      const response = await apiCall('/delivery/stats?period=today');
      const todayStats = response.stats;
      const overallStats = response.overallStats;
      
      setStats({
        totalOrders: overallStats.totalDeliveries || 0,
        deliveredOrders: todayStats.deliveredOrders || 0,
        totalEarnings: todayStats.totalEarnings || 0,
        rating: overallStats.rating || 0,
        todayOrders: todayStats.totalOrders || 0,
        onlineTime: '5:30',
        averageDeliveryTime: todayStats.averageDeliveryTime || 0
      });
      
    } catch (error) {
      setStats(getMockDataForEndpoint('/stats').stats);
      setUsingMockData(true);
    }
  };

  const toggleAvailability = async () => {
    setLoadingAction('toggle-availability');
    
    try {
      await apiCall('/delivery/toggle-availability-enhanced', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !isAvailable })
      });
      
      setIsAvailable(!isAvailable);
      
      if (!isAvailable) {
        await fetchAvailableOrders();
      }
      
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError(error.message);
    } finally {
      setLoadingAction('');
    }
  };

  const acceptOrder = async (orderId) => {
    setLoadingAction(`accept-${orderId}`);
    
    try {
      await apiCall(`/delivery/accept-order/${orderId}`, {
        method: 'PATCH'
      });
      
      setAvailableOrders(prev => prev.filter(order => order._id !== orderId));
      await fetchMyOrders();
      setActiveTab('myOrders');
      
    } catch (error) {
      console.error('Error accepting order:', error);
      setError(error.message);
    } finally {
      setLoadingAction('');
    }
  };

  const updateStatus = async (orderId, status) => {
    setLoadingAction(`status-${orderId}`);
    
    try {
      const updateData = {
        status,
        notes: statusNotes,
        coordinates: [],
      };
      
      if (currentLocation) {
        updateData.coordinates = [currentLocation.longitude, currentLocation.latitude];
      }
      
      await apiCall(`/delivery/update-status/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
      
      setMyOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: getOrderStatus(status) }
          : order
      ));
      
      setSelectedOrder(null);
      setStatusNotes('');
      
      await Promise.all([
        fetchMyOrders(),
        fetchDeliveryStats()
      ]);
      
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
    } finally {
      setLoadingAction('');
    }
  };

  const getOrderStatus = (deliveryStatus) => {
    const statusMap = {
      accepted: 'assigned_to_delivery',
      picked_up: 'on_the_way',
      on_the_way: 'on_the_way',
      delivered: 'delivered'
    };
    return statusMap[deliveryStatus] || 'assigned_to_delivery';
  };

  const refreshData = async () => {
    setRefreshing(true);
    setError('');
    
    try {
      await Promise.all([
        fetchAvailableOrders(),
        fetchMyOrders(),
        fetchDeliveryStats()
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    // Just clear user data, don't remove token
    setUser({ name: '', role: '' });
    setAvailableOrders([]);
    setMyOrders([]);
    setStats({
      totalOrders: 0,
      deliveredOrders: 0,
      totalEarnings: 0,
      rating: 0,
      todayOrders: 0,
      onlineTime: '0:00',
      averageDeliveryTime: 0
    });
    setError('تم تسجيل الخروج');
  };

  // Show loading screen during initialization
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Show error if no token
  if (!getAuthToken()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600 mb-4">لا يوجد رمز مميز في التخزين المحلي</p>
          <p className="text-sm text-gray-500">يرجى التأكد من وجود رمز مميز صحيح في localStorage تحت مفتاح "token"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">مرحباً، {user.name}</h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isAvailable ? 'متاح للتوصيل' : 'غير متاح'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
                disabled={loadingAction === 'toggle-availability'}
                className="scale-90"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-9 w-9 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-t border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError('')}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{stats.todayOrders}</div>
              <div className="text-xs text-gray-600">اليوم</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatPrice(stats.totalEarnings)} ج</div>
              <div className="text-xs text-gray-600">الأرباح</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {stats.rating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">التقييم</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.onlineTime}</div>
              <div className="text-xs text-gray-600">اونلاين</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('available')}
            className={`flex-1 h-12 rounded-none border-b-2 ${
              activeTab === 'available'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600'
            }`}
          >
            <Package className="h-4 w-4 ml-2" />
            الطلبات المتاحة
            {availableOrders.length > 0 && (
              <Badge className="mr-2 bg-blue-600 text-white text-xs">
                {availableOrders.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('myOrders')}
            className={`flex-1 h-12 rounded-none border-b-2 ${
              activeTab === 'myOrders'
                ? 'border-purple-600 text-purple-600 bg-purple-50'
                : 'border-transparent text-gray-600'
            }`}
          >
            <Truck className="h-4 w-4 ml-2" />
            طلباتي
            {myOrders.length > 0 && (
              <Badge className="mr-2 bg-purple-600 text-white text-xs">
                {myOrders.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {/* Available Orders Tab */}
        {activeTab === 'available' && (
          <div className="px-4 py-4 space-y-3">
            {!isAvailable && (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">غير متاح للتوصيل</h3>
                <p className="text-gray-500 text-sm">قم بتفعيل الإتاحة لعرض الطلبات الجديدة</p>
                <Button 
                  onClick={toggleAvailability}
                  disabled={loadingAction === 'toggle-availability'}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {loadingAction === 'toggle-availability' && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  تفعيل الإتاحة
                </Button>
              </div>
            )}
            
            {isAvailable && availableOrders.length === 0 && loadingAction !== 'fetching-available' && (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات متاحة</h3>
                <p className="text-gray-500 text-sm">سنرسل لك إشعار عند وجود طلب جديد</p>
                <Button 
                  onClick={refreshData}
                  disabled={refreshing}
                  variant="outline"
                  className="mt-4"
                >
                  <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
              </div>
            )}

            {loadingAction === 'fetching-available' && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">جاري تحميل الطلبات المتاحة...</p>
              </div>
            )}

            {isAvailable && availableOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">
                          طلب جديد
                          {order.urgency === 'high' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white mr-1">
                              عاجل
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-90">
                          {formatTime(order.createdAt)}
                          {order.minutesWaiting > 20 && (
                            <span className="text-yellow-200 mr-2">
                              • انتظار {order.minutesWaiting} دقيقة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPrice(order.totalPrice)} جنيه</div>
                      <div className="text-xs opacity-90">
                        رسوم: {formatPrice(order.deliveryFee + (order.bonusFee || 0))} جنيه
                        {order.bonusFee > 0 && (
                          <span className="text-yellow-200">
                            {' '}(+{formatPrice(order.bonusFee)} مكافأة)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 space-y-4">
                  <div className="p-4 bg-white rounded-2xl shadow space-y-4">
                    {/* -------- Customer Info -------- */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{order.user?.name}</span>
                        <span className="text-sm text-gray-600">({order.user?.phone})</span>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <Navigation className="h-3 w-3" />
                          <span>{calculateDistance(order)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>
                            عمولة: {formatPrice(order.deliveryFee + (order.bonusFee || 0))} ج
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* -------- Store Info -------- */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <div className="text-sm font-medium text-gray-900 mb-1">بيانات المتجر:</div>
                      <div className="flex items-center gap-2">
                        <a
                          href={getGoogleMapsLink(
                            order.storeLocation.coordinates[1],
                            order.storeLocation.coordinates[0]
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Navigation className="h-3 w-3" /> {order.store?.name}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.store?.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <Navigation className="h-3 w-3" />
                        <span>{calculateStoreDistance(order)}</span>
                      </div>
                    </div>

                    {/* -------- Delivery Info -------- */}
                    <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1">عنوان التوصيل:</div>
                        <div className="text-sm text-gray-600 leading-relaxed">{order.deliveryAddress}</div>
                      </div>
                      <a
                        href={getGoogleMapsLink(
                          order.deliveryLocation.coordinates[1],
                          order.deliveryLocation.coordinates[0]
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                      </a>
                    </div>

                    {/* -------- Order Items -------- */}
                    <div>
                      <h4 className="font-medium mb-2">المنتجات:</h4>
                      <div className="divide-y divide-gray-100">
                        {order.orderItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start py-2"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {item.product?.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <span className="font-medium block">{item.product?.name}</span>
                                <span className="text-sm text-gray-500">الكمية: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {(item.price * item.quantity).toFixed(2)} ج
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.price.toFixed(2)} ج / قطعة
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => acceptOrder(order._id)}
                    disabled={loadingAction === `accept-${order._id}`}
                    className={`w-full h-12 font-semibold rounded-xl shadow-lg ${
                      order.urgency === 'high' 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    } text-white`}
                  >
                    {loadingAction === `accept-${order._id}` ? (
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    ) : (
                      <CheckCircle className="h-5 w-5 ml-2" />
                    )}
                    قبول الطلب والبدء
                    {order.bonusFee > 0 && (
                      <span className="text-yellow-200 text-xs mr-2">
                        (+{formatPrice(order.bonusFee)} ج مكافأة)
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {/* Load More Available Orders */}
            {hasMoreAvailable && (
              <div className="text-center py-4">
                <Button 
                  onClick={() => fetchAvailableOrders(availableOrdersPage + 1)}
                  disabled={loadingAction === 'fetching-available'}
                  variant="outline"
                  className="w-full"
                >
                  {loadingAction === 'fetching-available' ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    'تحميل المزيد'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'myOrders' && (
          <div className="px-4 py-4 space-y-3">
            {myOrders.length === 0 && loadingAction !== 'fetching-my-orders' ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات نشطة</h3>
                <p className="text-gray-500 text-sm">اقبل طلب من الطلبات المتاحة للبدء</p>
              </div>
            ) : null}

            {loadingAction === 'fetching-my-orders' && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">جاري تحميل طلباتي...</p>
              </div>
            )}

            {myOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">طلبي #{order._id.slice(-6)}</div>
                        <div className="text-xs opacity-90">{formatTime(order.order.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPrice(order.order.totalPrice)} جنيه</div>
                      <Badge className={`${getStatusColor(order.order.status)} text-xs mt-1 border`}>
                        {getStatusText(order.order.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 space-y-4">
                  <div className="p-4 bg-white rounded-2xl shadow space-y-4">
                    {/* -------- Customer Info -------- */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{order.order.user?.name}</span>
                        <span className="text-sm text-gray-600">({order.order.user?.phone})</span>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <Navigation className="h-3 w-3" />
                      <span>{calculateDistance(order.order)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>
                            عمولة: {formatPrice(order.order.deliveryFee + (order.order.bonusFee || 0))} ج
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* -------- Store Info -------- */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <div className="text-sm font-medium text-gray-900 mb-1">بيانات المتجر:</div>
                      <div className="flex items-center gap-2">
                        <a
                          href={getGoogleMapsLink(
                            order.order.storeLocation.coordinates[1],
                            order.order.storeLocation.coordinates[0]
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Navigation className="h-3 w-3" /> {order.order.store?.name}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.order.store?.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <Navigation className="h-3 w-3" />
                        <span>{calculateStoreDistance(order.order)}</span>
                      </div>
                    </div>

                    {/* -------- Delivery Info -------- */}
                    <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1">عنوان التوصيل:</div>
                        <div className="text-sm text-gray-600 leading-relaxed">{order.order.deliveryAddress}</div>
                      </div>
                      <a
                        href={getGoogleMapsLink(
                          order.order.deliveryLocation.coordinates[1],
                          order.order.deliveryLocation.coordinates[0]
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                      </a>
                    </div>

                    {/* -------- Order Items -------- */}
                    <div>
                      <h4 className="font-medium mb-2">المنتجات:</h4>
                      <div className="divide-y divide-gray-100">
                        {order.order.orderItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start py-2"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {item.product?.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <span className="font-medium block">{item.product?.name}</span>
                                <span className="text-sm text-gray-500">الكمية: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {(item.price * item.quantity).toFixed(2)} ج
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.price.toFixed(2)} ج / قطعة
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {order.order.status !== 'delivered' && (
                    <div className="space-y-2">
                      {order.order.status === 'assigned_to_delivery' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={() => updateStatus(order.order._id, 'picked_up')}
                            disabled={loadingAction === `status-${order.order._id}`}
                            variant="outline"
                            className="h-11 text-sm"
                          >
                            {loadingAction === `status-${order.order._id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <Clock className="h-4 w-4 ml-2" />
                            )}
                            تم الاستلام من المتجر
                          </Button>                          
                        </div>
                      )}

                      {order.order.status === 'picked_up' && (
                          <Button 
                            onClick={() => updateStatus(order.order._id, 'on_the_way')}
                            disabled={loadingAction === `status-${order.order._id}`}
                            className=" w-full h-11 bg-blue-600 hover:bg-blue-700 text-sm"
                          >
                            {loadingAction === `status-${order.order._id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <Package className="h-4 w-4 ml-2" />
                            )}
                                فى الطريق للعميل
                          </Button>                        
                      )}
                      
                      {order.order.status === 'on_the_way' && (
                        <Button 
                          onClick={() => setSelectedOrder(order.order)}
                          disabled={loadingAction === `status-${order.order._id}`}
                          className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl"
                        >
                          {loadingAction === `status-${order.order._id}` ? (
                            <Loader2 className="h-5 w-5 animate-spin ml-2" />
                          ) : (
                            <CheckCircle className="h-5 w-5 ml-2" />
                          )}
                          تم التسليم للعميل
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More My Orders */}
            {hasMoreMyOrders && (
              <div className="text-center py-4">
                <Button 
                  onClick={() => fetchMyOrders(myOrdersPage + 1)}
                  disabled={loadingAction === 'fetching-my-orders'}
                  variant="outline"
                  className="w-full"
                >
                  {loadingAction === 'fetching-my-orders' ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    'تحميل المزيد'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delivery Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="w-full sm:max-w-md sm:mx-4">
            <Card className="rounded-t-3xl sm:rounded-2xl border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">تأكيد التسليم</CardTitle>
                      <p className="text-sm text-gray-500">طلب #{selectedOrder._id.slice(-6)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(null);
                      setStatusNotes('');
                    }}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 pb-6">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">العميل:</span>
                    <span className="font-medium">{selectedOrder.user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">المبلغ الإجمالي:</span>
                    <span className="font-bold text-green-600">{formatPrice(selectedOrder.totalPrice)} جنيه</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">عمولتك:</span>
                    <span className="font-bold text-blue-600">{formatPrice(selectedOrder.deliveryFee)} جنيه</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900">ملاحظات التسليم</label>
                  <Textarea
                    placeholder="أضف ملاحظات حول عملية التسليم (اختياري)..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                    className="text-sm resize-none rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button 
                    onClick={() => updateStatus(selectedOrder._id, 'delivered')}
                    disabled={loadingAction === `status-${selectedOrder._id}`}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg"
                  >
                    {loadingAction === `status-${selectedOrder._id}` ? (
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    ) : (
                      <CheckCircle className="h-5 w-5 ml-2" />
                    )}
                    تأكيد التسليم النهائي
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedOrder(null);
                      setStatusNotes('');
                    }}
                    disabled={loadingAction === `status-${selectedOrder._id}`}
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

      {/* Connection Status Footer */}
      <div className="fixed bottom-4 right-4 z-30 space-y-2">
        {/* API Connection Status */}
        <div className={`bg-white rounded-full shadow-lg p-2 flex items-center gap-2 ${
          usingMockData ? 'ring-2 ring-orange-200' : ''
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            usingMockData ? 'bg-orange-500' : 'bg-green-500'
          }`}></div>
          <span className="text-xs text-gray-600 pr-2">
            {usingMockData ? 'وضع تجريبي' : 'متصل'}
          </span>
        </div>
        
        {/* Location Status */}
        {currentLocation && (
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600 pr-1">
              GPS {currentLocation.accuracy < 50 ? 'دقيق' : 'تقريبي'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;