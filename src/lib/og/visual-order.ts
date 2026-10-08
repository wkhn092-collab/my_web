const HEBREW = /[\u0590-\u05FF]/;

/**
 * Satori (next/og) lays text out left-to-right only. For a single line with a right-to-left base direction this
 * returns the characters in the order they should appear on screen: Hebrew words reversed letter by letter, the word
 * order reversed, and runs of Latin words or numbers kept readable. One line only; wrapping would break the order.
 */
export function toVisualOrder(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.some((word) => HEBREW.test(word))) return words.join(' ');

  const runs: { rtl: boolean; words: string[] }[] = [];
  for (const word of words) {
    const rtl = HEBREW.test(word);
    const last = runs.at(-1);
    if (last && !last.rtl && !rtl) last.words.push(word);
    else runs.push({ rtl, words: [word] });
  }

  return runs
    .reverse()
    .map((run) => (run.rtl ? [...run.words[0]].reverse().join('') : run.words.join(' ')))
    .join(' ');
}
