"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/shadcn/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const formSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Email or Username is required" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

const supabase = createClient();

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { identifier, password } = values;
    let emailToUse = identifier;

    const isEmail = /\S+@\S+\.\S+/.test(identifier);

    if (!isEmail) {
      console.log("Trying to fetch user_profiles with username:", identifier);
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      console.log("Result profile:", profile);
      console.log("Profile fetch error:", profileError);

      if (profileError || !profile?.email) {
        form.setError("identifier", { message: "Username not found" });
        return;
      }

      emailToUse = profile.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      form.setError("root", { message: error.message });
    } else {
      toast.success("Login successful!");
      router.refresh();
      router.push("/");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email / Username</FormLabel>
              <FormControl>
                <Input placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="&#183; &#183; &#183; &#183; &#183; &#183; &#183; &#183;"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full cursor-pointer dark:hover:bg-transparent hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              <Button variant="link" size="link" className="ml-auto">
                <Link href="/forgot-password" className="text-secondary">
                  Forgot your password?
                </Link>
              </Button>
            </FormItem>
          )}
        />
        <Button type="submit" size="submit">
          Login
        </Button>
        <div className="flex items-center">
          <div className="flex-1 h-[2px] bg-muted-foreground mr-3"></div>
          Or
          <div className="flex-1 h-[2px] bg-muted-foreground ml-3"></div>
        </div>
        <div className="flex items-center justify-center">
          <p>Don&apos;t have an account yet?</p>
          <Button
            variant="link"
            size="link"
            className="ml-2 text-base text-secondary"
          >
            <Link href="register">Register</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
