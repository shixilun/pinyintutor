# Working notes

Deferred decisions and roadmap items that don't belong in `CONTEXT.md` (glossary only) or an ADR (not settled/architectural enough yet), but shouldn't be lost either.

## Audio source (in use, but quality flagged — may revisit)

In use: [`davinfifield/mp3-chinese-pinyin-sound`](https://github.com/davinfifield/mp3-chinese-pinyin-sound) (1,632 MP3 clips, `sound/mp3/`, Unlicense/public domain), with 15 syllable+tone gaps in that set filled in from the old Perl/Tk prototype's `Sound/` folder as `.wav` (`sound/wav/`) — `script.js`'s `loadAudio()` tries `sound/mp3/` first, falls back to `sound/wav/`.

Now that lesson exercises (the dictation quiz) surface these clips in a "hear it cold, no visual cue" context, the recording quality reads as noticeably uneven across syllables — more apparent here than in the standalone entry boxes. May need to go searching for a better-quality audio source at some point; not blocking current work.

## Build phasing

- Single-page application, not a multi-page site.
- **Phase 1 (current focus):** the standalone syllable entry-box + play/hint feature — everything captured in `CONTEXT.md` and `docs/adr/`.
- **Phase 2 (later, only after phase 1 works):** add a "lessons window" within the same single-page app so learners can work through the old prototype's tutorial curriculum (~23 topics — intro, tones, letter groups, spelling rules, special syllables). Don't build any of this scaffolding until phase 1 is done and it's explicitly asked for.
- **Future, far off:** multi-syllable word support, including neutral-tone syllables (neutral tone's pitch only makes sense relative to a preceding syllable, so it needs word-level context). Not a near-term concern.

## State persistence

A page reload starts fresh with zero boxes — no save/restore of box contents or drag positions. This matches the old Perl/Tk prototype, which also doesn't persist. Not requested and not expected to be needed, but keep box state as a plain serializable data structure (not something inherently tied to non-serializable DOM/runtime-only state) so persistence could be added later without a rework.
