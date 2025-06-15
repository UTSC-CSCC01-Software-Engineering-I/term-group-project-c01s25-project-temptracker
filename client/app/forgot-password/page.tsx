"use client";

import { useState } from "react";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleReset = async () => {
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            toast.error(error.message);
        }
        else {
            toast.success("Password reset email sent!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen space y-6">
            <h1 className="text-2xl font-semibold">Reset your password</h1>
            <p className="text-sm text-muted">Enter your email to receive a reset link.</p>
            <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-80"
            />
            <Button onClick={handleReset}>Send reset link</Button>
        </div>
    );
}