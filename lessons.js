// A single clickable syllable button: always plays `syllable` when clicked,
// regardless of what it's currently displaying. Its face shows either the
// syllable text or a generic speaker icon — the icon mode exists so a grid
// of these can be tested/laid out without depending on real lesson content
// naming a specific syllable to look at.
function createListenButton(syllable, { showIcon = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'listen-btn';
  button.addEventListener('click', () => playSyllable(syllable));

  function setShowIcon(next) {
    if (next) {
      button.textContent = '🔊';
      button.setAttribute('aria-label', `play ${syllable}`);
      button.title = 'click to hear';
    } else {
      button.textContent = syllable;
      button.removeAttribute('aria-label');
      button.removeAttribute('title');
    }
  }

  setShowIcon(showIcon);

  return { element: button, setShowIcon };
}

// A rectangular array of listen buttons. Wraps automatically based on
// container width — sized so 4 land per row in a ~300px-wide panel, but
// makes no assumption about exactly how many columns there are.
function createListenGrid(syllables, options = {}) {
  const element = document.createElement('div');
  element.className = 'listen-grid';

  const buttons = syllables.map((syl) => createListenButton(syl, options));
  buttons.forEach((b) => element.appendChild(b.element));

  function setShowIcon(next) {
    buttons.forEach((b) => b.setShowIcon(next));
  }

  return { element, buttons, setShowIcon };
}

// One row per toneless syllable, each row holding its 4 tones — unlike
// createListenGrid, the grouping is guaranteed by structure (one row per
// entry in `lettersList`), not by however a flat list happens to wrap at
// the container's current width.
function createToneRows(rawsylList) {
  const element = document.createElement('div');
  element.className = 'tone-rows';

  const rows = rawsylList.map((rawsyl) => {
    const toned = [1, 2, 3, 4].map((tone) => addtone(rawsyl, tone));
    const row = createListenGrid(toned);
    element.appendChild(row.element);
    return row;
  });

  function setShowIcon(next) {
    rows.forEach((row) => row.setShowIcon(next));
  }

  return { element, rows, setShowIcon };
}

// A quiz's answer entry keeps focus whatever in the quiz is clicked: a
// mouse press anywhere but the entry itself doesn't take focus, and any
// button, even one reached with Tab, hands focus back to the entry once
// it's clicked. So the learner can always just keep typing.
function keepEntryFocus(element, player) {
  element.addEventListener('mousedown', (e) => {
    if (!e.target.closest('input')) e.preventDefault();
  });
  element.addEventListener('click', (e) => {
    if (e.target.closest('button')) player.focus();
  });
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// A "hear it, type it back" quiz over a fixed pool of toned syllables.
// The target is only ever heard (via an icon-only listen button, so its
// label can't leak the answer), never shown; the answer field is a real
// syllable-player so the learner can hear their own guess before checking.
// Draws without repeats until the pool is exhausted, then reshuffles.
function createDictationQuiz(syllables) {
  const state = { pool: [...syllables], bag: [], current: null, correct: 0, total: 0 };

  const element = document.createElement('div');
  element.className = 'dictation-quiz';

  // Rebuilt each question (a listen button's syllable is fixed at creation),
  // so this slot just holds whichever one is current.
  const listenSlot = document.createElement('span');
  let listenButton = null;

  const answerPlayer = createSyllablePlayer();

  const checkButton = document.createElement('button');
  checkButton.type = 'button';
  checkButton.textContent = 'Check Answer';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.textContent = 'Try Next Syllable';

  const score = document.createElement('div');
  score.className = 'quiz-score';

  function updateScore() {
    const pct = state.total ? Math.round((state.correct / state.total) * 100) : 0;
    score.textContent = `Score: ${state.correct}/${state.total} (${pct}%)`;
  }

  function nextQuestion() {
    if (state.bag.length === 0) state.bag = shuffle(state.pool);
    state.current = state.bag.pop();
    listenButton = createListenButton(state.current, { showIcon: true });
    listenSlot.replaceChildren(listenButton.element);
    answerPlayer.prime('', 0);
  }

  checkButton.addEventListener('click', () => {
    const value = answerPlayer.getValue();
    if (value === null) return; // invalid spelling: entry already showed its own hint, not an attempt
    state.total++;
    listenButton.setShowIcon(false); // reveal the syllable now that they've committed to an answer
    if (value === state.current) state.correct++;
    updateScore();
  });

  nextButton.addEventListener('click', nextQuestion);

  element.append(listenSlot, answerPlayer.element, checkButton, nextButton, score);
  keepEntryFocus(element, answerPlayer);

  updateScore();
  nextQuestion();

  return { element };
}

// Custom-tag hydration for markdown-rendered HTML: a rendered page passes
// these tags through unchanged (unrecognized elements survive HTML
// parsing intact, attributes and text content included), and each of
// these upgrades one such element into its real component in place.
//
// None of these are self-closing: an unrecognized tag isn't a void
// element under HTML5 parsing rules, so a trailing "/>" is simply
// ignored and the element would otherwise stay open, swallowing
// everything after it until some later, unrelated closing tag happened
// to close it.
//
// <py>mā</py> — purely typographic, not interactive: renders its text in
// the dedicated pinyin font (once one is vendored in; a placeholder style
// stands in for it for now).
function hydratePy(el) {
  const span = document.createElement('span');
  span.className = 'py';
  span.textContent = el.textContent;
  el.replaceWith(span);
}

// <zy>ㄇㄚ</zy> — <py>'s counterpart for 注音符号: purely typographic, renders
// its text in a Traditional Chinese system font stack. lang="zh-TW" keeps
// the browser from picking Simplified/Japanese glyph variants or fallback
// fonts if none of the named fonts is installed.
function hydrateZy(el) {
  const span = document.createElement('span');
  span.className = 'zy';
  span.lang = 'zh-TW';
  span.textContent = el.textContent;
  el.replaceWith(span);
}

// The <zyconverter> 注音 box a click on a <zytable> symbol types into: set
// when that box gains focus, cleared when its pinyin neighbor does, so a
// click only ever inserts where the learner last put the cursor for 注音.
let zyInsertTarget = null;

function insertZhuyin(text) {
  const input = zyInsertTarget;
  if (!input || !input.isConnected) return;
  input.setRangeText(text, input.selectionStart, input.selectionEnd, 'end');
  input.focus();
}

// <zyconverter></zyconverter> — a 注音 box and a pinyin box with an arrow
// button each way between them, converting a single syllable. Tones are
// ignored: stripped from the input if present, never produced in the
// output. A failed conversion clears the other box and leaves a hint
// under the box that was converted from.
function hydrateZyConverter(el) {
  const element = document.createElement('div');
  element.className = 'zy-converter';

  function createSide(extraClass, placeholder) {
    const side = document.createElement('div');
    side.className = 'zy-converter-side';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = `zy-converter-input ${extraClass}`;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    input.spellcheck = false;
    const hint = document.createElement('div');
    hint.className = 'entry-hint';
    input.addEventListener('input', () => {
      if (input.value.trim() === '') hint.textContent = '';
    });
    side.append(input, hint);
    return { side, input, hint };
  }

  const zy = createSide('zy', 'bopomofo');
  zy.input.lang = 'zh-TW';
  const py = createSide('py', 'pinyin');

  function convert(from, to, converter) {
    const result = converter(from.input.value);
    to.hint.textContent = '';
    if (result.error) {
      from.hint.textContent = wrapHint(result.error);
      to.input.value = '';
      return;
    }
    from.hint.textContent = '';
    to.input.value = result.output;
  }
  const zyToPy = () => convert(zy, py, zhuyinToPinyin);
  const pyToZy = () => convert(py, zy, pinyinToZhuyin);

  function createArrow(label, title, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'zy-converter-arrow';
    button.textContent = label;
    button.title = title;
    button.addEventListener('click', onClick);
    return button;
  }
  const arrows = document.createElement('div');
  arrows.className = 'zy-converter-arrows';
  arrows.append(
    createArrow('→', 'bopomofo to pinyin', zyToPy),
    createArrow('←', 'pinyin to bopomofo', pyToZy),
  );

  zy.input.addEventListener('focus', () => { zyInsertTarget = zy.input; });
  py.input.addEventListener('focus', () => { zyInsertTarget = null; });
  py.input.addEventListener('input', () => autoCorrect(py.input));
  zy.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') zyToPy(); });
  py.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') pyToZy(); });

  element.append(zy.side, arrows, py.side);
  el.replaceWith(element);
}

// <zytable groups="ㄅ:b ㄆ:p ㄇ:m ㄈ:f | ㄉ:d ㄊ:t ㄋ:n ㄌ:l"></zytable> — a
// 注音-to-pinyin chart: each "|"-separated group becomes its own small
// two-column table (注音 | pinyin), and the groups sit side by side,
// wrapping onto further lines as the page narrows. Each pair is
// zhuyin:pinyin with no spaces inside it; a lone ":" makes a blank row.
//
// On a page that also has a <zyconverter>, the 注音 cells double as a
// keyboard: clicking one types its symbol into the converter's 注音 box
// at the cursor. The mousedown is swallowed so the click doesn't take
// focus (and with it the cursor) away from that box.
function hydrateZyTable(el, isKeyboard) {
  const groupsAttr = el.getAttribute('groups');
  if (!groupsAttr) {
    renderTagError(el, 'zytable needs a groups attribute');
    return;
  }
  const groups = groupsAttr.split('|').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const bad = groups.flat().find((pair) => pair.split(':').length !== 2);
  if (bad) {
    renderTagError(el, `zytable pair "${bad}" isn't zhuyin:pinyin`);
    return;
  }

  const chart = document.createElement('div');
  chart.className = 'zy-chart';
  for (const group of groups) {
    const table = document.createElement('table');
    table.className = 'zy-group';
    for (const pair of group) {
      const [zy, py] = pair.split(':');
      const row = table.insertRow();
      const zyCell = row.insertCell();
      zyCell.className = 'zy';
      zyCell.lang = 'zh-TW';
      zyCell.textContent = zy;
      if (isKeyboard && zy) {
        zyCell.classList.add('zy-key');
        zyCell.addEventListener('mousedown', (e) => e.preventDefault());
        zyCell.addEventListener('click', () => insertZhuyin(zy));
      }
      const pyCell = row.insertCell();
      pyCell.className = 'py';
      pyCell.textContent = py;
    }
    chart.append(table);
  }
  el.replaceWith(chart);
}

// <pydecomposition> or <zydecomposition> around a five-column markdown
// table (blank lines inside the tag so marked still renders the table):
//
//   <pydecomposition>
//
//   | syllable | initial | final | medial | rime |
//   |----------|---------|-------|--------|------|
//   | gua      | g       | wa    | wu     | a    |
//
//   </pydecomposition>
//
// Rebuilt into a two-level layout: "final" heads a column pair over
// medial and rime, and each syllable takes two rows — the final across
// both columns on top, its medial and rime split beneath, with syllable
// and initial spanning both. Header labels come from the markdown header
// row; empty markdown cells stay empty. Body cells are styled like <py>
// or <zy> to match the tag; the header row keeps the lesson font.
function hydrateDecomposition(el, kind) {
  const source = el.querySelector('table');
  const cols = source && source.rows[0] ? source.rows[0].cells.length : 0;
  if (cols !== 5) {
    renderTagError(el, `${kind}decomposition needs a markdown table with 5 columns: `
      + 'syllable | initial | final | medial | rime');
    return;
  }
  const texts = [...source.rows].map((row) => [...row.cells].map((cell) => cell.textContent.trim()));
  const [heads, ...body] = texts;
  el.replaceWith(createDecompositionTable(heads, body, kind).table);
}

// The <pydecomposition>/<zydecomposition>/<pysplitter> layout, from header
// labels and body rows, each [syllable, initial, final, medial, rime].
// Returns the table plus each body row's five cells, in that same order,
// for a caller that fills them in later.
function createDecompositionTable(heads, body, kind) {
  const [syllableHead, initialHead, finalHead, medialHead, rimeHead] = heads;
  const table = document.createElement('table');
  table.className = 'decomposition';
  const scriptAttrs = kind === 'zy' ? { className: 'zy', lang: 'zh-TW' } : { className: 'py' };
  const addCell = (row, tag, text, attrs = {}) => {
    const cell = document.createElement(tag);
    cell.textContent = text;
    Object.assign(cell, attrs);
    row.append(cell);
    return cell;
  };

  const thead = table.createTHead();
  const head1 = thead.insertRow();
  addCell(head1, 'th', syllableHead);
  addCell(head1, 'th', initialHead);
  addCell(head1, 'th', finalHead, { colSpan: 2 });
  const head2 = thead.insertRow();
  addCell(head2, 'th', '');
  addCell(head2, 'th', '');
  addCell(head2, 'th', medialHead);
  addCell(head2, 'th', rimeHead);

  const tbody = table.createTBody();
  const cells = body.map(([syllable, initial, final, medial, rime]) => {
    const top = tbody.insertRow();
    const bottom = tbody.insertRow();
    return [
      addCell(top, 'td', syllable, { ...scriptAttrs, rowSpan: 2 }),
      addCell(top, 'td', initial, { ...scriptAttrs, rowSpan: 2 }),
      addCell(top, 'td', final, { ...scriptAttrs, colSpan: 2 }),
      addCell(bottom, 'td', medial, scriptAttrs),
      addCell(bottom, 'td', rime, scriptAttrs),
    ];
  });
  return { table, cells };
}

// <pysplitter></pysplitter> — the <pydecomposition> layout for a single
// syllable the learner types: a pinyin box, its hint, and a "split"
// button stacked in the syllable cell (as in <dictation>). Split (or
// Enter) checks the syllable with parse() and fills in initial, final,
// medial, and rime from splitrawsyl(). Tone marks aren't accepted. A
// failed split clears the other cells and leaves a hint. Split is
// disabled while the box is empty, and any edit to the box clears the
// other cells at once, so they never show the split of something other
// than what's in the box. Edits leave the hint alone, so the learner can
// still read it while fixing the syllable, until the box is emptied.
function hydratePySplitter(el) {
  const heads = ['syllable', 'initial', 'final', 'medial', 'rime'];
  const { table, cells } = createDecompositionTable(heads, [['', '', '', '', '']], 'py');
  table.classList.add('py-splitter');
  const [syllableCell, ...partCells] = cells[0];

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'entry-input py';
  input.placeholder = 'pinyin';
  input.autocomplete = 'off';
  input.spellcheck = false;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'split';
  button.disabled = true;
  const hint = document.createElement('div');
  hint.className = 'entry-hint';
  const entry = document.createElement('div');
  entry.className = 'py-splitter-entry';
  entry.append(input, hint, button);
  syllableCell.append(entry);

  const clearParts = () => partCells.forEach((cell) => { cell.textContent = ''; });

  function split() {
    if (button.disabled) return;
    const rawsyl = input.value.toLowerCase().trim();
    clearParts();
    hint.textContent = '';
    if (/\s/.test(rawsyl)) {
      hint.textContent = 'enter just one syllable';
    } else if (splittone(rawsyl)[1] !== 0) {
      hint.textContent = 'leave off the tone mark';
    } else if (parse(rawsyl)) {
      hint.textContent = wrapHint(parse(rawsyl));
    } else {
      splitrawsyl(rawsyl).forEach((part, i) => { partCells[i].textContent = part; });
    }
  }

  button.addEventListener('click', split);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') split(); });
  input.addEventListener('input', () => {
    autoCorrect(input);
    clearParts();
    button.disabled = input.value.trim() === '';
    if (button.disabled) hint.textContent = '';
  });
  el.replaceWith(table);
}

// <syllableentry></syllableentry> — an embedded interactive syllable-entry
// box, no priming, no play button: just the input + validation hint, same
// component createBox()/createSyllablePlayer() are themselves built from.
function hydrateSyllableEntry(el) {
  const entry = createSyllableEntry();
  const wrapper = document.createElement('div');
  wrapper.className = 'syllable-entry-embed';
  wrapper.append(entry.input, entry.hint);
  el.replaceWith(wrapper);
}

// <syllableplayer></syllableplayer> — an embedded interactive syllable
// entry plus play button, identical to what "Hear a Syllable" creates as
// a draggable box, minus the drag handle/close chrome.
function hydrateSyllablePlayer(el) {
  const player = createSyllablePlayer();
  el.replaceWith(player.element);
}

// <listen syl="mā má mǎ mà" icon></listen> — a wrapping grid of listen
// buttons. `icon` is a boolean-presence attribute: present shows the
// generic speaker icon on every button, absent (the default) shows the
// syllable text.
function hydrateListen(el) {
  const syllables = el.getAttribute('syl').trim().split(/\s+/);
  const showIcon = el.hasAttribute('icon');
  console.log('<listen> syl:', syllables, 'icon:', showIcon);
  const grid = createListenGrid(syllables, { showIcon });
  el.replaceWith(grid.element);
}

// <tonerows rawsyl="ma pa"></tonerows> — one row per syllable, 4 tones each.
function hydrateToneRows(el) {
  const rawsylList = el.getAttribute('rawsyl').trim().split(/\s+/);
  console.log('<tonerows> rawsyl:', rawsylList);
  const rows = createToneRows(rawsylList);
  el.replaceWith(rows.element);
}

// <initialfinal i="z c s" f="a e ai"></initialfinal> — a dropdown of
// initials and a dropdown of finals (finals written as they are with no
// initial: yan, wan, ying), and a "create" button, enabled once both are
// chosen, that adds that syllable's 4 tones as a row at the bottom, or
// flashes the row if it's already there. A separate button (rather than
// adding a row whenever a dropdown changes) lets a deleted row be made
// again without changing the dropdowns first. Rows can be dragged into
// any order and deleted, so a learner can line up, say, za and ca to
// compare them.
//
// The final dropdown stays disabled until an initial is chosen, and then
// offers only the finals that fit it, so one tag can pair j with yu and
// zh with wu (ju, zhu) without offering j + wu. Switching initials keeps
// the chosen final if it still fits, otherwise blanks it.
//
// A pair fits if it combines into a syllable that parse() accepts and
// that splits back into the same initial and final. parse() alone isn't
// enough: a slip like d + yu combines into a real syllable (du, really
// d + wu). When the page loads, an initial with no final that fits, or a
// final with no initial that fits, turns the whole tag into a red error.
function hydrateInitialFinal(el) {
  const initials = (el.getAttribute('i') || '').trim().split(/\s+/).filter(Boolean);
  const finals = (el.getAttribute('f') || '').trim().split(/\s+/).filter(Boolean);
  if (initials.length === 0 || finals.length === 0) {
    renderTagError(el, 'initialfinal needs an i and an f attribute');
    return;
  }
  const fits = (i, f) => {
    const rawsyl = initialfinal(i, f);
    if (!rawsyl || parse(rawsyl) !== '') return false;
    const [splitInitial, splitFinal] = splitrawsyl(rawsyl);
    return splitInitial === i && splitFinal === f;
  };
  const finalsFor = new Map(initials.map((i) => [i, finals.filter((f) => fits(i, f))]));
  const lonelyInitials = initials.filter((i) => finalsFor.get(i).length === 0);
  const lonelyFinals = finals.filter((f) => !initials.some((i) => finalsFor.get(i).includes(f)));
  const problems = [];
  if (lonelyInitials.length > 0) problems.push(`no final fits ${lonelyInitials.join(', ')}`);
  if (lonelyFinals.length > 0) problems.push(`no initial fits ${lonelyFinals.join(', ')}`);
  if (problems.length > 0) {
    renderTagError(el, `initialfinal: ${problems.join('; ')}`);
    return;
  }

  // The hidden, disabled first option is the placeholder: it shows in the
  // closed dropdown until a choice is made, but never in the open list.
  function createSelect(label, values) {
    const select = document.createElement('select');
    select.setAttribute('aria-label', label);
    const placeholder = new Option(label, '');
    placeholder.disabled = true;
    placeholder.hidden = true;
    placeholder.selected = true;
    select.add(placeholder);
    values.forEach((value) => select.add(new Option(value)));
    return select;
  }
  const initialSelect = createSelect('initial', initials);
  const finalSelect = createSelect('final', []);
  finalSelect.disabled = true;

  function updateFinals() {
    const kept = finalSelect.value;
    const fitting = finalsFor.get(initialSelect.value);
    while (finalSelect.options.length > 1) finalSelect.remove(1);
    fitting.forEach((f) => finalSelect.add(new Option(f)));
    if (fitting.includes(kept)) finalSelect.value = kept;
    else finalSelect.options[0].selected = true;
    finalSelect.disabled = false;
  }

  const plus = document.createElement('span');
  plus.textContent = '+';
  const create = document.createElement('button');
  create.type = 'button';
  create.className = 'initial-final-create';
  create.textContent = 'create';
  create.disabled = true;
  const choice = document.createElement('div');
  choice.className = 'initial-final-choice';
  choice.append(initialSelect, plus, finalSelect, create);

  const rows = document.createElement('div');
  rows.className = 'initial-final-rows';
  makeReorderable(rows);

  function flash(row) {
    row.classList.remove('flash');
    row.getBoundingClientRect(); // so re-adding the class restarts the animation
    row.classList.add('flash');
  }

  function createRow(rawsyl) {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'reorder-handle';
    handle.textContent = '⠿';
    handle.setAttribute('aria-label', `move ${rawsyl}`);
    handle.title = 'drag to move';

    const grid = createListenGrid([1, 2, 3, 4].map((tone) => addtone(rawsyl, tone)));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-delete';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `delete ${rawsyl}`);
    remove.title = 'delete';

    const row = document.createElement('div');
    row.className = 'initial-final-row';
    row.dataset.rawsyl = rawsyl;
    row.append(handle, grid.element, remove);
    remove.addEventListener('click', () => row.remove());
    return row;
  }

  function choose() {
    if (!initialSelect.value || !finalSelect.value) return;
    const rawsyl = initialfinal(initialSelect.value, finalSelect.value);
    let row = [...rows.children].find((r) => r.dataset.rawsyl === rawsyl);
    if (row) {
      flash(row);
    } else {
      row = createRow(rawsyl);
      rows.append(row);
    }
    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  const updateCreate = () => {
    create.disabled = !initialSelect.value || !finalSelect.value;
  };
  initialSelect.addEventListener('change', () => {
    updateFinals();
    updateCreate();
  });
  finalSelect.addEventListener('change', updateCreate);
  create.addEventListener('click', choose);

  const element = document.createElement('div');
  element.className = 'initial-final';
  element.append(choice, rows);
  el.replaceWith(element);
}

// <dictation syl="pā tā" rawsyl="yi wu yu"></dictation> — a dictation quiz
// over the combined pool: syl's syllables used as given, each of rawsyl's
// expanded to all 4 tones. Either attribute alone is fine; at least one
// is required.
// Resolves an attribute's value into a flat array of syllables. Each
// token is resolved independently — a literal syllable, or (if it starts
// with @) expanded to a named set's contents (looked up in namedSets,
// built from <cartesian>/<syllableset> in the topic's preamble). The two
// can be freely mixed within one attribute: the @ prefix is distinctive
// enough on its own that there's no ambiguity per token.
function resolveSetAttr(attrValue, namedSets) {
  if (!attrValue) return [];
  const tokens = attrValue.trim().split(/\s+/).filter(Boolean);
  return tokens.flatMap((t) => {
    if (!t.startsWith('@')) return [t];
    const refName = t.slice(1);
    const set = namedSets.get(refName);
    if (!set) throw new Error(`references unknown set "${refName}"`);
    return [...set];
  });
}

// <dictation syl="pā tā" rawsyl="yi wu yu"></dictation> — a dictation quiz
// over the combined pool: syl's syllables used as given, each of rawsyl's
// expanded to all 4 tones. Either attribute alone is fine; at least one is
// required. Either attribute's value may instead be one or more @name
// references (never mixed with literals) into namedSets.
function hydrateDictation(el, namedSets) {
  const sylAttr = el.getAttribute('syl');
  const rawsylAttr = el.getAttribute('rawsyl');
  if (!sylAttr && !rawsylAttr) {
    renderTagError(el, 'dictation needs a syl and/or rawsyl attribute');
    return;
  }

  let syllables;
  try {
    const sylList = resolveSetAttr(sylAttr, namedSets);
    const rawsylList = resolveSetAttr(rawsylAttr, namedSets);
    const expanded = rawsylList.flatMap((rawsyl) => [1, 2, 3, 4].map((tone) => addtone(rawsyl, tone)));
    syllables = [...sylList, ...expanded];
    console.log('<dictation> pool:', syllables);
  } catch (err) {
    renderTagError(el, err.message);
    return;
  }

  const quiz = createDictationQuiz(syllables);
  el.replaceWith(quiz.element);
}

// Separate from the pinyin audioCache in script.js, since these are
// arbitrary English-audio filenames, not derived from a syllable+tone.
const egAudioCache = new Map();
const EG_DIR = 'sound/eg';
const EG_AUDIO_SOURCES = [
  { dir: EG_DIR, ext: 'wav' },
  { dir: EG_DIR, ext: 'mp3' },
];

function playEgSound(src) {
  let audio = egAudioCache.get(src);
  if (!audio) {
    audio = loadAudio(src, EG_AUDIO_SOURCES);
    egAudioCache.set(src, audio);
  }
  audio.currentTime = 0;
  audio.play().catch((err) => console.error(err));
}

// A tag-authoring mistake (missing required attribute, etc.) is made
// visible on the page itself, not just a devtools warning, so it's caught
// by looking at the lesson rather than checking the console.
function renderTagError(el, message) {
  console.warn(message);
  const span = document.createElement('span');
  span.className = 'tag-error';
  span.textContent = `${el.textContent} [${message}]`;
  el.replaceWith(span);
}

// <eg src="...">text</eg> — inline, italic+underline, clickable English
// audio (an English-vs-Chinese pronunciation comparison snippet).

function hydrateEg(el) {
  const src = el.getAttribute('src');
  if (!src) {
    renderTagError(el, '<eg> is missing its required src attribute');
    return;
  }
  const span = document.createElement('span');
  span.className = 'eg';
  span.textContent = el.textContent;
  span.tabIndex = 0;
  span.setAttribute('role', 'button');
  span.addEventListener('click', () => playEgSound(src));
  el.replaceWith(span);
}

// <egpy>ma</egpy> — inline, <py>'s font plus an underline, clickable.
// Displays exactly what was written; if it has no tone mark, defaults to
// first tone for playback only (the display stays toneless as written).
function hydrateEgPy(el) {
  const text = el.textContent;
  const [rawsyl, tone] = splittone(text);
  const toPlay = tone === 0 ? addtone(rawsyl, 1) : text;

  const span = document.createElement('span');
  span.className = 'py egpy';
  span.textContent = text;
  span.tabIndex = 0;
  span.setAttribute('role', 'button');
  span.addEventListener('click', () => playSyllable(toPlay));
  el.replaceWith(span);
}

// <egsentence src="...">Quoted text.</egsentence> — block-level version of
// <eg>: same italic+underline text, plus a speaker icon since a full
// sentence isn't as visually self-evident as a single clickable word.
function hydrateEgSentence(el) {
  const src = el.getAttribute('src');
  if (!src) {
    renderTagError(el, '<egsentence> is missing its required src attribute');
    return;
  }
  const container = document.createElement('div');
  container.className = 'eg-sentence';
  container.tabIndex = 0;
  container.setAttribute('role', 'button');
  container.addEventListener('click', () => playEgSound(src));

  const icon = document.createElement('span');
  icon.textContent = '🔊';
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'eg';
  text.textContent = el.textContent;

  container.append(icon, text);
  el.replaceWith(container);
}

function hydratePage(root, namedSets) {
  root.querySelectorAll('py').forEach(hydratePy);
  root.querySelectorAll('zy').forEach(hydrateZy);
  const hasZyConverter = root.querySelector('zyconverter') !== null;
  root.querySelectorAll('zyconverter').forEach(hydrateZyConverter);
  root.querySelectorAll('zytable').forEach((el) => hydrateZyTable(el, hasZyConverter));
  root.querySelectorAll('pydecomposition').forEach((el) => hydrateDecomposition(el, 'py'));
  root.querySelectorAll('zydecomposition').forEach((el) => hydrateDecomposition(el, 'zy'));
  root.querySelectorAll('pysplitter').forEach(hydratePySplitter);
  root.querySelectorAll('eg').forEach(hydrateEg);
  root.querySelectorAll('egpy').forEach(hydrateEgPy);
  root.querySelectorAll('egsentence').forEach(hydrateEgSentence);
  root.querySelectorAll('syllableentry').forEach(hydrateSyllableEntry);
  root.querySelectorAll('syllableplayer').forEach(hydrateSyllablePlayer);
  root.querySelectorAll('listen').forEach(hydrateListen);
  root.querySelectorAll('tonerows').forEach(hydrateToneRows);
  root.querySelectorAll('initialfinal').forEach(hydrateInitialFinal);
  root.querySelectorAll('dictation').forEach((el) => hydrateDictation(el, namedSets));
}

// ---- Lessons panel: manifest + topic loading + panel UI ----

const LESSONS_DIR = 'lessons';

// Loaded lazily on first panel open, not at page load.
let manifestPromise = null;

function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(`${LESSONS_DIR}/toc.txt`)
      .then((res) => res.text())
      .then((text) => text.split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'))
        .map((line) => {
          const match = line.match(/^(\S+)\s+(.*)$/);
          if (!match) return null;
          const file = match[1].endsWith('.md') ? match[1] : `${match[1]}.md`;
          return { file, title: match[2].trim() };
        })
        .filter(Boolean));
  }
  return manifestPromise;
}

// Splits raw markdown on "## " lines *before* any HTML rendering, so the
// heading itself is consumed as the page's title and never duplicated in
// the rendered body. Anything before the first "## " (the preamble) is
// where <cartesian>/<syllableset> definitions live — returned separately,
// never rendered as page content.
function splitPages(raw) {
  const parts = raw.split(/^## (.*)$/m);
  const preamble = parts[0];
  const pages = [];
  for (let i = 1; i < parts.length; i += 2) {
    pages.push({ title: parts[i].trim(), rawBody: parts[i + 1] });
  }
  return { preamble, pages };
}

// <cartesian name="syl1" i="p t k" f="a e ai"></cartesian> — the cross
// product of every initial in `i` with every final in `f`, named `name`.
function applyCartesian(el, namedSets) {
  const name = el.getAttribute('name');
  if (!name) throw new Error('<cartesian> is missing a name attribute');
  const initials = (el.getAttribute('i') || '').trim().split(/\s+/).filter(Boolean);
  const finals = (el.getAttribute('f') || '').trim().split(/\s+/).filter(Boolean);
  const result = new Set();
  initials.forEach((i) => finals.forEach((f) => result.add(i + f)));
  console.log(`<cartesian name="${name}">:`, [...result]);
  namedSets.set(name, result);
}

// <syllableset name="syl1" set="@syl1raw" exclude="pe tei"></syllableset>
// — (set ∪ include) − exclude, written to `name`. All three attributes
// are optional (missing = empty); excluding something not present is not
// an error. Each attribute's value may be literal syllables or one or
// more @name references, but never a mix of the two within one attribute.
function applySyllableSet(el, namedSets) {
  const name = el.getAttribute('name');
  if (!name) throw new Error('<syllableset> is missing a name attribute');
  const base = resolveSetAttr(el.getAttribute('set'), namedSets);
  const include = resolveSetAttr(el.getAttribute('include'), namedSets);
  const exclude = resolveSetAttr(el.getAttribute('exclude'), namedSets);
  const result = new Set([...base, ...include]);
  exclude.forEach((x) => result.delete(x));
  console.log(`<syllableset name="${name}">:`, [...result]);
  namedSets.set(name, result);
}

// Builds a topic's named-set registry from <cartesian>/<syllableset> tags
// living in its preamble, processed in document order so a later
// definition can reference an earlier one's name. Any problem throws —
// deliberately: a broken preamble means the whole topic can't be trusted
// to hydrate correctly, so the whole topic load fails rather than
// silently showing broken quizzes on some of its pages.
function buildNamedSets(preamble) {
  const namedSets = new Map();
  const container = document.createElement('div');
  container.innerHTML = preamble;
  Array.from(container.children).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'cartesian') applyCartesian(el, namedSets);
    else if (tag === 'syllableset') applySyllableSet(el, namedSets);
  });
  return namedSets;
}

// Fetched, split, and rendered through marked.js exactly once per file;
// the cache holds the promise itself (not just its resolved value) so two
// clicks before the first fetch finishes don't trigger a second one. A
// rejected promise (a broken preamble) stays cached as rejected — a
// genuinely broken topic doesn't get retried into working.
const topicCache = new Map();

function loadTopic(file) {
  if (!topicCache.has(file)) {
    const promise = fetch(`${LESSONS_DIR}/${file}`)
      .then((res) => res.text())
      .then((raw) => {
        const { preamble, pages } = splitPages(raw);
        const namedSets = buildNamedSets(preamble);
        return {
          namedSets,
          pages: pages.map((page) => ({
            title: page.title,
            html: marked.parse(page.rawBody),
          })),
        };
      });
    topicCache.set(file, promise);
  }
  return topicCache.get(file);
}

// The currently-displayed section's nav entry, highlighted so a learner
// can tell which syllables a listening-practice page is testing without
// the (visually identical) page content alone giving it away.
let activePageItem = null;

function setActivePage(pageItem) {
  if (activePageItem) activePageItem.classList.remove('active');
  activePageItem = pageItem;
  if (activePageItem) activePageItem.classList.add('active');
}

// Each section's last scroll position in the lessons panel, keyed by its
// nav entry, so going back to a section returns to where the learner left
// it, and a section never visited before starts at the top. Saved before
// the panel's content is replaced, since a shorter new page would clamp it.
const scrollPositions = new WeakMap();

function saveScrollPosition(content) {
  if (activePageItem) scrollPositions.set(activePageItem, content.parentElement.scrollTop);
}

function renderPageList(pageList, content, topic) {
  topic.pages.forEach((page) => {
    const pageItem = document.createElement('div');
    pageItem.className = 'lessons-page';
    pageItem.textContent = page.title;
    pageItem.addEventListener('click', () => {
      saveScrollPosition(content);
      content.innerHTML = page.html;
      hydratePage(content, topic.namedSets);
      setActivePage(pageItem);
      content.parentElement.scrollTop = scrollPositions.get(pageItem) ?? 0;
    });
    pageList.appendChild(pageItem);
  });
}

// Scrolls a just-expanded topic's section list into view, so a topic near
// the bottom of the toc doesn't open below the fold. If the topic and all
// its sections fit, the scroll stops as soon as the last section is
// visible; if not, the topic title goes to the top instead.
function revealTopic(topicItem, pageList) {
  if (pageList.hidden) return;
  const panel = topicItem.closest('#toc-panel');
  const height = pageList.getBoundingClientRect().bottom
    - topicItem.getBoundingClientRect().top;
  if (height <= panel.clientHeight && pageList.lastElementChild) {
    pageList.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else {
    topicItem.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

function renderTopicList(nav, content, entries) {
  entries.forEach(({ file, title }) => {
    const topicItem = document.createElement('div');
    topicItem.className = 'lessons-topic';
    topicItem.textContent = title;

    const pageList = document.createElement('div');
    pageList.className = 'lessons-page-list';
    pageList.hidden = true;

    topicItem.addEventListener('click', () => {
      if (pageList.children.length === 0) {
        loadTopic(file)
          .then((topic) => renderPageList(pageList, content, topic))
          .catch((err) => {
            pageList.textContent = `Preamble failed: ${err.message}`;
            pageList.classList.add('tag-error');
          })
          .then(() => revealTopic(topicItem, pageList));
      }
      pageList.hidden = !pageList.hidden;
      if (!pageList.hidden && pageList.children.length > 0) revealTopic(topicItem, pageList);
      if (pageList.hidden && activePageItem && pageList.contains(activePageItem)) {
        saveScrollPosition(content);
        content.innerHTML = '';
        setActivePage(null);
      }
    });

    nav.append(topicItem, pageList);
  });
}

function createLessonsPanel() {
  const toggle = document.createElement('button');
  toggle.id = 'lessons-toggle';
  toggle.type = 'button';
  toggle.textContent = 'Lessons';

  // Two separate docked panels, not one panel split internally: the toc
  // sits in its own bordered box immediately to the left of the content
  // viewport, matching the old prototype's two-pane window layout.
  const tocPanel = document.createElement('aside');
  tocPanel.id = 'toc-panel';
  tocPanel.hidden = true;

  const nav = document.createElement('nav');
  nav.className = 'lessons-nav';
  tocPanel.append(nav);

  const contentPanel = document.createElement('aside');
  contentPanel.id = 'lessons-panel';
  contentPanel.hidden = true;

  const content = document.createElement('div');
  content.className = 'lessons-content';
  contentPanel.append(content);

  let opened = false;
  toggle.addEventListener('click', () => {
    opened = !opened;
    tocPanel.hidden = !opened;
    contentPanel.hidden = !opened;
    toggle.textContent = opened ? 'Close' : 'Lessons';
    if (opened && nav.children.length === 0) {
      loadManifest().then((entries) => renderTopicList(nav, content, entries));
    }
  });

  document.body.append(toggle, tocPanel, contentPanel);
}

createLessonsPanel();
