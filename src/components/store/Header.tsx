import { Search, ShoppingCart, Menu, MapPin, User, LogOut, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '@/contexts/LocationContext';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

interface DetailedAddress {
  street?: string;
  houseNumber?: string;
  neighbourhood?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

// cities
const CITIES = [
  // { name: 'الرياض', lat: 24.7136, lon: 46.6753 },
  // { name: 'جدة', lat: 21.4858, lon: 39.1925 },
  // { name: 'الدمام', lat: 26.4207, lon: 50.0888 },
  { name: "القاهرة", lat: 30.0444, lon: 31.2357 },
  { name: "الاسكندرية", lat: 31.2156, lon: 29.9553 },
  { name: "المنصورة", lat: 31.0375, lon: 31.3784 },
  { name: "طنطا", lat: 30.7942, lon: 31.0000 },
  { name: "الزقازيق", lat: 30.5833, lon: 31.5167 },
  { name: "الفيوم", lat: 29.3099, lon: 30.8398 },
  { name: "بني سويف", lat: 29.0667, lon: 31.0833 },
  { name: "أسيوط", lat: 27.1800, lon: 31.1800 },
  { name: "سوهاج", lat: 26.5575, lon: 31.6944 },
  { name: "قنا", lat: 26.1500, lon: 32.7167 },
  { name: "الأقصر", lat: 25.6889, lon: 32.6396 },
  { name: "أسوان", lat: 24.0889, lon: 32.8998 },
  { name: "الغردقة", lat: 27.2579, lon: 33.8116 },
  { name: "شرم الشيخ", lat: 27.9158, lon: 34.3294 },
  { name: "العريش", lat: 31.1100, lon: 33.8000 },
  { name: "رفح", lat: 31.2833, lon: 34.2667 },
  { name: "بورسعيد", lat: 31.2569, lon: 32.3038 },
  { name: "دمياط", lat: 31.4167, lon: 31.8167 },
  { name: "السويس", lat: 29.9667, lon: 32.5333 },
  { name: "المنيا", lat: 28.1000, lon: 30.7500 },
  { name: "دمنهور", lat: 31.0333, lon: 30.4667 },
  { name: "كفر الشيخ", lat: 31.1167, lon: 30.9333 },
];

export const Header = ({ 
  cartItemCount = 0, 
  onCartClick, 
  }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { location, setLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const [locationDisplay, setLocationDisplay] = useState<string>("اختر موقعك");
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddress | null>(null);

  // Define helper functions before using them
  const formatAddressForDisplay = (address: DetailedAddress): string => {
    const parts = [];
    
    // Add house number and street
    if (address.houseNumber && address.street) {
      parts.push(`${address.houseNumber} ${address.street}`);
    } else if (address.street) {
      parts.push(address.street);
    }
    
    // Add neighbourhood or district
    if (address.neighbourhood) {
      parts.push(address.neighbourhood);
    } else if (address.district) {
      parts.push(address.district);
    }
    
    // Add city
    if (address.city) {
      parts.push(address.city);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'موقعي الحالي';
  };

  const formatFullAddress = (address: DetailedAddress): string => {
    const parts = [];
    
    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.street) parts.push(address.street);
    if (address.neighbourhood) parts.push(address.neighbourhood);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postcode) parts.push(address.postcode);
    
    return parts.join(', ');
  };

  useMemo(() => {    
    if (!location) {
      setLocationDisplay('لم يتم تحديد الموقع');
    } else {
      // Check if lat/lon matches one of the known cities
      const found = CITIES.find(
        (c) => c.lat === location.lat && c.lon === location.lon
      );
      if (found) {
        setLocationDisplay(found.name);
      } else {
        // Use stored detailed address if available
        const storedAddress = localStorage.getItem('userDetailedAddress');
        if (storedAddress) {
          const address = JSON.parse(storedAddress);
          setDetailedAddress(address);
          setLocationDisplay(formatAddressForDisplay(address));
        } else {
          setLocationDisplay('موقعي الحالي');
        }
      }
    }
  }, [location]);

  const fetchDetailedAddress = async (lat: number, lon: number): Promise<DetailedAddress> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=ar,en`
      );
      const data = await res.json();
      
      const address: DetailedAddress = {
        houseNumber: data.address?.house_number,
        street: data.address?.road || data.address?.street,
        neighbourhood: data.address?.neighbourhood || data.address?.suburb,
        district: data.address?.city_district || data.address?.district,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state || data.address?.governorate,
        country: data.address?.country,
        postcode: data.address?.postcode
      };
      
      return address;
    } catch (error) {
      console.error("فشل جلب تفاصيل العنوان:", error);
      return {
        city: "مدينة غير معروفة"
      };
    }
  };

  const handleSelectCity = (lat: number, lon: number, name: string) => {
    setLocation({ lat, lon });
    setLocationDisplay(name);
    setDetailedAddress(null);
    // Clear detailed address from storage when selecting predefined city
    localStorage.removeItem('userDetailedAddress');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      console.error("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    setLoading(true);
    setLocationDisplay('جارٍ تحديد الموقع...');
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocation(coords);
        localStorage.setItem("userLocation", JSON.stringify(coords));

        // Fetch detailed address information
        const address = await fetchDetailedAddress(coords.lat, coords.lon);
        setDetailedAddress(address);
        localStorage.setItem("userDetailedAddress", JSON.stringify(address));
        
        const displayText = formatAddressForDisplay(address);
        setLocationDisplay(displayText);

        setLoading(false);
      },
      (err) => {
        console.error("فشل تحديد الموقع:", err);
        setLocationDisplay("تعذر تحديد الموقع");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    const storedDetailedAddress = localStorage.getItem("userDetailedAddress");

    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
    }

    if (storedDetailedAddress) {
      const address = JSON.parse(storedDetailedAddress);
      setDetailedAddress(address);
      setLocationDisplay(formatAddressForDisplay(address));
      localStorage.setItem("FormatAdd" , locationDisplay)
    }
    
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-background border-b border-light sticky top-0 z-40 backdrop-blur-sm bg-background/95">
      <div className="container-desktop py-3">
        <div className="flex items-center gap-4">
        {/* User Menu / Login */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  مرحباً، {user?.name}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <ShoppingCart className="ml-2 h-4 w-4" />
                    طلباتي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth/login">
                <User className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Location (Desktop) */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 text-sm max-w-64 truncate" title={detailedAddress ? formatFullAddress(detailedAddress) : locationDisplay}>
                  {loading ? 'جارٍ التحديد...' : locationDisplay}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuItem onClick={handleDetectLocation} className="flex-col items-start p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <LocateFixed className="w-4 h-4" />
                    <span className="font-medium">استخدم موقعي الحالي</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    سيتم تحديد عنوانك بدقة مع اسم الشارع والحي
                  </span>
                </DropdownMenuItem>
                
                {detailedAddress && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-2">
                      <div className="text-xs text-muted-foreground mb-1">العنوان الحالي:</div>
                      <div className="text-sm font-medium">{formatFullAddress(detailedAddress)}</div>
                    </div>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <div className="px-3 py-1 text-xs text-muted-foreground">أو اختر من المدن:</div>
                {CITIES.map((city) => (
                  <DropdownMenuItem
                    key={city.name}
                    onClick={() =>
                      handleSelectCity(city.lat, city.lon, city.name)
                    }
                  >
                    {city.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Search Bar */}        
          <div className="flex-1 max-w-md"></div>
                    
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs cart-badge"
              >
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};