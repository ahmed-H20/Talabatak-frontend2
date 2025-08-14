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
import { json } from 'stream/consumers';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';


const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    setIsLoading(true);
    
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

      // TEMPORARY: Create a mock user object that matches your app's format
      const mockUser = {
        _id: googleUserInfo.sub,
        name: googleUserInfo.name,
        phone: '', // Empty for now - user can add later
        email: googleUserInfo.email,
        location: {
          coordinates: [0, 0],
          address: ''
        },
        role: "user", // Default role
        isPhoneVerified: false,
        photo: googleUserInfo.picture,
        provider: 'google',
        providerId: googleUserInfo.sub
      };

      // Store temporary session data
      localStorage.setItem("token", `google_${tokenResponse.access_token}`);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("isGoogleAuth", "true");

      console.log("User logged in with Google:", mockUser);

      // Navigate to main page (Google users are typically regular users)
      navigate("/");
      window.location.reload();

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${mockUser.name}`,
        className: "bg-success text-success-foreground"
      });
      
    } catch (error) {
      console.error("Error with Google login:", error);
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error instanceof Error ? error.message : "حدث خطأ في تسجيل الدخول بجوجل",
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setIsLoading(false);
    }
  },
  onError: (error) => {
    console.error("Google Login Failed:", error);
    toast({
      title: "خطأ في تسجيل الدخول", 
      description: "فشل في تسجيل الدخول بجوجل",
      className: "bg-destructive text-destructive-foreground"
    });
  },
});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.login(credentials.phone, credentials.password);
      console.log(result.role)
      if (result.role == "delivery"){
        navigate("/deliveryDashboard");      
      }
      else if(result.role == "admin"){
        navigate("/admin/dashboard");
      }
      else{
        navigate("/");
        window.location.reload();
      }    
      

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${result.user.name}`,
        className: "bg-success text-success-foreground"
      });
     
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
              {/* <GoogleLogin
                onSuccess={credentialResponse => {
                  console.log(credentialResponse);
                  login()
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
              /> */}
              <Button 
                className='bg-white text-black w-full' 
                onClick={() => login()}
                disabled={isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'Sign in with Google'}
                <img width="30" height="30" src="https://img.icons8.com/fluency/48/google-logo.png" alt="google-logo"/>
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