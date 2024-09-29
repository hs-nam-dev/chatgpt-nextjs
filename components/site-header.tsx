import { MainNav } from "@/components/main-nav";

interface SiteHeaderProps {
  onSettingClick: () => void;
  onHomeClick: () => void;
}

export function SiteHeader({ onSettingClick, onHomeClick }: SiteHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav onSettingClick={onSettingClick} onHomeClick={onHomeClick} />
      </div>
    </header>
  );
}