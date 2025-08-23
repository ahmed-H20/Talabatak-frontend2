import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    location: '',
    role: 'user'
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://talabatak-backend2-zw4i.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (!response.ok) {
        throw new Error(data.message || 'فشل في التسجيل');
      }

      toast({
        title: 'تم التسجيل بنجاح',
        description: 'تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن'
      });

      navigate('/');

    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir='rtl' className="max-w-md mx-auto mt-10 p-6 border rounded-md shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">تسجيل مستخدم جديد</h2>
      <form dir='rtl' onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>الاسم الكامل</Label>
          <Input
            placeholder="مثال: أحمد هشام"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div>
          <Label>رقم الهاتف</Label>
          <Input
            placeholder="مثال: 01012345678"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div>
          <Label>البريد الإلكتروني</Label>
          <Input
            type="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div>
          <Label>كلمة المرور</Label>
          <Input
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />
        </div>

        <div>
          <Label>العنوان</Label>
          <Input
            placeholder="مثال: المنصورة - شارع الجيش"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </Button>

        <div className="text-center text-muted-foreground pt-2 text-sm">أو</div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 border-primary text-primary font-semibold hover:bg-primary/10"
          onClick={() => navigate('/auth/register-delivery')}
        >
          🚴‍♂️ التسجيل كمندوب توصيل
        </Button>

        {/* ✅ زرار تسجيل الدخول */}
        <div className="text-center mt-4 text-sm">
          عندك حساب؟{' '}
          <button
            type="button"
            className="text-primary underline hover:opacity-80"
            onClick={() => navigate('/auth/login')}
          >
            سجل الدخول
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
