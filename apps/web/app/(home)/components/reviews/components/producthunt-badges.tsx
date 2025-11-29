"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

export const ProductHuntBadges = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href="https://www.producthunt.com/posts/eververse?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eververse"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Image
          alt="Eververse - Build&#0032;your&#0032;product&#0032;roadmap&#0032;at&#0032;lightspeed&#0044;&#0032;with&#0032;AI | Product Hunt"
          className="aspect-[250/54] h-[42px] w-auto"
          height={54}
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=778933&theme=${resolvedTheme}`}
          unoptimized
          width={250}
        />
      </a>

      <a
        href="https://www.producthunt.com/posts/eververse-2?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-eververse&#0045;2"
        rel="noreferrer noreferrer"
        target="_blank"
      >
        <Image
          alt="Eververse - Open&#0045;source&#0044;&#0032;AI&#0045;integrated&#0032;product&#0032;management&#0032;platform | Product Hunt"
          className="aspect-[250/54] h-[42px] w-auto"
          height={54}
          src={`https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=778933&theme=${resolvedTheme}&period=daily&t=1737227876787`}
          unoptimized
          width={250}
        />
      </a>
    </div>
  );
};
