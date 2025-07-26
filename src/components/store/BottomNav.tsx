import { Home, ShoppingCart, Package, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  cartItemCount?: number;
}

export const BottomNav = ({ cartItemCount = 0 }: BottomNavProps) => {
  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'الرئيسية',
      exact: true
    },
    {
      to: '/cart',
      icon: ShoppingCart,
      label: 'السلة',
      badge: cartItemCount
    },
    {
      to: '/orders',
      icon: Package,
      label: 'طلباتي'
    },
    {
      to: '/profile',
      icon: User,
      label: 'حسابي'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-light z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px] relative',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn('text-xs mt-1', isActive && 'font-medium text-primary')}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};