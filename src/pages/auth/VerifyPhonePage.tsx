import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, ArrowRight } from 'lucide-react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const VerifyPhonePage = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const phone = location.state?.phone;

  useEffect(() => {
    if (!phone) {
      navigate('/auth/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phone, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.verifyPhone(phone, otp);
      
      toast({
        title: "تم التحقق بنجاح",
        description: "تم تفعيل حسابك بنجاح",
        className: "bg-success text-success-foreground"
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "خطأ في التحقق",
        description: error instanceof Error ? error.message : "رمز التحقق غير صحيح",
        className: "bg-destructive text-destructive-foreground"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // You would need to call a resend OTP endpoint
      // For now, we'll just show a toast
      toast({
        title: "تم إرسال الرمز",
        description: "تم إرسال رمز تحقق جديد إلى رقم هاتفك",
        className: "bg-success text-success-foreground"
      });
      setTimeLeft(600); // Reset timer
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال رمز التحقق",
        className: "bg-destructive text-destructive-foreground"
      });
    }
  };

  return (
    <BaseLayout dir="rtl" className="min-h-screen bg-gradient-subtle">
      <Container size="tablet" className="flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">تحقق من رقم الهاتف</CardTitle>
            <p className="text-muted-foreground">
              تم إرسال رمز التحقق إلى
              <br />
              <span className="font-medium">{phone}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="otp">رمز التحقق</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  أدخل الرمز المكون من 6 أرقام
                </p>
              </div>

              {timeLeft > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  سينتهي الرمز خلال: {formatTime(timeLeft)}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={timeLeft > 0}
                  className="text-sm"
                >
                  {timeLeft > 0 ? 'إعادة الإرسال متاحة بعد انتهاء الوقت' : 'إعادة إرسال الرمز'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default VerifyPhonePage;