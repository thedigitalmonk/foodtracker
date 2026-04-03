import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EFF6FF",
          borderRadius: 40,
        }}
      >
        <svg
          width={140}
          height={140}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fridge body */}
          <rect x="18" y="8" width="58" height="78" rx="10" fill="#CBD5E1" />
          {/* Freezer top */}
          <rect x="18" y="8" width="58" height="30" rx="10" fill="#94A3B8" />
          <rect x="18" y="28" width="58" height="10" fill="#94A3B8" />
          {/* Divider */}
          <rect x="18" y="38" width="58" height="4" fill="#64748B" />
          {/* Freezer handle */}
          <rect x="48" y="15" width="8" height="17" rx="4" fill="#475569" />
          {/* Fridge handle */}
          <rect x="48" y="50" width="8" height="24" rx="4" fill="#475569" />
          {/* Checkmark badge */}
          <circle cx="75" cy="75" r="25" fill="#16A34A" />
          <polyline
            points="63,75 71,83 87,65"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
