// Toneless 注音符号 <-> pinyin conversion, one syllable at a time.
//
// The set of valid syllables isn't listed here: it's every
// initial+final combination that pinyin.js's parse() accepts, so the
// converter and the entry boxes can never disagree about what exists.
// Each valid pinyin syllable is converted to 注音 by rule, and the
// reverse table is simply that mapping inverted.

const ZY_INITIALS = {
  b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ',
  d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ',
  g: 'ㄍ', k: 'ㄎ', h: 'ㄏ',
  j: 'ㄐ', q: 'ㄑ', x: 'ㄒ',
  zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ',
  z: 'ㄗ', c: 'ㄘ', s: 'ㄙ',
};

// Keyed by the final's full (unabbreviated, no y/w) spelling; see
// fullFinal() for how a written pinyin final gets there.
const ZY_FINALS = {
  '': '', // zhi chi shi ri zi ci si: the initial alone
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ê: 'ㄝ',
  ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ',
  an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', er: 'ㄦ',
  ong: 'ㄨㄥ',
  i: 'ㄧ', ia: 'ㄧㄚ', io: 'ㄧㄛ', ie: 'ㄧㄝ', iai: 'ㄧㄞ', iao: 'ㄧㄠ', iou: 'ㄧㄡ',
  ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ', iong: 'ㄩㄥ',
  u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', uei: 'ㄨㄟ',
  uan: 'ㄨㄢ', uen: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ',
  ü: 'ㄩ', üe: 'ㄩㄝ', üan: 'ㄩㄢ', ün: 'ㄩㄣ',
};

// Undoes pinyin's spelling conventions: y/w standing in for i/u/ü with
// no initial, ü losing its umlaut after j/q/x, the iu/ui/un
// abbreviations, and the "i" written after zh/ch/sh/r/z/c/s.
function fullFinal(initial, final) {
  if (initial === '') {
    const whole = { yi: 'i', yin: 'in', ying: 'ing', wu: 'u', yong: 'iong' };
    if (whole[final]) return whole[final];
    if (final.startsWith('yu')) return 'ü' + final.slice(2);
    if (final.startsWith('y')) return 'i' + final.slice(1);
    if (final.startsWith('w')) return 'u' + final.slice(1);
    return final;
  }
  if ('jqx'.includes(initial) && final.startsWith('u')) return 'ü' + final.slice(1);
  if (/^([zcs]h?|r)$/.test(initial) && final === 'i') return '';
  return { iu: 'iou', ui: 'uei', un: 'uen' }[final] ?? final;
}

const PINYIN_TO_ZY = new Map();
const ZY_TO_PINYIN = new Map();

(function buildTables() {
  // Every spelling parse() has an opinion about is a candidate final;
  // most of them are misspellings it only exists to explain, and get
  // filtered out below by parse() itself.
  const finals = Object.keys(parse).filter((k) => typeof parse[k] === 'function');
  for (const initial of ['', ...Object.keys(ZY_INITIALS)]) {
    for (const final of finals) {
      const py = initial + final;
      if (parse[final](initial) !== '') continue;
      const full = fullFinal(initial, final);
      if (!(full in ZY_FINALS)) {
        console.warn(`zhuyin.js: no 注音 for pinyin final "${full}" (in ${py})`);
        continue;
      }
      const zy = (ZY_INITIALS[initial] ?? '') + ZY_FINALS[full];
      if (ZY_TO_PINYIN.has(zy)) {
        console.warn(`zhuyin.js: ${zy} is both ${ZY_TO_PINYIN.get(zy)} and ${py}`);
        continue;
      }
      PINYIN_TO_ZY.set(py, zy);
      ZY_TO_PINYIN.set(zy, py);
    }
  }
  // parse() special-cases er ahead of any initial/final split.
  PINYIN_TO_ZY.set('er', 'ㄦ');
  ZY_TO_PINYIN.set('ㄦ', 'er');
})();

const ZY_SYMBOL = /[ㄅ-ㄯ]/;
const ZY_TONE_MARKS = /[ˉˊˇˋ˙]/g;

// Each converter takes exactly one syllable and returns { output } on
// success, or { error } (a hint) if it couldn't be converted.
function zhuyinToPinyin(text) {
  const zy = text.replace(ZY_TONE_MARKS, '').trim();
  if (!zy) return { error: 'enter a syllable in bopomofo first' };
  if (/\s/.test(zy)) return { error: 'enter just one syllable' };
  const stray = [...zy].find((ch) => !ZY_SYMBOL.test(ch));
  if (stray) return { error: `${stray} is not a bopomofo symbol` };
  if (ZY_TO_PINYIN.has(zy)) return { output: ZY_TO_PINYIN.get(zy) };
  return { error: `${zy} does not occur in Mandarin` };
}

function pinyinToZhuyin(text) {
  const py = untone(text.toLowerCase().trim());
  if (!py) return { error: 'enter a syllable in pinyin first' };
  if (/\s/.test(py)) return { error: 'enter just one syllable' };
  if (PINYIN_TO_ZY.has(py)) return { output: PINYIN_TO_ZY.get(py) };
  return { error: parse(py) || `${py} does not occur in Mandarin` };
}
