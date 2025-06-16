import ResetPasswordForm from "@/components/ui/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <h1 className="mb-4">Set a new password</h1>
      <p className="mb-6 text-muted">Choose a secure password to complete the reset process.</p>
      <ResetPasswordForm />
    </div>
  );
}
