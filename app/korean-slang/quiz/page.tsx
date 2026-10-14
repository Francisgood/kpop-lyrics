import type { Metadata } from "next";
import Link from "next/link";
import { getSlangData } from "@/lib/slang-terms";
import { getSession } from "@/lib/auth";
import SlangQuiz from "@/components/SlangQuiz";
import { T, LangToggle } from "@/components/LangProvider";

export const dynamic = "force-dynamic"; // reads the session + current terms per request

export const metadata: Metadata = {
  title: "Korean Slang Practice Quiz — Aegyo Arena",
  description:
    "Practice the Korean slang you've been collecting. A fresh 10-question round every time, drawn from your deck and the words you missed. Score 100% to earn 10 points.",
  alternates: { canonical: "/korean-slang/quiz" },
};

export default async function SlangQuizPage() {
  const [{ deckTerms }, session] = await Promise.all([getSlangData(), getSession()]);

  return (
    <main>
      <section style={{ borderBottom: "1px solid var(--border)", background: "linear-gradient(180deg, #4AC8F020, transparent)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "34px 24px 30px", textAlign: "center" }}>
          <LangToggle align="center" marginBottom={16} />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 18 }}>
            <Link href="/korean-slang" style={{ color: "var(--ink-faint)", textDecoration: "none" }}><T en="Slang Deck" es="Mazo de Jerga" /></Link>
            {" / "}
            <span style={{ color: "var(--ink-dim)" }}><T en="Practice Quiz" es="Quiz de Práctica" /></span>
          </div>
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>💬</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.7rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 12px", color: "var(--ink)" }}>
            <T en="Practice your slang deck" es="Practica tu mazo de jerga" />
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--ink-dim)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 18px" }}>
            <T
              en="Ten questions drawn from the cards you've been picking up — the words you missed come first. Clear a perfect 10 for +10 points, once a day."
              es="Diez preguntas sacadas de las tarjetas que has ido recogiendo — las palabras que fallaste van primero. Haz un 10 perfecto y gana +10 puntos, una vez al día."
            />
          </p>
          {!session && (
            <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", margin: 0 }}>
              <T en="Playing as a guest — " es="Jugando como invitado — " />
              <Link href="/login?next=/korean-slang/quiz" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
                <T en="log in to earn points" es="inicia sesión para ganar puntos" />
              </Link>
            </p>
          )}
        </div>
      </section>

      <section style={{ padding: "36px 24px 72px" }}>
        <SlangQuiz terms={deckTerms} loggedIn={!!session} />
      </section>
    </main>
  );
}
