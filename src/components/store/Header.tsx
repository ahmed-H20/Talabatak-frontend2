import { Search, ShoppingCart, Menu, MapPin, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

export const Header = ({ 
  cartItemCount = 0, 
  onCartClick, 
  onMenuClick 
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-background border-b border-light sticky top-0 z-40 backdrop-blur-sm bg-background/95">
      <div className="container-desktop py-3">
        <div className="flex items-center gap-4">
          {/* Menu Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">متجري</span>
          </div>

          {/* Location (Desktop) */}
          <div className="hidden md:flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">الرياض</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-surface border-input-border"
              />
            </div>
          </div>

          {/* User Menu / Login */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  مرحباً، {user?.name}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <ShoppingCart className="ml-2 h-4 w-4" />
                    طلباتي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth/login">
                <User className="ml-2 h-4 w-4" />
                تسجيل الدخول
              </Link>
            </Button>
          )}

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs cart-badge"
              >
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};