import { useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Entry point for the back office.
 *
 * Sign-in itself happens on the Nexus Identity origin; there is no password
 * form here any more. The page starts the redirect immediately and doubles as
 * the "not entitled" screen for signed-in accounts without an admissions role.
 */
const AdminLoginPage = () => {
  const { status, user, login, logout } = useAdminAuth();

  useEffect(() => {
    if (status === "anonymous") {
      void login("/admin/dashboard");
    }
  }, [status, login]);

  const notEntitled = status === "authenticated";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-3xl">Admin Portal</CardTitle>
          <CardDescription>
            {notEntitled
              ? "This account cannot access the back office."
              : "Taking you to the university sign-in page…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          {notEntitled ? (
            <>
              <p>
                You are signed in as <strong>{user?.email}</strong>, but this
                area requires an admissions or administrator role.
              </p>
              <Button className="w-full" onClick={logout}>
                Sign in with a different account
              </Button>
            </>
          ) : (
            <p>
              If nothing happens,{" "}
              <button
                type="button"
                className="underline underline-offset-4 hover:text-foreground"
                onClick={() => void login("/admin/dashboard")}
              >
                continue to sign in
              </button>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
