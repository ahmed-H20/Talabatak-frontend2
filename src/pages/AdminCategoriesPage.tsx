import React, { useState } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  productsCount: number;
  isActive: boolean;
}

const AdminCategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'الهواتف المحمولة', description: 'جميع أنواع الهواتف الذكية', productsCount: 15, isActive: true },
    { id: '2', name: 'الأجهزة المنزلية', description: 'أجهزة كهربائية منزلية', productsCount: 8, isActive: true },
    { id: '3', name: 'الملابس', description: 'ملابس رجالية ونسائية', productsCount: 25, isActive: false },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
      toast({ title: "تم تحديث التصنيف بنجاح" });
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        productsCount: 0,
      };
      setCategories([...categories, newCategory]);
      toast({ title: "تم إضافة التصنيف بنجاح" });
    }
    
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    toast({ title: "تم حذف التصنيف بنجاح" });
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
    setIsDialogOpen(true);
  };

  return (
    <BaseLayout>
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة تصنيف جديد
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم التصنيف</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="أدخل اسم التصنيف"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="أدخل وصف التصنيف"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isActive">تصنيف نشط</Label>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingCategory ? 'تحديث' : 'إضافة'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في التصنيفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Package className="h-4 w-4" />
                      <span>{category.productsCount} منتج</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد تصنيفات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminCategoriesPage;