import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SmartImage from "@/components/SmartImage";
import { T, LangToggle } from "@/components/LangProvider";
import ProductDetail, { type DetailProduct, type DetailRow } from "@/components/shop/ProductDetail";
import {
  PLUSHIES, PRICE_SET, PRICE_SINGLE, SET_IMAGES, SET_SLUG, SET_TITLE, SPECS,
  STOCK_PER_CHARACTER, TOTAL_PRODUCED, bySlug, setStock, WORD,
} from "@/lib/plushies";

export function generateStaticParams() {
  return [{ slug: SET_SLUG }, ...PLUSHIES.map((p) => ({ slug: p.slug }))];
}

/** Spec rows shared by every product — the published part of the inspection report. */
function specRows(isSet: boolean, sku: string): DetailRow[] {
  const perUnit = isSet ? " (each)" : "";
  const perUnitEs = isSet ? " (cada uno)" : "";
  return [
    { label: { en: "Brand", es: "Marca" }, value: "Aegyo Arena" },
    { label: { en: "Collection", es: "Colección" }, value: "BABY-T-S" },
    { label: { en: "SKU", es: "SKU" }, value: sku },
    { label: { en: "Age", es: "Edad" }, value: "15+" },
    {
      label: { en: "Main material", es: "Material principal" },
      value: { en: SPECS.material.en, es: SPECS.material.es ?? SPECS.material.en },
    },
    {
      label: { en: "Product size", es: "Tamaño" },
      value: {
        en: `${SPECS.sizeCm} / ${SPECS.sizeIn}${perUnit}`,
        es: `${SPECS.sizeCm} / ${SPECS.sizeIn}${perUnitEs}`,
      },
    },
    {
      label: { en: "Weight", es: "Peso" },
      value: {
        en: `${SPECS.weightG} g (${SPECS.weightOz})${perUnit}${isSet ? ` · ${SPECS.weightG * 7} g per set` : ""}`,
        es: `${SPECS.weightG} g (${SPECS.weightOz})${perUnitEs}${isSet ? ` · ${SPECS.weightG * 7} g por set` : ""}`,
      },
    },
    {
      label: { en: "Tension strength", es: "Resistencia a la tracción" },
      value: {
        en: "Pull-tested at the hanging ring on a calibrated spring gauge — passed",
        es: "Probado en la argolla con dinamómetro calibrado — aprobado",
      },
    },
    {
      label: { en: "Inspected", es: "Inspeccionado" },
      value: {
        en: `${SPECS.inspection.dateLabel.en} · ${SPECS.inspection.qtyInspected}/${SPECS.inspection.qtyOrdered} pcs`,
        es: `${SPECS.inspection.dateLabel.es} · ${SPECS.inspection.qtyInspected}/${SPECS.inspection.qtyOrdered} pzs`,
      },
    },
    {
      label: { en: "Packing", es: "Empaque" },
      value: {
        en: `1 pc per holographic bag with hangtag · ${SPECS.packing.perCarton} pcs per carton · carton ${SPECS.cartonCm}, ${SPECS.cartonKg}`,
        es: `1 pza por bolsa holográfica con etiqueta · ${SPECS.packing.perCarton} pzs por caja · caja ${SPECS.cartonCm}, ${SPECS.cartonKg}`,
      },
    },
  ];
}

/** Size, weight, tension test and material — surfaced on every product page. */
function highlights(isSet: boolean): DetailRow[] {
  const each = isSet ? { en: " each", es: " cada uno" } : { en: "", es: "" };
  return [
    {
      label: { en: "Size", es: "Tamaño" },
      value: { en: `${SPECS.sizeCm}${each.en}`, es: `${SPECS.sizeCm}${each.es}` },
    },
    {
      label: { en: "Weight", es: "Peso" },
      value: { en: `${SPECS.weightG} g${each.en}`, es: `${SPECS.weightG} g${each.es}` },
    },
    {
      label: { en: "Tension test", es: "Prueba de tracción" },
      value: { en: "Passed", es: "Aprobada" },
    },
    {
      label: { en: "Material", es: "Material" },
      value: { en: SPECS.material.en, es: SPECS.material.es ?? SPECS.material.en },
    },
  ];
}

function buildProduct(slug: string): DetailProduct | null {
  if (slug === SET_SLUG) {
    const stock = setStock();
    return {
      slug: SET_SLUG,
      title: SET_TITLE,
      titleEs: "BABY-T-S Colgante de peluche — Set completo DAEBAK! de 7",
      letter: WORD,
      accent: "var(--sakura)",
      price: PRICE_SET,
      images: SET_IMAGES,
      stock,
      isSet: true,
      description: {
        en: `All seven BABY-T-S babies in one box — SUGA, RM, JIN, JIMIN, V, JUNGKOOK and J-HOPE — $${PRICE_SET} for the set. Lined up in order their tees read DAEBAK!, and only ${STOCK_PER_CHARACTER} of each baby were ever made.`,
        es: `Los siete babies BABY-T-S en una caja — SUGA, RM, JIN, JIMIN, V, JUNGKOOK y J-HOPE — $${PRICE_SET} el set. En orden, sus camisetas deletrean DAEBAK!, y solo se hicieron ${STOCK_PER_CHARACTER} de cada baby.`,
      },
      highlights: highlights(true),
      rows: [
        ...specRows(true, "AA-2026-SET"),
        {
          label: { en: "Includes", es: "Incluye" },
          value: {
            en: PLUSHIES.map((p) => `${p.member} “${p.letter}”`).join(" · "),
            es: PLUSHIES.map((p) => `${p.member} “${p.letter}”`).join(" · "),
          },
        },
      ],
      story: [
        {
          en: "The whole joke of BABY-T-S only lands when all seven are together. Each pendant carries one embroidered character on its tee — D, A, E, B, A, K and the exclamation mark — and on their own they read as nothing much. Put them in order on a shelf, a bag strap or a desk rail and they spell DAEBAK!, the thing you say when something is genuinely great.",
          es: "La gracia de BABY-T-S solo funciona con los siete juntos. Cada colgante lleva un carácter bordado en la camiseta — D, A, E, B, A, K y el signo de exclamación — y por separado no dicen gran cosa. Ponlos en orden en una repisa, en la correa de un bolso o en el borde del escritorio y deletrean DAEBAK!, lo que dices cuando algo es realmente bueno.",
        },
        {
          en: `Every character is a different colourway: mint hair on black, lavender on blue, black on pink, blonde on lilac, silver on caramel, black on royal blue, and red on yellow. Same body, same ${SPECS.sizeCm} footprint, same ${SPECS.weightG} g — seven distinct faces.`,
          es: `Cada personaje es una combinación distinta: menta sobre negro, lavanda sobre azul, negro sobre rosa, rubio sobre lila, plateado sobre caramelo, negro sobre azul rey y rojo sobre amarillo. Mismo cuerpo, mismos ${SPECS.sizeCm}, mismos ${SPECS.weightG} g — siete caras distintas.`,
        },
        {
          en: `Only ${STOCK_PER_CHARACTER} of each character were made — ${TOTAL_PRODUCED} figures in total across the whole run. Sets are assembled from that same stock, so when any one character sells out, the complete set goes with it.`,
          es: `Solo se fabricaron ${STOCK_PER_CHARACTER} de cada personaje — ${TOTAL_PRODUCED} figuras en total en todo el lote. Los sets se arman con ese mismo inventario, así que cuando se agota un personaje, el set completo se agota con él.`,
        },
      ],
    };
  }

  const p = bySlug(slug);
  if (!p) return null;

  return {
    slug: p.slug,
    title: `BABY-T-S ${p.member} Plush Pendant — “${p.letter}”`,
    titleEs: `BABY-T-S Colgante de peluche ${p.member} — “${p.letter}”`,
    letter: p.letter,
    accent: p.accent,
    price: PRICE_SINGLE,
    images: p.images,
    stock: p.stock,
    isSet: false,
    description: {
      en: `${p.tagline.en} ${p.blurb.en}`,
      es: `${p.tagline.es ?? p.tagline.en} ${p.blurb.es ?? p.blurb.en}`,
    },
    highlights: highlights(false),
    rows: [
      ...specRows(false, p.sku),
      {
        label: { en: "Colourway", es: "Combinación" },
        value: {
          en: `${p.hair.en} hair · ${p.body.en} body · “${p.letter}” tee`,
          es: `Cabello ${(p.hair.es ?? p.hair.en).toLowerCase()} · cuerpo ${(p.body.es ?? p.body.en).toLowerCase()} · camiseta “${p.letter}”`,
        },
      },
    ],
    story: [
      {
        en: `${p.member} hangs from a metal clasp and split ring, so the pendant goes straight onto a bag, a belt loop or a key ring without any extra hardware. The letter is embroidered, not printed — it won't crack or peel the way a transfer does.`,
        es: `${p.member} cuelga de un mosquetón metálico con argolla, así que el colgante se engancha directo a un bolso, una presilla o un llavero sin nada extra. La letra está bordada, no impresa — no se agrieta ni se despega como un estampado.`,
      },
      {
        en: `This is one of ${PLUSHIES.length} characters in the BABY-T-S collection. Collect all seven — ${PLUSHIES.map((x) => x.member).join(", ")} — and their tees spell DAEBAK! in order.`,
        es: `Este es uno de ${PLUSHIES.length} personajes de la colección BABY-T-S. Júntalos los siete — ${PLUSHIES.map((x) => x.member).join(", ")} — y sus camisetas deletrean DAEBAK! en orden.`,
      },
      {
        en: `Only ${STOCK_PER_CHARACTER} ${p.member} figures were produced, out of ${TOTAL_PRODUCED} across the collection. Each one was measured, weighed and pull-tested at final inspection on ${SPECS.inspection.dateLabel.en}.`,
        es: `Solo se produjeron ${STOCK_PER_CHARACTER} figuras de ${p.member}, de ${TOTAL_PRODUCED} en toda la colección. Cada una fue medida, pesada y sometida a prueba de tracción en la inspección final del ${SPECS.inspection.dateLabel.es}.`,
      },
    ],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = buildProduct(slug);
  if (!product) return { title: "Not found — Aegyo Arena" };
  return {
    title: `${product.title} — Aegyo Arena`,
    description: product.description.en,
    openGraph: { title: product.title, description: product.description.en, images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = buildProduct(slug);
  if (!product) notFound();

  // "You may also like" — the rest of the collection, set first on a single PDP.
  const related = [
    ...(product.isSet
      ? []
      : [{
          slug: SET_SLUG, title: "Complete DAEBAK! Set of 7", titleEs: "Set completo DAEBAK! de 7",
          price: PRICE_SET, image: SET_IMAGES[0], accent: "var(--sakura)", letter: "SET", stock: setStock(),
        }]),
    ...PLUSHIES.filter((p) => p.slug !== slug).map((p) => ({
      slug: p.slug, title: `${p.member} Plush Pendant`, titleEs: `Colgante de peluche ${p.member}`,
      price: PRICE_SINGLE, image: p.images[0], accent: p.accent, letter: p.letter, stock: p.stock,
    })),
  ];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.82rem", color: "var(--ink-faint)", marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>HOME</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>SHOP</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>BABY-T-S</Link>
        <span>/</span>
        <span style={{ color: "var(--ink-dim)" }}>{product.title}</span>
      </nav>

      <LangToggle align="flex-start" marginBottom={20} />

      <ProductDetail product={product} />

      {/* You may also like */}
      <section style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", color: "var(--ink)", margin: "0 0 22px" }}>
          <T en="You may also like" es="También te puede gustar" />
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 18 }}>
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/shop/${r.slug}`}
              style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#EEF0F3" }}>
                <SmartImage src={r.image} alt={r.title} fill sizes="200px" style={{ objectFit: "contain", padding: 12 }} />
                <span
                  style={{
                    position: "absolute", bottom: 8, right: 8, minWidth: 26, height: 26, padding: "0 7px", borderRadius: 7,
                    background: r.accent, color: "#1B2027", display: "grid", placeItems: "center", fontWeight: 900,
                    fontSize: r.letter.length > 1 ? "0.6rem" : "0.85rem",
                  }}
                >
                  {r.letter}
                </span>
              </div>
              <div style={{ padding: "13px 14px 15px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.35 }}>
                  <T en={r.title} es={r.titleEs} />
                </div>
                <div style={{ fontWeight: 900, fontSize: "0.98rem", color: "var(--ink)", marginTop: 6 }}>${r.price.toFixed(2)}</div>
                {r.stock <= 0 && (
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 4 }}>
                    <T en="Out of stock" es="Agotado" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
