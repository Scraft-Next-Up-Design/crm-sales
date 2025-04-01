"use client";

import dynamic from "next/dynamic";

export const DynamicAnalytics = dynamic(
  () => import("./analytics/page").then((mod) => ({ default: mod.default })),
  { loading: () => <div>Loading analytics...</div> }
);

export const DynamicDocumentation = dynamic(
  () =>
    import("./documentation/page").then((mod) => ({ default: mod.default })),
  { loading: () => <div>Loading documentation...</div> }
);

export const DynamicIntegration = dynamic(
  () => import("./integration/page").then((mod) => ({ default: mod.default })),
  { loading: () => <div>Loading integration...</div> }
);

export const DynamicLeads = dynamic(
  () => import("./leads/page").then((mod) => ({ default: mod.default })),
  { loading: () => <div>Loading leads...</div> }
);

export const DynamicProfile = dynamic(
  () => import("./profile/page").then((mod) => ({ default: mod.default })),
  { loading: () => <div>Loading profile...</div> }
);

export const DynamicWorkspace = dynamic(
  () =>
    import("./workspace/[id]/page").then((mod) => ({ default: mod.default })),
  { loading: () => <div>Loading workspace...</div> }
);

export const DynamicLottiePlayer = dynamic(
  () =>
    import("@lottiefiles/react-lottie-player").then((mod) => ({
      default: mod.Player,
    })),
  { ssr: false, loading: () => <div>Loading animation...</div> }
);

export const DynamicDataTable = dynamic(
  () =>
    import("@/components/ui/data-table").then((mod) => ({
      default: mod.DataTable as typeof mod.DataTable,
    })),
  { loading: () => <div>Loading table...</div> }
);
