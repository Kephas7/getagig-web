"use client";

import Image from "next/image";
import SignupForm from "../_components/SignupForm";

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-white">
        <Image
          src="/images/img2.png"
          alt="Band Illustration"
          width={600}
          height={600}
          priority
        />
      </div>

      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          {/* LOGO */}
          <div className="text-center space-y-2">
            <Image
              src="/images/logo.png"
              alt="Getagig Logo"
              width={60}
              height={60}
              className="mx-auto"
            />
            <h1 className="text-2xl font-semibold tracking-wide">GETAGIG</h1>
            <p className="text-sm text-gray-500 uppercase">Welcome</p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
