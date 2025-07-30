// Mock data for the e-commerce store

import { Product } from '@/components/store/ProductCard';

export const categories = [
  { id: 'all', name: 'الكل', icon: '🛍️' },
  { id: 'fruits', name: 'فواكه', icon: '🍎' },
  { id: 'vegetables', name: 'خضروات', icon: '🥕' },
  { id: 'dairy', name: 'ألبان', icon: '🥛' },
  { id: 'meat', name: 'لحوم', icon: '🥩' },
  { id: 'bakery', name: 'مخبوزات', icon: '🍞' },
  { id: 'beverages', name: 'مشروبات', icon: '🥤' }
];

export const mockProducts: Product[] = [
  // Fruits
  {
    id: 'fruits-1',
    name: 'تفاح أحمر طازج من المزارع المحلية',
    description: 'تفاح أحمر طازج عالي الجودة من المزارع المحلية',
    price: 12,
    originalPrice: 15,
    image: '🍎',
    rating: 4.8,
    reviewCount: 124,
    unit: 'كيلو',
    discount: 20,
    isNew: false,
    isFavorite: false,
    inStock: true,
    category: 'فواكه',
    subCategory: 'تفاح',
    store: 'متجر الرياض'
  },
  {
    id: 'fruits-2',
    name: 'موز عضوي طبيعي',
    description: 'موز عضوي طبيعي غني بالفيتامينات',
    price: 8,
    image: '🍌',
    rating: 4.6,
    reviewCount: 89,
    unit: 'كيلو',
    isNew: true,
    isFavorite: true,
    inStock: true,
    category: 'فواكه',
    subCategory: 'موز',
    store: 'متجر جدة'
  },
  {
    id: 'fruits-3',
    name: 'برتقال طبيعي حلو',
    description: 'برتقال طبيعي حلو غني بفيتامين C',
    price: 10,
    originalPrice: 12,
    image: '🍊',
    rating: 4.9,
    reviewCount: 156,
    unit: 'كيلو',
    discount: 17,
    isNew: false,
    isFavorite: false,
    inStock: true,
    category: 'فواكه',
    subCategory: 'حمضيات',
    store: 'متجر الدمام'
  },
  {
    id: 'fruits-4',
    name: 'عنب أحمر بدون بذور',
    price: 25,
    image: '🍇',
    rating: 4.7,
    reviewCount: 67,
    unit: 'كيلو',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'fruits-5',
    name: 'فراولة طازجة محلية',
    price: 18,
    originalPrice: 22,
    image: '🍓',
    rating: 4.9,
    reviewCount: 203,
    unit: 'علبة',
    discount: 18,
    isNew: true,
    isFavorite: false,
    inStock: true
  },

  // Vegetables
  {
    id: 'vegetables-1',
    name: 'جزر طازج',
    price: 6,
    image: '🥕',
    rating: 4.5,
    reviewCount: 78,
    unit: 'كيلو',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'vegetables-2',
    name: 'طماطم حمراء ناضجة',
    price: 9,
    image: '🍅',
    rating: 4.4,
    reviewCount: 92,
    unit: 'كيلو',
    isNew: false,
    isFavorite: true,
    inStock: true
  },
  {
    id: 'vegetables-3',
    name: 'خيار طازج',
    price: 7,
    image: '🥒',
    rating: 4.3,
    reviewCount: 45,
    unit: 'كيلو',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'vegetables-4',
    name: 'بروكولي أخضر',
    price: 14,
    image: '🥦',
    rating: 4.6,
    reviewCount: 34,
    unit: 'حبة',
    isNew: true,
    isFavorite: false,
    inStock: true
  },

  // Dairy
  {
    id: 'dairy-1',
    name: 'حليب طازج كامل الدسم',
    price: 5,
    image: '🥛',
    rating: 4.7,
    reviewCount: 167,
    unit: 'لتر',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'dairy-2',
    name: 'جبن أبيض طبيعي',
    price: 20,
    image: '🧀',
    rating: 4.8,
    reviewCount: 89,
    unit: 'كيلو',
    isNew: false,
    isFavorite: true,
    inStock: true
  },
  {
    id: 'dairy-3',
    name: 'زبدة طبيعية',
    price: 15,
    originalPrice: 18,
    image: '🧈',
    rating: 4.5,
    reviewCount: 56,
    unit: 'علبة',
    discount: 17,
    isNew: false,
    isFavorite: false,
    inStock: true
  },

  // Meat
  {
    id: 'meat-1',
    name: 'لحم غنم طازج',
    price: 65,
    image: '🥩',
    rating: 4.9,
    reviewCount: 145,
    unit: 'كيلو',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'meat-2',
    name: 'دجاج طازج محلي',
    price: 18,
    image: '🍗',
    rating: 4.6,
    reviewCount: 234,
    unit: 'كيلو',
    isNew: false,
    isFavorite: true,
    inStock: true
  },

  // Bakery
  {
    id: 'bakery-1',
    name: 'خبز عربي طازج',
    price: 3,
    image: '🍞',
    rating: 4.7,
    reviewCount: 198,
    unit: 'كيس',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'bakery-2',
    name: 'كرواسان زبدة',
    price: 12,
    image: '🥐',
    rating: 4.5,
    reviewCount: 67,
    unit: 'قطعة',
    isNew: true,
    isFavorite: false,
    inStock: true
  },

  // Beverages
  {
    id: 'beverages-1',
    name: 'عصير برتقال طبيعي',
    price: 8,
    image: '🧃',
    rating: 4.4,
    reviewCount: 123,
    unit: 'زجاجة',
    isNew: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: 'beverages-2',
    name: 'ماء معدني',
    price: 2,
    image: '💧',
    rating: 4.8,
    reviewCount: 345,
    unit: 'زجاجة',
    isNew: false,
    isFavorite: false,
    inStock: true
  }
];

// Cart item interface
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

// Order status types
export type OrderStatus = 'processing' | 'delivered' | 'rejected' | 'pending';

// Mock cart data
export const mockCartItems: CartItem[] = [
  {
    id: '1',
    product: mockProducts[0], // Apple
    quantity: 2
  },
  {
    id: '2', 
    product: mockProducts[1], // Banana
    quantity: 1
  }
];