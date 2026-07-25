# Stream Countdown Slide Motion Design

## Goal

Add entrance and exit motion to both start-stream countdown variants without changing their existing layout, typography, colours, rolling-digit animation, spacing, clipping, duration logic, or OBS Browser Source size.

## Behaviour

- When the Browser Source loads, the entire countdown card begins above its resting position and slides downward into place.
- The countdown starts immediately when the Browser Source loads; the slide-in does not delay the timer.
- The card remains fully visible while the timer counts down, including while it displays `0:00`.
- Exactly 5 seconds after the timer first reaches `0:00`, the entire countdown card slides upward and out of view.
- The exit runs once. Refreshing the Browser Source restarts both the timer and entrance/exit lifecycle.

## Motion

- Direction: top-to-bottom entrance, bottom-to-top exit.
- Scope: animate the whole `.timer-shell`, not individual title or digit elements.
- Use a transform-based transition so the internal odometer animation remains independent.
- Keep opacity unchanged unless needed to prevent a one-frame flash before the initial transform is applied.
- Reduced-motion mode should suppress the slide animation while preserving the same visibility timing: visible immediately on load, hidden 5 seconds after `0:00`.

## Variant parity

The following files must retain identical structure and behaviour:

- `Overlays & Plugins/overlays/countdown/stream-countdown.html`
- `Overlays & Plugins/overlays/countdown/stream-countdown-dark.html`

They may differ only in palette values already specific to each variant.

## Constraints

- Do not change the editable title text or `START_SECONDS` interface.
- Do not change the `700 × 180` recommended Browser Source size.
- Do not change title positioning, digit clipping, digit spacing, colon spacing, font sizing, border geometry, sweep animation, or rolling-digit timing.
- Keep the dark variant black/white/purple and the light variant white/black/yellow.
- The timer must still stop at `0:00`.

## Implementation outline

- Add hidden-above, visible, and hidden-above-after-finish states to `.timer-shell` via classes and CSS transform transitions.
- On startup, request a frame and apply the visible class so the entrance transition is guaranteed to run.
- When `remainingSeconds === 0`, stop the interval as today, then schedule the exit exactly once for 5000 ms later.
- Apply the exit class to move the whole shell upward out of view.
- In `prefers-reduced-motion: reduce`, disable the transform transition while preserving class-based state changes.

## Verification

- Light variant slides in from above on refresh, counts normally, holds `0:00` for 5 seconds, then slides upward out.
- Dark variant behaves identically.
- Refreshing either source restarts from the configured duration and replays the entrance.
- No changes to approved geometry or colour palettes beyond the pre-existing light/dark differences.
