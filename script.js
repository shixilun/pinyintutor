// Shared across all boxes: the same syllable's clip is fetched once no
// matter how many boxes end up playing it.
const audioCache = new Map();

// Only these can ever appear in a canonical pinyin spelling: a-z except v
// (which never appears; ü is only ever typed as the "u:" digraph), plus ':'
// itself to type that digraph. Tone digits are handled separately below.
const ALLOWED_LETTERS = /^[a-uw-z:]$/;

// A bare syllable input: live character filtering, tone-digit application,
// u:/ü autocorrect, and validation — all internal. Callers never read
// .value or touch the hint element directly; they call getValue()/prime().
function createSyllableEntry() {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'entry-input';
  input.placeholder = 'type a syllable';
  input.autocomplete = 'off';
  input.spellcheck = false;

  const hint = document.createElement('div');
  hint.className = 'entry-hint';
  hint.hidden = true;

  input.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) return;
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      if (e.key <= '4') applyTone(input, Number(e.key));
      return;
    }
    if (!ALLOWED_LETTERS.test(e.key)) {
      e.preventDefault();
    }
  });

  input.addEventListener('input', () => autoCorrect(input));

  function getValue() {
    const result = validateSyllable(input.value);
    if (result.valid) {
      hint.hidden = true;
      hint.textContent = '';
      return input.value;
    }
    hint.hidden = false;
    hint.textContent = result.hint;
    return null;
  }

  function prime(syllable, cursorPosition) {
    input.value = syllable;
    input.setSelectionRange(cursorPosition, cursorPosition);
    hint.hidden = true;
    hint.textContent = '';
  }

  function focus() {
    input.focus();
  }

  return { input, hint, getValue, prime, focus };
}

// A syllable entry plus a play button: clicking it retrieves the entry's
// value and plays it if valid; if invalid, the entry has already shown its
// own hint and there's nothing further to do.
function createSyllablePlayer() {
  const entry = createSyllableEntry();

  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'player-play';
  playButton.setAttribute('aria-label', 'play');
  playButton.textContent = '▶';
  playButton.addEventListener('click', () => {
    const value = entry.getValue();
    if (value !== null) playSyllable(value);
  });

  const row = document.createElement('div');
  row.className = 'player-row';
  row.append(entry.input, playButton);

  const element = document.createElement('div');
  element.className = 'syllable-player';
  element.append(row, entry.hint);

  return { element, focus: entry.focus, prime: entry.prime, getValue: entry.getValue };
}

const newBoxButton = document.getElementById('new-box');
newBoxButton.addEventListener('click', createBox);

const BOX_GAP = 12;
const STAGGER = 24;

// A new box spawns right next to the "Hear a Syllable" button, staggered
// off the end of the chain of still-untouched spawned boxes (so repeated
// clicks don't pile boxes on top of each other). Once a box in the chain
// is dragged away, the next box picks up the chain from whichever spawned
// box is still sitting untouched closest to the end of it — or, if none
// remain, starts over at the default spot next to the button.
const spawnedBoxes = [];

function createBox() {
  const player = createSyllablePlayer();

  const box = document.createElement('div');
  box.className = 'box';

  const handle = document.createElement('div');
  handle.className = 'box-handle';
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'box-close';
  closeButton.setAttribute('aria-label', 'delete');
  closeButton.textContent = '×';
  handle.appendChild(closeButton);

  box.append(handle, player.element);
  document.body.appendChild(box);

  handle.addEventListener('mousedown', (e) => startDrag(e, box));
  closeButton.addEventListener('mousedown', (e) => e.stopPropagation());
  closeButton.addEventListener('click', () => box.remove());

  box.style.zIndex = ++topZIndex;

  const buttonRect = newBoxButton.getBoundingClientRect();
  const defaultLeft = buttonRect.right + BOX_GAP;
  const defaultTop = buttonRect.bottom - box.offsetHeight;

  const anchor = [...spawnedBoxes].reverse()
    .find((b) => document.body.contains(b) && !b.dataset.moved);

  if (anchor && anchor.offsetTop - STAGGER >= 0) {
    box.style.left = `${anchor.offsetLeft + STAGGER}px`;
    box.style.top = `${anchor.offsetTop - STAGGER}px`;
  } else {
    box.style.left = `${defaultLeft}px`;
    box.style.top = `${defaultTop}px`;
  }

  player.focus();
  spawnedBoxes.push(box);
}

let topZIndex = 1;

function startDrag(e, box) {
  e.preventDefault();
  box.style.zIndex = ++topZIndex;

  const startX = e.clientX;
  const startY = e.clientY;
  const startLeft = box.offsetLeft;
  const startTop = box.offsetTop;

  function onMove(e) {
    box.style.left = `${startLeft + (e.clientX - startX)}px`;
    box.style.top = `${startTop + (e.clientY - startY)}px`;
    box.dataset.moved = 'true';
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function applyTone(input, toneDigit) {
  const cursor = input.selectionStart;
  const base = untone(input.value);
  if (toneDigit === 0) {
    input.value = base;
    input.setSelectionRange(cursor, cursor);
    input.dispatchEvent(new Event('input'));
    return;
  }
  const letterIndex = cursor - 1;
  const letter = base[letterIndex];
  if (!letter || !tones[letter]) return;
  const toned = tones[letter].at(toneDigit);
  input.value = base.slice(0, letterIndex) + toned + base.slice(letterIndex + 1);
  input.setSelectionRange(cursor, cursor);
  input.dispatchEvent(new Event('input'));
}

function autoCorrect(input) {
  const value = input.value;
  const pattern = /[uūúǔù]:/g;
  if (!pattern.test(value)) return;
  const replace = (str) => str.replace(pattern, (m) => tones['ü'][tones['u'].indexOf(m[0])]);
  const cursor = input.selectionStart;
  const before = replace(value.slice(0, cursor));
  input.value = replace(value);
  input.setSelectionRange(before.length, before.length);
}

function validateSyllable(text) {
  if (!text) return { valid: false, hint: "type a syllable" };
  const [rawsyl, tone] = splittone(text);
  const spellingHint = parse(rawsyl);
  if (spellingHint) return { valid: false, hint: spellingHint };
  if (tone === 0) {
    return { valid: false, hint: "tone mark is missing" };
  }
  const syl = addtone(rawsyl, tone);
  if (syl !== text) {
    return { valid: false, hint: "tone mark is over wrong vowel" };
  }
  return { valid: true };
}

function playSyllable(syllable) {
  const [rawsyl, tone] = splittone(syllable);
  const base = `${rawsyl.replace(/ü/g, 'v')}${tone}`;
  let audio = audioCache.get(base);
  if (!audio) {
    audio = loadAudio(base, MP3_DIR, WAV_DIR);
    audioCache.set(base, audio);
  }
  audio.currentTime = 0;
  audio.play().catch((err) => console.error(err));
}

// Prefer sound/mp3/; fall back to the old prototype's sound/wav/ when a
// syllable is missing from the mp3 set. Swap MP3_DIR/WAV_DIR to flip which
// source is authoritative.
const MP3_DIR = 'sound/mp3';
const WAV_DIR = 'sound/wav';

// Generic mp3-then-wav loader: tries `${mp3Dir}/${base}.mp3` first, falls
// back to `${wavDir}/${base}.wav` on error. Pass the same directory for
// both to just try both extensions in one place (e.g. the <eg> family).
function loadAudio(base, mp3Dir, wavDir) {
  const audio = new Audio(`${mp3Dir}/${base}.mp3`);
  let triedFallback = false;
  audio.addEventListener('error', () => {
    if (triedFallback) {
      console.error(`no audio file for ${base} (tried ${mp3Dir} and ${wavDir})`);
      return;
    }
    triedFallback = true;
    audio.src = `${wavDir}/${base}.wav`;
    audio.play().catch(() => {});
  });
  return audio;
}
