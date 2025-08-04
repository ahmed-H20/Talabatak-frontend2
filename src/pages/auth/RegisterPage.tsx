import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, Lock, MapPin, ArrowRight } from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/hooks/use-toast';
import { authService, RegisterData } from '@/services/authService';

// Social login icons (you can replace these with actual icons)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
      location: "",
    address: '',
    role: 'user' as 'user' | 'delivery'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتان",
        className: "bg-destructive text-destructive-foreground"
      });
      setIsLoading(false);
      return;
    }

    try {
      const registerData: RegisterData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        location: formData.address,
        role: formData.role
      };

      await authService.register(registerData);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك! تم إنشاء حسابك بنجاح",
        className: "bg-green-600 text-white"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSocialLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await authService.googleAuth();
      if (result.isNewUser) {
        // Redirect to complete profile with Google data
        navigate('/auth/complete-profile', { 
          state: { 
            socialData: result.user,
            provider: 'google'
          }
        });
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بعودتك!",
          className: "bg-green-600 text-white"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول بجوجل",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setSocialLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleFacebookSignup = async () => {
    setSocialLoading(prev => ({ ...prev, facebook: true }));
    try {
      const result = await authService.facebookAuth();
      if (result.isNewUser) {
        // Redirect to complete profile with Facebook data
        navigate('/auth/complete-profile', { 
          state: { 
            socialData: result.user,
            provider: 'facebook'
          }
        });
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بعودتك!",
          className: "bg-green-600 text-white"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول بفيسبوك",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setSocialLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  return (
    <BaseLayout dir="rtl" className="min-h-screen bg-gradient-subtle">
      <Container size="tablet" className="flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <p className="text-muted-foreground">انضم إلينا وابدأ رحلة التسوق</p>
          </CardHeader>
          <CardContent>
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignup}
                disabled={socialLoading.google}
              >
                {socialLoading.google ? (
                  'جاري التسجيل...'
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="mr-2">التسجيل باستخدام جوجل</span>
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleFacebookSignup}
                disabled={socialLoading.facebook}
              >
                {socialLoading.facebook ? (
                  'جاري التسجيل...'
                ) : (
                  <>
                    <FacebookIcon />
                    <span className="mr-2">التسجيل باستخدام فيسبوك</span>
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            {/* Regular Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pr-10"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف (11 رقم)</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 11) {
                        setFormData(prev => ({ ...prev, phone: value }));
                      }
                    }}
                    className="pr-10"
                    placeholder="01xxxxxxxxx"
                    maxLength={11}
                    required
                  />
                </div>
                {formData.phone && formData.phone.length !== 11 && (
                  <p className="text-sm text-destructive mt-1">يجب أن يكون رقم الهاتف 11 رقم</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="pr-10"
                    placeholder="أدخل عنوانك"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">نوع الحساب</Label>
                <Select value={formData.role} onValueChange={(value: 'delivery' | 'user') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">عميل</SelectItem>
                    <SelectItem value="delivery">مندوب توصيل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10"
                    placeholder="أدخل كلمة المرور"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pr-10"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || formData.phone.length !== 11}>
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default RegisterPage;