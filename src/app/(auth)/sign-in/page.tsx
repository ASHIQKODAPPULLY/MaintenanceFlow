import { signInAction, adminSignInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User } from "lucide-react";
import Link from "next/link";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2 text-center mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                className="text-primary font-medium hover:underline transition-all"
                href="/sign-up"
              >
                Sign up
              </Link>
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User size={16} />
                User Login
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield size={16} />
                Admin Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4 mt-6">
              <form className="flex flex-col space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all"
                        href="/forgot-password"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Your password"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <SubmitButton
                  className="w-full"
                  pendingText="Signing in..."
                  formAction={signInAction}
                >
                  Sign in
                </SubmitButton>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Demo Admin Access:</strong>
                  <br />
                  Email: admin@maintenance.app
                  <br />
                  Password: admin123
                </AlertDescription>
              </Alert>

              <form className="flex flex-col space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="admin-email"
                      className="text-sm font-medium"
                    >
                      Admin Email
                    </Label>
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      placeholder="admin@maintenance.app"
                      defaultValue="admin@maintenance.app"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="admin-password"
                      className="text-sm font-medium"
                    >
                      Admin Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      name="password"
                      placeholder="admin123"
                      defaultValue="admin123"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <SubmitButton
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  pendingText="Signing in as Admin..."
                  formAction={adminSignInAction}
                >
                  <Shield size={16} className="mr-2" />
                  Sign in as Admin
                </SubmitButton>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <FormMessage message={message} />
          </div>
        </div>
      </div>
    </>
  );
}
