document.querySelectorAll('.box').forEach(initBox);

// Shared across all boxes: the same syllable's clip is fetched once no
// matter how many boxes end up playing it.
const audioCache = new Map();

function initBox(box) {
  const input = box.querySelector('.box-input');
  const playButton = box.querySelector('.box-play');
  const hint = box.querySelector('.box-hint');

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