import { ShoppingCart, Plus, Minus, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { mockCartItems } from '@/data/mockData';
import { useState } from 'react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      <Header cartItemCount={totalItems} />
      
      <main className="min-h-screen bg-surface">
        <Container size="full" className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">سلة التسوق</h1>
            <span className="text-muted-foreground">({totalItems} منتج)</span>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium mb-2">السلة فارغة</h3>
                <p className="text-muted-foreground">ابدأ التسوق وأضف منتجات لسلتك</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-surface rounded-lg flex items-center justify-center text-3xl">
                          {item.product.image}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{item.product.name}</h3>
                          <p className="text-primary font-semibold">
                            {item.product.price} ر.س / {item.product.unit}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, 0)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg">
                            {(item.product.price * item.quantity).toFixed(0)} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary & Customer Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="أدخل عنوانك"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <MapPin className="ml-2 h-4 w-4" />
                      تحديد الموقع على الخريطة
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي</span>
                      <span>{totalPrice.toFixed(0)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رسوم التوصيل</span>
                      <span className="text-success">مجاناً</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>المجموع الكلي</span>
                      <span className="text-primary">{totalPrice.toFixed(0)} ر.س</span>
                    </div>
                    <Button className="w-full" size="lg">
                      تأكيد الطلب
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </Container>
      </main>

      <BottomNav cartItemCount={totalItems} />
    </BaseLayout>
  );
};

export default CartPage;