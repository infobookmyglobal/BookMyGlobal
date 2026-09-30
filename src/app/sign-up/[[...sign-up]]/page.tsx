"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

const isDev = process.env.NODE_ENV === "development";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDevSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="legacy min-h-screen bg-gradient-to-br from-navy to-blue flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-navy font-sora font-black text-lg mb-4">
            BMG
          </div>
          <h1 className="font-sora font-black text-white text-2xl">Create your account</h1>
          <p className="text-white/60 text-sm mt-2">Visas, attestation and trips, all in one account</p>
        </div>

        {isDev ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl text-white">
            <h3 className="font-sora font-black text-lg mb-4 text-center">Development Sign Up</h3>
            <form onSubmit={handleDevSignUp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-white/70 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-white/20 bg-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-gold placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-white/70 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-white/20 bg-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-gold placeholder:text-white/30"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gold text-navy font-black rounded-xl hover:bg-yellow-400 transition-all text-sm"
              >
                Sign Up (Dev Mode)
              </button>
            </form>
            <p className="text-[10px] text-white/40 text-center mt-4">
              Enter any email/password. You will be redirected to the dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <SignUp fallbackRedirectUrl="/dashboard" />
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <p className="text-gold text-xs font-black flex items-center justify-center gap-1.5 uppercase tracking-wider">
                ⚠️ OTP Code Not Arriving?
              </p>
              <p className="text-white/85 text-[10px] mt-1.5 font-bold leading-relaxed">
                Please check your <strong className="text-white underline">Spam</strong> or <strong className="text-white underline">Junk</strong> folder. Sometimes verification emails can be filtered there.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
