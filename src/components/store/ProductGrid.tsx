import { ProductCard, Product } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  categories: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

export const ProductGrid = ({ 
  products, 
  categories,
  onAddToCart, 
  onToggleFavorite,
  className 
}: ProductGridProps) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'all');

  // Filter products by category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.id.includes(activeCategory));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground">لم يتم العثور على منتجات في هذه الفئة</p>
        </div>
      )}
    </div>
  );
};