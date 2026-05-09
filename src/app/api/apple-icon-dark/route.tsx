import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C1C1E",
          borderRadius: 40,
        }}
      >
        <svg
          width={180}
          height={180}
          viewBox="0 0 1024 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="323" y="147" width="372" height="731" rx="62" stroke="white" stroke-width="44" stroke-linecap="round" />
          <path d="M336 573H684" stroke="white" stroke-width="20" stroke-linecap="square" />
          <path d="M626 501V409" stroke="white" stroke-width="32" stroke-linecap="round" />
          <path d="M626 737V645" stroke="white" stroke-width="32" stroke-linecap="round" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
