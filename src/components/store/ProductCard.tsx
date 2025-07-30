import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  unit: string;
  discount?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  inStock: boolean;
  category?: string;
  subCategory?: string;
  store?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleFavorite,
  className 
}: ProductCardProps) => {
  return (
    <Card className={cn('product-card group', className)}>
      <CardContent className="p-4">
        {/* Image and Badges */}
        <div className="relative mb-4">
          <div className="aspect-square bg-surface rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-success text-success-foreground text-xs">
                جديد
              </Badge>
            )}
            {product.discount && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite?.(product)}
            className="absolute top-2 left-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Heart 
              className={cn(
                'h-4 w-4',
                product.isFavorite 
                  ? 'text-destructive fill-current' 
                  : 'text-muted-foreground'
              )} 
            />
          </Button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-medium line-clamp-2 text-sm leading-tight">
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
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {product.price} ر.س
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice} ر.س
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              / {product.unit}
            </span>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => onAddToCart?.(product)}
            disabled={!product.inStock}
            className="w-full btn-primary-hover"
            size="sm"
          >
            {product.inStock ? (
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