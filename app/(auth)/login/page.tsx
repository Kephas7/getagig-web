"use client";

import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function Page() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden items-center justify-center border-r border-border/50 px-10 md:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <Image
          src="/images/login.png"
          alt="Band Illustration"
          width={500}
          height={500}
          priority
          className="relative z-10 drop-shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        />
      </div>

      <div className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-md space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
