import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Lấy thông tin user từ bộ nhớ trình duyệt (Local Storage)
        const userStr = localStorage.getItem('spot_user');
        
        if (!userStr) {
          // Chưa đăng nhập
          setIsAuthorized(false);
          return;
        }

        const user = JSON.parse(userStr);

        // 2. Nếu yêu cầu quyền Admin, kiểm tra role
        if (requireAdmin && user.role !== 'admin') {
          toast.error("Bạn không có quyền truy cập trang này!");
          setIsAuthorized(false);
          return;
        }

        // 3. Hợp lệ
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth Error:", error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [requireAdmin, location.pathname]);

  // Đang kiểm tra... (Tránh nháy màn hình)
  if (isAuthorized === null) {
    return null; 
  }

  // Nếu không hợp lệ, đá về trang đăng nhập
  if (!isAuthorized) {
    // Nếu đang ở trang chủ mà bị đá thì không cần redirect loop
    if (location.pathname === '/') return null;
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Nếu hợp lệ, cho phép truy cập
  return <>{children}</>;
};

export default ProtectedRoute;