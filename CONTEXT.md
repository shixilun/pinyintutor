# Pinyin Tutor

A web page for practicing pinyin syllable spelling and pronunciation: the learner types a syllable into an entry box and hears it spoken, or is told how to fix it if it isn't valid pinyin. Any number of boxes can be open at once, left over side by side, so a learner can bounce back and forth between near-minimal pairs (e.g. "zhí" and "jí") to internalize allophonic differences a single letter can't capture on its own — the same reasoning behind never teaching a letter like "i" in isolation.

## Language

**Syllable**:
The pinyin unit typed into a single entry box: an optional initial, a final, and a tone. One box handles exactly one syllable, never a whole word.
_Avoid_: word

**Initial**:
The optional consonant(s) that begin a syllable (b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s).

**Final**:
Everything in a syllable after the initial: the vowel nucleus and any coda (e.g. "a", "ang", "iao", "ü").

**Tone**:
One of four pitch contours, marked as a diacritic on the final's main vowel. Entered by typing a digit 1-4 after the letters; a diacritic already present is replaced, not stacked, by typing a new digit. Removed by typing 0.
_Avoid_: accent, mark

**Toneless entry**:
A syllable with no tone digit applied (or after 0 clears one). Treated as incomplete input, not a valid neutral-tone pronunciation — never playable. Neutral tone only has a well-defined pitch in the context of a preceding syllable, so it's out of scope until this app supports multi-syllable words.
_Avoid_: neutral tone (this app does not support neutral tone as a playable end state)

**Hint**:
The corrective message shown when a typed syllable isn't valid pinyin but a likely intended correction exists (e.g. "au is not valid in pinyin; do you mean ao?"). Persists on screen until the next click attempt, since expecting the learner to hold it in memory while correcting the entry is too much cognitive strain. Contrast with a live keystroke rejection, which is ephemeral and clears on the very next keystroke.
_Avoid_: error (a hint is specifically corrective, not just a rejection)
