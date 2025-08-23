import React, { useEffect, useState } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EmojiPicker from 'emoji-picker-react';

interface Category {
  _id: string;
  name: string;
  subCategories: [
    {
      _id: string;
      name: string;
    }  
  ];
  image: string;
}

const AdminCategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubcatModelOpen, setIsSubcatModelOpen] = useState(false);
  const [isEditcatModelOpen, setIsEditcatModelOpen] = useState(false);
  const [categoryData, setCategoryData] = useState({name:'', id:'', image:''})
  const [isCatModelOpen, setIsCatModelOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', subcategories: [] });
  const [subCategoryData, setSubCategoryData] = useState({ categoryId: '', subCategoryId: '', subCategoryName: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const token = localStorage.getItem('token');
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiData) => {
    setCategoryData(prev => ({
      ...prev,
      image: prev.image + emojiData.emoji
    }));
  };

  const fetchCategories = async () => {
      try {
        const res = await fetch('https://talabatak-backend2.vercel.app/api/categories', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) {
          throw new Error('فشل في تحميل التصنيفات');
        }
        const data = await res.json();
        setCategories(data.data);
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل التصنيفات',
          variant: 'destructive',
        });
      }
    };

  useEffect(() => {    
    fetchCategories();
  }, []);

  //Add sub
  const handleAddSubCategory = async() => {
    try {
        const res = await fetch('https://talabatak-backend2.vercel.app/api/subcategories', {
          method:"POST",
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            name: subCategoryData.subCategoryName,
            category : categoryData.id
          }),
        });
        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: 'فشل في انشاء التصنيف',
            variant: 'destructive',
          });
          throw new Error('فشل في انشاء التصنيف');
        }
        setIsSubcatModelOpen(false)
        setSubCategoryData({ categoryId: '', subCategoryId: '', subCategoryName: '' });
        toast({ title: 'تم انشاء التصنيف بنجاح'})
        fetchCategories();
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في انشاء التصنيف',
          variant: 'destructive',
        });
      }          
  };

  //Add Cat - Updated to include image
  const handleAddCategory = async() => {
    console.log(categoryData)
     try {
        const res = await fetch('https://talabatak-backend2.vercel.app/api/categories', {
          method:"POST",
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            name: categoryData.name,
            image: categoryData.image, // Now sending image with name
          }),
        });
        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: 'فشل في انشاء التصنيف',
            variant: 'destructive',
          });
          throw new Error('فشل في انشاء التصنيف');
        }
        setIsCatModelOpen(false)
        setCategoryData({id:'', name:'', image:''})
        toast({ title: 'تم انشاء التصنيف بنجاح'})
        fetchCategories();
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في انشاء التصنيف',
          variant: 'destructive',
        });
      }       
  };

  //Edit Cat - Updated to include image
  const handleEditCategory = async() => {
    try {
        const res = await fetch(`https://talabatak-backend2.vercel.app/api/categories/${categoryData.id}`, {
          method:"PUT",
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            name: categoryData.name,
            image: categoryData.image // Now sending image with name for editing
          }),
        });
        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: 'فشل في تعديل التصنيف',
            variant: 'destructive',
          });
          throw new Error('فشل في تعديل التصنيف');
        }
        setIsEditcatModelOpen(false)
        setCategoryData({id:'', name:'', image:''})
        toast({ title: 'تم تعديل التصنيف بنجاح'})
        fetchCategories();
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في تعديل التصنيف',
          variant: 'destructive',
        });
      }       
  }

  //Delete Category
  const handleDeleteCategory = async(categoryId: string) => {
   try{
      const res = await fetch(`https://talabatak-backend2.vercel.app/api/categories/${categoryId}`, {
        method: 'DELETE',  
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) {
          toast({ title: 'فشل في حذف التصنيفات' });
          throw new Error('فشل في حذف التصنيفات');          
          return;
        }
        toast({ title: 'تم حذف الفئة بنجاح' });
        fetchCategories();      
    }
    catch(err){
      console.log(err)
    }    
  };

  //Delete subCat
  const handleDeleteSubCategory = async(subCategoryId: string) => {
    try{
      const res = await fetch(`https://talabatak-backend2.vercel.app/api/subcategories/${subCategoryId}`, {
        method: 'DELETE',  
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) {
          toast({ title: 'فشل في حذف التصنيفات' });
          throw new Error('فشل في حذف التصنيفات');          
        }
        toast({ title: 'تم حذف الفئة بنجاح' });
        fetchCategories();      
    }
    catch(err){
      console.log(err)
    }
  };

  return (
    <BaseLayout dir="rtl" className="bg-surface">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
              <Button
                onClick={() => {
                  setIsCatModelOpen(true)
                }}
                className="gap-2 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4" />
                إضافة تصنيف جديد
              </Button>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="category-card bg-white p-4 rounded-lg border border-gray-300 shadow-md"
                >
                  <div className="category-header flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{category.image}{category.name}</h3>
                    <div className="category-actions flex gap-2">
                      <button
                        className="btn-icon edit-category bg-blue-500 text-white p-2 rounded-md"
                        onClick={()=>{
                            setCategoryData({id:category._id ,name: category.name, image: category.image}) // Fixed: use category.image instead of category.name
                            setIsEditcatModelOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-icon delete-category bg-red-500 text-white p-2 rounded-md"
                        onClick={() => {handleDeleteCategory(category._id)}}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="subcategories mb-4">
                    {category.subCategories.length > 0 ? (
                      category.subCategories.map((subCategory) => (
                        <div key={subCategory._id} className="subcategory flex justify-between items-center mb-2">
                          <span className="subcategory-tag inline-block bg-blue-100 text-blue-700 rounded-md px-3 py-1 text-sm mr-2">
                            {subCategory.name}
                          </span>
                          <div className="actions flex gap-2">
                            <button
                              className="delete-subcategory bg-red-500 text-white p-1 rounded-md"
                              onClick={() => handleDeleteSubCategory(subCategory._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">لا توجد فئات فرعية</span>
                    )}
                  </div>

                  <button
                    className="add-subcategory-btn bg-green-500 text-white p-2 rounded-md w-full flex justify-center items-center gap-2"
                    onClick={() => {
                      setCategoryData({name:'',id:category._id, image: ""})
                      setIsSubcatModelOpen(true)                      
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    إضافة فئة فرعية
                  </button>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد تصنيفات</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit category Modal */}
      <Dialog open={isEditcatModelOpen} onOpenChange={setIsEditcatModelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل التصنيف</DialogTitle>
          </DialogHeader>
          
          {/* Category Name Input */}
          <Input
            value={categoryData.name}
            onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
            placeholder="أدخل اسم التصنيف"
            className="mb-4"
          />
          
          {/* Category Image/Emoji Input */}
          <div className="relative mb-4">
            <Input
              value={categoryData.image}
              onChange={(e) => setCategoryData({...categoryData, image: e.target.value})}
              placeholder="اختر رمز للتصنيف"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPicker(val => !val)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-lg"
            >
              😀
            </button>

            {showPicker && (
              <div className="absolute z-10 top-12 left-0">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button onClick={() => setIsEditcatModelOpen(false)} variant="outline">
              إلغاء
            </Button>
            <Button onClick={handleEditCategory}>
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add subCategory */}
      <Dialog open={isSubcatModelOpen} onOpenChange={setIsSubcatModelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>اضافة فئة فرعية</DialogTitle>
          </DialogHeader>
          <Input
            value={subCategoryData.subCategoryName}
            onChange={(e) => setSubCategoryData({ ...subCategoryData, subCategoryName: e.target.value })}
            placeholder="أدخل اسم الفئة الفرعية"
            className="mb-4"
          />
          <div className="flex gap-4">            
            <Button onClick={() => setIsSubcatModelOpen(false)} variant="outline">
              إلغاء
            </Button>
            <Button 
              onClick={handleAddSubCategory} 
              variant="destructive">
              اضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category */}
      <Dialog open={isCatModelOpen} onOpenChange={setIsCatModelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>اضافة فئة</DialogTitle>
          </DialogHeader>
          
          {/* Category Name Input */}
          <Input
            value={categoryData.name}
            onChange={(e) => setCategoryData({...categoryData, name: e.target.value})}
            placeholder="أدخل اسم الفئة"
            className="mb-4"
          />
          
          {/* Category Image/Emoji Input */}
          <div dir="rtl" className="relative mb-4">
            <Input
              value={categoryData.image}
              onChange={(e) => setCategoryData({...categoryData, image: e.target.value})}
              placeholder="اختر رمز للفئة"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPicker(val => !val)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-lg"
            >
              😀
            </button>

            {showPicker && (
              <div className="absolute z-10 top-12 left-0">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          
          <div className="flex gap-4">            
            <Button onClick={() => setIsCatModelOpen(false)} variant="outline">
              إلغاء
            </Button>
            <Button 
              onClick={handleAddCategory} 
              variant="destructive">
              اضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </BaseLayout>
  );
};

export default AdminCategoriesPage;