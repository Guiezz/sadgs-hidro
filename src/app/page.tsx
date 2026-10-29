// src/app/page.tsx
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HomeHero } from "@/components/home/HomeHero";
import { ReservoirPills } from "@/components/home/ReservoirPills";

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20">
      <HomeHero />
      <FeatureGrid />
      <ReservoirPills />
    </div>
  );
}
