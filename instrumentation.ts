import { registerOTel, OTLPHttpProtoTraceExporter } from "@vercel/otel";

/**
 * OpenTelemetry tracing for the app. Next.js calls register() on server startup.
 * Traces are exported (OTLP/HTTP) to the OTEL_EXPORTER_OTLP_ENDPOINT, which is the
 * Cloudflare tunnel (otel.aegyoarena.com) fronting the OpenObserve instance on the
 * Mac mini. No-op until the endpoint is configured, so it never breaks builds/boots.
 */
export function register() {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) return;

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME || "aegyoarena",
    traceExporter: new OTLPHttpProtoTraceExporter({
      url: `${endpoint.replace(/\/+$/, "")}/v1/traces`,
      headers: process.env.OTEL_EXPORTER_OTLP_AUTH
        ? { Authorization: process.env.OTEL_EXPORTER_OTLP_AUTH }
        : undefined,
    }),
  });
}
