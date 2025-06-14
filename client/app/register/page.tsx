import RegisterForm from "@/components/ui/RegisterForm";

export default function Register() {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <h1 className="mb-4">Register</h1>
      <p className="mb-6 text-muted">Create a new account to get started.</p>
      <RegisterForm />
    </div>
  );

  // return (
  //   <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-sm mx-auto mt-10 text-gray-800">
  //     <h2 className="text-2xl font-semibold text-center">Create an Account</h2>
  //     <input
  //       type="email"
  //       placeholder="Email"
  //       value={email}
  //       onChange={e => setEmail(e.target.value)}
  //       required
  //       className="border p-2 rounded"
  //     />
  //     <input
  //       type="password"
  //       placeholder="Password"
  //       value={password}
  //       onChange={e => setPassword(e.target.value)}
  //       required
  //       className="border p-2 rounded"
  //     />
  //     {errorMsg && <p className="text-red-500">{errorMsg}</p>}
  //     <button
  //       type="submit"
  //       className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
  //     >
  //       Register
  //     </button>
  //   </form>
  // );
}
