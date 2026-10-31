import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/lib/nexus-auth";
import { ADMIN_ROLES } from "@/contexts/AdminAuthContext";

interface ProtectedRouteProps {
  children?: ReactNode;
  requireRole?: string;
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  return (
    <RequireAuth roles={requireRole ? [requireRole] : [...ADMIN_ROLES]}>
      {children ?? <Outlet />}
    </RequireAuth>
  );
};

export default ProtectedRoute;