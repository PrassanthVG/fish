"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: "#1a1d24",
          border: "1px solid #2a2e37",
          borderRadius: 10,
          padding: 32,
          width: 320,
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 20 }}>Admin Login</h1>
        <label htmlFor="email" style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 14,
            borderRadius: 6,
            border: "1px solid #2a2e37",
            background: "#0f1115",
            color: "#e6e6e6",
          }}
        />
        <label htmlFor="password" style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 14,
            borderRadius: 6,
            border: "1px solid #2a2e37",
            background: "#0f1115",
            color: "#e6e6e6",
          }}
        />
        {error && <p style={{ color: "#f28b82", fontSize: 13 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: "#2d6cdf",
            color: "white",
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
