# Crossroads

A structured, local-first decision framework for weighing major life crossroads —
career changes, relocations, relationships, and other high-stakes forks in the
road. Built with React, TypeScript, Vite, Tailwind CSS, and Chart.js.

Everything is stored in the browser's `localStorage`. There is no backend, no
account, and no data leaves the device other than an explicit "Export backup"
download.

## Modules

- **Safety screen** — a brief intake gate before any modeling begins. Answers
  indicating immediate danger, self-harm risk, or abuse/coercion route to
  professional crisis resources instead of the decision tool.
- **Weighted values elicitation** — name what matters and assign relative
  weights, normalized to 100%.
- **Four-scenario scoring grid** — score up to four candidate paths against
  every value on a 1–10 scale; weighted totals compute automatically.
- **Probabilities with base-rate hints** — assign your own probability of a
  favorable outcome per scenario, with illustrative outside-view reference
  hints by category to check against optimism bias.
- **Edit-direction bias detector** — after you first view results, the app
  tracks which scenario your subsequent edits tend to favor, and flags a
  pattern that looks like rationalizing toward a predetermined answer.
- **Dated evidence journal** — log timestamped observations tied to a
  scenario, to track whether your view is shifting on real information.
- **Pre-commitment contract** — write a commitment statement with a
  cooling-off period (24h/72h/7d) before it can be locked in; edits during
  cooling-off restart the timer.
- **Timeline projections** — a Chart.js view of expected-value trajectory
  over your edit history, plus an illustrative (explicitly non-predictive)
  future uncertainty band per scenario.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and production build
npm run preview  # preview the production build
```
