import { ShoppingCart, Plus, Minus, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';
import { Item } from '@radix-ui/react-context-menu';

const CartPage = () => {
  const [cartItems, setCartItems] = useState<cart>();
  const [deliveryAddress, setDeliveryAddress] = useState(localStorage.getItem("FormatAdd") || "");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [socket, setSocket] = useState(null);

  const { toast } = useToast();
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [afterDiscount, setAfterDiscount] = useState<number | null>(null);

  interface cart {
    status: string;
    numOfCartItems: number;
    data: {
      cartItems: {
        id:string;
        product: {
          id: string;
          store:{
            _id: string;
            name: string;
          };
          name: string;
          images:['']
          unit:string;
        };
        quantity: number;
        price: number;
      }[];
      totalCartPrice: number;
      totalPriceAfterDiscount: number;
      user: {
        id: string;
        name: string;
      };
    };
  }

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && token) {
      const socketConnection = io('https://talabatak-backend2-zw4i.onrender.com', {
        auth: {
          token: token
        }
      });

      socketConnection.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketConnection.on('orderCreated', (data) => {
        console.log('Order created:', data);
        toast({
          title: "تم إنشاء الطلب بنجاح",
          description: `طلب رقم: ${data.order._id.slice(-8)}`,
        });
      });

      socketConnection.on('orderStatusUpdated', (data) => {
        console.log('Order status updated:', data);
        toast({
          title: "تم تحديث حالة الطلب",
          description: `الحالة الجديدة: ${data.newStatus}`,
        });
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, []); // Empty dependency array since we only want this to run once

  const deliveryCoordinates = JSON.parse(localStorage.getItem("userLocation"))
  
  // Create Order Function
  // In your CartPage component, modify the createOrder function:
const createOrder = async () => {
  if (!deliveryAddress.trim()) {
    toast({
      title: "خطأ",
      description: "يرجى إدخال عنوان التوصيل",
      variant: "destructive"
    });
    return;
  }

  if (!cartItems?.data.cartItems || cartItems.data.cartItems.length === 0) {
    toast({
      title: "خطأ", 
      description: "السلة فارغة",
      variant: "destructive"
    });
    return;
  }

  try {
    setIsCreatingOrder(true);
    
    // Prepare order items in the format expected by backend
    const orderData = {
      cartItems: cartItems.data.cartItems.map(item => ({
        store: item.product.store._id,
        product: item.product.id,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryAddress: deliveryAddress.trim(),
      deliveryCoordinates: [deliveryCoordinates.lat, deliveryCoordinates.lon] // لازم تجيبها من الـ LocationSelector
    };


    console.log('Creating order with data:', orderData);

    const response = await fetch('https://talabatak-backend2-zw4i.onrender.com/api/orders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل في إنشاء الطلب');
    }

    console.log('Order created successfully:', data);

    toast({
      title: "تم إنشاء الطلب بنجاح",
      description: `!${data.orders[0].user.name}تم انشاء طلبك `,
    });

    // Clear the cart and delivery address
    setCartItems(null);
    setDeliveryAddress("");
    setAfterDiscount(null);
    setCouponCode("");

  } catch (error) {
    console.error('Error creating order:', error);
    toast({
      title: "خطأ",
      description: error.message || "حدث خطأ أثناء إنشاء الطلب",
      variant: "destructive"
    });
  } finally {
    setIsCreatingOrder(false);
  }
};

  const handleApplyCoupon = async () => {
    console.log(couponCode)
    if (!couponCode) return toast({title: "أدخل رمز الخصم", variant: 'destructive'});

    try {
      setIsApplying(true);
      const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/coupons/useCoupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({"couponName" : couponCode})
      });       
      const data = await res.json()
      if(!res.ok){
        toast({title: data.message});
        console.log(res)
        return   
      }
      console.log(data.message)            
      // Update cart data directly instead of refetching
      if (data.totalPriceAfterDiscount) {
        setAfterDiscount(data.totalPriceAfterDiscount);
      }
      toast({title: "تم تطبيق الخصم بنجاح"});      
    } catch (error) {
      toast({title : error.response?.data || "حدث خطأ أثناء تطبيق الكوبون"});
    } finally {
      setIsApplying(false);
    }
  };
  
  const fetchCart = async () => {    
    try {
      const response = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/cart/cartUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error('فشل فى تحميل السلة');
      }
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل فى تحميل السلة',
        variant: 'destructive',
      });
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(()=>{
    fetchCart()
  },[])

  console.log(cartItems,user)

  const updateQuantity = async (id: string, newQuantity: number) => {
    // ✅ Optimistically update the UI
    setCartItems(prev => {
      const updatedItems = newQuantity <= 0
        ? prev.data.cartItems.filter(item => item.product.id !== id)
        : prev.data.cartItems.map(item =>
            item.product.id === id
              ? { ...item, quantity: newQuantity }
              : item
          );

      return {
        ...prev,
        data: {
          ...prev.data,
          cartItems: updatedItems,
        },
      };
  });

  try {
    // ✅ Call API to update quantity in backend
    const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/cart/updateCartItem/${id}`, {
      method:  "PUT",
      headers: { 
        "Content-Type": "application/json" ,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (!res.ok) {
      throw new Error("فشل تحديث الكمية في قاعدة البيانات");
    }    
    const data = await res.json();
    console.log("تم تحديث العربة:", data);
    // Only fetch cart if the update was successful
    await fetchCart();
    } catch (err) {
      console.error("خطأ أثناء تحديث الكمية:", err);
      // Revert the optimistic update
      fetchCart();
    }
  };

  const deleteProduct = async (id: string) => {
    console.log(id)
    try {
    // ✅ Call API to delete in backend
    const res = await fetch(`https://talabatak-backend2-zw4i.onrender.com/api/cart/deletecart/${id}`, {
      method:  "DELETE",
      headers: { 
        "Content-Type": "application/json" ,
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    });

    if (!res.ok) {
      throw new Error("فشل حذف المنتج من قاعدة البيانات");
    }    
    console.log("تم حذف المنتج بنجاح");
    await fetchCart();
    } catch (err) {
      console.error("خطأ أثناء حذف المنتج:", err);
      // Show error message to user
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المنتج',
        variant: 'destructive',
      });
    }
  }

  const totalPrice = cartItems?.data.totalCartPrice || 0
  const totalItems = cartItems?.numOfCartItems || 0

  console.log(cartItems)

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

          {cartItems?.data.cartItems.length === 0 || cartItems == null?(
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
                {cartItems.data.cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-surface rounded-lg flex items-center justify-center text-3xl">
                          {
                            item.product?.images ?
                            <img src={item.product.images[0]} alt="product image" />
                            :
                            '🎯'
                          }
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{item.product.name}</h3>
                          <p className="text-primary font-semibold ml-2">
                            {item.price} ر.س / {item.product?.unit || "كيلو"}
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
                              onClick={() => deleteProduct(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg">
                            {(item.price * item.quantity).toFixed(0)} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary & Customer Info */}
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      عنوان التوصيل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="أدخل عنوان التوصيل التفصيلي..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
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
                      <span className="text-success">30</span>
                    </div>

                    {/* Input coupon */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="ادخل رمز الخصم"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleApplyCoupon} disabled={isApplying}>
                        {isApplying ? "جاري التطبيق..." : "تطبيق"}
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>المجموع الكلي</span>
                      <span className="text-primary">
                        {afterDiscount ? `${Number(afterDiscount).toFixed(0)} ر.س` : `${totalPrice.toFixed(0)} ر.س`}
                      </span>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={createOrder}
                      disabled={isCreatingOrder || !deliveryAddress.trim()}
                    >
                      {isCreatingOrder ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
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