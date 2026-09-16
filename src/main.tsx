
import "@vly-ai/integrations";
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { I18nProvider } from "@/lib/i18n";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { loadSavedTheme } from "@/config/themes";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

import "./index.css";

const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/Auth"));
const StoreProductsPage = lazy(() => import("./pages/StoreProductsPage"));
const StoreProductDetailPage = lazy(() => import("./pages/StoreProductDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PaymentReturnPage = lazy(() => import("./pages/PaymentReturnPage"));
const ComparePage = lazy(() => import("./modules/products/pages/ComparePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./modules/shared/layout/AdminLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductListPage = lazy(() => import("./modules/products/pages/ProductListPage"));
const ProductFormPage = lazy(() => import("./modules/products/pages/ProductFormPage"));
const ProductEditPage = lazy(() => import("./modules/products/pages/ProductEditPage"));
const ProductViewPage = lazy(() => import("./modules/products/pages/ProductViewPage"));
const CategoryListPage = lazy(() => import("./modules/categories/pages/CategoryListPage"));
const FeaturesPage = lazy(() => import("./modules/products/pages/FeaturesPage"));
const BrandListPage = lazy(() => import("./modules/brands/pages/BrandListPage"));
const OrderListPage = lazy(() => import("./modules/orders/pages/OrderListPage"));
const InvoicePrintPage = lazy(() => import("./modules/orders/pages/InvoicePrintPage"));
const CartPage = lazy(() => import("./modules/cart/pages/CartPage"));
const CheckoutPage = lazy(() => import("./modules/cart/pages/CheckoutPage"));
const BookingListPage = lazy(() => import("./modules/bookings/pages/BookingListPage"));
const UserListPage = lazy(() => import("./modules/users/pages/UserListPage"));
const UserProfilePage = lazy(() => import("./modules/users/pages/UserProfilePage"));
const DiscountListPage = lazy(() => import("./modules/discounts/pages/DiscountListPage"));
const ShippingListPage = lazy(() => import("./modules/shipping/pages/ShippingListPage"));
const TicketListPage = lazy(() => import("./modules/tickets/pages/TicketListPage"));
const ChatPage = lazy(() => import("./modules/chat/pages/ChatPage"));
const NotificationListPage = lazy(() => import("./modules/notifications/pages/NotificationListPage"));
const DepartmentListPage = lazy(() => import("./modules/departments/pages/DepartmentListPage"));
const ReportsPage = lazy(() => import("./modules/reports/pages/ReportsPage"));
const RoleListPage = lazy(() => import("./modules/roles/pages/RoleListPage"));
const TemplateListPage = lazy(() => import("./modules/templates/pages/TemplateListPage"));
const SettingsPage = lazy(() => import("./modules/settings/pages/SettingsPage"));
const AdminComparePage = lazy(() => import("./modules/products/pages/AdminComparePage"));
const AdminBlogPage = lazy(() => import("./modules/blog/pages/AdminBlogPage"));
const BlogFormPage = lazy(() => import("./modules/blog/pages/BlogFormPage"));
const BannerListPage = lazy(() => import("./modules/banners/pages/BannerListPage"));

function RouteLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        <div className="animate-pulse text-sm font-medium text-muted-foreground">در حال آماده‌سازی...</div>
      </div>
    </div>
  );
}

function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
}

const convexUrl = (import.meta.env.VITE_CONVEX_URL as string) || "https://zany-shrimp-635.convex.cloud";
if (!import.meta.env.VITE_CONVEX_URL) {
  console.warn("VITE_CONVEX_URL is missing. Please run `npx convex dev` to set it up. Using fallback for now.");
}
const convex = new ConvexReactClient(convexUrl);

loadSavedTheme();

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => { window.parent.postMessage({ type: "iframe-route-change", path: location.pathname }, "*"); }, [location.pathname]);
  useEffect(() => {
    function handleMessage(event: MessageEvent) { if (event.data?.type === "navigate") { if (event.data.direction === "back") window.history.back(); if (event.data.direction === "forward") window.history.forward(); } }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <I18nProvider>
        <ConfirmProvider>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<LazyRoute><Landing /></LazyRoute>} />
              <Route path="/auth" element={<LazyRoute><AuthPage redirectAfterAuth="/dashboard" /></LazyRoute>} />
              <Route path="/products" element={<LazyRoute><StoreProductsPage /></LazyRoute>} />
              <Route path="/products/:slug" element={<LazyRoute><StoreProductDetailPage /></LazyRoute>} />
              <Route path="/about" element={<LazyRoute><AboutPage /></LazyRoute>} />
              <Route path="/contact" element={<LazyRoute><ContactPage /></LazyRoute>} />
              <Route path="/legal/:type" element={<LazyRoute><LegalPage /></LazyRoute>} />
              <Route path="/payment/return" element={<LazyRoute><PaymentReturnPage /></LazyRoute>} />
              <Route path="/compare" element={<LazyRoute><ComparePage /></LazyRoute>} />
              <Route path="/blog" element={<LazyRoute><BlogPage /></LazyRoute>} />
              <Route path="/track-order" element={<LazyRoute><OrderTrackingPage /></LazyRoute>} />
              <Route path="/dashboard" element={<RequireAuth><LazyRoute><AdminLayout /></LazyRoute></RequireAuth>}>
                <Route index element={<LazyRoute><Dashboard /></LazyRoute>} />
                <Route path="products" element={<LazyRoute><ProductListPage /></LazyRoute>} />
                <Route path="products/new" element={<LazyRoute><ProductFormPage /></LazyRoute>} />
                <Route path="products/edit/:slug" element={<LazyRoute><ProductEditPage /></LazyRoute>} />
                <Route path="products/view/:slug" element={<LazyRoute><ProductViewPage /></LazyRoute>} />
                <Route path="categories" element={<LazyRoute><CategoryListPage /></LazyRoute>} />
                <Route path="features" element={<LazyRoute><FeaturesPage /></LazyRoute>} />
                <Route path="brands" element={<LazyRoute><BrandListPage /></LazyRoute>} />
                <Route path="orders" element={<LazyRoute><OrderListPage /></LazyRoute>} />
                <Route path="orders/:orderId/invoice" element={<LazyRoute><InvoicePrintPage /></LazyRoute>} />
                <Route path="cart" element={<LazyRoute><CartPage /></LazyRoute>} />
                <Route path="checkout" element={<LazyRoute><CheckoutPage /></LazyRoute>} />
                <Route path="bookings" element={<LazyRoute><BookingListPage /></LazyRoute>} />
                <Route path="users" element={<LazyRoute><UserListPage /></LazyRoute>} />
                <Route path="profile" element={<LazyRoute><UserProfilePage /></LazyRoute>} />
                <Route path="discounts" element={<LazyRoute><DiscountListPage /></LazyRoute>} />
                <Route path="shipping" element={<LazyRoute><ShippingListPage /></LazyRoute>} />
                <Route path="tickets" element={<LazyRoute><TicketListPage /></LazyRoute>} />
                <Route path="chat" element={<LazyRoute><ChatPage /></LazyRoute>} />
                <Route path="notifications" element={<LazyRoute><NotificationListPage /></LazyRoute>} />
                <Route path="departments" element={<LazyRoute><DepartmentListPage /></LazyRoute>} />
                <Route path="reports" element={<LazyRoute><ReportsPage /></LazyRoute>} />
                <Route path="roles" element={<LazyRoute><RoleListPage /></LazyRoute>} />
                <Route path="templates" element={<LazyRoute><TemplateListPage /></LazyRoute>} />
                <Route path="settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
                <Route path="compare" element={<LazyRoute><AdminComparePage /></LazyRoute>} />
                <Route path="blog" element={<LazyRoute><AdminBlogPage /></LazyRoute>} />
                <Route path="blog/new" element={<LazyRoute><BlogFormPage /></LazyRoute>} />
                <Route path="blog/edit/:slug" element={<LazyRoute><BlogFormPage /></LazyRoute>} />
                <Route path="banners" element={<LazyRoute><BannerListPage /></LazyRoute>} />
              </Route>
              <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
        </ConfirmProvider>
        </I18nProvider>
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);
