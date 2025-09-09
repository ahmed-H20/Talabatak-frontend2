import React from 'react'

const NotAdmin = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1>غير مصرح لك بالدخول</h1>
      <p className='text-red-600'>ليس لديك إذن لعرض هذه الصفحة.</p>
      <p className='text-gray-600'>يجب تسجيل الدخول كمسؤول للوصول إلى هذه الصفحة.</p>
      <a href="/" className="mt-4 text-blue-500 hover:underline">العودة إلى الصفحة الرئيسية</a>
    </div>
  )
}

export default NotAdmin
