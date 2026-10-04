import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import manifestJson from "@/public/giveaway/le-sserafim-2026/manifest.json";
import drawSpecJson from "@/public/giveaway/le-sserafim-2026/draw-spec.json";
import productionProofJson from "@/public/giveaway/le-sserafim-2026/production-proof.json";
import testProofJson from "@/public/giveaway/le-sserafim-2026/test-proof.json";

export const metadata: Metadata = {
  title: "LE SSERAFIM Giveaway Draw Transparency | Aegyo Arena",
  description:
    "Frozen roster commitment and reproducible Chainlink VRF candidate selection for the LE SSERAFIM PUREFLOW giveaway. Public IDs only — no names or emails.",
};

// Entrant IDs are random pseudonyms committed in the manifest before the draw.
// Names and emails are deliberately absent from this page and from the repo.
type Candidate = { ticketId: string; entrantId: string; score: string; position: number };
type DrawProof = {
  status: "pending" | "complete";
  mode: "test" | "production";
  proofHash?: string;
  manifestHash?: string;
  eligibleCount?: number;
  ticketCount?: number;
  producedAt?: string;
  grandPrizeCandidates?: Candidate[];
  runnerUpCandidates?: Candidate[];
  randomness?: {
    source: string;
    randomWord: string;
    testOnly: boolean;
    chainName?: string;
    chainId?: number;
    codeCommit?: string;
    consumerAddress?: string;
    deploymentTx?: string;
    drawSpecHash?: string;
    requestId?: string;
    requestTx?: string;
    fulfillmentTx?: string;
    explorerBaseUrl?: string;
    wrapperAddress?: string;
  };
};

const manifest = manifestJson;
const drawSpec = drawSpecJson;
const productionProof = productionProofJson as DrawProof;
const testProof = testProofJson as DrawProof;

const card: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 22,
};
const mono: CSSProperties = { fontFamily: "var(--mono)", overflowWrap: "anywhere" };

const drawnOn = productionProof.producedAt
  ? new Date(productionProof.producedAt).toLocaleString("en-US", {
      dateStyle: "long", timeStyle: "short", timeZone: "UTC",
    }) + " UTC"
  : null;

function CandidateList({ title, candidates, runnerUp = false }: { title: string; candidates: Candidate[]; runnerUp?: boolean }) {
  return (
    <section style={card}>
      <div style={{ fontFamily: "var(--mono)", color: runnerUp ? "var(--sky)" : "var(--sakura)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
        {candidates.map((candidate) => (
          <li key={candidate.entrantId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", background: "var(--surface)", borderRadius: 10 }}>
            <span style={{ ...mono, color: "var(--ink-faint)", fontSize: "0.78rem", minWidth: 24 }}>#{candidate.position}</span>
            <strong style={{ ...mono, color: "var(--ink)", fontSize: "0.9rem" }}>{candidate.entrantId}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Evidence({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt style={{ color: "var(--ink-dim)", marginBottom: 4 }}>{label}</dt>
      <dd style={{ margin: 0, ...mono }}>{children}</dd>
    </div>
  );
}

function CompleteProof({ proof, rehearsal = false }: { proof: DrawProof; rehearsal?: boolean }) {
  const grandPrize = proof.grandPrizeCandidates ?? [];
  const runnerUp = proof.runnerUpCandidates ?? [];
  const r = proof.randomness;
  const txUrl = (hash?: string) => (r?.explorerBaseUrl && hash ? `${r.explorerBaseUrl}/tx/${hash}` : null);
  const consumerUrl = r?.explorerBaseUrl && r.consumerAddress ? `${r.explorerBaseUrl}/address/${r.consumerAddress}` : null;
  const sourceUrl = r?.codeCommit ? `https://github.com/Francisgood/kpop-lyrics/commit/${r.codeCommit}` : null;
  const links: [string, string | null][] = [
    ["Open source commit ↗", sourceUrl],
    ["Open deployment transaction ↗", txUrl(r?.deploymentTx)],
    ["Open consumer contract ↗", consumerUrl],
    ["Open request transaction ↗", txUrl(r?.requestTx)],
    ["Open fulfillment transaction ↗", txUrl(r?.fulfillmentTx)],
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {rehearsal && (
        <div role="note" style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--tangerine)", background: "rgba(255,140,66,0.12)", color: "var(--ink)" }}>
          <strong>Rehearsal only.</strong> These IDs are not candidates and must not be contacted. The rehearsal exists to prove the scripts are deterministic before the live VRF request.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 16 }}>
        <CandidateList title="Grand-prize candidate order" candidates={grandPrize} />
        <CandidateList title="Runner-up candidate order" candidates={runnerUp} runnerUp />
      </div>
      <section style={card}>
        <h2 style={{ margin: "0 0 14px", fontSize: "1.5rem" }}>Verification evidence</h2>
        <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "14px 22px", fontSize: "0.86rem" }}>
          <Evidence label="Mode">{proof.mode}</Evidence>
          <Evidence label="Randomness">{r?.source}</Evidence>
          <Evidence label="Random word">{r?.randomWord}</Evidence>
          <Evidence label="Manifest hash">{proof.manifestHash}</Evidence>
          {r?.drawSpecHash && <Evidence label="Draw-spec hash">{r.drawSpecHash}</Evidence>}
          <Evidence label="Proof hash">{proof.proofHash}</Evidence>
          {r?.chainName && <Evidence label="Network">{r.chainName} ({r.chainId})</Evidence>}
          {r?.consumerAddress && <Evidence label="Consumer">{r.consumerAddress}</Evidence>}
          {r?.wrapperAddress && <Evidence label="Chainlink wrapper">{r.wrapperAddress}</Evidence>}
          {r?.requestId && <Evidence label="Request ID">{r.requestId}</Evidence>}
          {r?.codeCommit && <Evidence label="Source commit">{r.codeCommit}</Evidence>}
        </dl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 16 }}>
          {links.filter(([, href]) => href).map(([label, href]) => (
            <a key={label} href={href as string} target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>{label}</a>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function LeSserafimDrawPage() {
  const productionComplete = productionProof.status === "complete";
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "52px 24px 80px" }}>
      <div style={{ marginBottom: 30 }}>
        <Link href="/le-sserafim-giveaway" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>← LE SSERAFIM Giveaway</Link>
        <div style={{ fontFamily: "var(--mono)", color: "var(--sakura)", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 24 }}>Public draw evidence</div>
        <h1 style={{ fontSize: "clamp(2.35rem, 8vw, 4.5rem)", lineHeight: 1, margin: "10px 0 16px" }}>A draw anyone can reproduce.</h1>
        <p style={{ color: "var(--ink-dim)", lineHeight: 1.7, fontSize: "1.05rem", maxWidth: 720 }}>
          Every entrant was committed by hash before the randomness was requested. One Chainlink VRF word on Base ranks all weighted entries, and the same word always produces the same order — so the result can be checked by anyone, including people who do not trust us. Personal data stays private: this page shows pseudonymous IDs only.
        </p>
      </div>

      <section style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Eligible entrants</div>
            <strong style={{ fontSize: "2rem" }}>{manifest.eligibleCount}</strong>
          </div>
          <div>
            <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Weighted entries</div>
            <strong style={{ fontSize: "2rem" }}>{manifest.ticketCount}</strong>
            <div style={{ color: "var(--ink-dim)", fontSize: "0.82rem" }}>One per entrant, plus one per referral</div>
          </div>
          <div>
            <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Entries closed</div>
            <strong>October 1, 2026</strong>
            <div style={{ color: "var(--ink-dim)", fontSize: "0.82rem" }}>11:59:59 p.m. ET</div>
          </div>
          <div>
            <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Drawn</div>
            <strong>{drawnOn ? drawnOn.split(" at ")[0] : "—"}</strong>
            <div style={{ color: "var(--ink-dim)", fontSize: "0.82rem" }}>{drawnOn ? drawnOn.split(" at ")[1] : ""}</div>
          </div>
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", marginBottom: 5 }}>FROZEN MANIFEST HASH</div>
          <code style={{ ...mono, color: "var(--volt)", fontSize: "0.78rem" }}>{manifest.manifestHash}</code>
          <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", margin: "14px 0 5px" }}>FROZEN DRAW-SPEC HASH</div>
          <code style={{ ...mono, color: "var(--volt)", fontSize: "0.78rem" }}>{drawSpec.drawSpecHash}</code>
          <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="/giveaway/le-sserafim-2026/manifest.json" style={{ color: "var(--sky)", fontWeight: 700 }}>Download public manifest</a>
            <a href="/giveaway/le-sserafim-2026/draw-spec.json" style={{ color: "var(--sky)", fontWeight: 700 }}>Download draw spec</a>
            <a href="/giveaway/le-sserafim-2026/production-proof.json" style={{ color: "var(--sky)", fontWeight: 700 }}>Download proof</a>
            <a href="https://github.com/Francisgood/kpop-lyrics/tree/main/scripts/lsf-giveaway" target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>View verifier source ↗</a>
          </div>
        </div>
      </section>

      {productionComplete ? (
        <>
          <div style={{ margin: "26px 0 16px" }}>
            <span style={{ background: "var(--volt)", color: "var(--on-accent)", borderRadius: 999, padding: "7px 12px", fontWeight: 800, fontSize: "0.76rem" }}>PRODUCTION DRAW COMPLETE</span>
          </div>
          <CompleteProof proof={productionProof} />
        </>
      ) : (
        <>
          <section style={{ ...card, margin: "18px 0", borderColor: "var(--sky)" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem" }}>Production draw pending</h2>
            <p style={{ margin: 0, color: "var(--ink-dim)", lineHeight: 1.6 }}>The roster is frozen. The final ten IDs appear only after the live Chainlink VRF fulfillment is recorded and independently reproduced.</p>
          </section>
          <details style={{ ...card, marginTop: 18 }}>
            <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--tangerine)" }}>Open the completed rehearsal</summary>
            <div style={{ marginTop: 18 }}><CompleteProof proof={testProof} rehearsal /></div>
          </details>
        </>
      )}

      <section style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: "1.5rem" }}>How entries were weighted</h2>
        <p style={{ margin: 0, color: "var(--ink-dim)", lineHeight: 1.65 }}>
          Each entrant received one entry, plus one additional entry for every friend who entered through their referral link, exactly as the entry page promised. That is why {manifest.eligibleCount} people hold {manifest.ticketCount} entries. Every entry was ranked, and only the first entry reached for each person counts — so holding more entries improves the odds of being reached early, but nobody can occupy two positions.
        </p>
      </section>

      <section style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: "1.5rem" }}>Candidate status</h2>
        <p style={{ margin: 0, color: "var(--ink-dim)", lineHeight: 1.65 }}>
          Selection creates candidates, not confirmed prize recipients. Eligibility, response, identity, and acceptance checks happen privately. Outreach starts at position 1 in each queue and moves down only when an earlier candidate cannot proceed. The two queues never overlap and the draw is never rerun.
        </p>
      </section>

      <section style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: "1.5rem" }}>Check it yourself</h2>
        <p style={{ margin: "0 0 12px", color: "var(--ink-dim)", lineHeight: 1.65 }}>
          Clone the repository and reproduce the ten IDs above from the published files and the on-chain random word:
        </p>
        <pre style={{ ...mono, margin: 0, padding: "14px 16px", background: "var(--surface)", borderRadius: 10, fontSize: "0.78rem", overflowX: "auto" }}>
{`npm run lsf:verify -- \\
  --manifest public/giveaway/le-sserafim-2026/manifest.json \\
  --draw-spec public/giveaway/le-sserafim-2026/draw-spec.json \\
  --proof public/giveaway/le-sserafim-2026/production-proof.json`}
        </pre>
      </section>
    </main>
  );
}
