import { TrendingUp, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HeroBannerProps {
  onShopNow?: () => void;
}

export const HeroBanner = ({ onShopNow }: HeroBannerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Main Banner */}
      <Card className="md:col-span-2 lg:col-span-2 bg-gradient-hero text-white overflow-hidden relative">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">عروض اليوم</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              خصومات تصل إلى 50%
              <br />
              على الفواكه الطازجة
            </h2>
            <p className="text-white/90">
              أفضل الأسعار على منتجات عالية الجودة
            </p>
            <Button 
              onClick={onShopNow}
              variant="secondary"
              className="btn-primary-hover"
            >
              تسوق الآن
            </Button>
          </div>
          <div className="absolute -bottom-4 -left-4 text-8xl opacity-20">
            🍎
          </div>
        </CardContent>
      </Card>

      {/* Side Banners */}
      <div className="space-y-4">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-success mx-auto mb-2" />
            <h3 className="font-semibold text-success">توصيل سريع</h3>
            <p className="text-sm text-muted-foreground">خلال ساعتين</p>
          </CardContent>
        </Card>
        
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 text-warning mx-auto mb-2" />
            <h3 className="font-semibold text-warning">جودة مضمونة</h3>
            <p className="text-sm text-muted-foreground">أفضل المنتجات</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};