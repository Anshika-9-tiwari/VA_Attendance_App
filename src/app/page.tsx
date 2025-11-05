'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      router.push("/dashboard");
    } else {
      alert(data.error || "Login failed");
    }
  } catch (error) {
    alert("Something went wrong.");
  }
};


  return (
    <>
      <div className="flex justify-center items-center h-screen overflow-x-hidden bg-white text-gray-700">
        <div className="w-auto h-auto flex flex-col border-3 items-center border-gray-100 rounded-xl p-6 shadow-xl">
          <img src="/Velocity-ALogo2.png" alt="VelocityAutomation" width={150} />
          <p className="text-xs p-2">
            don't have account{" "}
            <a href="/signup" className="text-blue-700 font-bold hover:border-b-1">
              Signup
            </a>
          </p>

          <form
            onSubmit={handleLogin}
            className="flex flex-col justify-center items-center max-w-full p-6 h-full w-full"
          >
            {/* Email */}
            <div className="p-2 mt-2 w-full">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-gray-50 shadow-lg p-3 rounded-2xl w-full"
              />
            </div>

            {/* Password */}
            <div className="p-2 mt-2 w-full">
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-gray-50 shadow-lg p-3 rounded-2xl w-full"
              />
            </div>

            {/* Login Button */}
            <div className="p-2 mt-2 w-full">
              <button
                type="submit"
                className="bg-red-600 text-white p-3 w-full rounded-2xl border-white shadow-xl"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
