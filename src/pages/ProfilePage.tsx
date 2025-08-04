import { User, Phone, MapPin, Heart, Settings, Package, Clock, Star, Edit, Camera, Shield, Bell, HelpCircle, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // This would come from your API call to {{base_url}}/api/auth/profile
  const userInfo = JSON.parse(localStorage.getItem("user"))

  const quickActions = [
    // {
    //   icon: Heart,
    //   title: 'المفضلة',
    //   subtitle: `${userInfo.favoriteItems} منتج`,
    //   color: 'text-red-500',
    //   bgColor: 'bg-red-50',
    //   action: () => console.log('Navigate to favorites')
    // },
    {
      icon: Package,
      title: 'طلباتي',
      subtitle: `${userInfo.totalOrders} طلب`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      action: () => navigate('/orders'),
    },
    // {
    //   icon: MapPin,
    //   title: 'العناوين',
    //   subtitle: 'إدارة عناوين التوصيل',
    //   color: 'text-green-500',
    //   bgColor: 'bg-green-50',
    //   action: () => console.log('Navigate to addresses')
    // },
    // {
    //   icon: Clock,
    //   title: 'سجل الطلبات',
    //   subtitle: 'عرض جميع الطلبات',
    //   color: 'text-purple-500',
    //   bgColor: 'bg-purple-50',
    //   action: () => console.log('Navigate to order history')
    // }
  ];

  // const handleLogout = async () => {
  //   await LogOut();
  //   navigate('/');
  // };

  const settingsItems = [
    {
      icon: Bell,
      title: 'الإشعارات',
      subtitle: 'إدارة الإشعارات',
      action: () => console.log('Notifications settings')
    },
    {
      icon: Shield,
      title: 'الأمان والخصوصية',
      subtitle: 'كلمة المرور والحماية',
      action: () => console.log('Security settings')
    },
    {
      icon: Settings,
      title: 'إعدادات التطبيق',
      subtitle: 'اللغة والتفضيلات',
      action: () => console.log('App settings')
    },
    {
      icon: HelpCircle,
      title: 'المساعدة والدعم',
      subtitle: 'الأسئلة الشائعة',
      action: () => console.log('Help & support')
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ProfileHeader = () => (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {userInfo.profile_picture ? (
                <img 
                  src={userInfo.profile_picture} 
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold truncate">{userInfo.name}</h2>
              {userInfo.isPhoneVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{userInfo.phone}</span>
              </div>
              
              <div className="text-xs">
                عضو منذ {userInfo.createdAt}
              </div>
            </div>
          </div>
          
          {/* <Button variant="outline" size="sm" className="flex-shrink-0">
            <Edit className="h-4 w-4 ml-2" />
            تعديل
          </Button> */}
        </div>
        
        {!userInfo.isPhoneVerified && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>يرجى تأكيد رقم الهاتف لتفعيل جميع الميزات</span>
            </div>
            {/* <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700">
              تأكيد الرقم
            </Button> */}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-primary mb-1">{userInfo.totalOrders}</div>
          <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-500 mb-1">{userInfo.favoriteItems}</div>
          <div className="text-sm text-muted-foreground">منتج مفضل</div>
        </CardContent>
      </Card>
    </div>
  );

  const QuickActions = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">الإجراءات السريعة</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((item, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={item.action}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  {/* <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // const SettingsSection = () => (
  //   <div className="mb-6">
  //     <h3 className="text-lg font-semibold mb-4">الإعدادات</h3>
  //     <div className="space-y-2">
  //       {settingsItems.map((item, index) => (
  //         <Card 
  //           key={index} 
  //           className="cursor-pointer hover:shadow-sm transition-shadow"
  //           onClick={item.action}
  //         >
  //           <CardContent className="p-4">
  //             <div className="flex items-center gap-4">
  //               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
  //                 <item.icon className="h-5 w-5 text-gray-600" />
  //               </div>
  //               <div className="flex-1">
  //                 <h4 className="font-medium text-sm">{item.title}</h4>
  //                 <p className="text-xs text-muted-foreground">{item.subtitle}</p>
  //               </div>
  //               <div className="text-muted-foreground">
  //                 <span className="text-lg">‹</span>
  //               </div>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>
  //   </div>
  // );

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <Container size="full" className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">حسابي</h1>
          </div>

          <ProfileHeader />
          {/* <StatsCards /> */}
          <QuickActions />
          {/* <SettingsSection /> */}

          {/* Logout Button */}
          {/* <Card onClick={handleLogout} className="cursor-pointer hover:shadow-sm transition-shadow border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-red-600">تسجيل الخروج</h4>
                  <p className="text-xs text-red-400">الخروج من التطبيق</p>
                </div>
                <div className="text-red-400">
                  <span className="text-lg">‹</span>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </Container>
      </main>

      <BottomNav />
    </BaseLayout>
  );
};

export default ProfilePage;