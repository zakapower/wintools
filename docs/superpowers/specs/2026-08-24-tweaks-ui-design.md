# Tweaks UI redesign

Date: 2026-08-24  
Status: approved direction (approach A)

## Goal

Make the Tweaks section readable for non-experts: plain vertical list (like Windows Settings), keep official Windows names, add a short gray hint that explains what each option does. No change to generated XML behavior.

## Decisions

- Layout: approach **A** — single-column settings list (not chip grid).
- Label pattern: official name + short “what it does” hint.
- Naming: keep product jargon in the title (Recall, Copilot, Game DVR, BitLocker, Express); explain in the hint.
- Groups stay: Look & Windows, Privacy & suggestions, File Explorer, Taskbar, System.
- Express privacy stays as radios, styled like the same list rows.
- Apps section chip grid is out of scope.
- Summary panel can keep short labels; optional light polish only if it stays consistent without extra work.

## Layout

### Desktop (≥ ~720px)

Each tweak row:

```
[✓]  Title                          Short hint (muted, right-aligned)
```

- One column, full width of the generator column.
- Checkbox/radio mark on the left (existing `.choice` marks).
- Title: primary text, same weight as other field labels.
- Hint: muted color, smaller font (~0.85em), one line preferred; wrap allowed.
- Rows stack with modest vertical gap (no card chrome, no divider lines).
- Group titles remain uppercase section headers above each list.

### Mobile (< ~720px)

```
[✓]  Title
     Short hint under title (full width)
```

Hint moves under the title so names are not crushed.

## Copy rules

- Title = official / familiar Windows name (RU/EN via existing `t()`).
- Hint = one short sentence: effect for the user, not registry jargon.
- Hints are bilingual (RU + EN), same as titles.
- Express radios: titles stay (“Minimize Microsoft data” / “Windows defaults”); each gets a hint.

Example (RU):

| Title | Hint |
| --- | --- |
| Recall | Не сохраняет снимки экрана для поиска |
| Copilot | Убирает кнопку и политику Copilot |
| Game DVR | Отключает фоновую запись игр |
| BitLocker | Не включает шифрование диска при установке |
| Классическое меню ПКМ | Старое меню правой кнопки, как в Windows 10 |

Exact final strings are set during implementation; meaning must match current tweak behavior in `buildUnattendXml`.

## Structure / code

- Keep tweak state and `patch(...)` wiring as-is in `Generator.tsx`.
- Extend each tweak label markup to title + hint (e.g. `choice__text` + `choice__hint`, or a small shared row helper used only in Tweaks).
- CSS: replace `.choices--tweaks` 3-column `max-content` grid with a single-column full-width list; style hint for desktop vs mobile as above.
- Do not invent new tweak flags or rename config keys.
- No generator / XML / validation changes.

## Out of scope

- Redesigning Apps checkboxes.
- New tweaks or changing what existing tweaks write to the answer file.
- Visual companion mockups (text design only).
- Renaming the section title “Твики” / “Tweaks” (can stay).

## Success criteria

- On desktop, Tweaks read as a vertical settings list with gray hints on the right.
- On mobile (~390px), every title and hint is readable without horizontal overflow.
- A user unfamiliar with “Recall” / “Game DVR” understands the effect from the hint.
- Existing unit tests for unattend XML still pass unchanged.
- Behavior of checked options in downloaded `autounattend.xml` is identical before/after.
