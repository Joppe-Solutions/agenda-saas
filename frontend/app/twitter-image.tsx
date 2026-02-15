import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "agendae.me - Sistema de Agendamentos Online";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F1D55",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#00A9E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "white",
            }}
          >
            agendae.me
          </span>
        </div>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "white",
            marginBottom: 16,
          }}
        >
          Sistema de Agendamentos Online
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          Gerencie agendamentos e receba pagamentos via PIX
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}