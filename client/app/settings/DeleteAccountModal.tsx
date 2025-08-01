"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "../context";
import { useRouter } from "next/navigation";
import { getAccessToken, signOut } from "@/lib/authSession";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const handleClose = () => {
    setConfirmationEmail("");
    onClose();
  };

  const confirmDeleteAccount = async () => {
    // Check if email matches user's email
    const access_token = await getAccessToken();
    if (confirmationEmail !== userEmail) {
      toast.error("Email address does not match your account email");
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (response.status === 204) {
        toast.success("Account deleted successfully");

        // Log out the user and redirect to login page
        await signOut();
        router.push("/login");
      } else {
        toast.error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting your account");
    } finally {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be
            undone. All your data, including temperature submissions, badges,
            and profile information will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-email" className="text-sm font-medium">
            Please enter your email address to confirm deletion:
          </Label>
          <Input
            id="confirm-email"
            type="email"
            placeholder={"Enter your email"}
            value={confirmationEmail}
            onChange={(e) => setConfirmationEmail(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Expected: {userEmail}</p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDeleteAccount}
            disabled={!confirmationEmail || confirmationEmail !== userEmail}
            className="flex-1 sm:flex-none"
          >
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
