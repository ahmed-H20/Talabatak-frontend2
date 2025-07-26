import { useState } from 'react';
import { Header } from '@/components/store/Header';
import { BottomNav } from '@/components/store/BottomNav';
import { HeroBanner } from '@/components/store/HeroBanner';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Container } from '@/components/layout/Container';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { categories, mockProducts, mockCartItems } from '@/data/mockData';
import { Product } from '@/components/store/ProductCard';
import { useToast } from '@/hooks/use-toast';

const StorePage = () => {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>(['fruits-2', 'vegetables-2', 'dairy-2', 'meat-2']);
  const { toast } = useToast();

  // Update products with favorite status
  const productsWithFavorites = mockProducts.map(product => ({
    ...product,
    isFavorite: favoriteProducts.includes(product.id)
  }));

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, {
        id: `cart-${Date.now()}`,
        product,
        quantity: 1
      }]);
    }

    toast({
      title: "تمت إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
      className: "bg-success text-success-foreground"
    });
  };

  const handleToggleFavorite = (product: Product) => {
    setFavoriteProducts(prev => {
      const isFavorite = prev.includes(product.id);
      const newFavorites = isFavorite 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id];
      
      toast({
        title: isFavorite ? "تم إزالة من المفضلة" : "تم إضافة للمفضلة",
        description: product.name,
        className: isFavorite 
          ? "bg-muted text-muted-foreground" 
          : "bg-destructive text-destructive-foreground"
      });
      
      return newFavorites;
    });
  };

  const handleCartClick = () => {
    // Navigate to cart page (will implement in next phase)
    toast({
      title: "السلة",
      description: `لديك ${cartItems.length} منتج في السلة`,
    });
  };

  const handleMenuClick = () => {
    // Open mobile menu (will implement in next phase)
    toast({
      title: "القائمة",
      description: "سيتم فتح القائمة قريباً",
    });
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BaseLayout dir="rtl" className="pb-16 md:pb-0">
      {/* Header */}
      <Header 
        cartItemCount={totalCartItems}
        onCartClick={handleCartClick}
        onMenuClick={handleMenuClick}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        <Container size="full" className="py-6 space-y-8">
          {/* Hero Banner */}
          <HeroBanner onShopNow={() => window.scrollTo({ top: 400, behavior: 'smooth' })} />

          {/* Products Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">المنتجات</h2>
              <div className="text-sm text-muted-foreground">
                {productsWithFavorites.length} منتج متاح
              </div>
            </div>
            
            <ProductGrid
              products={productsWithFavorites}
              categories={categories}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />
          </section>
        </Container>
      </main>

      {/* Bottom Navigation */}
      <BottomNav cartItemCount={totalCartItems} />
    </BaseLayout>
  );
};

export default StorePage;