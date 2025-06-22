import RegisterForm from "@/components/ui/RegisterForm";

export default function Register() {
  return (
    <div className="flex flex-col justify-center items-center flex-1 md:min-h-screen">
      <h1 className="mb-4">Register</h1>
      <p className="mb-6 text-muted">Create a new account below to get started!</p>
      <RegisterForm />
    </div>
  );
}
