// BABY-T-S — the seven-plushie collection that spells DAEBAK!
//
// Single source of truth for the /shop collection page and every product detail
// page. Prices, stock and spec rows all come from here, so a restock or a price
// change is a one-file edit.
//
// Spec figures are transcribed from the factory's final inspection report
// (和顺玩具 / Heshun Toys, item no. hollysz001, O/C no. HB260103-1001E,
// inspected 2026-10-12, 700 pcs inspected against a 700 pc order). Do not edit
// them without a newer report — they're published as a disclosure, not copy.

export type Localized = { en: string; es?: string };

export type Plushie = {
  slug: string;
  /** Position in the word DAEBAK! — 0-indexed, drives the set lineup order. */
  order: number;
  /** The letter embroidered on this plushie's tee. */
  letter: string;
  member: string;
  sku: string;
  /** Accent colour used for the letter chip, card border and PDP highlights. */
  accent: string;
  hair: Localized;
  body: Localized;
  images: string[];
  /** Units produced for this character. 0 ⇒ the PDP shows NOTIFY ME WHEN AVAILABLE. */
  stock: number;
  tagline: Localized;
  blurb: Localized;
};

export const PRICE_SINGLE = 25;
export const PRICE_SET = 150;
/** 7 × $25 = $175, so the set saves $25. */
export const SET_SAVINGS = PRICE_SINGLE * 7 - PRICE_SET;

/** Shared across all seven — they're the same body, different colourway. */
export const SPECS = {
  sizeCm: "9.5 × 9.5 × 5.5 cm",
  sizeIn: "3.7 × 3.7 × 2.2 in",
  weightG: 40,
  weightOz: "1.4 oz",
  /** Outer carton, from the report's CARTON SIZE / G.W. row. */
  cartonCm: "60 × 45 × 30 cm",
  cartonKg: "3.5 kg",
  /** 14 cartons, 50 pcs per polybag per carton, 1 pc per laser bag + hangtag. */
  packing: { cartons: 14, perCarton: 50 },
  inspection: {
    date: "2026-10-12",
    dateLabel: { en: "12 October 2026", es: "12 de octubre de 2026" } as Localized,
    itemNo: "hollysz001",
    orderNo: "HB260103-1001E",
    qtyInspected: 700,
    qtyOrdered: 700,
  },
} as const;

export const STOCK_PER_CHARACTER = 100;

export const PLUSHIES: Plushie[] = [
  {
    slug: "suga",
    order: 0,
    letter: "D",
    member: "SUGA",
    sku: "AA-2026-D",
    accent: "#3FBF6A",
    hair: { en: "Mint", es: "Menta" },
    body: { en: "Black", es: "Negro" },
    images: ["/images/plushies/suga-1.png", "/images/plushies/suga-2.png", "/images/plushies/suga-3.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "The D that starts it all.", es: "La D con la que todo empieza." },
    blurb: {
      en: "Mint hair, all-black body, and a green D stitched across the tee. He opens the word — line him up first and the other six have something to follow.",
      es: "Cabello menta, cuerpo negro y una D verde bordada en la camiseta. Él abre la palabra — ponlo primero y los otros seis ya tienen a quién seguir.",
    },
  },
  {
    slug: "rm",
    order: 1,
    letter: "A",
    member: "RM",
    sku: "AA-2026-A1",
    accent: "#4A86E8",
    hair: { en: "Lavender", es: "Lavanda" },
    body: { en: "Blue", es: "Azul" },
    images: ["/images/plushies/rm-1.png", "/images/plushies/rm-2.png", "/images/plushies/rm-3.png", "/images/plushies/rm-4.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "The first A.", es: "La primera A." },
    blurb: {
      en: "Lavender hair over a blue body, with a navy A on the chest. The first of the collection's two A's — and the one with the tiny satisfied smirk.",
      es: "Cabello lavanda sobre cuerpo azul, con una A azul marino en el pecho. La primera de las dos A de la colección — y la de la sonrisita satisfecha.",
    },
  },
  {
    slug: "jin",
    order: 2,
    letter: "E",
    member: "JIN",
    sku: "AA-2026-E",
    accent: "#FF4FA3",
    hair: { en: "Black", es: "Negro" },
    body: { en: "Pink", es: "Rosa" },
    images: ["/images/plushies/jin-1.png", "/images/plushies/jin-2.png", "/images/plushies/jin-3.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "Pink body, open-mouth grin.", es: "Cuerpo rosa, sonrisa abierta." },
    blurb: {
      en: "Soft pink body, jet-black hair, and a magenta E. The widest grin in the set — the only one caught mid-laugh rather than mid-smile.",
      es: "Cuerpo rosa suave, cabello negro azabache y una E magenta. La sonrisa más amplia del set — el único atrapado riéndose, no sonriendo.",
    },
  },
  {
    slug: "jimin",
    order: 3,
    letter: "B",
    member: "JIMIN",
    sku: "AA-2026-B",
    accent: "#B8A0FF",
    hair: { en: "Blonde", es: "Rubio" },
    body: { en: "Lilac", es: "Lila" },
    images: ["/images/plushies/jimin-1.png", "/images/plushies/jimin-2.png", "/images/plushies/jimin-3.png", "/images/plushies/jimin-4.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "Blonde on lilac.", es: "Rubio sobre lila." },
    blurb: {
      en: "Bright blonde hair against a lilac body, with a cobalt B. The softest colourway in the collection and the one that photographs best on a bag strap.",
      es: "Cabello rubio brillante sobre cuerpo lila, con una B cobalto. La combinación más suave de la colección y la que mejor se ve colgada de un bolso.",
    },
  },
  {
    slug: "v",
    order: 4,
    letter: "A",
    member: "V",
    sku: "AA-2026-A2",
    accent: "#D98A3C",
    hair: { en: "Silver", es: "Plateado" },
    body: { en: "Caramel", es: "Caramelo" },
    images: ["/images/plushies/v-1.png", "/images/plushies/v-2.png", "/images/plushies/v-3.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "The second A.", es: "La segunda A." },
    blurb: {
      en: "Silver hair with a dark under-cap, a caramel body, and a red A. Sits in the second-to-last slot — the A that turns DAEB into DAEBA.",
      es: "Cabello plateado con base oscura, cuerpo caramelo y una A roja. Ocupa el penúltimo lugar — la A que convierte DAEB en DAEBA.",
    },
  },
  {
    slug: "jungkook",
    order: 5,
    letter: "K",
    member: "JUNGKOOK",
    sku: "AA-2026-K",
    accent: "#1F6FEB",
    hair: { en: "Black", es: "Negro" },
    body: { en: "Royal blue", es: "Azul rey" },
    images: ["/images/plushies/jungkook-3.png", "/images/plushies/jungkook-1.png", "/images/plushies/jungkook-2.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "Closes the word.", es: "Cierra la palabra." },
    blurb: {
      en: "Black hair under a royal-blue hood, blue body, red K. The last letter before the exclamation mark — and the deepest colour in the lineup.",
      es: "Cabello negro bajo una capucha azul rey, cuerpo azul, K roja. La última letra antes del signo de exclamación — y el color más intenso de la fila.",
    },
  },
  {
    slug: "j-hope",
    order: 6,
    letter: "!",
    member: "J-HOPE",
    sku: "AA-2026-EX",
    accent: "#FFC53D",
    hair: { en: "Red", es: "Rojo" },
    body: { en: "Yellow", es: "Amarillo" },
    images: ["/images/plushies/j-hope-1.png", "/images/plushies/j-hope-2.png", "/images/plushies/j-hope-3.png", "/images/plushies/j-hope-4.png"],
    stock: STOCK_PER_CHARACTER,
    tagline: { en: "The exclamation mark.", es: "El signo de exclamación." },
    blurb: {
      en: "Red hair, yellow body, red exclamation mark. The only non-letter in the set — without him the word is just DAEBAK, not DAEBAK!",
      es: "Cabello rojo, cuerpo amarillo, signo de exclamación rojo. El único que no es una letra — sin él la palabra es solo DAEBAK, no DAEBAK!",
    },
  },
];

export const SET_SLUG = "daebak-full-set";

export const SET_IMAGES = [
  // The clean studio lineup already on the site (all seven in DAEBAK! order),
  // then the inspection-report shots: front row, side profiles, height check.
  "/images/redesign/hero-plush.png",
  "/images/plushies/set-1.png",
  "/images/plushies/set-2.png",
  "/images/plushies/set-3.png",
];

/** The word the seven spell, in order. */
export const WORD = PLUSHIES.map((p) => p.letter).join(""); // DAEBAK!

/** Size of the production run — fixed by the factory order, unlike live stock. */
export const TOTAL_PRODUCED = STOCK_PER_CHARACTER * PLUSHIES.length;

/** A set can only ship while every character is still in stock. */
export const setStock = (): number => Math.min(...PLUSHIES.map((p) => p.stock));

export const totalStock = (): number => PLUSHIES.reduce((n, p) => n + p.stock, 0);

export const bySlug = (slug: string): Plushie | undefined => PLUSHIES.find((p) => p.slug === slug);

/** Title shown on cards, PDPs and in the cart. */
export const productTitle = (p: Plushie): string => `BABY-T-S ${p.member} Plush Pendant — “${p.letter}”`;

export const SET_TITLE = "BABY-T-S Plush Pendant — Complete DAEBAK! Set of 7";
