"use client";

import { use } from "react";
import Image from "next/image";
import ResetPasswordForm from "../../_components/ResetPasswordForm";

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center ">
        <Image
          src="/images/login.png"
          alt="Illustration"
          width={500}
          height={500}
          priority
        />
      </div>

      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
