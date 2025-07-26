import { User, Phone, MapPin, Heart, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';

const ProfilePage = () => {
  const userInfo = {
    name: 'أحمد محمد',
    phone: '0501234567',
    address: 'الرياض، حي النخيل'
  };

  const menuItems = [
    {
      icon: Heart,
      title: 'المفضلة',
      subtitle: 'المنتجات المحفوظة',
      action: () => {}
    },
    {
      icon: MapPin,
      title: 'العناوين',
      subtitle: 'إدارة عناوين التوصيل',
      action: () => {}
    },
    {
      icon: Settings,
      title: 'الإعدادات',
      subtitle: 'إعدادات التطبيق',
      action: () => {}
    }
  ];

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      <Header />
      
      <main className="min-h-screen bg-surface">
        <Container size="full" className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">حسابي</h1>
          </div>

          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle>{userInfo.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Phone className="h-4 w-4" />
                      <span>{userInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{userInfo.address}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  تعديل المعلومات الشخصية
                </Button>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="text-lg">‹</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-success">8</div>
                  <div className="text-sm text-muted-foreground">منتج مفضل</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <BottomNav />
    </BaseLayout>
  );
};

export default ProfilePage;