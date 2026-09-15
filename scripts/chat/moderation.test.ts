// Regression suite for the live-chat content filter.
//
//   npm run test:moderation
//
// Run it after any edit to lib/chat-moderation.ts, and after refreshing
// lib/data/profane-words.json from upstream — a new release of that list can
// silently re-tier a word. Every MUST_PASS case is real fan vocabulary that a
// naive profanity filter gets wrong; every MUST_BLOCK case is something the
// room should never have to read.
import { screen, vocabularySizes, fold } from "../../lib/chat-moderation";

const MUST_PASS: [string, string][] = [
  // Fan hyperbole — the native dialect of the room.
  ["hyperbole", "this song kills me every time"],
  ["hyperbole", "im literally dying at that hook"],
  ["hyperbole", "they ate and left no crumbs"],
  ["hyperbole", "the bridge KILLED me im dead 😭"],
  ["hyperbole", "i would die for this b-side"],
  ["hyperbole", "the vocals murdered me"],
  ["hyperbole", "im gonna scream at this bridge"],
  ["hyperbole", "im dead 💀 the choreo"],
  // Ordinary swearing, which is not moderated.
  ["swearing", "this comeback is fucking insane"],
  ["swearing", "holy shit that high note"],
  ["swearing", "damn ok she ate"],
  ["swearing", "wtf that was so good"],
  ["swearing", "shes fucking talented"],
  ["swearing", "hes so fucking good at this"],
  ["swearing", "that bassline goes hard as hell"],
  // Opinions about art rather than people.
  ["opinion", "that outfit is ugly ngl"],
  ["opinion", "this ship is trash sorry"],
  ["opinion", "the album cover is so ugly lol"],
  ["opinion", "the outfit she is wearing is ugly"],
  ["opinion", "that bassline is fat"],
  // Identity words must never be flagged.
  ["identity", "the gays are eating this up"],
  ["identity", "as a queer fan this means a lot"],
  ["identity", "im bi and this song is my anthem"],
  ["identity", "shes a lesbian icon honestly"],
  ["identity", "she looks so sexy in that fit"],
  ["identity", "the trans fans deserve this"],
  // Spanish, since the site is bilingual.
  ["spanish", "el vestido negro es hermoso"],
  ["spanish", "esa cancion me mata"],
  // The Scunthorpe problem: innocent words containing dirty substrings.
  ["scunthorpe", "im from scunthorpe actually"],
  ["scunthorpe", "the assassin choreo is unreal"],
  ["scunthorpe", "shiitake mushrooms in the mukbang"],
  ["scunthorpe", "we need a deeper analysis of the lyrics"],
  ["scunthorpe", "that classic bassline"],
  ["scunthorpe", "the cockpit scene in the mv"],
  ["scunthorpe", "titanium vocals"],
  ["scunthorpe", "she is japanese not korean"],
  ["scunthorpe", "a pakistani fan account posted it"],
  ["scunthorpe", "the peacock feathers in the styling"],
  ["scunthorpe", "grape flavored album version"],
  ["scunthorpe", "documentary about the tour"],
  ["scunthorpe", "raccoon eyes makeup trend"],
  ["scunthorpe", "the bass in this is so clean"],
  ["scunthorpe", "she was bitching about the schedule"],
  ["scunthorpe", "nipple tape fashion moment"],
  ["scunthorpe", "uranus is in the lyrics apparently"],
  ["scunthorpe", "raccoon eyes are back"],
  // Stan-culture idioms that borrow an insult noun as praise.
  ["idiom", "shes a bad bitch"],
  ["idiom", "bad bitch energy"],
  ["idiom", "this song is a bitch to learn"],
  ["idiom", "im such a mess"],
  ["idiom", "youre a legend"],
  ["idiom", "youre an angel"],
  ["idiom", "what a queen"],
  ["idiom", "she killed it"],
  ["idiom", "that was sick"],
  ["idiom", "this slaps so hard"],
  // Opinions about the work, not the person.
  ["opinion", "the mv is trash"],
  ["opinion", "the choreo is stupid"],
];

const MUST_BLOCK: [string, string][] = [
  // Self-harm.
  ["self_harm", "kys loser"],
  ["self_harm", "kill yourself"],
  ["self_harm", "you should die"],
  ["self_harm", "go die"],
  ["self_harm", "hope you die"],
  ["self_harm", "just drink bleach"],
  // Threats.
  ["threat", "im gonna beat you up after school"],
  ["threat", "ill stab you"],
  ["threat", "i know where you live"],
  ["threat", "watch your back"],
  // Identity slurs, plain and obfuscated.
  ["slur", "youre such a faggot"],
  ["slur", "f4gg0t"],
  ["slur", "n1gg3r"],
  ["slur", "stop being a r3t4rd"],
  ["slur", "shes a tranny"],
  ["slur", "go home you chink"],
  ["slur", "typical paki behaviour"],
  ["slur", "that wetback fan account"],
  ["slur", "f a g g o t"],
  ["slur", "n i g g e r"],
  ["slur", "he is a pedophile"],
  // Directed insults.
  ["attack", "youre a bitch"],
  ["attack", "you are such an asshole"],
  ["attack", "she is a whore"],
  ["attack", "hes a complete dickhead"],
  ["attack", "what a cunt"],
  ["attack", "fuck you"],
  ["attack", "fuck off"],
  ["attack", "stfu"],
  ["attack", "she is such a talentless whore"],
  ["attack", "bitch"],
  // Appearance and worth.
  ["attack", "nobody likes you"],
  ["attack", "youre so ugly lmao"],
  ["attack", "she is so fat now"],
  ["attack", "hes disgusting"],
  ["attack", "they are worthless"],
  ["attack", "she needs to lose some weight"],
  ["attack", "eat a salad"],
  ["attack", "youre a talentless nobody"],
  // Abuse spam.
  ["spam", "fuck shit bitch ass"],
  // Obfuscation: leetspeak, letter padding, spaced-out spellings.
  ["obfuscated", "b!tch"],
  ["obfuscated", "youre a b!tch"],
  ["obfuscated", "n1663r"],
  ["obfuscated", "niggggger"],
  ["obfuscated", "youre a f4g"],
  ["obfuscated", "y0u are a wh0re"],
  ["obfuscated", "@sshole"],
  ["obfuscated", "f u c k  y o u"],
  ["obfuscated", "FUCK YOU"],
  ["obfuscated", "sHuT tHe FuCk Up"],
  // Directed insults the word list does not carry.
  ["attack", "she is trash"],
  ["attack", "youre stupid"],
  ["attack", "they are useless"],
  // Personal data.
  ["doxx", "123-45-6789"],
  ["doxx", "4111 1111 1111 1111"],
  ["doxx", "he lives at 42 maple street"],
];

let failures = 0;
console.log("vocabulary:", vocabularySizes());
console.log('fold check: "F4GG0T" ->', fold("F4GG0T"), '| "asssss" ->', fold("asssss"), '| "as" ->', fold("as"));
console.log();

for (const [tag, s] of MUST_PASS) {
  const v = screen(s);
  if (!v.ok) {
    console.log(`FALSE POSITIVE [${tag} -> ${v.category}]: ${s}`);
    failures++;
  }
}
for (const [tag, s] of MUST_BLOCK) {
  const v = screen(s);
  if (v.ok) {
    console.log(`MISSED [${tag}]: ${s}`);
    failures++;
  }
}

const total = MUST_PASS.length + MUST_BLOCK.length;
if (failures === 0) {
  console.log(`all ${total} cases correct (${MUST_PASS.length} must pass, ${MUST_BLOCK.length} must block)`);
} else {
  console.error(`${failures} of ${total} failed`);
  process.exit(1);
}
