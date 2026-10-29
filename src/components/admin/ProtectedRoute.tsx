import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/lib/nexus-auth";
import { ADMIN_ROLES } from "@/contexts/AdminAuthContext";

<<<<<<< HEAD
/**
 * Layout guard for the back office.
 *
 * `RequireAuth` sends anonymous visitors to Nexus Identity with the current URL
 * as the return target, and shows an access-denied card when the account lacks
 * one of the admissions roles. Keeping it as a layout route means every admin
 * page inherits the same check and deep links survive the round-trip.
 */
const ProtectedRoute = () => (
  <RequireAuth roles={[...ADMIN_ROLES]}>
    <Outlet />
  </RequireAuth>
);
=======
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e

export default ProtectedRoute;