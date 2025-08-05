
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
  WifiOff
} from 'lucide-react';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Mock data for fallback
const mockData = {
  user: { name: 'أحمد محمد' },
  availableOrders: [
    {
      _id: '672abc123def456789012345',
      user: { name: 'سارة أحمد', phone: '01123456789' },
      store: { 
        name: 'مطعم الأصالة',
        location: { coordinates: [31.2357, 30.0444] }
      },
      totalPrice: 185,
      deliveryFee: 25,
      deliveryAddress: 'شارع التحرير، الدقي، الجيزة، مصر',
      status: 'ready_for_pickup',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      distance: '1.2 كم'
    },
    {
      _id: '672abc123def456789012346',
      user: { name: 'خالد عبدالله', phone: '01098765432' },
      store: { 
        name: 'كافيه القاهرة',
        location: { coordinates: [31.2400, 30.0500] }
      },
      totalPrice: 95,
      deliveryFee: 15,
      deliveryAddress: 'شارع النيل، المعادي، القاهرة، مصر',
      status: 'ready_for_pickup',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      distance: '2.1 كم'
    },
    {
      _id: '672abc123def456789012347',
      user: { name: 'فاطمة حسن', phone: '01156789123' },
      store: { 
        name: 'بيتزا هاوس',
        location: { coordinates: [31.2300, 30.0600] }
      },
      totalPrice: 320,
      deliveryFee: 35,
      deliveryAddress: 'مدينة نصر، القاहرة الجديدة، القاهرة، مصر',
      status: 'ready_for_pickup',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      distance: '3.8 كم'
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
    },
    {
      _id: '672abc123def456789012349',
      user: { name: 'نور محمد', phone: '01187654321' },
      store: { 
        name: 'سوبر ماركت الخير',
        location: { coordinates: [31.2200, 30.0700] }
      },
      totalPrice: 150,
      deliveryFee: 20,
      deliveryAddress: 'مصر الجديدة، القاهرة، مصر',
      status: 'on_the_way',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      distance: '0.9 كم'
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

// API helper functions with mock fallback
const apiCall = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الشبكة');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Return mock data based on endpoint
    return getMockDataForEndpoint(endpoint);
  }
};

const getMockDataForEndpoint = (endpoint) => {
  if (endpoint.includes('/available-orders')) {
    return { orders: mockData.availableOrders };
  } else if (endpoint.includes('/my-orders')) {
    return { orders: mockData.myOrders };
  } else if (endpoint.includes('/stats')) {
    return { 
      stats: mockData.stats,
      overallStats: { 
        totalDeliveries: mockData.stats.totalOrders,
        rating: mockData.stats.rating 
      }
    };
  } else if (endpoint.includes('/profile')) {
    return { 
      user: { 
        ...mockData.user,
        deliveryInfo: { isAvailable: true }
      }
    };
  } else if (endpoint.includes('/toggle-availability')) {
    return { success: true };
  } else if (endpoint.includes('/accept-order')) {
    return { success: true };
  } else if (endpoint.includes('/update-status')) {
    return { success: true };
  } else if (endpoint.includes('/update-location')) {
    return { success: true };
  }
  
  throw new Error('Endpoint not found');
};

const DeliveryDashboard = () => {
  // State management
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    totalEarnings: 0,
    rating: 0,
    todayOrders: 0,
    onlineTime: '0:00'
  });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Location state
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 30.0444,
    longitude: 31.2357,
    accuracy: 10,
    timestamp: Date.now()
  });
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState('granted');

  // User info
  const [user, setUser] = useState({ name: 'مصطفى أحمد' });

  // Initialize dashboard data
  useEffect(() => {
    initializeDashboard();
    requestLocationPermission();
  }, []);

  // Watch location changes (simplified for mock)
  useEffect(() => {
    // Simulate location updates every 30 seconds
    const interval = setInterval(() => {
      if (isAvailable && currentLocation) {
        const newLocation = {
          ...currentLocation,
          timestamp: Date.now(),
          // Simulate slight movement
          latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.001
        };
        setCurrentLocation(newLocation);
        updateLocationOnServer(newLocation);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAvailable, currentLocation]);

  // Location functions
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    // Simulate permission granted for demo
    setLocationPermission('granted');
    setCurrentLocation({
      latitude: 30.0444,
      longitude: 31.2357,
      accuracy: 10,
      timestamp: Date.now()
    });
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    // Simulate getting location
    setTimeout(() => {
      setCurrentLocation({
        latitude: 30.0444 + (Math.random() - 0.5) * 0.01,
        longitude: 31.2357 + (Math.random() - 0.5) * 0.01,
        accuracy: Math.floor(Math.random() * 20) + 5,
        timestamp: Date.now()
      });
      setLocationPermission('granted');
      setLocationLoading(false);
    }, 1000);
  };

  const getLocationErrorMessage = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'تم رفض الإذن لتحديد الموقع';
      case error.POSITION_UNAVAILABLE:
        return 'معلومات الموقع غير متوفرة';
      case error.TIMEOUT:
        return 'انتهت مهلة طلب تحديد الموقع';
      default:
        return 'حدث خطأ في تحديد الموقع';
    }
  };

  const updateLocationOnServer = async (location) => {
    try {
      await apiCall('/delivery/update-location', {
        method: 'PATCH',
        body: JSON.stringify({
          coordinates: [location.longitude, location.latitude],
          accuracy: location.accuracy
        })
      });
    } catch (error) {
      console.error('Error updating location on server:', error);
      setUsingMockData(true);
    }
  };

  const calculateRealDistance = (order) => {
    if (!currentLocation || !order.store?.location?.coordinates) {
      return order.distance || '-- كم';
    }

    const [storeLng, storeLat] = order.store.location.coordinates;
    const distance = calculateDistance2(
      currentLocation.latitude,
      currentLocation.longitude,
      storeLat,
      storeLng
    );
    
    return `${distance.toFixed(1)} كم`;
  };

  const calculateDistance2 = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const initializeDashboard = async () => {
    setLoading(true);
    setUsingMockData(false);
    try {
      await Promise.all([
        fetchAvailableOrders(),
        fetchMyOrders(),
        fetchDeliveryStats(),
        fetchUserProfile()
      ]);
    } catch (error) {
      setError(error.message);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile and availability status
  const fetchUserProfile = async () => {
    try {
      const response = await apiCall('/auth/profile');
      setUser({ name: response.user.name });
      setIsAvailable(response.user.deliveryInfo?.isAvailable || false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(mockData.user);
      setIsAvailable(true);
      setUsingMockData(true);
    }
  };

  // Fetch available orders
  const fetchAvailableOrders = async () => {
    try {
      const response = await apiCall('/delivery/available-orders?limit=20');
      setAvailableOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
      setAvailableOrders(mockData.availableOrders);
      setUsingMockData(true);
    }
  };

  // Fetch delivery person's orders
  const fetchMyOrders = async () => {
    try {
      const response = await apiCall('/delivery/my-orders?limit=20');
      setMyOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching my orders:', error);
      setMyOrders(mockData.myOrders);
      setUsingMockData(true);
    }
  };

  // Fetch delivery statistics
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
        onlineTime: calculateOnlineTime()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(mockData.stats);
      setUsingMockData(true);
    }
  };

  // Calculate online time (placeholder implementation)
  const calculateOnlineTime = () => {
    return '5:30';
  };

  // Toggle availability
  const toggleAvailability = async () => {
    setLoadingAction('toggle-availability');
    try {
      await apiCall('/delivery/toggle-availability', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !isAvailable })
      });
      
      setIsAvailable(!isAvailable);
      
      // Refresh available orders when becoming available
      if (!isAvailable) {
        await fetchAvailableOrders();
      }
    } catch (error) {
      // Mock toggle for demo
      setIsAvailable(!isAvailable);
      setUsingMockData(true);
    } finally {
      setLoadingAction('');
    }
  };

  // Accept order
  const acceptOrder = async (orderId) => {
    setLoadingAction(`accept-${orderId}`);
    try {
      await apiCall(`/delivery/accept-order/${orderId}`, {
        method: 'PATCH'
      });
      
      // Move order from available to my orders
      const acceptedOrder = availableOrders.find(order => order._id === orderId);
      if (acceptedOrder) {
        setMyOrders(prev => [{ ...acceptedOrder, status: 'assigned_to_delivery' }, ...prev]);
        setAvailableOrders(prev => prev.filter(order => order._id !== orderId));
        setActiveTab('myOrders');
      }
      
      // Refresh data
      await fetchMyOrders();
      await fetchAvailableOrders();
    } catch (error) {
      // Mock accept for demo
      const acceptedOrder = availableOrders.find(order => order._id === orderId);
      if (acceptedOrder) {
        setMyOrders(prev => [{ ...acceptedOrder, status: 'assigned_to_delivery' }, ...prev]);
        setAvailableOrders(prev => prev.filter(order => order._id !== orderId));
        setActiveTab('myOrders');
      }
      setUsingMockData(true);
    } finally {
      setLoadingAction('');
    }
  };

  // Update delivery status
  const updateStatus = async (orderId, status) => {
    setLoadingAction(`status-${orderId}`);
    try {
      await apiCall(`/delivery/update-status/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status, 
          notes: statusNotes,
          coordinates: getCurrentLocationForOrder()
        })
      });
      
      // Update local state
      setMyOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: getOrderStatus(status) }
          : order
      ));
      
      setSelectedOrder(null);
      setStatusNotes('');
      
      // Refresh orders and stats
      await fetchMyOrders();
      await fetchDeliveryStats();
    } catch (error) {
      // Mock status update for demo
      setMyOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: getOrderStatus(status) }
          : order
      ));
      
      setSelectedOrder(null);
      setStatusNotes('');
      setUsingMockData(true);
    } finally {
      setLoadingAction('');
    }
  };

  // Get current location (with real coordinates)
  const getCurrentLocationForOrder = () => {
    if (currentLocation) {
      return [currentLocation.longitude, currentLocation.latitude];
    }
    return null;
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAvailableOrders(),
        fetchMyOrders(),
        fetchDeliveryStats()
      ]);
    } catch (error) {
      setError(error.message);
      setUsingMockData(true);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper functions
  const getOrderStatus = (deliveryStatus) => {
    const statusMap = {
      accepted: 'assigned_to_delivery',
      picked_up: 'on_the_way',
      on_the_way: 'on_the_way',
      delivered: 'delivered'
    };
    return statusMap[deliveryStatus] || 'assigned_to_delivery';
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

  const openGoogleMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

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

  const calculateDistance = (order) => {
    return calculateRealDistance(order);
  };

  // Error display component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4 my-4">
      <div className="flex items-center gap-2 text-red-700 mb-2">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">حدث خطأ</span>
      </div>
      <p className="text-red-600 text-sm mb-3">{message}</p>
      <Button 
        onClick={onRetry} 
        size="sm" 
        variant="outline" 
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        <RefreshCw className="h-3 w-3 ml-1" />
        إعادة المحاولة
      </Button>
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white" dir="rtl">
      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError('');
            initializeDashboard();
          }} 
        />
      )}

      {/* Location Permission Request */}
      {locationPermission === 'prompt' && (
        <div className="mx-4 my-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">تحديد الموقع مطلوب</h3>
              <p className="text-blue-700 text-sm mb-3">
                نحتاج إلى إذن الموقع لإظهار المسافات الدقيقة وتحديث موقعك للعملاء
              </p>
              <Button 
                onClick={getCurrentLocation}
                disabled={locationLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <MapPin className="h-4 w-4 ml-2" />
                )}
                السماح بتحديد الموقع
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="mx-4 my-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">خطأ في تحديد الموقع</h3>
              <p className="text-red-700 text-sm mb-3">{locationError}</p>
              <Button 
                onClick={() => {
                  setLocationError('');
                  getCurrentLocation();
                }}
                size="sm"
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header with Status Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">لوحة التوصيل</h1>
                <p className="text-xs text-gray-500">مرحباً {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refreshData}
                disabled={refreshing}
                className="h-8 w-8 p-0 rounded-full"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Location Status Indicator */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                currentLocation ? 'bg-green-50 text-green-700' : 
                locationLoading ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  currentLocation ? 'bg-green-500' : 
                  locationLoading ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span>
                  {currentLocation ? 'موقع نشط' : 
                   locationLoading ? 'تحديد موقع...' : 
                   'موقع معطل'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium">{isAvailable ? 'متاح' : 'غير متاح'}</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={toggleAvailability}
                  disabled={loadingAction === 'toggle-availability'}
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex justify-between items-center text-center">
          <div className="flex-1">
            <div className="text-lg font-bold text-blue-600">{stats.todayOrders}</div>
            <div className="text-xs text-gray-500">طلبات اليوم</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex-1">
            <div className="text-lg font-bold text-green-600">{formatPrice(stats.totalEarnings)}</div>
            <div className="text-xs text-gray-500">أرباح اليوم</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex-1">
            <div className="text-lg font-bold text-purple-600">{stats.rating.toFixed(1)}</div>
            <div className="text-xs text-gray-500">التقييم ⭐</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex-1">
            <div className="text-lg font-bold text-orange-600">{stats.onlineTime}</div>
            <div className="text-xs text-gray-500">وقت الاتصال</div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="sticky top-[73px] z-30 bg-white border-b border-gray-100">
        <div className="flex px-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'available'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            الطلبات المتاحة ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('myOrders')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'myOrders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            طلباتي ({myOrders.length})
          </button>
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
            
            {isAvailable && availableOrders.length === 0 && (
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
                        <div className="text-sm font-semibold">طلب جديد</div>
                        <div className="text-xs opacity-90">{formatTime(order.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPrice(order.totalPrice)} جنيه</div>
                      <div className="text-xs opacity-90">رسوم: {formatPrice(order.deliveryFee)} جنيه</div>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{order.user?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.store?.name}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <Navigation className="h-3 w-3" />
                        <span>{calculateDistance(order)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <DollarSign className="h-3 w-3" />
                        <span>عمولة: {formatPrice(order.deliveryFee)} ج</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1">عنوان التوصيل:</div>
                        <div className="text-sm text-gray-600 leading-relaxed">{order.deliveryAddress}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openGoogleMaps(order.deliveryAddress)}
                        className="shrink-0 h-8 w-8 p-0 rounded-lg"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => acceptOrder(order._id)}
                    disabled={loadingAction === `accept-${order._id}`}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg"
                  >
                    {loadingAction === `accept-${order._id}` ? (
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    ) : (
                      <CheckCircle className="h-5 w-5 ml-2" />
                    )}
                    قبول الطلب والبدء
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'myOrders' && (
          <div className="px-4 py-4 space-y-3">
            {myOrders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات نشطة</h3>
                <p className="text-gray-500 text-sm">اقبل طلب من الطلبات المتاحة للبدء</p>
              </div>
            ) : (
              myOrders.map((order) => (
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
                          <div className="text-xs opacity-90">{formatTime(order.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatPrice(order.totalPrice)} جنيه</div>
                        <Badge className={`${getStatusColor(order.status)} text-xs mt-1 border`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{order.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${order.user?.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                            {order.user?.phone}
                          </a>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-gray-600">{calculateDistance(order)}</span>
                          <Navigation className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-green-600 font-medium">{formatPrice(order.deliveryFee)} ج</span>
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">عنوان التوصيل:</div>
                          <div className="text-sm text-gray-600 leading-relaxed">{order.deliveryAddress}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openGoogleMaps(order.deliveryAddress)}
                          className="shrink-0 h-8 w-8 p-0 rounded-lg"
                        >
                          <Navigation className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {order.status !== 'delivered' && (
                      <div className="space-y-2">
                        {order.status === 'assigned_to_delivery' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              onClick={() => updateStatus(order._id, 'accepted')}
                              disabled={loadingAction === `status-${order._id}`}
                              variant="outline"
                              className="h-11 text-sm"
                            >
                              {loadingAction === `status-${order._id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Clock className="h-4 w-4 ml-2" />
                              )}
                              تأكيد الاستلام
                            </Button>
                            <Button 
                              onClick={() => updateStatus(order._id, 'picked_up')}
                              disabled={loadingAction === `status-${order._id}`}
                              className="h-11 bg-blue-600 hover:bg-blue-700 text-sm"
                            >
                              {loadingAction === `status-${order._id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Package className="h-4 w-4 ml-2" />
                              )}
                              تم الاستلام
                            </Button>
                          </div>
                        )}
                        
                        {order.status === 'on_the_way' && (
                          <Button 
                            onClick={() => setSelectedOrder(order)}
                            disabled={loadingAction === `status-${order._id}`}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl"
                          >
                            {loadingAction === `status-${order._id}` ? (
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
              ))
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

      {/* WebSocket connection and location status */}
      <div className="fixed bottom-4 right-4 z-30 space-y-2">
        <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600 pr-2">متصل</span>
        </div>
        
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