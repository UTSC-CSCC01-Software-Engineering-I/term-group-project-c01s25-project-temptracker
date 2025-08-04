import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <h1 className="mb-4">Reset Password</h1>
      <p className="mb-6 text-muted">Create a new secure password for your account.</p>
      <ResetPasswordForm />
    </div>
  );
}
