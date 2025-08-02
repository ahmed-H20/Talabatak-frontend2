// import { Search, ShoppingCart, Menu, MapPin, User, LogOut } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
// import { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';

// interface HeaderProps {
//   cartItemCount?: number;
//   onCartClick?: () => void;
//   onMenuClick?: () => void;
// }

// export const Header = ({ 
//   cartItemCount = 0, 
//   onCartClick, 
//   onMenuClick 
// }: HeaderProps) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const { user, isAuthenticated, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await logout();
//     navigate('/');
//   };

//   return (
//     <header className="bg-background border-b border-light sticky top-0 z-40 backdrop-blur-sm bg-background/95">
//       <div className="container-desktop py-3">
//         <div className="flex items-center gap-4">
//           {/* Menu Button (Mobile) */}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onMenuClick}
//             className="md:hidden"
//           >
//             <Menu className="h-5 w-5" />
//           </Button>

//           {/* Logo */}
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-sm">م</span>
//             </div>
//             <span className="font-bold text-xl hidden sm:block">متجري</span>
//           </div>

//           {/* Location (Desktop) */}
//           <div className="hidden md:flex items-center gap-1 text-muted-foreground">
//             <MapPin className="h-4 w-4" />
//             <span className="text-sm">الرياض</span>
//           </div>

//           {/* Search Bar */}
//           <div className="flex-1 max-w-md mx-4">
//             <div className="relative">
//               <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="ابحث عن المنتجات..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pr-10 bg-surface border-input-border"
//               />
//             </div>
//           </div>

//           {/* User Menu / Login */}
//           {isAuthenticated ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative">
//                   <User className="h-5 w-5" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-48">
//                 <div className="px-2 py-1.5 text-sm text-muted-foreground">
//                   مرحباً، {user?.name}
//                 </div>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem asChild>
//                   <Link to="/profile" className="cursor-pointer">
//                     <User className="ml-2 h-4 w-4" />
//                     الملف الشخصي
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem asChild>
//                   <Link to="/orders" className="cursor-pointer">
//                     <ShoppingCart className="ml-2 h-4 w-4" />
//                     طلباتي
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
//                   <LogOut className="ml-2 h-4 w-4" />
//                   تسجيل الخروج
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <Button asChild variant="outline" size="sm">
//               <Link to="/auth/login">
//                 <User className="ml-2 h-4 w-4" />
//                 تسجيل الدخول
//               </Link>
//             </Button>
//           )}

//           {/* Cart Button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onCartClick}
//             className="relative"
//           >
//             <ShoppingCart className="h-5 w-5" />
//             {cartItemCount > 0 && (
//               <Badge 
//                 className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs cart-badge"
//               >
//                 {cartItemCount > 9 ? '9+' : cartItemCount}
//               </Badge>
//             )}
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// };

import { Search, ShoppingCart, Menu, MapPin, User, LogOut, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '@/contexts/LocationContext';
interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

// cities
const CITIES = [
  { name: 'الرياض', lat: 24.7136, lon: 46.6753 },
  { name: 'جدة', lat: 21.4858, lon: 39.1925 },
  { name: 'الدمام', lat: 26.4207, lon: 50.0888 },
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
  onMenuClick 
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { location, setLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const [cityName, setCityName] = useState<string>("اختر موقعك"); // To display selected city

  useEffect(() => {    
    if (!location) {
      setCityName('لم يتم تحديد الموقع');
    } else {
      // Check if lat/lon matches one of the known cities
      const found = CITIES.find(
        (c) => c.lat === location.lat && c.lon === location.lon
      );
      if (found) setCityName(found.name);
      else setCityName(`${localStorage.getItem('userCity')} ,تم تحديد موقعك الحالي`);
    }
  }, [location]);

  const fetchCityName = async (lat: number, lon: number) => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await res.json();
        return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "مدينة غير معروفة"
        );
    } catch (error) {
        console.error("فشل جلب اسم المدينة:", error);
        return "مدينة غير معروفة";
    }
  };

  const handleSelectCity = (lat: number, lon: number, name: string) => {
    setLocation({ lat, lon });
    setCityName(name);
  };

  // const handleDetectLocation = () => {
  //   setLoading(true);
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       const coords = {
  //         lat: pos.coords.latitude,
  //         lon: pos.coords.longitude
  //       };
  //       setLocation(coords);
  //       setCityName('تم تحديد موقعك الحالي');
  //       setLoading(false);
  //     },
  //     (err) => {
  //       console.error('فشل تحديد الموقع:', err);
  //       setCityName('تعذر تحديد الموقع');
  //       setLoading(false);
  //     }
  //   );
  // };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      console.error("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocation(coords);
        localStorage.setItem("userLocation", JSON.stringify(coords));

        // 👇 هنا الإضافة
        const name = await fetchCityName(coords.lat, coords.lon);
        setCityName(name);
        localStorage.setItem("userCity", name);

        setLoading(false);
      },
      (err) => {
        console.error("فشل تحديد الموقع:", err);
        setCityName("تعذر تحديد الموقع");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    const storedCity = localStorage.getItem("userCity");

    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
    }

    if (storedCity) {
      setCityName(storedCity);
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
                <Button variant="ghost" className="px-2 text-sm">
                  {loading ? 'جارٍ التحديد...' : cityName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleDetectLocation}>
                  <LocateFixed className="w-4 h-4 mr-2" />
                  استخدم موقعي الحالي
                </DropdownMenuItem>
                <hr className="my-1" />
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