import { createClient } from "../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      let redirectUrl;
      // Always use NEXT_PUBLIC_SITE_URL in production, never use origin
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://nervous-cohen2-vhwd5.view-3.tempo-dev.app";

      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      } else {
        redirectUrl = `${siteUrl}${next}`;
      }

      // If this is a password recovery, add the access token to the URL
      if (type === "recovery") {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          const url = new URL(redirectUrl);
          url.searchParams.set("access_token", session.access_token);
          redirectUrl = url.toString();
        }
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://nervous-cohen2-vhwd5.view-3.tempo-dev.app";
  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`);
}
