import { ShoppingCart, Heart, Star, Package, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DemoSection = () => {
  return (
    <div className="space-y-section">
      {/* Hero Section - Design System Demo */}
      <section className="bg-gradient-hero text-white rounded-3xl p-8 md:p-12 shadow-lg">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            متجر الكتروني عربي
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            منصة تجارة إلكترونية حديثة مع دعم كامل للغة العربية وتصميم متجاوب
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="btn-primary-hover">
              <ShoppingCart className="ml-2 h-5 w-5" />
              ابدأ التسوق
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Package className="ml-2 h-5 w-5" />
              عرض المنتجات
            </Button>
          </div>
        </div>
      </section>

      {/* Color System Demo */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">نظام الألوان</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="product-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Primary</p>
              <p className="text-sm text-muted-foreground">Teal/Emerald</p>
            </CardContent>
          </Card>
          <Card className="product-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary-accent rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Accent</p>
              <p className="text-sm text-muted-foreground">Warm Coral</p>
            </CardContent>
          </Card>
          <Card className="product-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-success rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Success</p>
              <p className="text-sm text-muted-foreground">Fresh Green</p>
            </CardContent>
          </Card>
          <Card className="product-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-warning rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Warning</p>
              <p className="text-sm text-muted-foreground">Golden Yellow</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Product Cards Demo */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">المنتجات المميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'تفاح أحمر طازج', price: '12 ر.س / كيلو', image: '🍎', rating: 4.8 },
            { name: 'موز عضوي', price: '8 ر.س / كيلو', image: '🍌', rating: 4.6 },
            { name: 'برتقال طبيعي', price: '10 ر.س / كيلو', image: '🍊', rating: 4.9 }
          ].map((product, index) => (
            <Card key={index} className="product-card group">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {product.image}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground mr-1">
                        ({product.rating})
                      </span>
                    </div>
                    <p className="text-xl font-bold text-primary">{product.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 btn-primary-hover">
                      <ShoppingCart className="ml-2 h-4 w-4" />
                      أضف للسلة
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">مميزات المتجر</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Truck,
              title: 'توصيل سريع',
              description: 'توصيل في نفس اليوم لجميع المناطق'
            },
            {
              icon: Shield,
              title: 'دفع آمن',
              description: 'حماية كاملة لبياناتك المالية'
            },
            {
              icon: Package,
              title: 'منتجات عالية الجودة',
              description: 'أفضل المنتجات من مصادر موثوقة'
            }
          ].map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status Badges Demo */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">حالات الطلبات</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge className="bg-success text-success-foreground px-4 py-2">
            تم التسليم
          </Badge>
          <Badge className="bg-warning text-warning-foreground px-4 py-2">
            قيد المعالجة
          </Badge>
          <Badge className="bg-destructive text-destructive-foreground px-4 py-2">
            مرفوض
          </Badge>
          <Badge className="bg-primary text-primary-foreground px-4 py-2">
            جديد
          </Badge>
        </div>
      </section>
    </div>
  );
};