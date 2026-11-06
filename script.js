// Shared across all boxes: the same syllable's clip is fetched once no
// matter how many boxes end up playing it.
const audioCache = new Map();

// Only these can ever appear in a canonical pinyin spelling: a-z except v
// (which never appears; ü is only ever typed as the "u:" digraph), plus ':'
// itself to type that digraph. Tone digits are handled separately below.
const ALLOWED_LETTERS = /^[a-uw-z:]$/;

// Every hint shown to the learner goes through this: a line break after
// each ',' and ';' and before each '(' (.entry-hint is white-space:
// pre-line), so hint strings themselves never need a hand-placed '\n'.
// Any whitespace already at those spots, '\n' included, is replaced.
function wrapHint(text) {
  return text
    .replace(/([,;])\s*/g, '$1\n')
    .replace(/(\S)\s*\(/g, '$1\n(')
    .trim();
}

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

  // Always stays in the layout (reserved height via CSS), never toggled
  // with `hidden`, so a hint appearing/disappearing doesn't shift
  // whatever content sits below the entry.
  const hint = document.createElement('div');
  hint.className = 'entry-hint';

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

  input.addEventListener('input', () => {
    autoCorrect(input);
    if (input.value.trim() === '') hint.textContent = '';
  });

  function getValue() {
    const result = validateSyllable(input.value);
    if (result.valid) {
      hint.textContent = '';
      return input.value;
    }
    hint.textContent = wrapHint(result.hint);
    return null;
  }

  function prime(syllable, cursorPosition) {
    input.value = syllable;
    input.setSelectionRange(cursorPosition, cursorPosition);
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
  playButton.title = 'play';
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

  // Whichever box has the focus (its entry or play button) comes to the
  // front, so its hint is never hidden under a box created after it.
  box.addEventListener('focusin', () => {
    if (Number(box.style.zIndex) !== topZIndex) box.style.zIndex = ++topZIndex;
  });

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

// Lets the learner reorder `list`'s children: drag an item by its
// .reorder-handle (mouse or touch, via pointer events) and the items it
// passes slide out of the way; or focus the handle and press ↑/↓. Items
// can be added or removed at any time. Written for <initialfinal>'s tone
// rows, and meant to be reused for a phone-friendly Hear a Syllable grid.
function makeReorderable(list) {
  const itemOf = (handle) => {
    let item = handle;
    while (item && item.parentElement !== list) item = item.parentElement;
    return item;
  };

  // Moves `item` before or after `sibling`, slides `sibling` from its old
  // spot to its new one, and returns how far `item` moved in the layout.
  function moveItem(item, sibling, where) {
    const itemTop = item.offsetTop;
    const siblingTop = sibling.offsetTop;
    if (where === 'before') sibling.before(item);
    else sibling.after(item);
    sibling.style.transition = 'none';
    sibling.style.transform = `translateY(${siblingTop - sibling.offsetTop}px)`;
    sibling.getBoundingClientRect();
    sibling.style.transition = 'transform 150ms';
    sibling.style.transform = '';
    return item.offsetTop - itemTop;
  }

  list.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.reorder-handle');
    if (!handle || e.button !== 0) return;
    const item = itemOf(handle);
    if (!item) return;
    e.preventDefault();
    item.classList.add('reordering');
    item.style.transition = 'none';
    // Where the pointer would be if the item were sitting at its current
    // place in the layout; the item is drawn offset from there.
    let originY = e.clientY;

    // Listened for on the window, not the handle: moving the item in the
    // page would cancel any pointer capture on its handle mid-drag.
    function onMove(ev) {
      if (ev.pointerId !== e.pointerId) return;
      let prev = item.previousElementSibling;
      while (prev && ev.clientY - originY < -prev.offsetHeight / 2) {
        originY += moveItem(item, prev, 'before');
        prev = item.previousElementSibling;
      }
      let next = item.nextElementSibling;
      while (next && ev.clientY - originY > next.offsetHeight / 2) {
        originY += moveItem(item, next, 'after');
        next = item.nextElementSibling;
      }
      item.style.transform = `translateY(${ev.clientY - originY}px)`;
    }
    function onUp(ev) {
      if (ev.pointerId !== e.pointerId) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      item.classList.remove('reordering');
      item.style.transition = 'transform 150ms';
      item.style.transform = '';
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  list.addEventListener('keydown', (e) => {
    const handle = e.target.closest('.reorder-handle');
    if (!handle || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    const item = itemOf(handle);
    const sibling = e.key === 'ArrowUp' ? item.previousElementSibling : item.nextElementSibling;
    if (!sibling) return;
    moveItem(item, sibling, e.key === 'ArrowUp' ? 'before' : 'after');
    // Moving the item in the page takes the focus away from its handle.
    handle.focus();
  });
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
    audio = loadAudio(base, SYLLABLE_AUDIO_SOURCES);
    audioCache.set(base, audio);
  }
  audio.currentTime = 0;
  audio.play().catch((err) => console.error(err));
}

const MP3_DIR = 'sound/mp3';
const WAV_DIR = 'sound/wav';

// Try order for pinyin syllable audio: reorder this list to change which
// format/directory is tried first — nothing else needs to change.
const SYLLABLE_AUDIO_SOURCES = [
  { dir: WAV_DIR, ext: 'wav' },
  { dir: MP3_DIR, ext: 'mp3' },
];

// Generic loader: tries each `{dir, ext}` source in order until one
// actually plays, falling back to the next on error. `sources` controls
// both the directories and the try order — nothing here is hardcoded.
function loadAudio(base, sources) {
  let index = 0;
  const audio = new Audio(`${sources[0].dir}/${base}.${sources[0].ext}`);
  audio.addEventListener('error', () => {
    index++;
    if (index >= sources.length) {
      const tried = sources.map((s) => `${s.dir}/${base}.${s.ext}`).join(', ');
      console.error(`no audio file for ${base} (tried ${tried})`);
      return;
    }
    audio.src = `${sources[index].dir}/${base}.${sources[index].ext}`;
    audio.play().catch(() => {});
  });
  return audio;
}
