import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowRight } from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const phone = location.state?.phone;

  useEffect(() => {
    if (!phone) {
      navigate('/auth/forgot-password');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتان",
        className: "bg-destructive text-destructive-foreground"
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        className: "bg-destructive text-destructive-foreground"
      });
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword(phone, formData.otp, formData.newPassword);
      
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
        className: "bg-success text-success-foreground"
      });

      navigate('/auth/login');
    } catch (error) {
      toast({
        title: "خطأ في إعادة التعيين",
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
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
            <p className="text-muted-foreground">
              أدخل رمز التحقق وكلمة المرور الجديدة
              <br />
              <span className="font-medium">{phone}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="otp">رمز التحقق</Label>
                <Input
                  id="otp"
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    otp: e.target.value.replace(/\D/g, '').slice(0, 6) 
                  }))}
                  className="text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="pr-10"
                    placeholder="أدخل كلمة المرور الجديدة"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || formData.otp.length !== 6}
              >
                {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default ResetPasswordPage;