import { useState } from "react";
import { API_URL } from "../utils/api";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const loginUrl = `${API_URL}/admin/login`;
      console.log("Login URL:", loginUrl);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      console.log("Login status:", response.status);

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      onLogin(data.token);
    } catch (error) {
      console.error("Login request failed:", error);
      setError("Backend is not available.");
    }
  }

  return (
    <section className="mx-auto mt-32 max-w-md rounded-3xl border p-6">
      <h2 className="text-2xl font-semibold">Admin Login</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full rounded-2xl border px-4 py-3"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" className="w-full rounded-2xl border px-4 py-3">
          Login
        </button>
      </form>
    </section>
  );
}
