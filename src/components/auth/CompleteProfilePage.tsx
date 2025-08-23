import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MapPin, User, UserCheck } from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const CompleteProfilePage = () => {
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    role: 'user' as 'user' | 'delivery',
    coordinates: null as [number, number] | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = authService.getCurrentUser();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "غير مدعوم",
        description: "المتصفح لا يدعم تحديد الموقع",
        className: "bg-destructive text-destructive-foreground"
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          coordinates: [longitude, latitude]
        }));
        
        toast({
          title: "تم تحديد الموقع",
          description: "تم الحصول على موقعك الحالي بنجاح",
          className: "bg-success text-success-foreground"
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: "خطأ في تحديد الموقع",
          description: "تعذر الحصول على موقعك الحالي. يمكنك المتابعة بدون تحديد الموقع",
          className: "bg-destructive text-destructive-foreground"
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "رقم الهاتف مطلوب",
        className: "bg-destructive text-destructive-foreground"
      });
      return false;
    }

    if (formData.phone.length !== 11 || !/^\d{11}$/.test(formData.phone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "رقم الهاتف يجب أن يكون 11 رقماً",
        className: "bg-destructive text-destructive-foreground"
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "العنوان مطلوب",
        className: "bg-destructive text-destructive-foreground"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const locationData = {
        coordinates: formData.coordinates || [0, 0],
        address: formData.address
      };

      const result = await authService.completeSocialProfile({
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        location: locationData
      });

      // The authService.completeSocialProfile already handles token storage
      // No need to manually store the token here

      toast({
        title: "تم إكمال الملف الشخصي",
        description: "تم حفظ بياناتك بنجاح",
        className: "bg-success text-success-foreground"
      });

      // Small delay to show success message
      setTimeout(() => {
        // Navigate based on user role
        switch (result.user.role) {
          case 'delivery':
            navigate('/deliveryDashboard', { replace: true });
            break;
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Profile completion error:', error);
      
      // Handle specific error cases
      let errorMessage = "حدث خطأ غير متوقع";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (errorMessage.includes('Phone number is already registered')) {
        errorMessage = "رقم الهاتف مسجل مسبقاً";
      } else if (errorMessage.includes('Phone number must be exactly 11 digits')) {
        errorMessage = "رقم الهاتف يجب أن يكون 11 رقماً";
      }

      toast({
        title: "خطأ في حفظ البيانات",
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  // Check if user is Google user and needs profile completion
  if (user.provider === 'local' || user.profileComplete) {
    // User doesn't need profile completion, redirect to home
    navigate('/');
    return null;
  }

  return (
    <BaseLayout dir="rtl" className="min-h-screen bg-gradient-subtle">
      <Container size="tablet" className="flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">إكمال الملف الشخصي</CardTitle>
            <p className="text-muted-foreground">
              مرحباً {user.name}، يرجى إكمال بياناتك للمتابعة
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pr-10"
                    placeholder="01xxxxxxxxx"
                    required
                    disabled={isLoading}
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  يجب أن يكون رقم الهاتف 11 رقماً
                </p>
              </div>

              <div>
                <Label htmlFor="address">العنوان التفصيلي *</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="pr-10 resize-none"
                    placeholder="مثال: المنصورة، شارع الجيش، بجوار مسجد النور، الدور الثالث"
                    required
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">نوع الحساب</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'user' | 'delivery') => handleInputChange('role', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>مستخدم عادي</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery">
                      <div className="flex items-center gap-2">
                        <span>🚴‍♂️</span>
                        <span>مندوب توصيل</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الموقع الجغرافي (اختياري)</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoading || isGettingLocation}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 ml-2" />
                    {isGettingLocation ? 'جاري تحديد الموقع...' : 'تحديد الموقع الحالي'}
                  </Button>
                  
                  {formData.coordinates && (
                    <div className="text-xs text-success bg-success/10 p-2 rounded-md text-center">
                      ✓ تم تحديد موقعك الجغرافي بنجاح
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    سيساعد تحديد موقعك في عرض الخدمات والعروض القريبة منك
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ والمتابعة'}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  <strong>ملاحظة:</strong> يمكنك تعديل هذه البيانات لاحقاً من إعدادات الحساب
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default CompleteProfilePage;