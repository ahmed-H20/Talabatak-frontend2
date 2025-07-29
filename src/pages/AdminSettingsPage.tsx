import React, { useState } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Globe, Mail, Phone, MapPin } from 'lucide-react';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'شاملول ستور',
    siteDescription: 'متجر إلكتروني شامل لجميع احتياجاتكم',
    siteKeywords: 'تسوق, منتجات, توصيل, السعودية',
    siteLogo: '',
    contactEmail: 'info@shamolstore.com',
    contactPhone: '+966501234567',
    address: 'الرياض، المملكة العربية السعودية',
    workingHours: 'السبت - الخميس: 9:00 ص - 10:00 م',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    whatsappNumber: '+966501234567',
  });

  const [deliverySettings, setDeliverySettings] = useState({
    deliveryEnabled: true,
    freeDeliveryAmount: 200,
    deliveryFee: 15,
    estimatedDeliveryTime: '2-4 أيام عمل',
    deliveryAreas: 'الرياض، جدة، الدمام',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    cashOnDelivery: true,
    creditCard: true,
    applePay: false,
    stcPay: true,
    currency: 'SAR',
    taxRate: 15,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    newOrder: true,
  });

  const handleSiteSettingsSave = () => {
    // Here you would save to backend
    toast({ title: "تم حفظ إعدادات الموقع بنجاح" });
  };

  const handleDeliverySettingsSave = () => {
    // Here you would save to backend
    toast({ title: "تم حفظ إعدادات التوصيل بنجاح" });
  };

  const handlePaymentSettingsSave = () => {
    // Here you would save to backend
    toast({ title: "تم حفظ إعدادات الدفع بنجاح" });
  };

  const handleNotificationSettingsSave = () => {
    // Here you would save to backend
    toast({ title: "تم حفظ إعدادات الإشعارات بنجاح" });
  };

  return (
    <BaseLayout>
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">إعدادات الموقع</h1>
            
            <Tabs defaultValue="site" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="site">إعدادات الموقع</TabsTrigger>
                <TabsTrigger value="delivery">التوصيل</TabsTrigger>
                <TabsTrigger value="payment">الدفع</TabsTrigger>
                <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
              </TabsList>

              {/* Site Settings */}
              <TabsContent value="site">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      إعدادات الموقع العامة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="siteName">اسم الموقع</Label>
                        <Input
                          id="siteName"
                          value={siteSettings.siteName}
                          onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={siteSettings.contactEmail}
                          onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="siteDescription">وصف الموقع</Label>
                      <Textarea
                        id="siteDescription"
                        value={siteSettings.siteDescription}
                        onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="siteKeywords">الكلمات المفتاحية</Label>
                      <Input
                        id="siteKeywords"
                        value={siteSettings.siteKeywords}
                        onChange={(e) => setSiteSettings({...siteSettings, siteKeywords: e.target.value})}
                        placeholder="فصل الكلمات بفاصلة"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="contactPhone">رقم الهاتف</Label>
                        <Input
                          id="contactPhone"
                          value={siteSettings.contactPhone}
                          onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="whatsappNumber">رقم الواتساب</Label>
                        <Input
                          id="whatsappNumber"
                          value={siteSettings.whatsappNumber}
                          onChange={(e) => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Textarea
                        id="address"
                        value={siteSettings.address}
                        onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="workingHours">ساعات العمل</Label>
                      <Input
                        id="workingHours"
                        value={siteSettings.workingHours}
                        onChange={(e) => setSiteSettings({...siteSettings, workingHours: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="facebookUrl">رابط الفيسبوك</Label>
                        <Input
                          id="facebookUrl"
                          value={siteSettings.facebookUrl}
                          onChange={(e) => setSiteSettings({...siteSettings, facebookUrl: e.target.value})}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="twitterUrl">رابط تويتر</Label>
                        <Input
                          id="twitterUrl"
                          value={siteSettings.twitterUrl}
                          onChange={(e) => setSiteSettings({...siteSettings, twitterUrl: e.target.value})}
                          placeholder="https://twitter.com/yourpage"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="instagramUrl">رابط انستجرام</Label>
                        <Input
                          id="instagramUrl"
                          value={siteSettings.instagramUrl}
                          onChange={(e) => setSiteSettings({...siteSettings, instagramUrl: e.target.value})}
                          placeholder="https://instagram.com/yourpage"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSiteSettingsSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      حفظ الإعدادات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Delivery Settings */}
              <TabsContent value="delivery">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات التوصيل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="deliveryEnabled">تفعيل خدمة التوصيل</Label>
                      <Switch
                        id="deliveryEnabled"
                        checked={deliverySettings.deliveryEnabled}
                        onCheckedChange={(checked) => setDeliverySettings({...deliverySettings, deliveryEnabled: checked})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="deliveryFee">رسوم التوصيل (ريال)</Label>
                        <Input
                          id="deliveryFee"
                          type="number"
                          value={deliverySettings.deliveryFee}
                          onChange={(e) => setDeliverySettings({...deliverySettings, deliveryFee: Number(e.target.value)})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="freeDeliveryAmount">مبلغ التوصيل المجاني (ريال)</Label>
                        <Input
                          id="freeDeliveryAmount"
                          type="number"
                          value={deliverySettings.freeDeliveryAmount}
                          onChange={(e) => setDeliverySettings({...deliverySettings, freeDeliveryAmount: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="estimatedDeliveryTime">وقت التوصيل المتوقع</Label>
                      <Input
                        id="estimatedDeliveryTime"
                        value={deliverySettings.estimatedDeliveryTime}
                        onChange={(e) => setDeliverySettings({...deliverySettings, estimatedDeliveryTime: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="deliveryAreas">مناطق التوصيل</Label>
                      <Textarea
                        id="deliveryAreas"
                        value={deliverySettings.deliveryAreas}
                        onChange={(e) => setDeliverySettings({...deliverySettings, deliveryAreas: e.target.value})}
                        rows={3}
                        placeholder="اكتب المناطق مفصولة بفاصلة"
                      />
                    </div>

                    <Button onClick={handleDeliverySettingsSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      حفظ إعدادات التوصيل
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الدفع</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">طرق الدفع المتاحة</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cashOnDelivery">الدفع عند الاستلام</Label>
                          <Switch
                            id="cashOnDelivery"
                            checked={paymentSettings.cashOnDelivery}
                            onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, cashOnDelivery: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="creditCard">البطاقة الائتمانية</Label>
                          <Switch
                            id="creditCard"
                            checked={paymentSettings.creditCard}
                            onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, creditCard: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="applePay">Apple Pay</Label>
                          <Switch
                            id="applePay"
                            checked={paymentSettings.applePay}
                            onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, applePay: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="stcPay">STC Pay</Label>
                          <Switch
                            id="stcPay"
                            checked={paymentSettings.stcPay}
                            onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, stcPay: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="currency">العملة</Label>
                        <Input
                          id="currency"
                          value={paymentSettings.currency}
                          onChange={(e) => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="taxRate">معدل الضريبة (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={paymentSettings.taxRate}
                          onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <Button onClick={handlePaymentSettingsSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      حفظ إعدادات الدفع
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الإشعارات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">إشعارات العملاء</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
                          <Switch
                            id="emailNotifications"
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="smsNotifications">الرسائل النصية</Label>
                          <Switch
                            id="smsNotifications"
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="orderConfirmation">تأكيد الطلب</Label>
                          <Switch
                            id="orderConfirmation"
                            checked={notificationSettings.orderConfirmation}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderConfirmation: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="orderShipped">شحن الطلب</Label>
                          <Switch
                            id="orderShipped"
                            checked={notificationSettings.orderShipped}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderShipped: checked})}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="orderDelivered">تسليم الطلب</Label>
                          <Switch
                            id="orderDelivered"
                            checked={notificationSettings.orderDelivered}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderDelivered: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">إشعارات الإدارة</h3>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newOrder">طلب جديد</Label>
                        <Switch
                          id="newOrder"
                          checked={notificationSettings.newOrder}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newOrder: checked})}
                        />
                      </div>
                    </div>

                    <Button onClick={handleNotificationSettingsSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      حفظ إعدادات الإشعارات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AdminSettingsPage;