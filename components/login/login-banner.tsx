"use client";

import Image from "next/image";

export function LoginBanner() {
  return (
    <div className="relative h-full w-full min-w-0 overflow-hidden">
      <Image
        src="/images/banner.svg"
        alt=""
        fill
        className="object-cover object-center"
        priority
        sizes="727px"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute left-10 top-10 flex max-w-[320px] flex-col gap-2">
        <p className="whitespace-nowrap text-3xl font-bold leading-tight text-white md:text-4xl">
          Seja bem-vindo 👋
        </p>
        <p
          className="text-xl font-medium leading-snug text-login-banner-text md:text-2xl"
          style={{ opacity: 0.85 }}
        >
          Portal do Squad XP
        </p>
      </div>
    </div>
  );
}
