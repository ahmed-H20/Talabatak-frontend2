import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export const CategoryTabs = ({ 
  categories, 
  activeCategory, 
  activeSubCategory,
  onCategoryChange,
  className,
  showProductCount = false,
  collapsible = true
}: CategoryTabsProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Auto-expand the active category
  useEffect(() => {
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
    
    // Special handling for "all" category
    if (categoryId === 'all') {
      onCategoryChange(categoryId, '');
      return;
    }
    
    // If category has subcategories
    if (category?.subCategories && category.subCategories.length > 0) {
      // If clicking on already active category, toggle expansion
      if (activeCategory === categoryId && collapsible) {
        toggleCategoryExpansion(categoryId);
      } else {
        // New category selection - expand and clear subcategory
        setExpandedCategories(prev => new Set([...prev, categoryId]));
        onCategoryChange(categoryId, '');
      }
    } else {
      // Category without subcategories
      onCategoryChange(categoryId, '');
    }
  };

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
    // If clicking the same subcategory, deselect it
    if (activeSubCategory === subCategoryId) {
      onCategoryChange(categoryId, '');
    } else {
      onCategoryChange(categoryId, subCategoryId);
    }
  };

  const handleAllSubCategoriesClick = (categoryId: string) => {
    onCategoryChange(categoryId, '');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                'whitespace-nowrap flex-shrink-0 transition-all relative',
                'flex items-center gap-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-accent hover:text-accent-foreground border-border'
              )}
            >
              {/* Category Icon */}
              {category.icon && (
                <span className="text-lg">{category.icon}</span>
              )}
              
              {/* Category Name */}
              <span>{category.name}</span>
              
              {/* Product Count Badge */}
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
              
              {/* Expansion Indicator */}
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

      {/* Subcategories - Only show for active category */}
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category._id) || !collapsible;
        const hasSubCategories = category.subCategories && category.subCategories.length > 0;
        const isCategoryActive = activeCategory === category._id;
        
        // Only show subcategories if:
        // 1. Category is active
        // 2. Category has subcategories
        // 3. Category is expanded (or collapsible is false)
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
            {/* Subcategory Label */}
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              {category.name} - التصنيفات الفرعية
            </div>
            
            {/* Subcategory Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* All subcategories option */}
              <Button
                variant={!activeSubCategory ? "default" : "outline"}
                size="sm"
                onClick={() => handleAllSubCategoriesClick(category._id)}
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
              
              {/* Individual subcategories */}
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
                    
                    {/* Subcategory Product Count */}
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
      
      {/* Active Selection Indicator */}
      {activeCategory !== 'all' && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <span className="font-medium">التصنيف النشط: </span>
          <span className="text-primary">
            {categories.find(cat => cat._id === activeCategory)?.name}
          </span>
          {activeSubCategory && (
            <>
              <span className="mx-1">←</span>
              <span className="text-primary">
                {categories
                  .find(cat => cat._id === activeCategory)
                  ?.subCategories?.find(sub => sub._id === activeSubCategory)?.name
                }
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};