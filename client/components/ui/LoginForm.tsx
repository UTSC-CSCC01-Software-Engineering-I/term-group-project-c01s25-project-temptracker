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

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

const supabase = createClient();

export default function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const { email, password } = values;

    const { error } = await supabase.auth.signInWithPassword({
      email,
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
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
                <Input
                  placeholder="&#183; &#183; &#183; &#183; &#183; &#183; &#183; &#183;"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <Button variant="link" size="link" className="ml-auto">
                <Link href="/forgot-password">Forgot your password?</Link>
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
          <Button variant="link" size="link" className="ml-2 text-base">
            <Link href="register">Register</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
