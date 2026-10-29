import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AuthProvider, useNexusAuth } from "@/lib/nexus-auth";

/**
 * Roles that may enter the back office.
 *
 * The same names are used by the identity server, the SDK and the Spring
 * resource server, so there is exactly one vocabulary for access.
 */
export const ADMIN_ROLES = [
  "ADMISSIONS_OFFICER",
  "ADMISSIONS_ADMIN",
  "SYSTEM_ADMIN",
] as const;

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  tenantId?: number | null;
}

type AdminAuthStatus = "loading" | "authenticated" | "anonymous";

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  status: AdminAuthStatus;
  /** Redirects to Nexus Identity; the browser leaves this page. */
  login: (returnTo?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

const IDENTITY_ISSUER =
  import.meta.env.VITE_IDENTITY_ISSUER ?? "http://localhost:9000";

/**
 * Adapts the shared SSO client to the shape the admin pages already use.
 *
 * The pages read a plain `token` string and send it as a bearer token. The SDK
 * keeps access tokens in memory and refreshes them, so this bridge mirrors the
 * current token into state and schedules a refresh slightly before it expires.
 * That keeps every existing `fetch(..., { headers: { Authorization: token } })`
 * working without touching thirty pages.
 */
const AdminAuthBridge = ({ children }: { children: ReactNode }) => {
  const { status, user, client, getAccessToken, login, logout } = useNexusAuth();
  const [token, setToken] = useState<string | null>(null);
  const refreshTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
<<<<<<< HEAD
    // Drop anything the legacy password form stored; those tokens are no
    // longer valid and must not shadow the SSO session.
=======
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/v1/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    const nextUser: AdminUser = {
      id: data.id || 0,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      tenantId: data.tenantId,
    };
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_user", JSON.stringify(nextUser));
    setToken(data.token);
    setUser(nextUser);
  };

  const logout = () => {
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const next = await getAccessToken();
      if (cancelled) return;
      setToken(next);

      window.clearTimeout(refreshTimer.current);
      const claims = client.getUser();
      const expiresInMs = claims?.exp
        ? claims.exp * 1000 - Date.now()
        : 60_000;
      refreshTimer.current = window.setTimeout(
        () => void sync(),
        Math.max(expiresInMs - 60_000, 5_000),
      );
    };

    void sync();
    const unsubscribe = client.subscribe(() => void sync());

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearTimeout(refreshTimer.current);
    };
  }, [client, getAccessToken]);

  const legacyUser: AdminUser | null = user
    ? {
        id: 0,
        email: user.email,
        fullName: user.name?.trim() || user.email,
      }
    : null;

  return (
    <AdminAuthContext.Provider
      value={{
        user: legacyUser,
        token,
        loading: status === "loading",
        status,
        login,
<<<<<<< HEAD
        logout: () => {
          void logout();
        },
        isAuthenticated: status === "authenticated" && token !== null,
=======
        logout,
        isAuthenticated: !!token,
        isSuperAdmin: user?.role === "SUPER_ADMIN",
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
<<<<<<< HEAD
};

const AuthSplash = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-8">
    <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
      Checking your session
    </p>
  </div>
);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => (
  <AuthProvider
    config={{
      issuer: IDENTITY_ISSUER,
      clientId: "nexus-application-portal",
      redirectPath: "/auth/callback",
    }}
    fallback={<AuthSplash />}
  >
    <AdminAuthBridge>{children}</AdminAuthBridge>
  </AuthProvider>
);
=======
};
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
