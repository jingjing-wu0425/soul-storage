"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <h1 className="font-[var(--font-serif)] text-2xl text-text-primary text-center mb-8">
        开始记录
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">邮箱</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">用户名</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            minLength={3}
            maxLength={20}
            className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
            placeholder="字母、数字和下划线"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">密码</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
            placeholder="至少 8 个字符"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent/20 text-accent border border-accent/30 rounded-md py-2.5 text-sm hover:bg-accent/30 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        已有账号？{" "}
        <Link href="/login" className="text-accent hover:text-accent/80 transition-colors">
          登录
        </Link>
      </p>
    </motion.div>
  );
}
