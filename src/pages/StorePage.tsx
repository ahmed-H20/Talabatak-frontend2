import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { HeroBanner } from '@/components/store/HeroBanner';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Container } from '@/components/layout/Container';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/contexts/LocationContext';

// API Product interface - matches your actual data structure
interface APIProduct {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  quantity: number;
  discount: number;
  unit: string;
  category: {
    _id: string;
    name: string;
  };
  subCategory?: {
    _id: string;
    name: string;
  };
  discountedPrice: number;
  storeId: string;
  storeName: string;
}

interface Category {
  _id: string;
  name: string;
  icon?: string;
  productCount?: number;
  subCategories?: SubCategory[];
}

interface SubCategory {
  _id: string;
  name: string;
  productCount?: number;
}

interface CartItem {
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  status: string;
  message: string;
  numOfCartItems: number;
  data: {
    id: string;
    cartItems: CartItem[];
    totalCartPrice: number;
    totalPriceAfterDiscount: number;
    user: {
      id: string;
      name: string;
    };
    createdAt: string;
  };
}

const StorePage = () => {
  const [cartItems, setCartItems] = useState<Cart | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const { toast } = useToast();
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0)
  console.log(products)
  const { location } = useLocation();
  const token = localStorage.getItem("token");
  
  const currentLocation = localStorage.getItem("userLocation") ? JSON.parse(localStorage.getItem("userLocation") || '{}') : null;

  console.log("Current Location:", currentLocation);  
  // Enhanced fetch with better error handling and loading states
  const fetchProducts = useCallback(async () => {
    if (!location?.lat || !location?.lon) {
      setError('الموقع غير محدد. يرجى تحديد موقعك أولاً.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:5000/api/stores/nearby?lat=${currentLocation?.lat}&lng=${currentLocation?.lon}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        // Ensure products match APIProduct interface
        const formattedProducts: APIProduct[] = data.products.map((product) => ({
          _id: product._id || product.id,
          name: product.name || '',
          description: product.description || '',
          images: product.images || [product.image].filter(Boolean),
          price: product.price || 0,
          quantity: product.quantity || 0,
          discount: product.discount || 0,
          unit: product.unit || 'قطعة',
          category: {
            _id: product.category?._id || product.categoryId || 'default',
            name: product.category?.name || product.categoryName || 'غير محدد'
          },
          subCategory: product.subCategory ? {
            _id: product.subCategory._id || product.subCategoryId,
            name: product.subCategory.name || product.subCategoryName
          } : undefined,
          discountedPrice: product.discountedPrice || (product.price * (1 - (product.discount || 0) / 100)),
          storeId: product.storeId || 'default',
          storeName: product.storeName || 'متجر'
        }));
        
        setProducts(formattedProducts);
      } else {
        setProducts([]);
        toast({
          title: 'تنبيه',
          description: 'لا توجد منتجات متاحة في موقعك الحالي',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.');
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المنتجات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [location, token, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل التصنيفات');
      }

      const data = await response.json();
      
      // Format categories data to match interface
      const formattedCategories: Category[] = (data.data || []).map((category) => ({
        _id: category._id || category.id,
        name: category.name || '',
        icon: category.icon,
        productCount: category.productCount || 0,
        subCategories: (category.subCategories || []).map((sub) => ({
          _id: sub._id || sub.id,
          name: sub.name || '',
          productCount: sub.productCount || 0
        }))
      }));
      
      setCategoriesData(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل التصنيفات',
        variant: 'destructive',
      });
    }
  }, [token, toast]);

  const fetchCart = useCallback(async () => {
    if (!token) return; // Don't fetch cart if user is not authenticated

    try {
      const response = await fetch(`http://localhost:5000/api/cart/cartUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل السلة');
      }

      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Don't show toast for cart errors as it's not critical
    }
  }, [token]);

  // Enhanced add to cart with API integration
  const handleAddToCart = async (product: APIProduct) => {
    if (!token) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يرجى تسجيل الدخول لإضافة المنتجات إلى السلة',
        variant: 'destructive',
      });
      return;
    }
    try {
      console.log(product._id)
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/cart/addCartItem`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            "productId":product._id
          }),
        });
        if (!response.ok) {
          throw new Error('فشل اضافة المنتج');
        }
        const data = await response.json();
        setCartCount(data.numOfCartItems)
        setLoading(false);
      } catch (error) {
        toast({
          title: 'خطأ',
          description: "فشل اضافة المنتج",
          variant: 'destructive',
        });
        console.error('Error fetching categories:', error);
        setLoading(false);
      }

    toast({
      title: "تمت إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
      className: "bg-success text-success-foreground"
    });
  };

  const handleToggleFavorite = async (product: APIProduct) => {
    const isFavorite = favoriteProducts.includes(product._id);
    
    // Optimistically update UI
    setFavoriteProducts(prev => {
      const newFavorites = isFavorite 
        ? prev.filter(id => id !== product._id)
        : [...prev, product._id];
      return newFavorites;
    });

    toast({
      title: isFavorite ? "تم إزالة من المفضلة" : "تم إضافة للمفضلة",
      description: product.name,
      className: isFavorite 
        ? "bg-gray-50 border-gray-200 text-gray-800" 
        : "bg-red-50 border-red-200 text-red-800"
    });

    // TODO: Add API call to update favorites on server
    if (token) {
      try {
        await fetch(`http://localhost:5000/api/favorites/${product._id}`, {
          method: isFavorite ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error updating favorites:', error);
        // Revert optimistic update on error
        setFavoriteProducts(prev => {
          const revertedFavorites = isFavorite 
            ? [...prev, product._id]
            : prev.filter(id => id !== product._id);
          return revertedFavorites;
        });
      }
    }
  };

  const handleCartClick = () => {
    if (!cartItems?.numOfCartItems) {
      toast({
        title: "السلة فارغة",
        description: "لا توجد منتجات في السلة",
      });
      return;
    }

    // Navigate to cart page
    toast({
      title: "السلة",
      description: `لديك ${cartItems.numOfCartItems} منتج في السلة`,
    });
  };

  // Fetch data when component mounts or location changes
  useEffect(() => {
    fetchCategories();
    fetchCart();
  }, [fetchCategories, fetchCart]);

  useEffect(() => {
    if (location) {
      fetchProducts();
    }
  }, [location, fetchProducts]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteProducts');
    if (savedFavorites) {
      try {
        setFavoriteProducts(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
  }, [favoriteProducts]);

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      {/* Header */}
      <Header 
        cartItemCount={cartItems?.numOfCartItems || 0}
        onCartClick={handleCartClick}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        <Container size="full" className="py-6 space-y-8">
          {/* Hero Banner */}
          <HeroBanner 
            onShopNow={() => window.scrollTo({ top: 400, behavior: 'smooth' })} 
          />

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
              <p className="text-destructive">{error}</p>
              <button 
                onClick={() => fetchProducts()}
                className="mt-2 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Location Warning */}
          {!location && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800">
                يرجى تحديد موقعك من الأعلى لعرض المنتجات المتاحة في منطقتك
              </p>
            </div>
          )}

          {/* Products Section */}
          {location && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">المنتجات</h2>
                <div className="text-sm text-muted-foreground">
                  {loading ? 'جارٍ التحميل...' : `${products.length} منتج متاح`}
                </div>
              </div>
              
              {/* Use the ProductGrid component */}
              <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isLoading={loading}
              />
            </section>
          )}
        </Container>
      </main>

      {/* Bottom Navigation */}
      <BottomNav cartItemCount={cartCount || 0} />
    </BaseLayout>
  );
};

export default StorePage;