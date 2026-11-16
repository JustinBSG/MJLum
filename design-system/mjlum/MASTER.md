# MJLum design system

This specification replaces the earlier encyclopedia-site template with the physical-table mobile design requested by the user. Product rules follow [the scoring guide](../../docs/guide.md); interface changes preserve scoring formulas.

## Direction

Minimalism / Soft UI Evolution. Prioritize a light theme, one-handed use at a physical table, and a Traditional Chinese (Hong Kong) interface. Avoid gradients, glass effects, emoji icons, and decorative animation.

## Colors

Primary/focus: `#1E3A8A`; primary-button text: white; background: `#F8FAFC`; cards: `#FFFFFF`; text: `#17243B`; secondary text: `#475569`; border: `#CBD5E1`; selected: `#E8EEF9`; positive: `#166534`; negative: `#B42318`. Show signs or text alongside positive/negative colors.

## Typography and spacing

Use the platform sans-serif with Traditional Chinese support. Body: 16/24; headings: 28/36; scores: 40/48. Use tabular numbers and support system font scaling. Spacing: 4/8/16/24/32; corner radii: 12–20; maximum content width: 720. Touch targets are at least 48×48; primary actions are 56 high. Use light borders to group content rather than stacked shadows.

## Interactions

The four bottom tabs are Table (牌桌), History (記錄), Settlement (找數), and Statistics (統計). Win entry (食糊) is the primary table action; Draw (流局) is secondary. Other actions live in the More tools modal. Features provide a clear Back action; the table also offers Home. Win entry proceeds through player selection, the full fan range, self-draw or discarder selection, review, and confirmation. Omit the redundant question-mark row and payment-method heading.

Amount fields provide a numeric keypad with explicit Done and Cancel actions. Support decimals and fractions without truncating exact values. Use native Switch controls and a selected background/checkmark for options. Minimum and capped fan values share one dual-handle slider with accessible increment/decrement actions. History, session settings, and fan tables have column headings, grid lines, and aligned numbers; wide tables scroll horizontally. Score cards do not expand to reveal exact values. Confirm a drawn hand in a modal above the table. Apply consistent safe areas and top spacing throughout.

## Accessibility

Expose control semantics, accessible names, and selected/disabled states. Use a 3-unit navy focus outline, background feedback on press, and Lucide SVG icons. Respect safe areas and keyboard avoidance. Avoid decorative animation; functional dice animation respects reduced-motion preferences. The delivered theme is light; dark mode is not claimed as complete.

## Brand icon

Use an original rounded red-dragon Mahjong tile mascot with a white face, navy outline and smile, and dark-green tile base. The app icon has a solid navy background; Home and the splash screen use the transparent mascot. The vector source is `app/src/constants/brand.ts`. Run `npm run generate:brand` from `app` to export iOS, Android, web, and splash assets.
