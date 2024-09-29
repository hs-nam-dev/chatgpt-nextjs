import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MainNavProps {
  onSettingClick: () => void;
  onHomeClick: () => void;
}

export function MainNav({ onSettingClick, onHomeClick }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2" onClick={onHomeClick}>
        <span className="inline-block font-bold">ChatGPT</span>
      </Link>
      <nav className="flex gap-6">
        <button
          onClick={onHomeClick}
          className={cn(
            "flex items-center text-sm font-medium text-muted-foreground"
          )}
        >
          Home
        </button>
      </nav>
      <nav className="flex gap-6">
        <button
          onClick={onSettingClick}
          className={cn(
            "flex items-center text-sm font-medium text-muted-foreground"
          )}
        >
          SETTING
        </button>
      </nav>
    </div>
  );
}