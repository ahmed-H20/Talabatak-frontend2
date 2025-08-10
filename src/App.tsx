import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminLocationsPage from "./pages/AdminLocationsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyPhonePage from "./pages/auth/VerifyPhonePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import { LocationProvider } from "./contexts/LocationContext";
import AdminCouponsPage from "./pages/AdminCouponPage";
import DeliveryRegistrationForm from "./pages/auth/delivaryRegPage";
import DeliveryDashboard from "./pages/deliveryPage";
import AdminDeliveryManagement from "./pages/AdminDelivaryDashboard";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProductForm from '@/pages/ProductForm'

const queryClient = new QueryClient();
const clientId = "599763874700-ma2che296dum9ktpadcirtdktdke3j32.apps.googleusercontent.com"

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LocationProvider>
        <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId} >
          <Routes>
            <Route path="product-test" element={<ProductForm onSuccess stores = {[]} categories = {[]} subCategories = {[]}/>}/>
            <Route path="/auth/verify-phone" element={<VerifyPhonePage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/" element={<StorePage />} />
            <Route path="/cart" element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/deliveryDashboard" element={
              // <ProtectedRoute allowedRoles={['delivery']}>
                <DeliveryDashboard />
              // </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route
              path="/auth/register-delivery"
              element={
                <DeliveryRegistrationForm
                  onSuccess={() => {}}
                />
              }
            />            
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/stores" element={<AdminStoresPage />} />
            <Route path="/admin/locations" element={<AdminLocationsPage />} />
            <Route path="/admin/coupons" element={<AdminCouponsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/delivery" element={<AdminDeliveryManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </GoogleOAuthProvider>
        </BrowserRouter>
        </LocationProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
