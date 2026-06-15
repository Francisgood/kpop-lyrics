import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPointTotal, getRank, PRIZE_TIERS, POINT_VALUES } from "@/lib/points";
import Link from "next/link";
import { EnrollButton, PhoneForm, ZipCodeForm } from "./RewardsClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  // ── Unauthenticated: teaser view ─────────────────────────────────────────
  if (!session) {
    return (
      <main>
        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 60%, #0f3460 100%)", color: "#fff", padding: "80px 24px 60px", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--genius-yellow)", marginBottom: 16, fontWeight: 700 }}>
              ★ Daebak Rewards Program ★
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.1 }}>
              Earn Points.<br />
              <span style={{ color: "var(--genius-yellow)" }}>Win K-pop Prizes.</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 32 }}>
              Every comment, annotation, and approved edit earns you Daebak Points.
              Redeem them for merch, plushies, desk toys, concert tickets —
              or save them to bid on your idol&apos;s signed memorabilia.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-yellow" style={{ fontSize: "1rem", padding: "14px 32px" }}>
                START EARNING →
              </Link>
              <Link href="/login" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", padding: "14px 20px", textDecoration: "none", alignSelf: "center" }}>
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Prize Tiers Preview */}
        <PrizeTiersSection points={0} teaser />

        {/* How to Earn */}
        <HowToEarnSection />
      </main>
    );
  }

  // ── Authenticated: full dashboard ────────────────────────────────────────
  const userId = session.userId;
  const user   = session.user;

  const [total, recentEvents] = await Promise.all([
    getUserPointTotal(userId),
    prisma.pointEvent.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    12,
    }),
  ]);

  const rank        = getRank(total);
  const displayName = user.displayName ?? user.email.split("@")[0];
  const joinDate    = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Progressive steps: which are done?
  const stepEnrolled = user.rewardsEnrolled;
  const stepPhone    = !!user.phone;
  const stepZip      = !!user.zipCode;

  // Next step label for CTA
  const nextStep = !stepEnrolled
    ? "enroll"
    : !stepPhone
    ? "phone"
    : !stepZip
    ? "zipcode"
    : "complete";

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 60%, #0f3460 100%)", color: "#fff", padding: "60px 24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / Dashboard"}
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--genius-yellow)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "2.2rem", color: "var(--on-accent)", flexShrink: 0, boxShadow: "0 0 0 4px rgba(255,255,100,0.2)" }}>
              {displayName[0].toUpperCase()}
            </div>

            {/* Name + rank */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                Contributor Dashboard
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>
                {displayName}
              </h1>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ background: rank.color, color: "#fff", fontSize: "0.68rem", fontWeight: 800, padding: "3px 12px", borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {rank.label}
                </span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                  Fan since {joinDate}
                </span>
              </div>
              {rank.next && (
                <div style={{ marginTop: 8, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                  {(rank.nextPts! - total).toLocaleString()} pts to reach{" "}
                  <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{rank.next}</span>
                </div>
              )}
            </div>

            {/* Big points number */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 900, color: "var(--genius-yellow)", lineHeight: 1 }}>
                {total.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
                Daebak Points
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: 24, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
            {[
              { label: "Points Earned", value: total.toLocaleString() },
              { label: "Activities", value: recentEvents.length },
              { label: "Rank", value: rank.label },
              { label: "Next Prize at", value: total >= 4000 ? "Max reached!" : `${nextThreshold(total).toLocaleString()} pts` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--genius-yellow)" }}>{value}</div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prize Tiers ──────────────────────────────────────────────────── */}
      <PrizeTiersSection points={total} />

      {/* ── Main content grid ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="responsive-sidebar-grid">

          {/* LEFT: Activity feed + How to Earn */}
          <div>
            {/* Activity Feed */}
            <section style={{ marginBottom: 48 }}>
              <div className="section-header">Recent Activity</div>
              {recentEvents.length === 0 ? (
                <div style={{ color: "var(--genius-gray)", fontSize: "0.9rem", padding: "24px 0" }}>
                  No activity yet —{" "}
                  <Link href="/artists" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "none" }}>browse artists</Link>,
                  leave a comment, or annotate a lyric to start earning!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentEvents.map((event) => (
                    <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 6 }}>
                      <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{eventEmoji(event.type)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {event.reason}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 2 }}>
                          {new Date(event.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#16a34a", fontSize: "0.95rem", flexShrink: 0 }}>
                        +{event.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <HowToEarnSection />
          </div>

          {/* RIGHT: Rewards enrollment + progressive steps */}
          <aside>
            {/* Daebak Rewards panel */}
            <div style={{ marginBottom: 24 }}>
              <div className="section-header">Daebak Rewards</div>

              {/* Step 1: Enroll */}
              <div className="genius-card" style={{ padding: 20, marginBottom: 12 }}>
                <StepHeader n={1} done={stepEnrolled} label="Join the program" />
                {stepEnrolled ? (
                  <div style={{ fontSize: "0.8rem", color: "var(--genius-gray)", marginTop: 8 }}>
                    Enrolled · prize notifications active
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: "0.82rem", color: "var(--ink-dim)", lineHeight: 1.6, marginBottom: 14 }}>
                      Get notified by email when you unlock a prize tier.
                      We&apos;ll use{" "}
                      <strong style={{ color: "var(--ink)" }}>{user.email}</strong> as your rewards email.
                    </p>
                    <EnrollButton enrolled={stepEnrolled} />
                  </div>
                )}
              </div>

              {/* Step 2: Phone */}
              <div className="genius-card" style={{ padding: 20, marginBottom: 12, opacity: stepEnrolled ? 1 : 0.45 }}>
                <StepHeader n={2} done={stepPhone} label="Add your phone" />
                {stepEnrolled ? (
                  <div style={{ marginTop: 12 }}>
                    {!stepPhone && (
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-dim)", lineHeight: 1.6, marginBottom: 12 }}>
                        Get SMS alerts when you&apos;re close to a prize — and exclusive early drop notifications.
                      </p>
                    )}
                    <PhoneForm current={user.phone ?? null} />
                  </div>
                ) : (
                  <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 8 }}>Complete step 1 first</div>
                )}
              </div>

              {/* Step 3: Zip code */}
              <div className="genius-card" style={{ padding: 20, marginBottom: 12, opacity: stepPhone ? 1 : 0.45 }}>
                <StepHeader n={3} done={stepZip} label="Your zip / postal code" />
                {stepPhone ? (
                  <div style={{ marginTop: 12 }}>
                    {!stepZip && (
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-dim)", lineHeight: 1.6, marginBottom: 12 }}>
                        We&apos;ll alert you about K-pop events, fan meets, and prize drop-offs in your area.
                      </p>
                    )}
                    <ZipCodeForm current={user.zipCode ?? null} />
                  </div>
                ) : (
                  <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 8 }}>Complete step 2 first</div>
                )}
              </div>

              {/* Points legal disclaimer */}
              <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 6 }}>
                <div style={{ fontSize: "0.68rem", color: "var(--genius-gray)", lineHeight: 1.65 }}>
                  Points are non-transferable to other accounts you have or to friends and family.
                  Each point has a cash value of $0.0000001 USD.
                  Offers across promotions cannot be combined.
                  Points expire within 1 year of earning them through approved actions on Aegyo Arena.
                </div>
              </div>
            </div>

            {/* Link to profile */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Link href={`/contributors/${userId}`} style={{ fontSize: "0.78rem", color: "var(--genius-gray)", textDecoration: "none", borderBottom: "1px solid var(--genius-border)" }}>
                View public profile →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ── Prize Tiers Section ───────────────────────────────────────────────────────
function PrizeTiersSection({ points, teaser = false }: { points: number; teaser?: boolean }) {
  return (
    <section style={{ background: "#0a0a0a", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "0.68rem", color: "var(--genius-yellow)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
            Rewards Journey
          </div>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, margin: 0 }}>
            5 Ways to Win with Your Points
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {PRIZE_TIERS.map((tier) => {
            const isAuction  = tier.points === null;
            const unlocked   = !isAuction && points >= tier.points!;
            const pct        = isAuction ? null : Math.min(100, Math.round((points / tier.points!) * 100));

            return (
              <div
                key={tier.key}
                style={{
                  background:   unlocked ? "#111" : "#111",
                  border:       `1px solid ${unlocked ? tier.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  padding:      "22px 18px",
                  position:     "relative",
                  overflow:     "hidden",
                  transition:   "border-color 0.2s",
                }}
              >
                {/* Glow strip on unlocked */}
                {unlocked && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: tier.color, borderRadius: "10px 10px 0 0" }} />
                )}

                {/* Emoji (or plushie thumbnail) + label */}
                <div style={{ fontSize: "2rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  {tier.key === "plushie" ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/bts-plushie-1.png" alt="BTS plushie" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: "50%" }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/bts-plushie-2.png" alt="BTS plushie" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: "50%" }} />
                    </>
                  ) : (
                    tier.emoji
                  )}
                </div>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem", marginBottom: 4 }}>
                  {tier.label}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 14 }}>
                  {tier.description}
                </div>

                {isAuction ? (
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: tier.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                      Auction Based
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                      Save your points — highest bidder wins
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, marginBottom: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: unlocked ? tier.color : `${tier.color}88`, borderRadius: 999, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                        {teaser ? "?" : points.toLocaleString()} / {tier.points!.toLocaleString()} pts
                      </span>
                      {unlocked ? (
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: tier.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Unlocked ✓
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
                          {teaser ? "?" : `${(tier.points! - points).toLocaleString()} to go`}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Plushie examples */}
        <div style={{ marginTop: 32, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--genius-yellow)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>
            Example Plushies · 2,000 pts tier
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["/images/bts-plushie-1.png", "/images/bts-plushie-2.png"].map((src, i) => (
              <div key={i} style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(139,92,246,0.3)", width: 160 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`BTS plushie ${i + 1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
                <div style={{ padding: "10px 12px", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                  Aegyo Arena<br />
                  <span style={{ color: "#8b5cf6", fontWeight: 700 }}>BTS Character Plushie</span>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, maxWidth: 180 }}>
                Reach <span style={{ color: "#8b5cf6", fontWeight: 700 }}>2,000 pts</span> to unlock your choice of K-pop character plushie.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How to Earn ───────────────────────────────────────────────────────────────
function HowToEarnSection() {
  const actions = [
    { emoji: "🎤", label: "Post a comment",        pts: POINT_VALUES.comment,       desc: "Comment on any song, artist, or album" },
    { emoji: "✍️", label: "Add an annotation",     pts: POINT_VALUES.annotation,    desc: "Explain a lyric line on any song page" },
    { emoji: "✅", label: "Get an edit approved",  pts: POINT_VALUES.edit_approved, desc: "Suggest an edit that gets approved by a moderator" },
    { emoji: "⭐", label: "Sign up bonus",          pts: POINT_VALUES.signup_bonus,  desc: "One-time bonus when you create your account" },
    { emoji: "🔗", label: "Link a social profile", pts: 10,                         desc: "Earn 10 pts per verified social media profile on your Aegyo Arena profile — up to 3 channels (30 pts max)" },
  ];

  return (
    <section>
      <div className="section-header">How to Earn Points</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {actions.map(({ emoji, label, pts, desc }) => (
          <div key={label} className="genius-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{label}</span>
              <span style={{ marginLeft: "auto", fontWeight: 800, color: "#16a34a", fontSize: "0.95rem", flexShrink: 0 }}>+{pts}</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Step header ───────────────────────────────────────────────────────────────
function StepHeader({ n, done, label }: { n: number; done: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: done ? "#16a34a" : "var(--genius-black)",
        color: "#fff", fontWeight: 800, fontSize: "0.75rem",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {done ? "✓" : n}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: done ? "var(--genius-gray)" : "#000" }}>
        {label}
      </div>
      {done && (
        <span style={{ marginLeft: "auto", fontSize: "0.68rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Done
        </span>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function eventEmoji(type: string): string {
  switch (type) {
    case "signup_bonus":       return "⭐";
    case "comment":            return "🎤";
    case "annotation":         return "✍️";
    case "edit_approved":      return "✅";
    case "annotation_upvoted": return "👍";
    default:                   return "🎯";
  }
}

function nextThreshold(points: number): number {
  if (points < 1000) return 1000;
  if (points < 2000) return 2000;
  if (points < 3000) return 3000;
  if (points < 4000) return 4000;
  return 4000;
}
