import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"
export const runtime = "edge"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f59e0b",
          fontWeight: 800,
          fontFamily: "Vazirmatn, Tahoma, sans-serif",
          borderRadius: 24,
        }}
      >
        پ
      </div>
    ),
    { ...size },
  )
}
