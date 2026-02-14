"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "1rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: "6rem",
                  width: "6rem",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  backgroundColor: "#fee2e2",
                }}
              >
                <AlertTriangle
                  style={{ height: "3rem", width: "3rem", color: "#dc2626" }}
                />
              </div>
            </div>

            <h1
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Erro crítico
            </h1>
            <p
              style={{
                marginBottom: "0.5rem",
                color: "#6b7280",
              }}
            >
              Ocorreu um erro crítico na aplicação. Por favor, tente recarregar
              a página.
            </p>

            {error.digest && (
              <p
                style={{
                  marginBottom: "1.5rem",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                }}
              >
                Código: {error.digest}
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "#2563eb",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <RefreshCw style={{ height: "1rem", width: "1rem" }} />
                Recarregar página
              </button>
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Voltar para Home
              </a>
            </div>

            <p
              style={{
                marginTop: "2rem",
                fontSize: "0.875rem",
                color: "#9ca3af",
              }}
            >
              Se o problema persistir, entre em contato com{" "}
              <a
                href="mailto:suporte@reserva.online"
                style={{ color: "#2563eb", textDecoration: "none" }}
              >
                suporte@reserva.online
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
