// src/components/dashboard/IdentificationMapWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const InteractiveMap = dynamic(() => import("@/components/dashboard/InteractiveMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[380px] w-full rounded-[14px]" />,
});

type Props = {
  lat: number;
  lon: number;
  nome: string;
};

export default function IdentificationMapWrapper(props: Props) {
  return <InteractiveMap {...props} />;
}
