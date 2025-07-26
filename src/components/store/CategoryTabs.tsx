import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CategoryTabsProps {
  categories: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export const CategoryTabs = ({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  className 
}: CategoryTabsProps) => {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'whitespace-nowrap flex-shrink-0 transition-all',
            activeCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-primary'
              : 'hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {category.icon && (
            <span className="ml-2 text-lg">{category.icon}</span>
          )}
          {category.name}
        </Button>
      ))}
    </div>
  );
};