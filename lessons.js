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
    } else {
      button.textContent = syllable;
      button.removeAttribute('aria-label');
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

// <listen syl="mā má mǎ mà"></listen> — a wrapping grid of listen buttons.
function hydrateListen(el) {
  const syllables = el.getAttribute('syl').trim().split(/\s+/);
  const grid = createListenGrid(syllables);
  el.replaceWith(grid.element);
}

// <tonerows rawsyl="ma pa"></tonerows> — one row per syllable, 4 tones each.
function hydrateToneRows(el) {
  const rawsylList = el.getAttribute('rawsyl').trim().split(/\s+/);
  const rows = createToneRows(rawsylList);
  el.replaceWith(rows.element);
}

// <dictation syl="pā tā" rawsyl="yi wu yu"></dictation> — a dictation quiz
// over the combined pool: syl's syllables used as given, each of rawsyl's
// expanded to all 4 tones. Either attribute alone is fine; at least one
// is required.
function hydrateDictation(el) {
  const syl = el.getAttribute('syl');
  const rawsyl = el.getAttribute('rawsyl');
  if (!syl && !rawsyl) {
    renderTagError(el, 'dictation needs a syl and/or rawsyl attribute');
    return;
  }

  const syllables = [];
  if (syl) syllables.push(...syl.trim().split(/\s+/));
  if (rawsyl) {
    rawsyl.trim().split(/\s+/).forEach((r) => {
      for (let tone = 1; tone <= 4; tone++) syllables.push(addtone(r, tone));
    });
  }

  const quiz = createDictationQuiz(syllables);
  el.replaceWith(quiz.element);
}

// Separate from the pinyin audioCache in script.js, since these are
// arbitrary English-audio filenames, not derived from a syllable+tone.
const egAudioCache = new Map();
const EG_DIR = 'sound/eg';

function playEgSound(src) {
  let audio = egAudioCache.get(src);
  if (!audio) {
    audio = loadAudio(src, EG_DIR, EG_DIR);
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

function hydratePage(root) {
  root.querySelectorAll('py').forEach(hydratePy);
  root.querySelectorAll('eg').forEach(hydrateEg);
  root.querySelectorAll('egpy').forEach(hydrateEgPy);
  root.querySelectorAll('egsentence').forEach(hydrateEgSentence);
  root.querySelectorAll('listen').forEach(hydrateListen);
  root.querySelectorAll('tonerows').forEach(hydrateToneRows);
  root.querySelectorAll('dictation').forEach(hydrateDictation);
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
// the rendered body.
function splitPages(raw) {
  const parts = raw.split(/^## (.*)$/m);
  const pages = [];
  for (let i = 1; i < parts.length; i += 2) {
    pages.push({ title: parts[i].trim(), rawBody: parts[i + 1] });
  }
  return pages;
}

// Fetched, split, and rendered through marked.js exactly once per file;
// the cache holds the promise itself (not just its resolved value) so two
// clicks before the first fetch finishes don't trigger a second one.
const topicCache = new Map();

function loadTopic(file) {
  if (!topicCache.has(file)) {
    const promise = fetch(`${LESSONS_DIR}/${file}`)
      .then((res) => res.text())
      .then((raw) => ({
        pages: splitPages(raw).map((page) => ({
          title: page.title,
          html: marked.parse(page.rawBody),
        })),
      }));
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

function renderPageList(pageList, content, topic) {
  topic.pages.forEach((page) => {
    const pageItem = document.createElement('div');
    pageItem.className = 'lessons-page';
    pageItem.textContent = page.title;
    pageItem.addEventListener('click', () => {
      content.innerHTML = page.html;
      hydratePage(content);
      setActivePage(pageItem);
    });
    pageList.appendChild(pageItem);
  });
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
        loadTopic(file).then((topic) => renderPageList(pageList, content, topic));
      }
      pageList.hidden = !pageList.hidden;
      if (pageList.hidden && activePageItem && pageList.contains(activePageItem)) {
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
