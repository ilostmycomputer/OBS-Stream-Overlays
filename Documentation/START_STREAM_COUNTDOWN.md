# Start Stream Countdown

A local OBS Browser Source countdown intended for the beginning of a stream. It starts from an editable duration, uses rolling odometer-style digits, and automatically enters and leaves the screen.

## Variants

Both variants use the same layout, spacing, clipping, rolling-digit motion, timer logic, and entrance/exit animation. Only the colour palette differs.

- Light: [`Overlays & Plugins/overlays/countdown/stream-countdown.html`](../Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html) — white card, black text, yellow perimeter sweep.
- Dark: [`Overlays & Plugins/overlays/countdown/stream-countdown-dark.html`](../Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html) — black card, white text, purple perimeter sweep.

`OpenAI-Sans-Bold.otf` in the same folder is optional and provides the intended typography. The timer still works without it and falls back to a system sans-serif font.

## Default behaviour

By default, both variants start at `1:59` and display `Stream Countdown` above the timer.

When the Browser Source loads:

1. The whole card begins above its resting position with zero opacity.
2. It fades in while sliding down into place.
3. The countdown starts immediately; the entrance animation does not delay it.
4. The rolling digits continue until the timer reaches `0:00`.
5. The card stays fully visible at `0:00` for 5 seconds.
6. It then fades out while sliding upward and out of view.

Refreshing the Browser Source restarts the timer and replays the full entrance/exit lifecycle.

If the operating system requests reduced motion, the animated slide/fade transition is suppressed while the same timing is preserved.

## Add it to OBS

1. In OBS, select the scene where the countdown should appear.
2. In **Sources**, select **+ → Browser**.
3. Select **Create new** and give the source a name such as `Start Stream Countdown`.
4. Enable **Local file**.
5. Select **Browse** and choose either `stream-countdown.html` or `stream-countdown-dark.html`.
6. Set Width to `700` and Height to `180`.
7. Leave **Shutdown source when not visible** disabled.
8. Select **OK**.
9. Position and scale the source where you want it on the stream.

If you edit the HTML after adding it to OBS, right-click the Browser Source and select **Refresh cache of current page**.

## Change the title

Open the selected HTML file in a text editor such as Notepad and find:

```html
<div class="stream-countdown-title">Stream Countdown</div>
```

Replace only `Stream Countdown` with the text you want to display.

## Change the starting time

Near the bottom of the file, find:

```js
const START_SECONDS = 1 * 60 + 59;
```

The first number is the number of minutes and the final number is the extra seconds.

For example:

```js
const START_SECONDS = 5 * 60 + 0;
```

starts at `5:00`.

After changing the time, save the file and refresh the Browser Source in OBS.

## Important layout notes

The approved light and dark variants intentionally share the same geometry. Changing the title position, digit-window dimensions, colon width, letter spacing, clipping, or rolling-digit timing can make the timer look unbalanced or alter the odometer effect.

If you only want a different colour scheme, change palette values without changing the HTML structure or animation logic.

## Troubleshooting

### The timer is already partway through when it appears

The countdown starts as soon as the Browser Source loads. The entrance animation intentionally runs at the same time rather than delaying the timer.

### The timer disappeared after reaching zero

That is intentional. It holds `0:00` for 5 seconds, then fades and slides out. Refresh the Browser Source to start it again.

### The timer does not animate when entering or leaving

Your operating system may have reduced-motion preferences enabled. The overlay respects `prefers-reduced-motion` and removes the animated transition in that mode.

### The font looks different

Install or keep `OpenAI-Sans-Bold.otf` beside the HTML file. Without it, the overlay uses a fallback system sans-serif font.

### The overlay looks blurry

Increase the Browser Source Width and Height proportionally, then scale it down on the OBS canvas. Higher Browser Source resolutions use more system resources, so use the lowest resolution that looks clean.

For general OBS Browser Source setup, cropping, sharpening, and troubleshooting, see [`FULL_GUIDE.md`](FULL_GUIDE.md).
