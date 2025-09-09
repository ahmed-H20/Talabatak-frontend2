import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Eye,
  User,
  Phone,
  MapPin,
  FileText,
  Truck,
  Star,
  AlertCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const AdminDeliveryManagement = () => {
  const [applications, setApplications] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('applications');
  const { toast } = useToast();

  const token = localStorage.getItem('token');

  // API call helper
  const apiCall = async (url, options = {}) => {
    const response = await fetch(`http://localhost:5000/api${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      const data = await response.json();
      toast(data.message || 'حدث خطأ');
      throw new Error(data.message || 'حدث خطأ');
    }

    return response.json();
  };

  // Load delivery applications
  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/delivery/applications?status=${statusFilter}`);
      setApplications(data.applications || []);
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

  // Load approved delivery persons
  const loadDeliveryPersons = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/delivery/applications?status=approved');
      setDeliveryPersons(data.applications || []);
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

  // Approve application
  const approveApplication = async (applicationId) => {
    try {
      await apiCall(`/delivery/approve/${applicationId}`, {
        method: 'PATCH'
      });

      // Update application status in state
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, deliveryStatus: 'approved' }
          : app
      ));

      toast({
        title: '✅ تم الموافقة',
        description: 'تم الموافقة على طلب التوصيل بنجاح'
      });

      setSelectedApplication(null);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Reject application
  const rejectApplication = async (applicationId) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال سبب الرفض',
        variant: 'destructive'
      });
      return;
    }

    try {
      await apiCall(`/delivery/reject/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectionReason })
      });

      // Update application status in state
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, deliveryStatus: 'rejected', rejectionReason }
          : app
      ));

      toast({
        title: '❌ تم الرفض',
        description: 'تم رفض طلب التوصيل'
      });

      setSelectedApplication(null);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm) ||
      app.deliveryInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.deliveryInfo?.nationalId?.includes(searchTerm);
    
    return matchesSearch;
  });

  // Helper functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else {
      loadDeliveryPersons();
    }
  }, [statusFilter, activeTab]);

  return (
    <BaseLayout dir="rtl" className="bg-surface">
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">إدارة التوصيل</h1>
              </div>
              
              <Button 
                onClick={activeTab === 'applications' ? loadApplications : loadDeliveryPersons}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === 'applications' ? 'default' : 'outline'}
                onClick={() => setActiveTab('applications')}
              >
                طلبات التوصيل
              </Button>
              <Button
                variant={activeTab === 'delivery-persons' ? 'default' : 'outline'}
                onClick={() => setActiveTab('delivery-persons')}
              >
                مندوبي التوصيل
              </Button>
            </div>
            
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو الهاتف أو رقم الهوية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              {activeTab === 'applications' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبات</SelectItem>
                    <SelectItem value="pending">بانتظار المراجعة</SelectItem>
                    <SelectItem value="approved">موافق عليها</SelectItem>
                    <SelectItem value="rejected">مرفوضة</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'applications' ? (
              /* Applications Tab */
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">جاري تحميل الطلبات...</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
                      <p className="text-gray-500">
                        {applications.length === 0 
                          ? 'لم يتم استلام أي طلبات توصيل بعد'
                          : 'لا توجد طلبات تطابق معايير البحث'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredApplications.map((application, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{application.deliveryInfo?.fullName}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              تقدم بالطلب في: {formatDate(application.createdAt)}
                            </p>
                          </div>
                          <Badge className={getStatusVariant(application.deliveryStatus)}>
                            {getStatusIcon(application.deliveryStatus)}
                            <span className="mr-1">{getStatusText(application.deliveryStatus)}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Personal Info */}
                          <div>
                            <h4 className="font-medium mb-3 text-gray-900">المعلومات الشخصية</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">الاسم:</span>
                                <span>{application.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">الهاتف:</span>
                                <span>{application.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">البريد:</span>
                                <span>{application.email}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                <span className="font-medium">العنوان:</span>
                                <span>
                                  {application.location?.coordinates
                                    ? application.location.coordinates.join(", ")
                                    : "No location"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div>
                            <h4 className="font-medium mb-3 text-gray-900">معلومات التوصيل</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">رقم الهوية:</span>
                                <span>{application.deliveryInfo?.nationalId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">مدينة العمل:</span>
                                <span>{application.deliveryInfo?.workingCity}</span>
                              </div>
                              {application.deliveryInfo?.approvedAt && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">تاريخ الموافقة:</span>
                                  <span>{formatDate(application.deliveryInfo.approvedAt)}</span>
                                </div>
                              )}
                              {application.deliveryInfo?.rejectionReason && (
                                <div className="flex items-start gap-2 text-red-600">
                                  <AlertCircle className="h-4 w-4 mt-1" />
                                  <span className="font-medium">سبب الرفض:</span>
                                  <span className="flex-1">{application.deliveryInfo.rejectionReason}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-6 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </Button>
                          
                          {application.deliveryStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveApplication(application._id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 ml-2" />
                                موافقة
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedApplication(application)}
                              >
                                <XCircle className="h-4 w-4 ml-2" />
                                رفض
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              /* Delivery Persons Tab */
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">جاري تحميل مندوبي التوصيل...</p>
                  </div>
                ) : deliveryPersons.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">لا يوجد مندوبين</h3>
                      <p className="text-gray-500">لا يوجد مندوبين توصيل موافق عليهم</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliveryPersons.map((person) => (
                      <Card key={person._id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <User className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold">{person.deliveryInfo?.fullName}</h3>
                            <p className="text-sm text-gray-600">{person.phone}</p>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>المدينة:</span>
                              <span>{person.deliveryInfo?.workingCity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>التقييم:</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span>{person.deliveryInfo?.rating || 5.0}</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>إجمالي التوصيلات:</span>
                              <span>{person.deliveryInfo?.totalDeliveries || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الحالة:</span>
                              <Badge className={person.deliveryInfo?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {person.deliveryInfo?.isAvailable ? 'متاح' : 'غير متاح'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تفاصيل طلب التوصيل</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(null);
                    setRejectionReason('');
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                  <p className="font-semibold">{selectedApplication.deliveryInfo?.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                  <p className="font-semibold">{selectedApplication.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                  <p className="font-semibold">{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">رقم الهوية الوطنية</label>
                  <p className="font-semibold">{selectedApplication.deliveryInfo?.nationalId}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">مدينة العمل</label>
                  <p className="font-semibold">{selectedApplication.deliveryInfo?.workingCity}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">العنوان</label>
                  <p className="font-semibold">{selectedApplication.location}</p>
                </div>
              </div>

              {selectedApplication.deliveryInfo?.idCardImage && (
                <div>
                  <label className="text-sm font-medium text-gray-500">صورة الهوية الوطنية</label>
                  <img
                    src={selectedApplication.deliveryInfo.idCardImage}
                    alt="صورة الهوية"
                    className="w-full max-w-md mx-auto rounded-lg border mt-2"
                  />
                </div>
              )}

              {selectedApplication.deliveryStatus === 'pending' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">سبب الرفض (في حالة الرفض)</label>
                    <Textarea
                      placeholder="اكتب سبب رفض الطلب..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveApplication(selectedApplication._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      موافقة على الطلب
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectApplication(selectedApplication._id)}
                      className="flex-1"
                      disabled={!rejectionReason.trim()}
                    >
                      <XCircle className="h-4 w-4 ml-2" />
                      رفض الطلب
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </BaseLayout>
  );
};

export default AdminDeliveryManagement;