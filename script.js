// Shared across all boxes: the same syllable's clip is fetched once no
// matter how many boxes end up playing it.
const audioCache = new Map();

const boxTemplate = document.getElementById('box-template');
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
  const box = boxTemplate.content.firstElementChild.cloneNode(true);
  document.body.appendChild(box);
  initBox(box);

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

  box.querySelector('.box-input').focus();
  spawnedBoxes.push(box);
}

function initBox(box) {
  const input = box.querySelector('.box-input');
  const playButton = box.querySelector('.box-play');
  const hint = box.querySelector('.box-hint');
  const handle = box.querySelector('.box-handle');
  const closeButton = box.querySelector('.box-close');

  handle.addEventListener('mousedown', (e) => startDrag(e, box));
  closeButton.addEventListener('mousedown', (e) => e.stopPropagation());
  closeButton.addEventListener('click', () => box.remove());

  // Set once a play click validates the current text successfully; cleared
  // by any edit, so the next play click re-validates instead of just replaying.
  let validated = false;

  input.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length === 1 && e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      if (e.key <= '4') applyTone(input, Number(e.key));
    }
  });

  input.addEventListener('input', () => {
    autoCorrect(input);
    validated = false;
  });

  playButton.addEventListener('click', () => {
    if (validated) {
      playSyllable(input.value);
      return;
    }
    const result = validateSyllable(input.value);
    if (result.valid) {
      hint.hidden = true;
      hint.textContent = '';
      validated = true;
      playSyllable(input.value);
    } else {
      hint.hidden = false;
      hint.textContent = result.hint;
    }
  });
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
  const [letters, tone] = splittone(text);
  const spellingHint = parse(letters);
  if (spellingHint) return { valid: false, hint: spellingHint };
  if (tone === 0) {
    return { valid: false, hint: "tone mark is missing" };
  }
  const canonical = addtone(letters, tone);
  if (canonical !== text) {
    return { valid: false, hint: "tone mark is over wrong vowel" };
  }
  return { valid: true };
}

function playSyllable(syllable) {
  const [letters, tone] = splittone(syllable);
  const base = `${letters.replace(/ü/g, 'v')}${tone}`;
  let audio = audioCache.get(base);
  if (!audio) {
    audio = loadAudio(base);
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

function loadAudio(base) {
  const audio = new Audio(`${MP3_DIR}/${base}.mp3`);
  let triedFallback = false;
  audio.addEventListener('error', () => {
    if (triedFallback) {
      console.error(`no audio file for ${base} (tried ${MP3_DIR} and ${WAV_DIR})`);
      return;
    }
    triedFallback = true;
    audio.src = `${WAV_DIR}/${base}.wav`;
    audio.play().catch(() => {});
  });
  return audio;
}