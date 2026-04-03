import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EFF6FF",
          borderRadius: 7,
        }}
      >
        <FridgeIcon size={28} />
      </div>
    ),
    { ...size }
  );
}

function FridgeIcon({ size }: { size: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fridge body */}
      <rect x="5" y="2" width="18" height="24" rx="3" fill="#CBD5E1" />
      {/* Freezer top */}
      <rect x="5" y="2" width="18" height="9" rx="3" fill="#94A3B8" />
      <rect x="5" y="8" width="18" height="3" fill="#94A3B8" />
      {/* Divider */}
      <rect x="5" y="11" width="18" height="1.5" fill="#64748B" />
      {/* Freezer handle */}
      <rect x="14" y="4.5" width="2" height="5" rx="1" fill="#475569" />
      {/* Fridge handle */}
      <rect x="14" y="15" width="2" height="7" rx="1" fill="#475569" />
      {/* Checkmark badge */}
      <circle cx="21" cy="22" r="7" fill="#16A34A" />
      <polyline
        points="17.5,22 20,24.5 24.5,19.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
