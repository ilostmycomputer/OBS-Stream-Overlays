# Stream Countdown Slide Motion Design

## Goal

Add entrance and exit motion to both start-stream countdown variants without changing their existing layout, typography, colours, rolling-digit animation, spacing, clipping, duration logic, or OBS Browser Source size.

## Behaviour

- When the Browser Source loads, the entire countdown card begins above its resting position, fades in, and slides downward into place.
- The countdown starts immediately when the Browser Source loads; the entrance animation does not delay the timer.
- The card remains fully visible while the timer counts down, including while it displays `0:00`.
- Exactly 5 seconds after the timer first reaches `0:00`, the entire countdown card fades out while sliding upward and out of view.
- The exit runs once. Refreshing the Browser Source restarts both the timer and entrance/exit lifecycle.

## Motion

- Direction: top-to-bottom entrance, bottom-to-top exit.
- Scope: animate the whole `.timer-shell`, not individual title or digit elements.
- Use transform and opacity transitions so the internal odometer animation remains independent.
- Entrance: `opacity: 0` to `1` while moving from above into the resting position.
- Exit: `opacity: 1` to `0` while moving upward out of view.
- Reduced-motion mode should suppress the animated transition while preserving the same visibility timing: visible immediately on load, hidden 5 seconds after `0:00`.

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

## Implementation

- `.timer-shell` starts above the visible position with `opacity: 0`.
- On startup, request two animation frames and apply `.is-visible`, producing the slide-down and fade-in transition.
- When `remainingSeconds === 0`, stop the timer interval and schedule the exit exactly once for 5000 ms later.
- On exit, remove `.is-visible` and apply `.is-exiting`, producing the upward slide and fade-out transition.
- `prefers-reduced-motion: reduce` removes the animated transition while preserving the lifecycle timing.

## Verification

- Light variant fades and slides in from above on refresh, counts normally, holds `0:00` for 5 seconds, then fades and slides upward out.
- Dark variant behaves identically.
- Refreshing either source restarts from the configured duration and replays the entrance.
- No changes to approved geometry or colour palettes beyond the pre-existing light/dark differences.
