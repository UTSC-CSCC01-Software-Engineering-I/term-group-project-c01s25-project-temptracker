"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { toast } from "sonner";

const supabase = createClient();

export default function ResetPassword() {
    const[password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession();
    }, []);
    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            toast.error("Both fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        
        if (error) {
            toast.error(error.message);
        }
        else {
            toast.success("Password updated! You can now log in.");
            router.push("/login");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-80"
        />
        <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-80"
        />
        <Button onClick={handleUpdatePassword} disabled={!password || !confirmPassword}>
            Update Password
        </Button>
        </div>
    );
}