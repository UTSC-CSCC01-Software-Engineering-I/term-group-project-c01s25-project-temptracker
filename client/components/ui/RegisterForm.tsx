"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/shadcn/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string({ required_error: "Password is required" })
      .trim()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm: z.string({ required_error: "Confirm is required" }).trim(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

const supabase = createClient();

export default function RegisterForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm: "",
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const { email, password } = values;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error("There was an error creating your account. Please try again.");
      form.setError("root", { message: error.message });
    } else {
      toast.success("Account created successfully! Please check your email to verify your account.");
      router.refresh();
      router.push("/login");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email<span className="text-red-700">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
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
              <FormLabel>
                Password<span className="text-red-700">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Create a password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormDescription>Must be as least 8 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Confirm Password<span className="text-red-700">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Create a password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="submit">
          Create account
        </Button>
        <div className="flex items-center">
          <div className="flex-1 h-[2px] bg-muted-foreground mr-3"></div>
          Or
          <div className="flex-1 h-[2px] bg-muted-foreground ml-3"></div>
        </div>
        <div className="flex items-center justify-center">
          <p>Already have an account?</p>
          <Button variant="link" size="link" className="ml-2">
            <Link href="login" className="text-base">
              Login
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
