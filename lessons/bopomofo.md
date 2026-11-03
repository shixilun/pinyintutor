## Introduction

Most modern schemes for marking the pronunciation of Chinese characters are based on an existing alphabet (usually 
the Latin alphabet).

However, shortly after the establishment of the Republic of China in 1912, as part of the government's efforts to 
establish a uniform national pronunciation, a scheme was devised to annotate this pronunciation.  It eventually 
evolved into what became _zhuyin fuhao_ (<py>zhùyīn</py> means "annotate the sounds" and <py>fúhào</py> 
means "symbols").  In addition to being called _zhuyin_, it is commonly referred to as <py>bopomofo</py> after the 
first four symbols in the scheme.

This scheme has the following characteristics:
- The symbols come from an original shorthand notation based on Chinese characters.  For example, <zy>ㄅ</zy>, which 
  represents the <py>b</py> sound, comes from the character 包, pronounced <py>bāo</py>.  (Japanese _hiragana_ and 
  _katakana_ were derived in a similar way.)
- The scheme assigns symbols to sounds based on a description of character pronunciation by Chinese scholars that goes 
  back _centuries_.  Because pronunciation has changed over time, some of the symbol assignments might not feel 
  natural and just have to be memorized as special spelling rules.
- <py>bopomofo</py> marks tones almost the same way as _pinyin_.  The tone mark goes after the syllable, and there 
  is no mark for the first tone.  Here is an example for the <py>bopomofo</py> syllable <zy>ㄚ</zy>.
<zytable groups="ㄚ:ā ㄚˊ:á ㄚˇ:ǎ ㄚˋ:à"></zytable>

## Initials, Medials, Rimes in pinyin

You have seen that in _pinyin_, syllables split into initials and finals.

In historical pronunciation analysis, finals split further into _medials_ and _rimes_.  (That's not a typo.)

The _rimes_ are essentially all the finals we have seen that do not begin with <py>y</py> or <py>w</py>, with a 
couple exceptions we will see later.

The _medials_ are denoted by the letters <py>i</py>, <py>u</py>, and <py>ü</py>.  They correspond to finals 
beginning with <py>y</py> (but not <py>yu</py>), <py>w</py>, and <py>yu</py>.

Here are some _pinyin_ finals that have been split into medials and rimes.

> <py>you</py> &#x2192; <py>i</py> + <py>ou</py>

> <py>wei</py> &#x2192; <py>u</py> + <py>ei</py>

> <py>yuan</py> &#x2192; <py>ü</py> + <py>an</py>

Any _pinyin_ final that does not begin with <py>y</py> or <py>w</py> is said to have an _empty_ medial.

There are a lot of special cases for how finals are split into medials and rimes.  Some of them come from how 
_pinyin_ is designed.  Some of them come from how pronunciation has changed over the centuries.  The next four 
sections cover these special cases.

## Initials, Medials, Rimes in pinyin — special cases (1)

Here are some special cases of splitting _pinyin_ finals into medials and rimes.

---

These three _pinyin_ finals have medials but no rimes; we say they have _empty_ rimes.  The _pinyin_ final is on the 
left and the corresponding medial is on the right.

> <py>yi</py> &#x2192; <py>i</py> <!-- &emsp; (or <py>i</py> + ∅) -->

> <py>wu</py> &#x2192; <py>u</py> <!-- &emsp; (or <py>u</py> + ∅) -->

> <py>yu</py> &#x2192; <py>ü</py> <!-- &emsp; (or <py>ü</py> + ∅) -->

---

Because the perceived pronunciation of <py>e</py> in <egpy>ye</egpy> and <egpy>yue</egpy> is different from the
pronunciation of <egpy>e</egpy> by itself, when splitting into medials and rimes we use the symbol <py>ê</py> to
distinguish the two.

> <py>e</py> &#x2192; <py>e</py>

> <py>ye</py> &#x2192; <py>i</py> + <py>ê</py>

> <py>yue</py> &#x2192; <py>ü</py> + <py>ê</py>

## Initials, Medials, Rimes in pinyin — special cases (2)

Here are some special cases of splitting _pinyin_ finals into medials and rimes.

---

These three _pinyin_ finals split in ways you might not expect at first.

> <py>yin</py> &#x2192; <py>i</py> + <py>en</py>

> <py>ying</py> &#x2192; <py>i</py> + <py>eng</py>

> <py>yun</py> &#x2192; <py>ü</py> + <py>en</py>

But if you listen carefully, you will hear plenty of native speakers pronounce each of these three _pinyin_ finals 
as two short syllables smashed together into one, just like the split into medial and rime indicates.  For example, 
<py>yin</py> can sound like the name _Ian_ said quickly.

---

For historical reasons, the _pinyin_ finals <egpy>weng</egpy> and <egpy>ong</egpy> split into medials and rimes the 
exact same way.  But since <py>weng</py> never takes an initial and <py>ong</py> always takes an initial, there 
should be little confusion.

> <py>weng</py> &#x2192; <py>u</py> + <py>eng</py>

> <py>dong</py> &#x2192; <py>d</py> + <py>ong</py> &#x2192; <py>d</py> + <py>u</py> + <py>eng</py>

You will _never_ hear a native speaker pronounce <egpy>dong</egpy> as <egpy>du</egpy> + <egpy>eng</egpy>.

Similarly, <py>yong</py> splits as follows.

> <py>yong</py>
> &#x2192; <py>i</py> + <py>ong</py>
> &#x2192; <py>i</py> + ( <py>u</py> + <py>eng</py> )
> &#x2192; ( <py>i</py> + <py>u</py> ) + <py>eng</py>
> &#x2192; <py>ü</py> + <py>eng</py>

But there are not many native speakers who pronounce <egpy>yong</egpy> as <egpy>yu</egpy> + <egpy>ong</egpy>.

## Initials, Medials, Rimes in pinyin — special cases (3)

Here are some special cases of splitting _pinyin_ finals into medials and rimes.

---

In the introduction, we said that every _pinyin_ syllable has an initial and a final.  However, not everyone agrees 
about the syllables <py>zhi chi shi ri</py> and <py>zi ci si</py>.  Some call the sound following the initial just 
an extension of the initial and say that these syllables have empty final (and thus empty medial and rime).  Others 
call the sound a true final and call that final and its rime an "apical vowel".

In the official documentation for _pinyin_, it is a final written <py>-i</py>; the hyphen disappears when this final 
is added to an appropriate initial.  The hyphen helps remind us that this sound has nothing to do with the medial 
<py>i</py> or the final <py>yi</py>.  We will write this final <py>(-i)</py> to acknowledge that not everyone 
recognizes this as a true final.

The right-hand side of the following examples of splitting can be interpreted both as initial + final and as initial + 
rime with no medial.

> <py>zhi</py> &#x2192; <py>zh</py> + <py>(-i)</py>

> <py>chi</py> &#x2192; <py>ch</py> + <py>(-i)</py>

> <py>shi</py> &#x2192; <py>sh</py> + <py>(-i)</py>

> <py>ri</py> &#x2192; <py>r</py> + <py>(-i)</py>

> <py>zi</py> &#x2192; <py>z</py> + <py>(-i)</py>

> <py>ci</py> &#x2192; <py>c</py> + <py>(-i)</py>

> <py>si</py> &#x2192; <py>s</py> + <py>(-i)</py>

## Initials, Medials, Rimes in pinyin — special cases (4)

Here are some special cases of splitting _pinyin_ finals into medials and rimes.

---

As explained elsewhere, <py>bo po mo fo</py> are really pronounced <py>buo puo muo fuo</py>, and their traditional 
split into initials, medials, and rimes reflects that.

> <py>bo</py> &#x2192; <py>b</py> + <py>wo</py> &#x2192; <py>b</py> + <py>u</py> + <py>o</py>

> <py>po</py> &#x2192; <py>p</py> + <py>wo</py> &#x2192; <py>p</py> + <py>u</py> + <py>o</py>

> <py>mo</py> &#x2192; <py>m</py> + <py>wo</py> &#x2192; <py>m</py> + <py>u</py> + <py>o</py>

> <py>fo</py> &#x2192; <py>f</py> + <py>wo</py> &#x2192; <py>f</py> + <py>u</py> + <py>o</py>

## Examples in pinyin

Here are some examples of how _pinyin_ syllables split into initials, finals, medials, and rimes.

<pydecomposition>

| syllable | initial | final | medial | rime |
|----------|---------|-------|--------|------|
| a        |         | a     |        | a    |
| ga       | g       | a     |        | a    |

</pydecomposition>

<pydecomposition>

| syllable | initial | final | medial | rime |
|----------|---------|-------|--------|------|
| wu       |         | wu    |  u     |      |
| wa       |         | wa    |  u     | a    |
| gu       | g       | wu    |  u     |      |
| gua      | g       | wa    |  u     | a    |

</pydecomposition>

<pydecomposition>

| syllable | initial | final | medial | rime |
|----------|---------|-------|--------|------|
| yi       |         | yi    |  i     |      |
| ya       |         | ya    |  i     | a    |
| ji       | j       | yi    |  i     |      |
| jia      | j       | ya    |  i     | a    |

</pydecomposition>

<pydecomposition>

| syllable | initial | final | medial | rime |
|----------|---------|-------|--------|------|
| yu       |         | yu    |  ü     |      |
| yuan     |         | yuan  |  ü     | an   |
| qu       | q       | yu    |  ü     |      |
| quan     | q       | yuan  |  ü     | an   |

</pydecomposition>

## Splitter app

You can use this to enter a _pinyin_ syllable and see how it splits into its initial, final, medial, and rime.

<pysplitter></pysplitter>

## Initials, Medials, Rimes in bopomofo

These are the <py>bopomofo</py> symbols for the initials.

<zytable groups="ㄅ:b ㄆ:p ㄇ:m ㄈ:f | ㄉ:d ㄊ:t ㄋ:n ㄌ:l | ㄍ:g ㄎ:k ㄏ:h | ㄐ:j ㄑ:q ㄒ:x | ㄓ:zh ㄔ:ch ㄕ:sh ㄖ:r | ㄗ:z ㄘ:c ㄙ:s"></zytable>

These are the <py>bopomofo</py> symbols for the medials.

<zytable groups="ㄧ:i | ㄨ:u | ㄩ:ü"></zytable>

These are the <py>bopomofo</py> symbols for the rimes.

<zytable groups="ㄚ:a ㄜ:e ㄛ:o ㄝ:ê | ㄞ:ai ㄟ:ei ㄠ:ao ㄡ:ou | ㄢ:an ㄣ:en ㄤ:ang ㄥ:eng"></zytable>
<zytable groups="ㄦ:er"></zytable>

Here are the permitted combinations of medials and rimes using <py>bopomofo</py> symbols.

<zytable groups="ㄧㄚ:ya ㄧㄝ:ye ㄧㄠ:yao ㄧㄡ:you | ㄨㄚ:wa ㄨㄛ:wo ㄨㄞ:wai ㄨㄟ:wei | ㄩㄝ:yue"></zytable>
<zytable groups="ㄧㄢ:yan ㄧㄤ:yang | ㄨㄢ:wan ㄨㄤ:wang | ㄩㄢ:yuan"></zytable>
<zytable groups="ㄧㄣ:yin ㄧㄥ:ying | ㄨㄣ:wen ㄨㄥ:weng ㄨㄥ:ong | ㄩㄣ:yun : ㄩㄥ:yong"></zytable>

## Initials, Medials, Rimes in bopomofo — special cases

Here are some special cases of how traditional initials, medials, and rimes are implemented in <py>bopomofo</py>.

---

Like _pinyin_ and just about every other romanization (but not Yale), <py>bopomofo</py> ignores the medial hidden in 
the pronunciation of the four syllables that make up its own name.

<zytable groups="ㄅㄛ:bo ㄆㄛ:po ㄇㄛ:mo ㄈㄛ:fo"></zytable>

<zy>ㄨ</zy> and <py>u</py> are nowhere to be seen.

(Yale romanization uses _bwo pwo mwo fwo_.)

---

<py>bopomofo</py> treats the _pinyin_ syllables <py>zhi chi shi ri</py> and <py>zi ci si</py> as having empty finals,
and thus empty medials and rimes.  These syllables are represented in <py>bopomofo</py> by just the initial itself.

<zytable groups="ㄓ:zhi ㄔ:chi ㄕ:shi ㄖ:ri | ㄗ:zi ㄘ:ci ㄙ:si"></zytable>

So, for example, the pronunciation of the Chinese word for "solar eclipse" is shown as <py>rìshí</py> in _pinyin_ 
and <zy>ㄖˋㄕˊ</zy> in <py>bopomofo</py>.

**Note:** At one time, there was a suggestion to use the symbol <zy>ㄭ</zy>, an upside-down <zy>ㄓ</zy>, to represent 
the rime <py>(-i)</py>.  In that case, <py>rìshí</py> would have been written as <zy>ㄖㄭˋㄕㄭˊ</zy>.  The final 
implementation of <py>bopomofo</py> discarded that idea.

## bopomofo-pinyin converter

You can use this app to convert between <py>bopomofo</py> and _pinyin_.

To enter <py>bopomofo</py> symbols, first place the cursor in the <py>bopomofo</py> box on the left, then click on 
any of the boxed <py>bopomofo</py> symbols below.

<zyconverter></zyconverter>
<zytable groups="ㄅ:b ㄆ:p ㄇ:m ㄈ:f | ㄉ:d ㄊ:t ㄋ:n ㄌ:l | ㄍ:g ㄎ:k ㄏ:h | ㄐ:j ㄑ:q ㄒ:x | ㄓ:zh ㄔ:ch ㄕ:sh ㄖ:r | ㄗ:z ㄘ:c ㄙ:s"></zytable>
<zytable groups="ㄧ:i | ㄨ:u | ㄩ:ü"></zytable>
<zytable groups="ㄚ:a ㄜ:e ㄛ:o ㄝ:ê | ㄞ:ai ㄟ:ei ㄠ:ao ㄡ:ou | ㄢ:an ㄣ:en ㄤ:ang ㄥ:eng"></zytable>
<zytable groups="ㄦ:er"></zytable>
