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

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.login(credentials.phone, credentials.password);
      
      navigate(from, { replace: true });

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