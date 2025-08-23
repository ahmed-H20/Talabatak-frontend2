import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, MapPin, User, Phone, Mail, Lock, Image, FileText, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DeliveryRegistrationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    // Basic user info
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    
    // Delivery-specific info
    fullName: '',
    nationalId: '',
    workingCity: '',
    idCardImage: null,
    coordinates: null
  });
  const navigate = useNavigate();
  
  const onBackToLogin = () => navigate('/auth/login')
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [previewImage, setPreviewImage] = useState(null);
  const { toast } = useToast();

  const egyptianCities = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'القليوبية', 
    'كفر الشيخ', 'الغربية', 'المنوفية', 'البحيرة', 'الإسماعيلية', 'بورسعيد',
    'السويس', 'شمال سيناء', 'جنوب سيناء', 'دمياط', 'الفيوم', 'بني سويف',
    'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر',
    'الوادي الجديد', 'مطروح'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'خطأ',
          description: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت',
          variant: 'destructive'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setFormData(prev => ({
          ...prev,
          idCardImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: [longitude, latitude]
          }));
          toast({
            title: 'تم تحديد الموقع',
            description: 'تم الحصول على موقعك الحالي بنجاح'
          });
        },
        (error) => {
          toast({
            title: 'خطأ في تحديد الموقع',
            description: 'تعذر الحصول على موقعك الحالي',
            variant: 'destructive'
          });
        }
      );
    } else {
      toast({
        title: 'غير مدعوم',
        description: 'المتصفح لا يدعم تحديد الموقع',
        variant: 'destructive'
      });
    }
  };

  const validateStep1 = () => {
    const { name, phone, email, password, confirmPassword, location } = formData;
    
    if (!name.trim()) {
      toast({ title: 'خطأ', description: 'اسم المستخدم مطلوب', variant: 'destructive' });
      return false;
    }
    
    if (!phone.trim() || phone.length < 11) {
      toast({ title: 'خطأ', description: 'رقم الهاتف غير صحيح', variant: 'destructive' });
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'خطأ', description: 'البريد الإلكتروني غير صحيح', variant: 'destructive' });
      return false;
    }
    
    if (!password || password.length < 6) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({ title: 'خطأ', description: 'كلمة المرور غير متطابقة', variant: 'destructive' });
      return false;
    }
    
    if (!location.trim()) {
      toast({ title: 'خطأ', description: 'العنوان مطلوب', variant: 'destructive' });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { fullName, nationalId, workingCity } = formData;
    
    if (!fullName.trim()) {
      toast({ title: 'خطأ', description: 'الاسم الكامل مطلوب', variant: 'destructive' });
      return false;
    }
    
    if (!nationalId.trim() || nationalId.length !== 14) {
      toast({ title: 'خطأ', description: 'رقم الهوية الوطنية يجب أن يكون 14 رقم', variant: 'destructive' });
      return false;
    }
    
    if (!workingCity) {
      toast({ title: 'خطأ', description: 'مدينة العمل مطلوبة', variant: 'destructive' });
      return false;
    }
    
    // if (!formData.idCardImage) {
    //   toast({ title: 'خطأ', description: 'صورة الهوية الوطنية مطلوبة', variant: 'destructive' });
    //   return false;
    // }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const registrationData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        role: 'delivery',
        deliveryInfo: {
          fullName: formData.fullName,
          nationalId: formData.nationalId,
          workingCity: formData.workingCity,
        //   idCardImage: formData.idCardImage
        },
        coordinates: formData.coordinates
      };
      console.log(registrationData)
      const response = await fetch('https://talabatak-backend2.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في التسجيل');
      }

      toast({
        title: 'تم التسجيل بنجاح',
        description: 'تم إرسال طلبك للمراجعة، ستتم مراسلتك عند الموافقة',
      });

      if (onSuccess) {
        onSuccess(data);
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'خطأ في التسجيل',
        description: error.message || 'حدث خطأ أثناء التسجيل',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">تسجيل مندوب توصيل</CardTitle>
        <p className="text-muted-foreground">
          {step === 1 ? 'المعلومات الأساسية' : 'معلومات التوصيل'}
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">العنوان</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="location"
                  placeholder="أدخل عنوانك التفصيلي"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pr-10 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="الاسم الكامل كما هو مكتوب في الهوية"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">رقم الهوية الوطنية</Label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nationalId"
                  type="text"
                  placeholder="14 رقم"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  className="pr-10"
                  maxLength={14}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingCity">مدينة العمل</Label>
              <Select 
                value={formData.workingCity} 
                onValueChange={(value) => handleInputChange('workingCity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مدينة العمل" />
                </SelectTrigger>
                <SelectContent>
                  {egyptianCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>صورة الهوية الوطنية</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {previewImage ? (
                  <div className="space-y-2">
                    <img
                      src={previewImage}
                      alt="معاينة الهوية"
                      className="max-w-full h-32 object-contain mx-auto rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData(prev => ({ ...prev, idCardImage: null }));
                      }}
                    >
                      إزالة الصورة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('idCardImage').click()}
                      >
                        <Image className="h-4 w-4 ml-2" />
                        اختر صورة الهوية
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG أقل من 5MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="idCardImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الموقع الجغرافي (اختياري)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="flex-1"
                >
                  <MapIcon className="h-4 w-4 ml-2" />
                  تحديد الموقع الحالي
                </Button>
                {formData.coordinates && (
                  <div className="text-xs text-green-600 self-center">
                    ✓ تم تحديد الموقع
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                سيساعد تحديد موقعك في عرض الطلبات القريبة منك
              </p>
            </div>
          </>
        )}

        <div className="space-y-3 pt-4">
          {step === 1 ? (
            <Button 
              onClick={handleNextStep} 
              className="w-full"
              disabled={isLoading}
            >
              التالي
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={handleNextStep} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'جاري التسجيل...' : 'تسجيل كمندوب توصيل'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep(1)} 
                className="w-full"
                disabled={isLoading}
              >
                السابق
              </Button>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            onClick={onBackToLogin} 
            className="w-full"
          >
            العودة لتسجيل الدخول
          </Button>
        </div>

        {step === 2 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>ملاحظة:</strong> سيتم مراجعة طلبك من قبل الإدارة خلال 24-48 ساعة. 
              ستتلقى إشعاراً عند الموافقة على طلبك.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryRegistrationForm;