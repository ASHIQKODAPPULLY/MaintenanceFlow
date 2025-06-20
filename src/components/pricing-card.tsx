"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { supabase } from "../../supabase/supabase";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/login?redirect=pricing";
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <Card
      className={`w-full max-w-[350px] mx-auto relative overflow-hidden ${item.popular ? "border-2 border-blue-500 shadow-xl sm:scale-105" : "border border-gray-200"}`}
    >
      {item.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-30" />
      )}
      <CardHeader className="relative p-4 sm:p-6">
        {item.popular && (
          <div className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-3 sm:mb-4">
            Most Popular
          </div>
        )}
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900">
            ${item?.amount / 100}
          </span>
          <span className="text-gray-600 text-sm sm:text-base">
            /{item?.interval}
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="relative p-4 sm:p-6">
        <Button
          onClick={async () => {
            await handleCheckout(item.id);
          }}
          className={`w-full py-4 sm:py-6 text-base sm:text-lg font-medium`}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}
