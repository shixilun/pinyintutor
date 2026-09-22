<!-- Placeholder content, just to prove the framework works end to end.
     Replace with real lesson content. -->

<cartesian name="syl1" i="p t k" f="a e ai"></cartesian>
<syllableset name="syl1clean" set="@syl1" exclude="pe"></syllableset>

## First Page

This is the first page of a placeholder topic. The syllable <py>mā</py> has the first tone.

<listen syl="mā má mǎ mà"></listen>

## Second Page

Grouped by base syllable, one row per tone set:

<tonerows rawsyl="ma pa ta"></tonerows>

Quick quiz:

<dictation syl="pā tā kā pá tá ká"></dictation>

## Named Set Quiz

This pool comes from `<cartesian>` (p/t/k × a/e/ai) minus `pe`, referenced
by name rather than spelled out:

<dictation rawsyl="@syl1clean"></dictation>

## New Components

Icon-mode listen grid (should show speaker icons, not text):

<listen syl="mā má mǎ mà" icon></listen>

A bare entry box (no play button):

<syllableentry></syllableentry>

An embedded syllable player (identical to a "Hear a Syllable" box, no drag/close chrome):

<syllableplayer></syllableplayer>
