import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Brand mark used as the browser-tab favicon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#a100ff",
          color: "white",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        C
      </div>
    ),
    size,
  );
}
