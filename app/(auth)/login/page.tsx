"use client";

import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center ">
        <Image
          src="/images/login.png"
          alt="Band Illustration"
          width={500}
          height={500}
          priority
        />
      </div>

      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
