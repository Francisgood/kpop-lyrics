import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import manifestJson from "@/public/giveaway/bts-2026/manifest.json";
import drawSpecJson from "@/public/giveaway/bts-2026/draw-spec.json";
import productionProofJson from "@/public/giveaway/bts-2026/production-proof.json";
import testProofJson from "@/public/giveaway/bts-2026/test-proof.json";

export const metadata: Metadata = {
  title: "BTS Giveaway Draw Transparency | Aegyo Arena",
  description: "Public roster commitment and reproducible Chainlink VRF candidate selection evidence.",
};

type Candidate = { publicId: string; score: string; position: number };
type DrawProof = {
  status: "pending" | "complete";
  mode: "test" | "production";
  proofHash?: string;
  manifestHash?: string;
  eligibleCount?: number;
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
const mono: CSSProperties = {
  fontFamily: "var(--mono)",
  overflowWrap: "anywhere",
};

function CandidateList({ title, candidates, runnerUp = false }: { title: string; candidates: Candidate[]; runnerUp?: boolean }) {
  return (
    <section style={card}>
      <div style={{ fontFamily: "var(--mono)", color: runnerUp ? "var(--sky)" : "var(--sakura)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
        {candidates.map((candidate) => (
          <li key={candidate.publicId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", background: "var(--surface)", borderRadius: 10 }}>
            <span style={{ ...mono, color: "var(--ink-faint)", fontSize: "0.78rem", minWidth: 24 }}>#{candidate.position}</span>
            <strong style={{ ...mono, color: "var(--ink)", fontSize: "0.96rem" }}>{candidate.publicId}</strong>
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
  const randomness = proof.randomness;
  const fulfillmentUrl = randomness?.explorerBaseUrl && randomness.fulfillmentTx
    ? `${randomness.explorerBaseUrl}/tx/${randomness.fulfillmentTx}`
    : null;
  const requestUrl = randomness?.explorerBaseUrl && randomness.requestTx
    ? `${randomness.explorerBaseUrl}/tx/${randomness.requestTx}`
    : null;
  const deploymentUrl = randomness?.explorerBaseUrl && randomness.deploymentTx
    ? `${randomness.explorerBaseUrl}/tx/${randomness.deploymentTx}`
    : null;
  const consumerUrl = randomness?.explorerBaseUrl && randomness.consumerAddress
    ? `${randomness.explorerBaseUrl}/address/${randomness.consumerAddress}`
    : null;
  const sourceUrl = randomness?.codeCommit
    ? `https://github.com/mateodaza/kpop-lyrics/commit/${randomness.codeCommit}`
    : null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {rehearsal && (
        <div role="note" style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--tangerine)", background: "rgba(255,140,66,0.12)", color: "var(--ink)" }}>
          <strong>Rehearsal only.</strong> These IDs are not winners and must not be contacted. This proves the scripts are deterministic before the live VRF request.
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
          <Evidence label="Randomness">{randomness?.source}</Evidence>
          <Evidence label="Random word">{randomness?.randomWord}</Evidence>
          <Evidence label="Manifest hash">{proof.manifestHash}</Evidence>
          {randomness?.drawSpecHash && <Evidence label="Draw-spec hash">{randomness.drawSpecHash}</Evidence>}
          <Evidence label="Proof hash">{proof.proofHash}</Evidence>
          {randomness?.chainName && <Evidence label="Network">{randomness.chainName} ({randomness.chainId})</Evidence>}
          {randomness?.consumerAddress && <Evidence label="Consumer">{randomness.consumerAddress}</Evidence>}
          {randomness?.wrapperAddress && <Evidence label="Chainlink wrapper">{randomness.wrapperAddress}</Evidence>}
          {randomness?.requestId && <Evidence label="Request ID">{randomness.requestId}</Evidence>}
          {randomness?.codeCommit && <Evidence label="Source commit">{randomness.codeCommit}</Evidence>}
        </dl>
        {(deploymentUrl || consumerUrl || requestUrl || fulfillmentUrl || sourceUrl) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 16 }}>
            {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>Open source commit ↗</a>}
            {deploymentUrl && <a href={deploymentUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>Open deployment transaction ↗</a>}
            {consumerUrl && <a href={consumerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>Open consumer contract ↗</a>}
            {requestUrl && <a href={requestUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>Open request transaction ↗</a>}
            {fulfillmentUrl && <a href={fulfillmentUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>Open fulfillment transaction ↗</a>}
          </div>
        )}
      </section>
    </div>
  );
}

export default function GiveawayDrawPage() {
  const productionComplete = productionProof.status === "complete";
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "52px 24px 80px" }}>
      <div style={{ marginBottom: 30 }}>
        <Link href="/bts-giveaway" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>← BTS Giveaway</Link>
        <div style={{ fontFamily: "var(--mono)", color: "var(--sakura)", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 24 }}>Public draw evidence</div>
        <h1 style={{ fontSize: "clamp(2.35rem, 8vw, 4.5rem)", lineHeight: 1, margin: "10px 0 16px" }}>A draw anyone can reproduce.</h1>
        <p style={{ color: "var(--ink-dim)", lineHeight: 1.7, fontSize: "1.05rem", maxWidth: 720 }}>
          The private subscriber roster is committed by hash before the live randomness request. Personal data stays private; public IDs, the selection algorithm, and verification evidence stay public.
        </p>
      </div>

      <section style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
          <div><div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Eligible entries</div><strong style={{ fontSize: "2rem" }}>{manifest.eligibleCount}</strong></div>
          <div><div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cutoff</div><strong>July 17, 2026</strong><div style={{ color: "var(--ink-dim)", fontSize: "0.82rem" }}>11:59:59 p.m. ET</div></div>
          <div><div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Selection</div><strong>5 + 5</strong><div style={{ color: "var(--ink-dim)", fontSize: "0.82rem" }}>Grand-prize + runner-up queues</div></div>
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", marginBottom: 5 }}>FROZEN MANIFEST HASH</div>
          <code style={{ ...mono, color: "var(--volt)", fontSize: "0.78rem" }}>{manifest.manifestHash}</code>
          <div style={{ color: "var(--ink-faint)", fontSize: "0.75rem", margin: "14px 0 5px" }}>FROZEN DRAW-SPEC HASH</div>
          <code style={{ ...mono, color: "var(--volt)", fontSize: "0.78rem" }}>{drawSpec.drawSpecHash}</code>
          <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="/giveaway/bts-2026/manifest.json" style={{ color: "var(--sky)", fontWeight: 700 }}>Download public manifest</a>
            <a href="/giveaway/bts-2026/draw-spec.json" style={{ color: "var(--sky)", fontWeight: 700 }}>Download draw spec</a>
            <a href="https://github.com/Francisgood/kpop-lyrics/tree/main/scripts/giveaway" target="_blank" rel="noreferrer" style={{ color: "var(--sky)", fontWeight: 700 }}>View verifier source ↗</a>
          </div>
        </div>
      </section>

      {productionComplete ? (
        <>
          <div style={{ margin: "26px 0 16px" }}><span style={{ background: "var(--volt)", color: "var(--on-accent)", borderRadius: 999, padding: "7px 12px", fontWeight: 800, fontSize: "0.76rem" }}>PRODUCTION DRAW COMPLETE</span></div>
          <CompleteProof proof={productionProof} />
        </>
      ) : (
        <>
          <section style={{ ...card, margin: "18px 0", borderColor: "var(--sky)" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem" }}>Production draw pending</h2>
            <p style={{ margin: 0, color: "var(--ink-dim)", lineHeight: 1.6 }}>The roster is frozen. The final ten IDs will appear only after the live Chainlink VRF fulfillment is recorded and independently reproduced.</p>
          </section>
          <details style={{ ...card, marginTop: 18 }}>
            <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--tangerine)" }}>Open the completed rehearsal</summary>
            <div style={{ marginTop: 18 }}><CompleteProof proof={testProof} rehearsal /></div>
          </details>
        </>
      )}

      <section style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: "1.5rem" }}>Candidate status</h2>
        <p style={{ margin: 0, color: "var(--ink-dim)", lineHeight: 1.65 }}>Selection creates potential candidates, not confirmed prize recipients. Eligibility, response, KYC, and acceptance are completed privately. Start with position 1 in each prize queue and move down only when the earlier candidate cannot proceed.</p>
      </section>
    </main>
  );
}
