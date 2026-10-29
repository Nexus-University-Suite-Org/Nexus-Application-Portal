import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/lib/nexus-auth";
import { ADMIN_ROLES } from "@/contexts/AdminAuthContext";

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

export default ProtectedRoute;
