import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderTree, 
  Settings,
  Store
} from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    {
      title: 'لوحة التحكم',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'الطلبات',
      href: '/admin/orders',
      icon: ShoppingCart
    },
    {
      title: 'المنتجات',
      href: '/admin/products',
      icon: Package
    },
    {
      title: 'التصنيفات',
      href: '/admin/categories',
      icon: FolderTree
    },
    {
      title: 'إعدادات المتجر',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <div className="w-64 bg-white border-l border-border h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">شاملول ستور</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Back to Store */}
      <div className="p-4 mt-auto border-t border-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
        >
          <Store className="h-5 w-5" />
          <span>العودة للمتجر</span>
        </NavLink>
      </div>
    </div>
  );
};

export { AdminSidebar };