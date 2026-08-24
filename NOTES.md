# Working notes

Deferred decisions and roadmap items that don't belong in `CONTEXT.md` (glossary only) or an ADR (not settled/architectural enough yet), but shouldn't be lost either.

## Audio source (undecided)

Not reusing the existing `Sound/` folder from the old Perl/Tk prototype (~1,656 `.wav` files) — quality was judged low and uneven. Want nicer sound from online instead, for the pinyin syllables specifically (English example sounds will be rerecorded separately, not in scope here).

Candidate found so far: [`davinfifield/mp3-chinese-pinyin-sound`](https://github.com/davinfifield/mp3-chinese-pinyin-sound) on GitHub — 1,632 MP3 clips, named by tone-numbered syllable (e.g. `ma3.mp3`), covering essentially the full syllable × tone-1-4 inventory. Licensed under The Unlicense (public domain, no attribution required), ~30MB total. No neutral-tone clips, but that's not a blocker — toneless input is invalid/unplayable by design (see `CONTEXT.md`). Not yet quality-checked — only confirmed to exist, cover the syllable set, and be freely licensed.

## Build phasing

- Single-page application, not a multi-page site.
- **Phase 1 (current focus):** the standalone syllable entry-box + play/hint feature — everything captured in `CONTEXT.md` and `docs/adr/`.
- **Phase 2 (later, only after phase 1 works):** add a "lessons window" within the same single-page app so learners can work through the old prototype's tutorial curriculum (~23 topics — intro, tones, letter groups, spelling rules, special syllables). Don't build any of this scaffolding until phase 1 is done and it's explicitly asked for.
- **Future, far off:** multi-syllable word support, including neutral-tone syllables (neutral tone's pitch only makes sense relative to a preceding syllable, so it needs word-level context). Not a near-term concern.

## State persistence

A page reload starts fresh with zero boxes — no save/restore of box contents or drag positions. This matches the old Perl/Tk prototype, which also doesn't persist. Not requested and not expected to be needed, but keep box state as a plain serializable data structure (not something inherently tied to non-serializable DOM/runtime-only state) so persistence could be added later without a rework.
