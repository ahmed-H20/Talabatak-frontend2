import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Star, Heart, ShoppingCart, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// ProductCard component interface - what your ProductCard expects
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  images: string[];
  price: number;
  discountedPrice: number;
  discount: number;
  unit: string;
  inStock: boolean;
  quantity: number;
  rating: number;
  reviewCount: number; // Added this missing property
  store: {
    name: string;
    distance: number;
  };
  storeName: string
}

interface SubCategory {
  _id: string;
  name: string;
  productCount?: number;
}

interface Category {
  _id: string;
  name: string;
  icon?: string;
  productCount?: number;
  subCategories?: SubCategory[];
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  activeSubCategory?: string;
  onCategoryChange: (categoryId: string, subCategoryId?: string) => void;
  className?: string;
  showProductCount?: boolean;
  collapsible?: boolean;
}

interface ProductGridProps {
  products: APIProduct[];
  onAddToCart?: (product: APIProduct) => void;
  onToggleFavorite?: (product: APIProduct) => void;
  className?: string;
  isLoading?: boolean;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'discount';

// ProductCard Component
const ProductCard: React.FC<{
  product: Product;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isLoading?: boolean;
}> = ({ product, onAddToCart, onToggleFavorite, isLoading = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border overflow-hidden animate-pulse">
        <div className="aspect-square bg-muted" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </button>
        
        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">غير متوفر</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        {/* Product Name */}
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <h4 className="font-small text-sm line-clamp-2 min-h-[0.5rem]">
          متجر {product.storeName}
        </h4>
        {/* Store Info */}
        <div className="flex items-center text-xs text-muted-foreground">
          <span></span>
          <span>{product.store.name}</span>
          <span className="mx-1">•</span>
          <span>{product.store.distance.toFixed(2)} كم</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">
                {product.discountedPrice} ج.م
              </span>
              <span className="text-xs text-muted-foreground">
                /{product.unit}
              </span>
            </div>
            {product.discount > 0 && (
              <div className="text-xs text-muted-foreground line-through">
                {product.price} ج.م
              </div>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={onAddToCart}
          disabled={!product.inStock}
          size="sm"
          className="w-full"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          إضافة للسلة
        </Button>
      </div>
    </div>
  );
};

// CategoryTabs Component
const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, 
  activeCategory, 
  activeSubCategory,
  onCategoryChange,
  className,
  showProductCount = false,
  collapsible = true
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (activeCategory && activeCategory !== 'all') {
      setExpandedCategories(prev => new Set([...prev, activeCategory]));
    }
  }, [activeCategory]);

  const toggleCategoryExpansion = (categoryId: string) => {
    if (!collapsible) return;
    
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    
    if (categoryId === 'all') {
      onCategoryChange(categoryId, '');
      return;
    }
    
    if (category?.subCategories && category.subCategories.length > 0) {
      if (activeCategory === categoryId && collapsible) {
        toggleCategoryExpansion(categoryId);
      } else {
        setExpandedCategories(prev => new Set([...prev, categoryId]));
        onCategoryChange(categoryId, '');
      }
    } else {
      onCategoryChange(categoryId, '');
    }
  };

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
    if (activeSubCategory === subCategoryId) {
      onCategoryChange(categoryId, '');
    } else {
      onCategoryChange(categoryId, subCategoryId);
    }
  };

  // console.log(onAddToCart())

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const isActive = activeCategory === category._id;
          const hasSubCategories = category.subCategories && category.subCategories.length > 0;
          const isExpanded = expandedCategories.has(category._id);
          
          return (
            <Button
              key={category._id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category._id)}
              className={cn(
                'whitespace-nowrap flex-shrink-0 transition-all',
                'flex items-center gap-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {category.icon && <span className="text-lg">{category.icon}</span>}
              <span>{category.name}</span>
              
              {showProductCount && category.productCount !== undefined && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-1 text-xs h-5 px-1.5",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {category.productCount}
                </Badge>
              )}
              
              {hasSubCategories && collapsible && (
                <div className="ml-1">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Subcategories */}
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category._id) || !collapsible;
        const hasSubCategories = category.subCategories && category.subCategories.length > 0;
        const isCategoryActive = activeCategory === category._id;
        
        if (!isCategoryActive || !hasSubCategories || (!isExpanded && collapsible)) {
          return null;
        }
        
        return (
          <div 
            key={`subcategories-${category._id}`}
            className={cn(
              'transition-all duration-200 ease-in-out',
              'border-l-2 border-primary/30 bg-muted/20 rounded-r-lg',
              'pl-4 ml-2 py-2'
            )}
          >
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              {category.name} - التصنيفات الفرعية
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={!activeSubCategory ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category._id, '')}
                className={cn(
                  'whitespace-nowrap flex-shrink-0 transition-all text-xs',
                  !activeSubCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                الكل
                {showProductCount && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-1 text-xs h-4 px-1",
                      !activeSubCategory 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {category.productCount}
                  </Badge>
                )}
              </Button>
              
              {category.subCategories?.map((subCategory) => {
                const isSubActive = activeSubCategory === subCategory._id;
                
                return (
                  <Button
                    key={`${category._id}-${subCategory._id}`}
                    variant={isSubActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSubCategoryClick(category._id, subCategory._id)}
                    className={cn(
                      'whitespace-nowrap flex-shrink-0 transition-all text-xs',
                      'flex items-center gap-2',
                      isSubActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span>{subCategory.name}</span>
                    
                    {showProductCount && subCategory.productCount !== undefined && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-1 text-xs h-4 px-1",
                          isSubActive 
                            ? "bg-primary-foreground/20 text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {subCategory.productCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main ProductGrid Component
export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onAddToCart, 
  onToggleFavorite,
  className,
  isLoading = false
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Convert API product to ProductCard format
  const convertToProductCard = (apiProduct: APIProduct): Product => {
    return {
      id: apiProduct._id,
      name: apiProduct.name,
      description: apiProduct.description,
      image: apiProduct.images[0] || '',
      images: apiProduct.images,
      price: apiProduct.price,
      discountedPrice: apiProduct.discountedPrice,
      discount: apiProduct.discount,
      unit: apiProduct.unit,
      inStock: apiProduct.quantity > 0,
      quantity: apiProduct.quantity,
      rating: 4.5, // Default since not in API
      reviewCount: Math.floor(Math.random() * 100) + 10, // Generate random review count
      store: {
        name: 'متجر محلي',
        distance: Math.random() * 5 + 0.5 // Random distance       
      },
      storeName: apiProduct.storeName
    };
  };

  // Extract categories from products
  const categoriesWithSubCategories = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    
    products.forEach(product => {
      const categoryId = product.category._id;
      const categoryName = product.category.name;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          _id: categoryId,
          name: categoryName,
          productCount: 0,
          subCategories: []
        });
      }
      
      const category = categoryMap.get(categoryId)!;
      category.productCount = (category.productCount || 0) + 1;
      
      if (product.subCategory && product.subCategory._id) {
        const existingSubCat = category.subCategories?.find(
          sub => sub._id === product.subCategory!._id
        );
        
        if (!existingSubCat) {
          category.subCategories?.push({
            _id: product.subCategory._id,
            name: product.subCategory.name,
            productCount: 0
          });
        }
      }
    });
    
    // Calculate subcategory product counts
    categoryMap.forEach(category => {
      category.subCategories?.forEach(subCat => {
        subCat.productCount = products.filter(product => 
          product.category._id === category._id && 
          product.subCategory?._id === subCat._id
        ).length;
      });
    });
    
    return Array.from(categoryMap.values());
  }, [products]);

  const enhancedCategories = useMemo(() => {
    return [
      { 
        _id: 'all', 
        name: 'الكل', 
        icon: '🛍️',
        productCount: products.length,
        subCategories: []
      },
      ...categoriesWithSubCategories
    ];
  }, [categoriesWithSubCategories, products.length]);

  const handleCategoryChange = (categoryId: string, subCategoryId?: string) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(subCategoryId || '');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category._id === activeCategory
      );

      if (activeSubCategory) {
        filtered = filtered.filter(product =>
          product.subCategory?._id === activeSubCategory
        );
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    if (showInStockOnly) {
      filtered = filtered.filter(product => product.quantity > 0);
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, activeCategory, activeSubCategory, searchQuery, sortBy, showInStockOnly]);

  const handleClearFilters = () => {
    setActiveCategory('all');
    setActiveSubCategory('');
    setSearchQuery('');
    setSortBy('default');
    setShowInStockOnly(false);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 h-8 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCard key={i} product={{} as Product} isLoading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ابحث عن المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            فلاتر
          </Button>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الافتراضي</SelectItem>
              <SelectItem value="price-asc">السعر: الأقل أولاً</SelectItem>
              <SelectItem value="price-desc">السعر: الأعلى أولاً</SelectItem>
              <SelectItem value="discount">الخصم الأكبر</SelectItem>
              <SelectItem value="name">الاسم</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || activeCategory !== 'all' || activeSubCategory || sortBy !== 'default' || showInStockOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground"
            >
              مسح الفلاتر
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">المتوفر فقط</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <CategoryTabs
        categories={enhancedCategories}
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        onCategoryChange={handleCategoryChange}
        showProductCount={true}
        collapsible={true}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredAndSortedProducts.length} من {products.length} منتج
        </span>
        {searchQuery && (
          <span>
            نتائج البحث عن: "{searchQuery}"
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={convertToProductCard(product)}
            onAddToCart={() => onAddToCart?.(product)}
            onToggleFavorite={() => onToggleFavorite?.(product)}
          />
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {searchQuery ? '🔍' : activeCategory !== 'all' ? '📦' : '🛍️'}
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد منتجات'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `لم نجد منتجات تطابق "${searchQuery}"`
              : activeCategory !== 'all'
              ? `لم يتم العثور على منتجات في ${activeSubCategory ? 'التصنيف الفرعي المحدد' : 'هذه الفئة'}`
              : 'لا توجد منتجات متاحة حالياً'
            }
          </p>
          {(searchQuery || activeCategory !== 'all' || activeSubCategory) && (
            <Button onClick={handleClearFilters} variant="outline">
              مسح الفلاتر وعرض جميع المنتجات
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// // Demo with sample data
// const sampleProducts: APIProduct[] = [
//   {
//     "_id": "688fccd375a19fcd62e79ecc",
//     "name": "تفاح أحمر طازج",
//     "description": "تفاح أحمر عالي الجودة من المزارع المحلية",
//     "images": ["https://images.unsplash.com/photo-1568702846914-96b305d2aaeb"],
//     "price": 45,
//     "quantity": 100,
//     "discount": 5,
//     "unit": "كيلو",
//     "category": { "_id": "cat1", "name": "خضار وفواكه" },
//     "subCategory": { "_id": "sub1", "name": "فواكه" },
//     "discountedPrice": 42.75,
//     "storeId": "store1"
//   },
//   {
//     "_id": "688fccd375a19fcd62e79ecd",
//     "name": "موز طازج",
//     "description": "موز عالي الجودة غني بالفيتامينات",
//     "images": ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"],
//     "price": 35,
//     "quantity": 80,
//     "discount": 10,
//     "unit": "كيلو",
//     "category": { "_id": "cat1", "name": "خضار وفواكه" },
//     "subCategory": { "_id": "sub1", "name": "فواكه" },
//     "discountedPrice": 31.5,
//     "storeId": "store1"
//   },
//   {
//     "_id": "688fccd375a19fcd62e79ecf",
//     "name": "طماطم طازجة",
//     "description": "طماطم حمراء طازجة من المزارع المحلية",
//     "images": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea"],
//     "price": 25,
//     "quantity": 150,
//     "discount": 15,
//     "unit": "كيلو",
//     "category": { "_id": "cat1", "name": "خضار وفواكه" },
//     "subCategory": { "_id": "sub2", "name": "خضار" },
//     "discountedPrice": 21.25,
//     "storeId": "store1"
//   },
//   {
//     "_id": "688fd1057a5d1e5bf469b3bf",
//     "name": "تلفزيون سامسونج 55 بوصة",
//     "description": "تلفزيون سامسونج ذكي 4K بشاشة 55 بوصة مع تقنية HDR",
//     "images": ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1"],
//     "price": 15000,
//     "quantity": 25,
//     "discount": 8,
//     "unit": "قطعة",
//     "category": { "_id": "cat2", "name": "الكترونيات" },
//     "subCategory": { "_id": "sub3", "name": "تلفزيونات" },
//     "discountedPrice": 13800,
//     "storeId": "store1"
//   }
// ];

// // Demo Component
// export default function ProductGridDemo() {
//   const handleAddToCart = (product: APIProduct) => {
//     console.log('Added to cart:', product.name);
//   };

//   const handleToggleFavorite = (product: APIProduct) => {
//     console.log('Toggled favorite:', product.name);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">متجر المنتجات</h1>
//       <ProductGrid
//         products={sampleProducts}
//         onAddToCart={handleAddToCart}
//         onToggleFavorite={handleToggleFavorite}
//       />
//     </div>
//   );
// }