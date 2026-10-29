import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

/**
 * Landing page for the identity redirect.
 *
 * The SDK exchanges the code while the provider initialises and rewrites the
 * address bar back to the requested page. React Router does not observe that
 * rewrite, so this component re-synchronises the router with the URL the SDK
 * restored — or falls back to the sign-in entry point if the exchange failed.
 */
const AuthCallbackPage = () => {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-8">
        <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
          Completing sign-in
        </p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  const target = window.location.pathname + window.location.search;
  return (
    <Navigate
      to={target.startsWith("/auth/callback") ? "/admin/dashboard" : target}
      replace
    />
  );
};

export default AuthCallbackPage;
