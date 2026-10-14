"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { resolveLoginBannerSrc } from "./login-banner-src";

export function LoginBanner() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(resolveLoginBannerSrc(new Date()));
  }, []);

  return (
    <div className="relative h-full w-full min-w-0 overflow-hidden bg-primary">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="727px"
        />
      ) : null}
      <div className="absolute inset-0 " />
      <div className="absolute left-10 top-10 flex max-w-[320px] flex-col gap-2">
        <p className="whitespace-nowrap text-3xl font-bold leading-tight text-white md:text-4xl">
          Seja bem-vindo 👋
        </p>
        <p
          className="text-xl font-medium leading-snug text-login-banner-text md:text-2xl"
          style={{ opacity: 0.85 }}
        >
          Portal dos Squads
        </p>
      </div>
    </div>
  );
}
