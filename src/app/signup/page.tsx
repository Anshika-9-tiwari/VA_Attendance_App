'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {

  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name || !email || !password || !role) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert(data.error || "User already exists");
      return;
    }
  } catch (error) {
    alert("Something went wrong.");
  }
};


  return (
    <>
      <div className="flex justify-center items-center h-screen overflow-x-hidden">
        <div className="w-auto h-auto flex flex-col border-2 items-center border-white rounded-xl p-6 shadow-lg">
          <img src="/Velocity-ALogo2.png" alt="VelocityAutomation" width={150} />
          <p className="text-xs p-2">
            Already have account{" "}
            <a href="/" className="text-blue-700 font-bold hover:border-b-1">
              Login
            </a>
          </p>

          <form
            onSubmit={handleSignup}
            className="flex flex-col justify-center items-center max-w-full p-6 h-full w-full"
          >
            {/* Full Name */}
            <div className="p-2 mt-2 w-full">
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-white shadow-lg p-3 rounded-2xl w-full"
              />
            </div>

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
                className="border-2 border-white shadow-lg p-3 rounded-2xl w-full"
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
                className="border-2 border-white shadow-lg p-3 rounded-2xl w-full"
              />
            </div>

            {/* Role Dropdown */}
            <div className="p-2 mt-2 w-full">
              <select
                name="role"
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border-2 border-white shadow-lg p-3 rounded-2xl w-full bg-white text-gray-700"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {/* Signup Button */}
            <div className="p-2 mt-2 w-full">
              <button
                type="submit"
                className="bg-red-600 text-white p-3 w-full rounded-2xl border-white shadow-xl"
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
