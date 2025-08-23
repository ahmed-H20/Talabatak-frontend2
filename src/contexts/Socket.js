// In your components or context
import { io } from 'socket.io-client';

useEffect(() => {
  const socket = io('https://talabatak-backend2.vercel.app');
  
  socket.on('orderCreated', (orderData) => {
    toast({
      title: 'طلب جديد',
      description: `تم إنشاء طلب جديد رقم ${orderData.orderId}`,
    });
    // Update your orders list
  });

  socket.on('orderStatusUpdated', (data) => {
    toast({
      title: 'تحديث حالة الطلب',
      description: `تم تحديث حالة الطلب إلى ${data.newStatus}`,
    });
    // Update order status in your UI
  });

  return () => socket.disconnect();
}, []);