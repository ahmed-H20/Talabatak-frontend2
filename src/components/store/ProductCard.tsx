import { ShoppingCart, Heart, Star, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Multiple images support
  rating: number;
  reviewCount: number;
  unit: string;
  discount?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  inStock: boolean;
  stockQuantity?: number;
  category?: string;
  categoryId?: string;
  subCategory?: string;
  store?: {
    id: string;
    name: string;
    distance?: number;
  };
  distance?: number; // Distance from user location
  storeName: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
  isLoading?: boolean;
}

export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleFavorite,
  className,
  isLoading = false
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (isLoading) {
    return (
      <Card className={cn('product-card', className)}>
        <CardContent className="p-4">
          <Skeleton className="aspect-square rounded-lg mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'product-card group hover:shadow-lg transition-all duration-300 border-0 shadow-sm',
      !product.inStock && 'opacity-75',
      className
    )}>
      <CardContent className="p-4 flex flex-col h-full">
        {/* Image and Badges */}
        <div className="relative mb-4 h-full">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {!imageError ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-green-500 text-white text-xs shadow-sm">
                جديد
              </Badge>
            )}
            {product.discount && product.discount > 0 && (
              <Badge className="bg-red-500 text-white text-xs shadow-sm">
                -{product.discount}%
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="text-xs">
                نفذ المخزون
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite?.(product)}
            className="absolute top-2 left-2 h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <Heart 
              className={cn(
                'h-4 w-4 transition-colors',
                product.isFavorite 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-400 hover:text-red-400'
              )} 
            />
          </Button>

          {/* Stock indicator */}
          {product.inStock && product.stockQuantity && product.stockQuantity <= 5 && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                متبقي {product.stockQuantity}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Store Info */}
          {product.store && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Store className="h-3 w-3" />
              <span className="truncate">{product.storeName}</span>
              {product.store.distance && (
                <>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{product.store.distance.toFixed(1)} كم</span>
                </>
              )}
            </div>
          )}

          <h3 className="font-medium line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString('ar-SA')} ر.س
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice.toFixed(0)} ر.س
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              / {product.unit}
            </span>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={cn(
              "w-full transition-all duration-200",
              product.inStock 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            size="sm"
          >
            {isAddingToCart ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                جارٍ الإضافة...
              </div>
            ) : product.inStock ? (
              <>
                <ShoppingCart className="ml-2 h-4 w-4" />
                أضف للسلة
              </>
            ) : (
              'غير متوفر'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
