import LoginForm from "@/components/ui/LoginForm";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <h1 className="mb-4">Welcome Back</h1>
      <p className="mb-6 text-muted">Please login below to get the full experience!</p>
      <LoginForm />
    </div>
  );
}
