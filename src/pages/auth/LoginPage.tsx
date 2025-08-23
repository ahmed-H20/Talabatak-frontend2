import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      
      try {
        // Fetch user info from Google
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch Google user info');
        }

        const googleUserInfo = await res.json();

        // Send correct data to backend
        const result = await authService.googleAuth({
          providerId: googleUserInfo.sub, // Google user ID
          name: googleUserInfo.name,
          email: googleUserInfo.email,
          photo: googleUserInfo.picture,
          provider: 'google'
        });

        console.log("Google auth result:", result);

        // Handle different response scenarios
        if (result.isNewUser && result.needsProfileCompletion) {
          // New Google user needs to complete profile
          toast({
            title: "مرحباً بك!",
            description: "يرجى إكمال ملفك الشخصي للمتابعة",
            className: "bg-blue-500 text-white"
          });
          
          // Update auth context with incomplete user
          if (setUser) {
            setUser(result.user);
          }
          
          navigate('/auth/complete-profile');
          return;
        }

        // Existing user or completed profile
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك ${result.user.name}`,
          className: "bg-success text-success-foreground"
        });

        // Update auth context
        if (setUser) {
          setUser(result.user);
        }

        // Navigate based on role and delivery status
        if (result.user.role === "delivery") {
          if (result.deliveryInfo?.status === 'pending') {
            toast({
              title: "في انتظار الموافقة",
              description: "طلب التوصيل الخاص بك قيد المراجعة",
              className: "bg-yellow-500 text-white"
            });
            navigate("/");
          } else if (result.deliveryInfo?.status === 'rejected') {
            toast({
              title: "تم رفض الطلب",
              description: "تم رفض طلب التوصيل الخاص بك",
              className: "bg-destructive text-destructive-foreground"
            });
            navigate("/");
          } else {
            navigate("/deliveryDashboard");
          }
        } else if (result.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate(from);
        }
        
      } catch (error) {
        console.error("Error with Google login:", error);
        
        let errorMessage = "حدث خطأ في تسجيل الدخول بجوجل";
        
        if (error instanceof Error) {
          // Handle specific error messages
          if (error.message.includes('Missing required Google auth data')) {
            errorMessage = "بيانات جوجل غير مكتملة";
          } else if (error.message.includes('This Google account is already registered')) {
            errorMessage = "هذا الحساب مسجل مسبقاً";
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          className: "bg-destructive text-destructive-foreground"
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      setIsGoogleLoading(false);
      toast({
        title: "خطأ في تسجيل الدخول", 
        description: "فشل في تسجيل الدخول بجوجل",
        className: "bg-destructive text-destructive-foreground"
      });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.phone.trim() || !credentials.password.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال رقم الهاتف وكلمة المرور",
        className: "bg-destructive text-destructive-foreground"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(credentials.phone, credentials.password);
      console.log("Login result:", result);
      
      // Update auth context
      if (setUser) {
        setUser(result.user);
      }
      
      // Handle delivery users with different statuses
      if (result.role === "delivery") {
        if (result.deliveryInfo?.status === 'pending') {
          toast({
            title: "في انتظار الموافقة",
            description: "طلب التوصيل الخاص بك قيد المراجعة",
            className: "bg-yellow-500 text-white"
          });
          navigate("/");
        } else if (result.deliveryInfo?.status === 'rejected') {
          toast({
            title: "تم رفض الطلب", 
            description: result.deliveryInfo.rejectionReason || "تم رفض طلب التوصيل الخاص بك",
            className: "bg-destructive text-destructive-foreground"
          });
          navigate("/");
        } else {
          navigate("/deliveryDashboard");
        }
      } else if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate(from);
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${result.user.name}`,
        className: "bg-success text-success-foreground"
      });
     
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "حدث خطأ غير متوقع";
      
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('Invalid phone or password')) {
          errorMessage = "رقم الهاتف أو كلمة المرور غير صحيحة";
        } else if (error.message.includes('pending approval')) {
          errorMessage = "طلب التوصيل قيد المراجعة";
        } else if (error.message.includes('rejected')) {
          errorMessage = "تم رفض طلب التوصيل";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout dir="rtl" className="min-h-screen bg-gradient-subtle">
      <Container size="tablet" className="flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <p className="text-muted-foreground">ادخل بياناتك للوصول لحسابك</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={credentials.phone}
                    onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                    className="pr-10"
                    placeholder="أدخل رقم الهاتف"
                    required
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10"
                    placeholder="أدخل كلمة المرور"
                    required
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>
              
              <div className="text-left">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                className="w-full" 
                onClick={() => login()}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بجوجل'}
                <img 
                  width="20" 
                  height="20" 
                  src="https://img.icons8.com/fluency/48/google-logo.png" 
                  alt="google-logo" 
                  className="ml-2"
                />
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link to="/auth/register" className="text-primary hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>          
          </CardContent>
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default LoginPage;