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
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(0, 169, 230, 0.2) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#00A9E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 24,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
            }}
          >
            agendae.me
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Agendamentos online
          </h1>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              background: "linear-gradient(90deg, #00A9E6, #2FC6FF)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
            }}
          >
            simples e profissionais
          </h1>
        </div>
        <p
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: 24,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          Gerencie agendamentos, receba pagamentos via PIX e escale seu negócio
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}