// Shared K-pop quiz data — single source of truth for the /quiz pages and the
// homepage QuizModal. Each category is a standalone, individually shareable quiz.
//
// BILINGUAL (EN/ES): every user-facing string has an optional `…Es` sibling.
// Renderers show the Es value when the site language is "es" and fall back to the
// English field whenever an Es value is absent. Two hard rules:
//   1. `answer` is an INDEX into `options` — it is language-independent and is the
//      ONLY source of truth for correctness. Never key correctness off any string.
//   2. `optionsEs` MUST have the same length and the same ORDER as `options`, so
//      index i means the same choice in both languages. Es fields are DISPLAY ONLY.
// Fields whose content is proper nouns, song titles, lyrics or Korean terms being
// quizzed are intentionally left without an Es variant — they fall back to English.

export type QuizQuestion = {
  q: string;
  qEs?: string;
  options: string[];
  optionsEs?: string[];   // same length + same order as `options` (display only)
  answer: number;         // canonical index into `options` — never translated
  explanation: string;
  explanationEs?: string;
  image?: string;      // optional illustrative GIF/image shown above the options
  imageAlt?: string;
  imageAltEs?: string;
  sourceUrl?: string;    // optional "watch the clip" link shown at the bottom of the question
  sourceLabel?: string;
  sourceLabelEs?: string;
  learnMoreUrl?: string;   // optional internal link shown AFTER answering (e.g. the slang dictionary entry)
  learnMoreLabel?: string;
  learnMoreLabelEs?: string;
};

export type QuizCategory = {
  id: string;
  slug: string;          // URL segment: /quiz/<slug>
  title: string;         // page + social title
  titleEs?: string;
  label: string;         // short display name
  labelEs?: string;
  emoji: string;
  accent: string;        // per-quiz accent colour (distinct social identity)
  blurb: string;         // one-line hook for the hub card
  blurbEs?: string;
  description: string;   // meta / OpenGraph description
  descriptionEs?: string;
  questions: QuizQuestion[];
};

export const QUIZZES: QuizCategory[] = [
  {
    id: "aegyo",
    slug: "aegyo",
    title: "Aegyo & Aegyo-Sal Quiz",
    titleEs: "Trivia de Aegyo y Aegyo-Sal",
    blurb: "Aegyo-sal, buing buing, and the science of cute — how fluent are you in K-pop's charm code?",
    blurbEs: "Aegyo-sal, buing buing y la ciencia de lo tierno — ¿qué tan fluida eres en el código de encanto del K-pop?",
    description: "What is aegyo-sal? Why do East Asian cultures prize aegyo as charming rather than attention-seeking? Test your knowledge of K-pop's cuteness code — the eye-smile, the gestures, and the science of cute — in this 10-question Aegyo quiz on Aegyo Arena.",
    descriptionEs: "¿Qué es el aegyo-sal? ¿Por qué las culturas del este de Asia ven el aegyo como algo encantador y no como llamar la atención? Pon a prueba lo que sabes del código de ternura del K-pop — la sonrisa de ojitos, los gestos y la ciencia de lo tierno — en esta trivia de Aegyo de 10 preguntas en Aegyo Arena.",
    label: "Aegyo",
    emoji: "🥺",
    accent: "#C77DFF",
    questions: [
      {
        q: "The K-beauty term 애교살 (aegyo-sal) refers to which facial feature?",
        qEs: "¿A qué rasgo facial se refiere el término de K-beauty 애교살 (aegyo-sal)?",
        options: [
          "A deep dimple that appears in the cheek when smiling",
          "The small roll of muscle right under the lower lash line that puffs up in a smile",
          "The rosy flush high on the cheekbones",
          "The crease of a double eyelid",
        ],
        optionsEs: [
          "Un hoyuelo profundo que aparece en la mejilla al sonreír",
          "El pequeño rollito de músculo justo debajo de las pestañas inferiores que se infla al sonreír",
          "El rubor rosado en la parte alta de los pómulos",
          "El pliegue del párpado doble",
        ],
        answer: 1,
        explanation: "애교살 literally means 'charm flesh' (애교 aegyo = charm + 살 sal = flesh). It's the little band of orbicularis-oculi muscle just beneath the lower lashes that plumps into a soft ridge when you smile, making the eyes look bigger, brighter and more expressive.",
        explanationEs: "애교살 significa literalmente 'carne de encanto' (애교 aegyo = encanto + 살 sal = carne). Es la pequeña banda del músculo orbicular de los ojos justo debajo de las pestañas inferiores que se abulta en un relieve suave cuando sonríes, haciendo que los ojos se vean más grandes, más brillantes y más expresivos.",
      },
      {
        q: "How is aegyo-sal different from an 'eye bag'?",
        qEs: "¿En qué se diferencia el aegyo-sal de una 'bolsa en el ojo'?",
        options: [
          "They're identical — just two words for the same thing",
          "Aegyo-sal is the thin cute ridge right under the lashes; eye bags are the lower, saggier puffiness read as tired or aging",
          "Aegyo-sal only appears on men",
          "Eye bags are considered cute; aegyo-sal is considered aging",
        ],
        optionsEs: [
          "Son idénticos — solo dos palabras para lo mismo",
          "El aegyo-sal es el relieve delgado y tierno justo debajo de las pestañas; las bolsas son la hinchazón más abajo y caída que se lee como cansancio o edad",
          "El aegyo-sal solo aparece en los hombres",
          "Las bolsas se consideran tiernas; el aegyo-sal se considera envejecedor",
        ],
        answer: 1,
        explanation: "Position is everything. Aegyo-sal sits directly under the lash line and reads as youthful and charming; true under-eye bags (눈밑지방) sit lower and are associated with fatigue and aging. K-beauty makeup exaggerates the former while concealing the latter.",
        explanationEs: "La posición lo es todo. El aegyo-sal va justo debajo de la línea de pestañas y se lee como juvenil y encantador; las verdaderas bolsas bajo los ojos (눈밑지방) van más abajo y se asocian con el cansancio y la edad. El maquillaje K-beauty exagera lo primero y disimula lo segundo.",
      },
      {
        q: "K-pop's classic aegyo 'eye smile' — cheeks up, eyes curved into crescents, finger hearts out (as in this GIF) — is prized because it…",
        qEs: "La clásica 'sonrisa de ojitos' del aegyo en el K-pop — mejillas arriba, ojos curvados en medialunas, finger hearts listos (como en este GIF) — se valora porque…",
        image: "/images/quiz/aegyo-expression.gif",
        imageAlt: "A K-pop idol smiling with a doe-eyed 'eye smile' and pointing at her cheeks with finger hearts — a classic aegyo expression.",
        imageAltEs: "Una idol de K-pop sonriendo con una 'sonrisa de ojitos' y señalando sus mejillas con finger hearts — una expresión clásica de aegyo.",
        options: [
          "Makes her look older and more authoritative",
          "Makes the eyes read as bigger, younger and warmer — the aegyo-sal effect",
          "Signals that she is about to cry",
          "Only works under bright stage lighting",
        ],
        optionsEs: [
          "Hace que se vea mayor y con más autoridad",
          "Hace que los ojos se vean más grandes, más jóvenes y más cálidos — el efecto aegyo-sal",
          "Indica que está a punto de llorar",
          "Solo funciona bajo luces brillantes de escenario",
        ],
        answer: 1,
        explanation: "That crescent 'eye smile' — cheeks up, aegyo-sal plumped — is the visual core of aegyo. The plumped under-eye makes the eyes look larger and more childlike, which people instinctively find endearing (the 'baby schema').",
        explanationEs: "Esa 'sonrisa de ojitos' en medialuna — mejillas arriba, aegyo-sal abultado — es el núcleo visual del aegyo. El abultamiento bajo el ojo hace que los ojos se vean más grandes y más infantiles, algo que la gente encuentra tierno por puro instinto (el 'esquema de bebé').",
      },
      {
        q: "Idols are constantly asked to 'do aegyo' on variety shows. A move like the hands-framing-the-face, sing-song pose in this GIF is best described as…",
        qEs: "A los idols les piden 'hacer aegyo' todo el tiempo en los programas de variedades. Un movimiento como el de las manos enmarcando la cara con vocecita cantada de este GIF se describe mejor como…",
        image: "/images/quiz/aegyo-pose.gif",
        imageAlt: "A K-pop idol cupping her face with both hands in a cutesy 'flower' aegyo pose surrounded by floating hearts.",
        imageAltEs: "Una idol de K-pop ahuecando su cara con ambas manos en una pose de aegyo tipo 'flor' rodeada de corazones flotantes.",
        options: [
          "A martial-arts guard position",
          "A performed act of cuteness — like 뿌잉뿌잉 (buing buing) or the 'Gwiyomi' play",
          "A traditional court bow",
          "A vocal warm-up exercise",
        ],
        optionsEs: [
          "Una posición de guardia de artes marciales",
          "Un acto de ternura actuado — como 뿌잉뿌잉 (buing buing) o el juego del 'Gwiyomi'",
          "Una reverencia tradicional de la corte",
          "Un ejercicio de calentamiento vocal",
        ],
        answer: 1,
        explanation: "Aegyo isn't only a look, it's a performance — cutesy voice, gestures and poses like 뿌잉뿌잉 (buing buing, twisting fists at the cheeks) or the viral 'Gwiyomi' counting play. Variety shows love putting idols on the spot to perform it.",
        explanationEs: "El aegyo no es solo una cara, es una actuación — vocecita tierna, gestos y poses como 뿌잉뿌잉 (buing buing, girando los puños en las mejillas) o el viral juego de contar 'Gwiyomi'. A los programas de variedades les encanta poner a los idols en aprietos para que lo hagan.",
      },
      {
        q: "Why is aegyo considered a socially acceptable way to draw attention or ask for a favour?",
        qEs: "¿Por qué el aegyo se considera una forma socialmente aceptable de llamar la atención o pedir un favor?",
        options: [
          "Because it signals wealth and high social status",
          "Because acting endearing feels warm and non-threatening, so it wins affection without seeming arrogant or pushy",
          "Because it is legally required of service workers",
          "Because it removes the need to ever say thank you",
        ],
        optionsEs: [
          "Porque indica riqueza y alto estatus social",
          "Porque actuar tierno se siente cálido y nada amenazante, así que gana cariño sin parecer arrogante ni insistente",
          "Porque es un requisito legal para los trabajadores de servicio",
          "Porque elimina la necesidad de dar las gracias",
        ],
        answer: 1,
        explanation: "In cultures that prize social harmony, openly demanding attention can read as arrogant. Aegyo reframes the ask as playful and endearing — a soft, face-saving way to seek affection, defuse tension, or coax a 'yes' without confrontation.",
        explanationEs: "En las culturas que valoran la armonía social, exigir atención abiertamente puede leerse como arrogancia. El aegyo replantea la petición como algo juguetón y tierno — una manera suave de buscar cariño, bajar la tensión o sacar un 'sí' sin confrontación y sin que nadie quede mal.",
      },
      {
        q: "Japan has a closely related beauty ideal for the coveted under-eye plumpness. What is it called?",
        qEs: "Japón tiene un ideal de belleza muy parecido para el codiciado abultamiento bajo los ojos. ¿Cómo se llama?",
        options: [
          "涙袋 (namida-bukuro), literally 'tear bag'",
          "漫画 (manga)",
          "侘寂 (wabi-sabi)",
          "木漏れ日 (komorebi)",
        ],
        optionsEs: [
          "涙袋 (namida-bukuro), literalmente 'bolsa de lágrimas'",
          "漫画 (manga)",
          "侘寂 (wabi-sabi)",
          "木漏れ日 (komorebi)",
        ],
        answer: 0,
        explanation: "Japan calls the prized under-eye plumpness 涙袋 (namida-bukuro), 'tear bag,' valued for the same youthful, doe-eyed effect. The broader cute-culture parallel is kawaii — Korea's aegyo and Japan's kawaii are close cousins.",
        explanationEs: "Japón llama 涙袋 (namida-bukuro), 'bolsa de lágrimas', al preciado abultamiento bajo los ojos, valorado por el mismo efecto juvenil de ojos grandes. El paralelo más amplio en la cultura de lo tierno es el kawaii — el aegyo coreano y el kawaii japonés son primos hermanos.",
      },
      {
        q: "How do K-beauty makeup artists fake or boost aegyo-sal?",
        qEs: "¿Cómo fingen o potencian el aegyo-sal los maquilladores de K-beauty?",
        options: [
          "By drawing one thick black line across the entire under-eye",
          "By dabbing a shimmery light shade on the ridge and a thin soft-brown shadow just beneath it",
          "By applying bright red blush directly under the eye",
          "By gluing false lashes onto the lower lid only",
        ],
        optionsEs: [
          "Dibujando una línea negra gruesa a lo largo de todo el contorno inferior",
          "Aplicando con toquecitos un tono claro con brillo sobre el relieve y una sombra café suave y delgada justo debajo",
          "Aplicando rubor rojo intenso justo debajo del ojo",
          "Pegando pestañas postizas solo en el párpado inferior",
        ],
        answer: 1,
        explanation: "The trick is light and shadow: a pearly highlight on the aegyo-sal ridge catches the light so it looks plump, and a faint brown line underneath fakes the natural shadow — creating a 3-D 'pillow' under the eye. Fillers and fat-grafting do it more permanently.",
        explanationEs: "El truco es luz y sombra: un iluminador perlado sobre el relieve del aegyo-sal atrapa la luz para que se vea abultado, y una línea café tenue debajo finge la sombra natural — creando una 'almohadita' en 3D bajo el ojo. Los rellenos y el injerto de grasa lo logran de forma más permanente.",
      },
      {
        q: "Who performs aegyo in Korean pop culture?",
        qEs: "¿Quién hace aegyo en la cultura pop coreana?",
        options: [
          "Only female idols",
          "Only trainees under 18",
          "Everyone — male idols are regularly asked to do it too, and it's used among friends, couples, and even toward elders or bosses",
          "Only actors, never singers",
        ],
        optionsEs: [
          "Solo las idols mujeres",
          "Solo los trainees menores de 18",
          "Todos — a los idols hombres también se lo piden seguido, y se usa entre amigos, parejas e incluso con mayores o jefes",
          "Solo los actores, nunca los cantantes",
        ],
        answer: 2,
        explanation: "Though often stereotyped as feminine, aegyo is performed by male idols on cue (frequently for comedic effect), and everyday aegyo shows up between friends, couples, and even toward elders or bosses to soften a request. It's a whole social register, not just a girl-group thing.",
        explanationEs: "Aunque suele estereotiparse como femenino, los idols hombres hacen aegyo cuando se lo piden (muchas veces para dar risa), y el aegyo cotidiano aparece entre amigos, parejas e incluso con mayores o jefes para suavizar una petición. Es todo un registro social, no solo cosa de girl groups.",
      },
      {
        q: "The 2013 viral 'Gwiyomi (귀요미) Player' craze — idols counting '1 + 1' with escalating cuteness — is a textbook example of what?",
        qEs: "La fiebre viral de 2013 del 'Gwiyomi (귀요미) Player' — idols contando '1 + 1' con ternura en aumento — es un ejemplo de manual ¿de qué?",
        image: "/images/quiz/aegyo-gwiyomi.gif",
        imageAlt: "A performer doing the Gwiyomi Song's cutesy counting routine, hands framing the face — the aegyo gesture that went viral.",
        imageAltEs: "Una artista haciendo la tierna rutina de contar de la Gwiyomi Song, con las manos enmarcando la cara — el gesto de aegyo que se volvió viral.",
        options: [
          "A dance-battle format",
          "A meme-ified aegyo performance that spread worldwide",
          "A cooking-show segment",
          "A rap cypher",
        ],
        optionsEs: [
          "Un formato de batalla de baile",
          "Una actuación de aegyo vuelta meme que se esparció por todo el mundo",
          "Un segmento de programa de cocina",
          "Un cypher de rap",
        ],
        answer: 1,
        explanation: "귀요미 means 'cutie.' The Gwiyomi Song turned aegyo into a copy-me challenge — an escalating cutesy counting routine — and it went global, showing how aegyo doubles as shareable, participatory content.",
        explanationEs: "귀요미 significa 'cosita linda'. La Gwiyomi Song convirtió el aegyo en un reto de imítame — una rutina de contar cada vez más tierna — y se volvió global, mostrando que el aegyo también funciona como contenido participativo y compartible.",
        sourceUrl: "https://www.youtube.com/watch?v=YjZ1vd1YgOE",
        sourceLabel: "Watch the Gwiyomi Song clip on YouTube",
        sourceLabelEs: "Mira el clip de la Gwiyomi Song en YouTube",
      },
      {
        q: "Scientists explain the universal pull of aegyo with the 'baby schema' (Kindchenschema). What is it?",
        qEs: "Los científicos explican el atractivo universal del aegyo con el 'esquema de bebé' (Kindchenschema). ¿Qué es?",
        options: [
          "A theory about how babies acquire language",
          "The instinct to feel warmth and a protective urge toward big-eyed, round, childlike features",
          "A standardized K-pop training curriculum",
          "A camera lens that digitally enlarges the eyes",
        ],
        optionsEs: [
          "Una teoría sobre cómo los bebés adquieren el lenguaje",
          "El instinto de sentir ternura y ganas de proteger ante rasgos redondos, infantiles y de ojos grandes",
          "Un plan de entrenamiento estandarizado de K-pop",
          "Un lente de cámara que agranda los ojos digitalmente",
        ],
        answer: 1,
        explanation: "Ethologist Konrad Lorenz described how big eyes, round cheeks and small chins trigger caregiving instincts across humans. Aegyo — and aegyo-sal's big-eyed effect — deliberately leans into this, a big reason cuteness works so well as social currency.",
        explanationEs: "El etólogo Konrad Lorenz describió cómo los ojos grandes, las mejillas redondas y los mentones pequeños activan el instinto de cuidado en los humanos. El aegyo — y el efecto de ojos grandes del aegyo-sal — se apoya en esto a propósito, y por eso la ternura funciona tan bien como moneda social.",
      },
    ],
  },
  {
    id: "slang",
    slug: "kpop-dictionary",
    title: "K-pop Dictionary Quiz",
    titleEs: "Trivia del Diccionario K-pop",
    blurb: "Bias wrecker, daesang, maknae, fancam — how fluent are you in fandom slang?",
    blurbEs: "Bias wrecker, daesang, maknae, fancam — ¿qué tan fluida eres en el slang del fandom?",
    description: "Bias wrecker, daesang, maknae, fancam — how fluent are you in K-pop fandom slang? Take the 5-question K-pop Dictionary quiz on Aegyo Arena.",
    descriptionEs: "Bias wrecker, daesang, maknae, fancam — ¿cuánto slang del fandom K-pop dominas? Juega la trivia del Diccionario K-pop de 5 preguntas en Aegyo Arena.",
    label: "K-pop Dictionary",
    labelEs: "Diccionario K-pop",
    emoji: "📖",
    accent: "#FFD700",
    questions: [
      {
        q: "What does 'bias wrecker' mean in K-pop fandom?",
        qEs: "¿Qué significa 'bias wrecker' en el fandom del K-pop?",
        options: [
          "Your absolute favourite member in a group",
          "A member who keeps threatening to replace your bias",
          "An obsessive fan who follows idols everywhere",
          "A blogger who writes negative reviews of idols",
        ],
        optionsEs: [
          "Tu miembro favorito absoluto de un grupo",
          "Un miembro que amenaza constantemente con reemplazar a tu bias",
          "Un fan obsesivo que sigue a los idols a todos lados",
          "Un blogger que escribe reseñas negativas de los idols",
        ],
        answer: 1,
        explanation: "A bias wrecker is a member you didn't choose, but who constantly steals your attention — 'wrecking' your loyalty to your actual bias.",
        explanationEs: "Un bias wrecker es un miembro que no elegiste, pero que te roba la atención sin parar — 'destruyendo' la lealtad hacia tu bias de verdad.",
      },
      {
        q: "A K-pop 'comeback' refers to...",
        qEs: "Un 'comeback' en el K-pop se refiere a...",
        options: [
          "A disbanded group permanently reuniting",
          "A group returning from a world tour",
          "Any new music release after a period of absence",
          "An idol returning from mandatory military service",
        ],
        optionsEs: [
          "Un grupo disuelto que se reúne de forma permanente",
          "Un grupo que vuelve de una gira mundial",
          "Cualquier lanzamiento de música nueva tras un periodo de ausencia",
          "Un idol que regresa del servicio militar obligatorio",
        ],
        answer: 2,
        explanation: "In K-pop, even a group releasing music just weeks after their last release calls it a 'comeback' — it's any new promotional cycle.",
        explanationEs: "En el K-pop, hasta un grupo que saca música apenas semanas después de su último lanzamiento le dice 'comeback' — es cualquier ciclo promocional nuevo.",
      },
      {
        q: "'Daesang' (대상) at K-pop award shows means...",
        qEs: "'Daesang' (대상) en las premiaciones de K-pop significa...",
        options: [
          "Best Choreography award",
          "Best Music Video award",
          "A special debut award",
          "The Grand Prize — the highest honour in K-pop",
        ],
        optionsEs: [
          "Premio a la Mejor Coreografía",
          "Premio al Mejor Video Musical",
          "Un premio especial de debut",
          "El Gran Premio — el máximo honor del K-pop",
        ],
        answer: 3,
        explanation: "Daesang (大賞) translates literally as 'grand prize' — winning one at MAMA or Melon Music Awards is the peak achievement in K-pop.",
        explanationEs: "Daesang (大賞) se traduce literalmente como 'gran premio' — ganar uno en los MAMA o en los Melon Music Awards es el logro máximo del K-pop.",
      },
      {
        q: "The 'maknae' of a group is...",
        qEs: "El 'maknae' de un grupo es...",
        options: [
          "The leader who handles all press interviews",
          "The main dancer with the most fancam views",
          "The youngest member, often doted on by the group",
          "The member who writes all original songs",
        ],
        optionsEs: [
          "El líder que se encarga de todas las entrevistas de prensa",
          "El bailarín principal con más vistas en fancams",
          "El miembro más joven, casi siempre consentido por el grupo",
          "El miembro que escribe todas las canciones originales",
        ],
        answer: 2,
        explanation: "막내 (maknae) means the youngest person. In idol groups, the maknae is often treated like the group's baby — babied by senior members and beloved by fans.",
        explanationEs: "막내 (maknae) significa la persona más joven. En los grupos de idols, al maknae lo tratan como el bebé del grupo — consentido por los miembros mayores y adorado por los fans.",
      },
      {
        q: "A 'fancam' is...",
        qEs: "Un 'fancam' es...",
        options: [
          "A crowd-sourced voting app for idol polls",
          "An official fan club membership card",
          "A video focused on one specific member during a group performance",
          "The camera rig used during music video shoots",
        ],
        optionsEs: [
          "Una app de votación colectiva para encuestas de idols",
          "Una tarjeta oficial de membresía del fan club",
          "Un video enfocado en un miembro específico durante una presentación grupal",
          "El equipo de cámara que se usa en los rodajes de videos musicales",
        ],
        answer: 2,
        explanation: "Fancams track a single member throughout an entire performance. Lisa's MAMA 2019 fancam passed 400 million views — a record that helped introduce many fans to K-pop.",
        explanationEs: "Los fancams siguen a un solo miembro durante toda la presentación. El fancam de Lisa en los MAMA 2019 superó los 400 millones de vistas — un récord que le presentó el K-pop a un montón de fans.",
      },
    ],
  },
  {
    id: "korean-slang",
    slug: "korean-slang",
    title: "Korean Slang Quiz",
    titleEs: "Trivia de Slang Coreano",
    blurb: "치맥, 눈치, 대박, 리즈 — do you actually speak K-pop's Korean slang?",
    blurbEs: "치맥, 눈치, 대박, 리즈 — ¿de verdad hablas el slang coreano del K-pop?",
    description: "치맥, 눈치, 대박, 리즈 — how much everyday Korean slang do you actually know? Test yourself on 10 real Korean expressions from the Aegyo Arena slang dictionary.",
    descriptionEs: "치맥, 눈치, 대박, 리즈 — ¿cuánto slang coreano del día a día te sabes en serio? Ponte a prueba con 10 expresiones coreanas reales del diccionario de slang de Aegyo Arena.",
    label: "Korean Slang",
    labelEs: "Slang Coreano",
    emoji: "💬",
    accent: "#4AC8F0",
    questions: [
      {
        q: "A fan shouts '대박 (daebak)!' the moment their group wins a Daesang. What does 대박 express?",
        qEs: "Una fan grita '대박 (daebak)!' justo cuando su grupo gana un Daesang. ¿Qué expresa 대박?",
        options: [
          "\"Better luck next time\"",
          "\"Awesome! / Jackpot!\" — total amazement",
          "\"I'm so bored\"",
          "\"Let's go home\"",
        ],
        optionsEs: [
          "\"Suerte para la próxima\"",
          "\"¡Increíble! / ¡Jackpot!\" — asombro total",
          "\"Qué aburrimiento\"",
          "\"Vámonos a casa\"",
        ],
        answer: 1,
        explanation: "대박 originally meant 'great success' or 'jackpot/windfall,' then became an all-purpose exclamation of amazement. It's one of the most widely borrowed Korean words in global fandom — used for shock announcements, stunning visuals, or surprise chart wins.",
        explanationEs: "대박 originalmente significaba 'gran éxito' o 'jackpot/golpe de suerte', y después se volvió una exclamación de asombro para todo. Es una de las palabras coreanas más adoptadas por el fandom global — se usa para anuncios impactantes, visuales espectaculares o triunfos sorpresa en las listas.",
        learnMoreUrl: "/korean-slang/daebak",
        learnMoreLabel: "Read the full 대박 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 대박 en el diccionario K-pop →",
      },
      {
        q: "치맥 (chimaek) — a Korean national institution and variety-show staple — is a mashup of which two things?",
        qEs: "치맥 (chimaek) — una institución nacional coreana y un clásico de los programas de variedades — es la mezcla ¿de qué dos cosas?",
        options: [
          "Cheese + macaroni",
          "Fried chicken + beer (치킨 + 맥주)",
          "Tea + rice cake",
          "Chili + noodles",
        ],
        optionsEs: [
          "Queso + macarrones",
          "Pollo frito + cerveza (치킨 + 맥주)",
          "Té + pastel de arroz",
          "Chile + fideos",
        ],
        answer: 1,
        explanation: "치맥 = 치킨 (chicken) + 맥주 (beer) — Korea's beloved fried-chicken-and-beer pairing. It's so iconic it has its own festival in Daegu, and idols reference it constantly (and endorse chicken brands).",
        explanationEs: "치맥 = 치킨 (pollo) + 맥주 (cerveza) — la adorada combinación coreana de pollo frito con cerveza. Es tan icónica que tiene su propio festival en Daegu, y los idols la mencionan todo el tiempo (y hasta son imagen de marcas de pollo).",
        learnMoreUrl: "/korean-slang/chimaek",
        learnMoreLabel: "Read the full 치맥 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 치맥 en el diccionario K-pop →",
      },
      {
        q: "An idol who gracefully reads the mood of a room and responds perfectly is said to have great 눈치 (nunchi). What is it?",
        qEs: "De un idol que capta el ambiente de un lugar con elegancia y responde perfecto se dice que tiene mucho 눈치 (nunchi). ¿Qué es?",
        options: [
          "A powerful singing voice",
          "Social awareness — the ability to read the room and unspoken cues",
          "A huge fan following",
          "Flawless dance timing",
        ],
        optionsEs: [
          "Una voz potente para cantar",
          "Sensibilidad social — la capacidad de leer el ambiente y las señales no dichas",
          "Un montón de seguidores",
          "Un timing de baile impecable",
        ],
        answer: 1,
        explanation: "눈치 (literally 'eye-measure') is the Korean art of reading a room — catching unspoken cues and reacting appropriately. Good 눈치 helps idols handle interviews and group dynamics gracefully; lacking it is a classic criticism of tone-deaf behavior.",
        explanationEs: "눈치 (literalmente 'medida del ojo') es el arte coreano de leer el ambiente — captar las señales no dichas y reaccionar como corresponde. Tener buen 눈치 ayuda a los idols a manejar entrevistas y dinámicas de grupo con soltura; que te falte es la crítica clásica cuando alguien no capta nada.",
        learnMoreUrl: "/korean-slang/nunchi",
        learnMoreLabel: "Read the full 눈치 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 눈치 en el diccionario K-pop →",
      },
      {
        q: "정 (jeong) is often called untranslatable. What does it describe?",
        qEs: "A 정 (jeong) muchas veces le dicen intraducible. ¿Qué describe?",
        options: [
          "A quick crush that fades fast",
          "A deep attachment and affection that builds slowly over time",
          "A signed business contract",
          "Rage at a rival group",
        ],
        optionsEs: [
          "Un flechazo rápido que se desvanece enseguida",
          "Un apego y cariño profundo que se construye lento con el tiempo",
          "Un contrato de negocios firmado",
          "Rabia contra un grupo rival",
        ],
        answer: 1,
        explanation: "정 is a uniquely Korean concept — the deep, sticky bond that grows through shared history. It's the loyalty between longtime members and the attachment fans feel after following an idol through every era. You can even develop 정 for a song or a place.",
        explanationEs: "정 es un concepto muy coreano — el vínculo profundo y pegajoso que crece con la historia compartida. Es la lealtad entre miembros de toda la vida y el apego que sienten los fans tras seguir a un idol por cada era. Hasta puedes desarrollar 정 por una canción o un lugar.",
        learnMoreUrl: "/korean-slang/jeong",
        learnMoreLabel: "Read the full 정 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 정 en el diccionario K-pop →",
      },
      {
        q: "In K-pop commentary, a veteran who lectures younger groups about 'real talent' and 'the old ways' might be called a 꼰대 (kkondae). Who is that?",
        qEs: "En los comentarios de K-pop, a un veterano que sermonea a los grupos más jóvenes sobre el 'talento de verdad' y 'cómo se hacían las cosas antes' le pueden decir 꼰대 (kkondae). ¿Quién es?",
        options: [
          "A generous mentor",
          "A preachy, out-of-touch older person who moralizes at younger people",
          "A backup dancer",
          "A first-time concertgoer",
        ],
        optionsEs: [
          "Un mentor generoso",
          "Una persona mayor sermoneadora y desconectada que moraliza a los más jóvenes",
          "Un bailarín de respaldo",
          "Alguien que va a su primer concierto",
        ],
        answer: 1,
        explanation: "꼰대 is the rigid elder who constantly references 'back in my day' and lectures juniors. Gen Z broadened it into a catch-all for any condescending, boomer-style moralizing — including industry vets who gatekeep what counts as 'real' K-pop.",
        explanationEs: "꼰대 es el mayor rígido que vive diciendo 'en mis tiempos' y sermonea a los más jóvenes. La Gen Z lo amplió para cualquier moralina condescendiente estilo boomer — incluidos los veteranos de la industria que deciden qué cuenta como K-pop 'de verdad'.",
        learnMoreUrl: "/korean-slang/kkondae",
        learnMoreLabel: "Read the full 꼰대 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 꼰대 en el diccionario K-pop →",
      },
      {
        q: "Your bias flashes an unexpected sweet smile and you feel 심쿵 (simkung). What just happened?",
        qEs: "Tu bias suelta una sonrisa dulce inesperada y sientes 심쿵 (simkung). ¿Qué acaba de pasar?",
        options: [
          "Your heart skipped and fluttered (심장 + 쿵, a 'heart-thud')",
          "You fell asleep",
          "You got a headache",
          "You won a giveaway",
        ],
        optionsEs: [
          "Tu corazón dio un brinco y se aceleró (심장 + 쿵, un 'golpe de corazón')",
          "Te quedaste dormida",
          "Te dio dolor de cabeza",
          "Ganaste un sorteo",
        ],
        answer: 0,
        explanation: "심쿵 = 심장 (heart) + 쿵 (a thud sound) — the little heart-drop when an idol does something unexpectedly charming. It's one of the most common reactions to idol content, from a casual vlog smile to a breathtaking stage look.",
        explanationEs: "심쿵 = 심장 (corazón) + 쿵 (el sonido de un golpe) — el brinquito del corazón cuando un idol hace algo inesperadamente encantador. Es una de las reacciones más comunes al contenido de idols, desde una sonrisa casual en un vlog hasta un look de escenario que te deja sin aire.",
        learnMoreUrl: "/korean-slang/simkung",
        learnMoreLabel: "Read the full 심쿵 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 심쿵 en el diccionario K-pop →",
      },
      {
        q: "Fans call an idol's 2016 comeback their 리즈 (rijeu). Surprisingly, this slang for 'peak/prime era' traces back to…",
        qEs: "Los fans le dicen 리즈 (rijeu) al comeback de 2016 de un idol. Sorprendentemente, este slang para 'la época de máximo esplendor' viene de…",
        options: [
          "A famous Korean poet",
          "The English football club Leeds United",
          "A makeup brand",
          "A kind of flower",
        ],
        optionsEs: [
          "Un poeta coreano famoso",
          "El club de fútbol inglés Leeds United",
          "Una marca de maquillaje",
          "Un tipo de flor",
        ],
        answer: 1,
        explanation: "리즈 means someone's absolute prime — their best-looking, best-performing era. It traces back through a Korean internet meme to Leeds United (a footballer's 'Leeds era' being his peak). Now it's pure K-pop shorthand: 'that was her 리즈 era.'",
        explanationEs: "리즈 significa el mejor momento absoluto de alguien — su era de mejor look y mejor desempeño. Viene, vía un meme del internet coreano, del Leeds United (la 'era Leeds' de un futbolista era su punto más alto). Hoy es puro código K-pop: 'esa fue su era 리즈'.",
        learnMoreUrl: "/korean-slang/rijeu",
        learnMoreLabel: "Read the full 리즈 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 리즈 en el diccionario K-pop →",
      },
      {
        q: "An idol films a cozy vlog of themselves 혼밥 (honbap). What are they doing?",
        qEs: "Un idol graba un vlog acogedor haciendo 혼밥 (honbap). ¿Qué está haciendo?",
        options: [
          "Cooking a feast for the whole group",
          "Eating alone (혼자 + 밥)",
          "Ordering the most expensive dish on the menu",
          "Skipping a meal to practice",
        ],
        optionsEs: [
          "Cocinando un banquete para todo el grupo",
          "Comiendo solo (혼자 + 밥)",
          "Pidiendo el platillo más caro del menú",
          "Saltándose una comida para ensayar",
        ],
        answer: 1,
        explanation: "혼밥 = 혼자 (alone) + 밥 (meal) — eating solo. Once mildly stigmatized in Korea's communal food culture, it was normalized in the mid-2010s, and idol 혼밥 vlogs now look downright aspirational. (Its drinking cousin is 혼술, honsul.)",
        explanationEs: "혼밥 = 혼자 (solo) + 밥 (comida) — comer sin compañía. Antes estaba algo mal visto en la cultura comunal de la comida coreana, pero se normalizó a mediados de los 2010, y hoy los vlogs de 혼밥 de los idols se ven hasta aspiracionales. (Su primo alcohólico es el 혼술, honsul.)",
        learnMoreUrl: "/korean-slang/honbap",
        learnMoreLabel: "Read the full 혼밥 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 혼밥 en el diccionario K-pop →",
      },
      {
        q: "A surprise disbandment announcement leaves the whole fandom in total 멘붕 (menbung). What is it?",
        qEs: "Un anuncio sorpresa de disolución deja a todo el fandom en 멘붕 (menbung) total. ¿Qué es?",
        options: [
          "A dance formation",
          "A mental breakdown — being totally overwhelmed (멘탈 붕괴)",
          "A ticketing website",
          "A celebration party",
        ],
        optionsEs: [
          "Una formación de baile",
          "Un colapso mental — quedar totalmente rebasada (멘탈 붕괴)",
          "Un sitio de venta de boletos",
          "Una fiesta de celebración",
        ],
        answer: 1,
        explanation: "멘붕 is short for 멘탈 붕괴 ('mental collapse') — the brain-melting overwhelm of too much to process, whether it's a shocking controversy, a surprise comeback, or a performance so good your brain short-circuits.",
        explanationEs: "멘붕 es la forma corta de 멘탈 붕괴 ('colapso mental') — ese derretimiento de cerebro cuando hay demasiado que procesar, sea una controversia impactante, un comeback sorpresa o una presentación tan buena que te hace cortocircuito.",
        learnMoreUrl: "/korean-slang/menbung",
        learnMoreLabel: "Read the full 멘붕 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 멘붕 en el diccionario K-pop →",
      },
      {
        q: "Fans hold up an idol's 5 a.m. workouts and language study as 갓생 (gatsaeng) goals. What does 갓생 mean?",
        qEs: "Los fans ponen los entrenamientos a las 5 a.m. y el estudio de idiomas de un idol como metas de 갓생 (gatsaeng). ¿Qué significa 갓생?",
        options: [
          "A lazy day off",
          "The ideal disciplined, maximally productive 'god life' (갓 + 생)",
          "A concert afterparty",
          "A crash diet",
        ],
        optionsEs: [
          "Un día libre de pura flojera",
          "La 'vida de dios' ideal: disciplinada y máximamente productiva (갓 + 생)",
          "Un afterparty de concierto",
          "Una dieta exprés",
        ],
        answer: 1,
        explanation: "갓생 = 갓 (god, as in 'godlike') + 생 (life) — living a disciplined, growth-focused, ultra-productive existence. Fans admire idols' punishing routines (early workouts, multi-language study, perfectionist rehearsals) as 갓생 inspiration.",
        explanationEs: "갓생 = 갓 (dios, como en 'divino') + 생 (vida) — vivir una existencia disciplinada, enfocada en crecer y ultraproductiva. Los fans admiran las rutinas brutales de los idols (entrenar temprano, estudiar varios idiomas, ensayos perfeccionistas) como inspiración de 갓생.",
        learnMoreUrl: "/korean-slang/gatsaeng",
        learnMoreLabel: "Read the full 갓생 entry in the K-pop dictionary →",
        learnMoreLabelEs: "Lee la entrada completa de 갓생 en el diccionario K-pop →",
      },
    ],
  },
  {
    id: "artist",
    slug: "artist-facts",
    title: "Artist Facts Quiz",
    titleEs: "Trivia de Datos de Artistas",
    blurb: "Debuts, labels, lineups and lore. Do you really know your faves?",
    blurbEs: "Debuts, disqueras, alineaciones y lore. ¿De verdad conoces a tus faves?",
    description: "Debuts, labels, lineups and lore — do you really know your faves? Take the 5-question K-pop Artist Facts quiz on Aegyo Arena.",
    descriptionEs: "Debuts, disqueras, alineaciones y lore — ¿de verdad conoces a tus faves? Juega la trivia de Datos de Artistas de K-pop de 5 preguntas en Aegyo Arena.",
    label: "Artist Facts",
    labelEs: "Datos de Artistas",
    emoji: "🎤",
    accent: "#FF6B9D",
    questions: [
      {
        q: "Lisa founded her own entertainment label in January 2024. What is it called?",
        qEs: "Lisa fundó su propia disquera de entretenimiento en enero de 2024. ¿Cómo se llama?",
        // options are proper nouns — no Es variant needed, they fall back to English.
        options: ["Manoban Music", "Bangkok Records", "Lloud", "LALI Entertainment"],
        answer: 2,
        explanation: "Lloud Co., Ltd. is Lisa's independent label, backed by a global distribution deal with RCA Records (Sony Music) — making her the first K-pop idol of her generation to own her own company.",
        explanationEs: "Lloud Co., Ltd. es la disquera independiente de Lisa, respaldada por un acuerdo global de distribución con RCA Records (Sony Music) — lo que la convierte en la primera idol de K-pop de su generación en ser dueña de su propia empresa.",
      },
      {
        q: "How many members does SEVENTEEN have?",
        qEs: "¿Cuántos miembros tiene SEVENTEEN?",
        options: ["7", "9", "11", "13"],
        answer: 3,
        explanation: "SEVENTEEN has 13 members — hence the name '13 + teen'. They're split into three units: Hip-Hop, Vocal, and Performance.",
        explanationEs: "SEVENTEEN tiene 13 miembros — de ahí el nombre '13 + teen'. Están divididos en tres unidades: Hip-Hop, Vocal y Performance.",
      },
      {
        q: "aespa's groundbreaking concept involves each member having...",
        qEs: "El concepto revolucionario de aespa consiste en que cada miembro tiene...",
        options: [
          "A real-life twin who performs as a body double",
          "A virtual AI counterpart called an 'æ'",
          "A solo alter ego with a different stage name",
          "A holographic avatar used on stage",
        ],
        optionsEs: [
          "Una gemela de la vida real que actúa como doble",
          "Una contraparte virtual de IA llamada 'æ'",
          "Un alter ego solista con otro nombre artístico",
          "Un avatar holográfico que se usa en el escenario",
        ],
        answer: 1,
        explanation: "Each aespa member has an 'æ' — a virtual AI version of themselves living in the digital world called KWANGYA. This dual-world concept is central to the SMCU (SM Culture Universe) lore.",
        explanationEs: "Cada miembro de aespa tiene un 'æ' — una versión virtual de sí misma hecha con IA que vive en el mundo digital llamado KWANGYA. Este concepto de dos mundos es clave en el lore del SMCU (SM Culture Universe).",
      },
      {
        q: "Which group was formed through the 2020 survival show 'I-Land'?",
        qEs: "¿Qué grupo se formó a través del programa de supervivencia 'I-Land' de 2020?",
        options: ["TXT", "Stray Kids", "ENHYPEN", "Zerobaseone"],
        answer: 2,
        explanation: "ENHYPEN was formed through 'I-Land', co-produced by HYBE and CJ ENM. Their vampire-inspired debut concept and coming-of-age themes quickly earned them a massive global fanbase.",
        explanationEs: "ENHYPEN se formó en 'I-Land', coproducido por HYBE y CJ ENM. Su concepto de debut inspirado en vampiros y sus temas sobre crecer les ganaron rapidísimo un fandom global enorme.",
      },
      {
        q: "Which BLACKPINK member debuted as a solo artist first?",
        qEs: "¿Qué miembro de BLACKPINK debutó primero como solista?",
        options: ["Jisoo", "Rosé", "Jennie", "Lisa"],
        answer: 2,
        explanation: "Jennie released 'SOLO' in November 2018, making her the first BLACKPINK member to go solo. The track topped Korean charts and announced her as a formidable solo force.",
        explanationEs: "Jennie lanzó 'SOLO' en noviembre de 2018, siendo la primera miembro de BLACKPINK en ir por su cuenta. El tema llegó a lo más alto de las listas coreanas y la presentó como una fuerza solista imparable.",
      },
    ],
  },
  {
    id: "mukbang",
    slug: "mukbang",
    title: "Mukbang & Food Quiz",
    titleEs: "Trivia de Mukbang y Comida",
    blurb: "Idol eating shows, viral street-food moments and Korean food culture.",
    blurbEs: "Programas de idols comiendo, momentos virales de comida callejera y cultura gastronómica coreana.",
    description: "Idol mukbangs, viral street-food moments and Korean food culture — take the 5-question Mukbang and Food quiz on Aegyo Arena.",
    descriptionEs: "Mukbangs de idols, momentos virales de comida callejera y cultura gastronómica coreana — juega la trivia de Mukbang y Comida de 5 preguntas en Aegyo Arena.",
    label: "Mukbang & Food",
    labelEs: "Mukbang y Comida",
    emoji: "🍜",
    accent: "#FF6B35",
    questions: [
      {
        q: "Which BTS member is universally known as the group's biggest eater and the unofficial king of idol mukbang?",
        qEs: "¿Qué miembro de BTS es conocido por todos como el que más come del grupo y el rey no oficial del mukbang de idols?",
        options: [
          "RM — he stress-eats before studio sessions",
          "Jin — earned the nickname 'Worldwide Handsome Eater'",
          "V — he eats black bean noodles every single day",
          "Jungkook — documented eating 3 full meals before sunrise",
        ],
        optionsEs: [
          "RM — come por estrés antes de las sesiones de estudio",
          "Jin — se ganó el apodo de 'Worldwide Handsome Eater'",
          "V — come fideos de frijol negro todos los días",
          "Jungkook — documentado comiendo 3 comidas completas antes del amanecer",
        ],
        answer: 1,
        explanation: "Jin (Kim Seokjin) is BTS's legendary eater — nicknamed for his theatrical food reactions and ability to finish everyone else's leftovers. His mukbang content on Weverse consistently goes viral. He once ate an entire convenience store haul live on camera.",
        explanationEs: "Jin (Kim Seokjin) es el comelón legendario de BTS — apodado así por sus reacciones teatrales ante la comida y su habilidad para acabarse las sobras de todos. Su contenido de mukbang en Weverse se vuelve viral siempre. Una vez se comió un mandado entero de tienda de conveniencia en vivo frente a la cámara.",
      },
      {
        q: "In IVE's 'I AM' music video, Wonyoung is seen eating which iconic Korean street food that sent fans into a frenzy of fan cams?",
        qEs: "En el video musical de 'I AM' de IVE se ve a Wonyoung comiendo una icónica comida callejera coreana que desató una locura de fancams. ¿Cuál es?",
        options: [
          "Tteokbokki (spicy rice cakes)",
          "Hotteok (sweet pancake)",
          "Bungeoppang (fish-shaped pastry)",
          "Corn Dog (gamja hot dog)",
        ],
        optionsEs: [
          "Tteokbokki (pasteles de arroz picantes)",
          "Hotteok (panqueque dulce)",
          "Bungeoppang (pastelito con forma de pez)",
          "Corn Dog (gamja hot dog)",
        ],
        answer: 2,
        explanation: "Bungeoppang — the fish-shaped red bean pastry — became a Wonyoung meme after she was spotted eating one on a winter schedule. Fans recreated photos holding bungeoppang trying to 'match her vibe.' The pastry briefly sold out near Starship Entertainment.",
        explanationEs: "El bungeoppang — el pastelito con forma de pez relleno de frijol rojo dulce — se volvió un meme de Wonyoung después de que la vieran comiendo uno en una agenda de invierno. Los fans recrearon fotos sosteniendo bungeoppang intentando 'igualar su vibra'. El pastelito se agotó un buen rato cerca de Starship Entertainment.",
      },
      {
        q: "Lisa went viral for her authentic Thai food content. Which dish does she consistently rank as her absolute comfort food from home?",
        qEs: "Lisa se volvió viral por su contenido de comida tailandesa auténtica. ¿Qué platillo pone siempre como su comida reconfortante favorita de casa?",
        options: [
          "Pad Thai — she calls it 'the standard'",
          "Som Tum (green papaya salad) — she claims it cures everything",
          "Khao Man Gai (chicken rice) — reminds her of her mum",
          "Mango sticky rice — she ships it to Paris on weekends",
        ],
        optionsEs: [
          "Pad Thai — le dice 'el estándar'",
          "Som Tum (ensalada de papaya verde) — dice que lo cura todo",
          "Khao Man Gai (arroz con pollo) — le recuerda a su mamá",
          "Mango sticky rice — se lo manda a París los fines de semana",
        ],
        answer: 1,
        explanation: "Som Tum (ส้มตำ) — Thai green papaya salad — is Lisa's documented comfort food. In interviews she's said it's the first thing she craves when she misses Bangkok. She's been photographed at Thai restaurants in Seoul ordering it regardless of the season.",
        explanationEs: "El Som Tum (ส้มตำ) — la ensalada tailandesa de papaya verde — es la comida reconfortante documentada de Lisa. En entrevistas ha dicho que es lo primero que se le antoja cuando extraña Bangkok. La han fotografiado en restaurantes tailandeses de Seúl pidiéndolo sin importar la temporada.",
      },
      {
        q: "The Korean word '먹방' (mukbang) is a portmanteau of which two Korean words?",
        qEs: "La palabra coreana '먹방' (mukbang) es la fusión ¿de qué dos palabras coreanas?",
        options: [
          "먹다 (meokda, to eat) + 방송 (bangsong, broadcast)",
          "먹거리 (meokgeori, food) + 방문 (bangmun, visit)",
          "맛있다 (masitda, delicious) + 방 (bang, room)",
          "먹다 (meokda, to eat) + 방탄 (bangtan, bulletproof)",
        ],
        optionsEs: [
          "먹다 (meokda, comer) + 방송 (bangsong, transmisión)",
          "먹거리 (meokgeori, comida) + 방문 (bangmun, visita)",
          "맛있다 (masitda, delicioso) + 방 (bang, cuarto)",
          "먹다 (meokda, comer) + 방탄 (bangtan, a prueba de balas)",
        ],
        answer: 0,
        explanation: "먹방 = 먹다 (to eat) + 방송 (broadcast). The format originated in South Korea around 2010 and exploded globally through streaming platforms. K-pop idols doing mukbangs became a staple fan service genre — combining parasocial closeness with the deeply social Korean food culture.",
        explanationEs: "먹방 = 먹다 (comer) + 방송 (transmisión). El formato nació en Corea del Sur alrededor de 2010 y explotó a nivel global gracias a las plataformas de streaming. Los mukbangs de idols de K-pop se volvieron un género básico de fan service — mezclando la cercanía parasocial con la cultura gastronómica coreana, que es profundamente social.",
      },
      {
        q: "BLACKPINK's '24/365 with BLACKPINK' YouTube series featured the members eating together. Which member became an unexpected fan favourite for her dramatic food reactions?",
        qEs: "La serie de YouTube '24/365 with BLACKPINK' mostraba a las miembros comiendo juntas. ¿Cuál se volvió favorita inesperada de los fans por sus reacciones dramáticas ante la comida?",
        options: [
          "Jennie — her 'it's giving main character energy' food takes",
          "Jisoo — her kimchi jjigae obsession became a running joke",
          "Rosé — her tiny bites vs enormous portions became iconic",
          "Lisa — she turned every meal into a dance performance",
        ],
        optionsEs: [
          "Jennie — sus comentarios de comida tipo 'esto es puro main character energy'",
          "Jisoo — su obsesión con el kimchi jjigae se volvió un chiste recurrente",
          "Rosé — sus mordiditas diminutas frente a porciones enormes se volvieron icónicas",
          "Lisa — convertía cada comida en una presentación de baile",
        ],
        answer: 1,
        explanation: "Jisoo's kimchi jjigae obsession became a fan-beloved running joke throughout the series. She consistently ranked it above anything else, defended it passionately against other food opinions, and BLINKs began sending kimchi jjigae food trucks to BLACKPINK shoots in tribute.",
        explanationEs: "La obsesión de Jisoo con el kimchi jjigae se volvió un chiste recurrente adorado por los fans a lo largo de la serie. Siempre lo ponía por encima de todo, lo defendía con pasión contra cualquier otra opinión gastronómica, y las BLINKs empezaron a mandar food trucks de kimchi jjigae a los rodajes de BLACKPINK como tributo.",
      },
    ],
  },
  {
    id: "lyrics",
    slug: "lyrics-challenge",
    title: "K-pop Lyrics Challenge",
    titleEs: "Reto de Letras de K-pop",
    blurb: "Translate the line, name the song, finish the lyric.",
    blurbEs: "Traduce el verso, nombra la canción, completa la letra.",
    description: "Translate the line, name the song, finish the lyric — from BLACKPINK to NewJeans. Take the 5-question K-pop Lyrics Challenge on Aegyo Arena.",
    descriptionEs: "Traduce el verso, nombra la canción, completa la letra — de BLACKPINK a NewJeans. Juega el Reto de Letras de K-pop de 5 preguntas en Aegyo Arena.",
    label: "Lyrics Challenge",
    labelEs: "Reto de Letras",
    emoji: "🎵",
    accent: "#4ECDC4",
    questions: [
      {
        q: "'내 독이 퍼지게 해줘' from BLACKPINK's Pink Venom translates to...",
        qEs: "'내 독이 퍼지게 해줘' de Pink Venom de BLACKPINK se traduce como...",
        options: [
          "\"Let my love bloom everywhere\"",
          "\"Let my music play on\"",
          "\"Let my venom spread\"",
          "\"Let my tears fall free\"",
        ],
        optionsEs: [
          "\"Deja que mi amor florezca por todas partes\"",
          "\"Deja que mi música siga sonando\"",
          "\"Deja que mi veneno se esparza\"",
          "\"Deja que mis lágrimas caigan libres\"",
        ],
        answer: 2,
        explanation: "독 (dok) means venom or poison. BLACKPINK's 'Pink Venom' is built on the flower-with-thorns metaphor — beautiful but dangerous.",
        explanationEs: "독 (dok) significa veneno. 'Pink Venom' de BLACKPINK se construye sobre la metáfora de la flor con espinas — hermosa pero peligrosa.",
      },
      {
        q: "Which song contains '나는 나야' (naneun naya — \"I am myself\")?",
        qEs: "¿Qué canción contiene '나는 나야' (naneun naya — \"yo soy yo\")?",
        options: [
          "MONEY by Lisa",
          "LALISA by Lisa",
          "NEW WOMAN by Lisa feat. Rosalía",
          "ROCKSTAR by Lisa",
        ],
        optionsEs: [
          "MONEY de Lisa",
          "LALISA de Lisa",
          "NEW WOMAN de Lisa feat. Rosalía",
          "ROCKSTAR de Lisa",
        ],
        answer: 1,
        explanation: "'나는 나야' closes LALISA, Lisa's debut single. It became a fan anthem — a manifesto of self-identity after years of being shaped by an entertainment system.",
        explanationEs: "'나는 나야' cierra LALISA, el sencillo debut de Lisa. Se volvió un himno de los fans — un manifiesto de identidad propia tras años de ser moldeada por un sistema de entretenimiento.",
      },
      {
        q: "'방콕에서 여기까지' (From Bangkok to here) appears in which song?",
        qEs: "'방콕에서 여기까지' (De Bangkok hasta aquí) aparece ¿en qué canción?",
        // options are song titles — no Es variant needed, they fall back to English.
        options: ["MONEY", "ROCKSTAR", "LALISA", "BORN AGAIN"],
        answer: 2,
        explanation: "LALISA is Lisa's autobiographical debut track. The line 'from Bangkok to here' traces her journey from Thailand to Seoul at 13, alone, to train at YG Entertainment.",
        explanationEs: "LALISA es el tema debut autobiográfico de Lisa. El verso 'de Bangkok hasta aquí' traza su viaje de Tailandia a Seúl a los 13 años, sola, para entrenar en YG Entertainment.",
      },
      {
        q: "Complete this BTS Dynamite lyric: 'Shining through, I light up when ___'",
        qEs: "Completa este verso de Dynamite de BTS: 'Shining through, I light up when ___'",
        // options are the actual English lyric — deliberately NOT translated, that's the puzzle.
        options: [
          "\"...the night falls down\"",
          "\"...you call my name\"",
          "\"...ARMY calls for me\"",
          "\"...the stars align\"",
        ],
        answer: 1,
        explanation: "'Shining through, I light up when you call my name' — Dynamite was BTS's first all-English track and their first song to debut at #1 on the Billboard Hot 100.",
        explanationEs: "'Shining through, I light up when you call my name' — Dynamite fue el primer tema totalmente en inglés de BTS y su primera canción en debutar en el #1 del Billboard Hot 100.",
      },
      {
        q: "'심장이 자꾸 뛰어' (My heart keeps racing) is a lyric from...",
        qEs: "'심장이 자꾸 뛰어' (Mi corazón no para de latir) es un verso de...",
        options: [
          "Boy With Luv — BTS",
          "Hype Boy — NewJeans",
          "FANCY — TWICE",
          "Next Level — aespa",
        ],
        answer: 1,
        explanation: "From NewJeans' 'Hype Boy' — '나 요즘 왜 이러지 / 심장이 자꾸 뛰어' (Why am I like this lately / My heart keeps racing). The song became a massive all-kill on debut.",
        explanationEs: "De 'Hype Boy' de NewJeans — '나 요즘 왜 이러지 / 심장이 자꾸 뛰어' (¿Por qué ando así últimamente? / Mi corazón no para de latir). La canción logró un all-kill enorme en su debut.",
      },
    ],
  },
];

export const QUIZ_SLUGS: string[] = QUIZZES.map((q) => q.slug);

export function getQuizBySlug(slug: string): QuizCategory | undefined {
  return QUIZZES.find((q) => q.slug === slug);
}
