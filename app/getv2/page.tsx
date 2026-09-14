// app/getv2/page.tsx
import { Suspense } from "react";
import CariRuteAngkot from "@/components/search-routev2/CariRuteAngkot "; // sesuaikan path

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CariRuteAngkot />
    </Suspense>
  );
}