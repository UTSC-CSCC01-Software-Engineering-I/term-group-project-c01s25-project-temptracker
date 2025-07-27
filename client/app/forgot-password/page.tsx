import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <h1 className="text-center mb-4">Forgot your password?</h1>
      <p className="mb-6 text-muted">Enter your email to receive a reset link.</p>
      <ForgotPasswordForm />
    </div>
  );
}
