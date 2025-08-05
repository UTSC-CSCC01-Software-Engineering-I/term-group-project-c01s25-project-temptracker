"use client";

import dynamic from "next/dynamic";

// Lazy load the Home component client-side only
const LazyHome = dynamic(() => import("@/components/ui/Home"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function ClientWrapper() {
  return <LazyHome />;
}
