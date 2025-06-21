import { redirect } from "next/navigation";

// Redirect signup attempts to sign-in page
export default function SignupRedirect() {
  redirect("/sign-in");
}
