# OBS Stream Overlays

Free, local overlays and helper tools for OBS Studio. **You do not need to install or download the whole repository if you only want one feature.** Pick the feature you want below and download only its listed files.

Downloading the repository ZIP does not install anything. It only copies the files to your computer, so using the ZIP and deleting the folders you do not need is also fine.

## What to download for each feature

| Feature | Files needed from this repository | Install or access separately |
| --- | --- | --- |
| **Countdown** | Light style: [`summer-update-countdown.html`](Overlays%20%26%20Plugins/overlays/countdown/summer-update-countdown.html). Dark style: [`summer-update-countdown-dark.html`](Overlays%20%26%20Plugins/overlays/countdown/summer-update-countdown-dark.html). | [OBS Studio](https://obsproject.com/download). The three OpenAI Sans font files in `Overlays & Plugins/overlays/countdown/` are optional and only provide the intended clean typography. |
| **Stream countdown** | [`stream-countdown.html`](Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html) | [OBS Studio](https://obsproject.com/download). `OpenAI-Sans-Bold.otf` in the same folder is optional and provides the intended typography. |
| **Confetti** | [`confetti.html`](Overlays%20%26%20Plugins/overlays/confetti/confetti.html) | [OBS Studio](https://obsproject.com/download) only. |
| **Animated YouTube Studio subscriber count** | [`gradient.html`](Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html) | [OBS Studio](https://obsproject.com/download), access to your channel in YouTube Studio, and the compiled [Stroke Glow Shadow installer](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases). |
| **Discord typing alert** | The entire `Overlays & Plugins/overlays/typing-notifications/` folder, plus [`Overlays & Plugins/integrations/vencord/TypingNotifications/index.tsx`](Overlays%20%26%20Plugins/integrations/vencord/TypingNotifications/index.tsx) | OBS Studio, Discord Desktop, [Node.js 22 or newer](https://nodejs.org/en/download), pnpm `11.9.0`, and [Vencord source](https://github.com/Vendicated/Vencord). Git is optional. Vencord-only users can skip OBS and the local bridge. |
| **Five-click cursor zoom** | The entire [`Overlays & Plugins/tools/obs-five-click-cursor-zoom/`](Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom/) folder | OBS Studio 28 or newer, OBS WebSocket, [Node.js 22 or newer](https://nodejs.org/en/download), and Windows 10 or 11. |

## In development

### ER:LC server tracker

I am working on an OBS overlay that automatically displays the join code for the ER:LC private server you are currently in, allowing viewers to join you directly. It will only work with private servers you own because each server requires its own API key. If you leave one of your configured servers, the overlay automatically disappears so an outdated join code is never left on stream.

## Downloading one file

1. Open the linked file above.
2. Select **Download raw file** near the top-right of the GitHub file page.
3. Save it with its original filename inside a permanent folder.
4. Do not move it after adding it to OBS, because OBS remembers the file path.

For the countdown's intended appearance, the optional font files are:

- `OpenAI-Sans-Bold.otf`
- `OpenAI-Sans-Light.otf`
- `OpenAI-Sans-Medium.otf`

The countdown still works without them and falls back to a normal system sans-serif font.

## Feature-specific notes

### Countdown

Choose either `summer-update-countdown.html` for the original light style or `summer-update-countdown-dark.html` for the permanently visible dark style with a red-to-blue perimeter sweep. Edit the target date in Notepad, then add the selected file to OBS as a local Browser Source at `700 × 180`.

[Open the complete countdown instructions](Documentation/FULL_GUIDE.md#1-countdown)

### Stream countdown

`stream-countdown.html` is a simple duration timer with rolling digits, a white card, black text, a yellow perimeter sweep, and an editable title. By default it starts at `1:59` and displays `Stream Countdown` above the timer.

Edit the title by changing:

```html
<div class="stream-countdown-title">Stream Countdown</div>
```

Edit the starting duration by changing:

```js
const START_SECONDS = 1 * 60 + 59;
```

For example, `const START_SECONDS = 5 * 60 + 0;` starts at `5:00`. Add the file to OBS as a local Browser Source at `700 × 180` and refresh the source after editing it.

[Open the complete stream-countdown instructions](Documentation/FULL_GUIDE.md#stream-countdown)

### Confetti

You need only `confetti.html`. Add it as a local Browser Source using the same resolution as your OBS canvas.

[Open the complete confetti instructions](Documentation/FULL_GUIDE.md#2-confetti)

### Animated subscriber count

The only file needed from this repository is `gradient.html`. The subscriber number itself comes from a signed-in YouTube Studio Browser Source.

Stroke Glow Shadow is easy to install when you choose its **compiled installer**: close OBS, run the installer, follow the prompts, and reopen OBS. Do not download GitHub's **Source code (zip)** archive because that is not an installer.

[Open the complete subscriber-count instructions](Documentation/FULL_GUIDE.md#3-animated-youtube-studio-subscriber-count)

### Discord typing alert

This is the only overlay that needs several files and programs. Keep every file inside `Overlays & Plugins/overlays/typing-notifications/` together, and also download the Vencord plugin file at `Overlays & Plugins/integrations/vencord/TypingNotifications/index.tsx`.

For this feature, downloading the repository ZIP is usually easier. You may then delete or ignore the countdown, confetti, gradient, cursor-zoom, and documentation folders.

[Open the complete Discord typing-alert instructions](Documentation/FULL_GUIDE.md#4-discord-typing-alert)

### Regular Vencord users (no OBS)

If you only want typing notifications inside Discord, you do **not** need to install, configure, or run the local bridge, OBS, or the OBS Browser Source. The bridge exists only to forward typing events from Vencord into the stream overlay.

Install the custom Vencord plugin using [Section C](Documentation/FULL_GUIDE.md#c-install-the-custom-vencord-source-build), then enable it and choose watched channels using [Section D](Documentation/FULL_GUIDE.md#d-enable-and-configure-typingnotifications). The normal desktop notification and typing sound work without the bridge.

### Five-click cursor zoom

This Windows helper detects five rapid left-clicks, checks whether OBS is recording or streaming, enables a cursor-free Display Capture, smoothly zooms towards the cursor, follows it for 15 seconds, then restores the original scene state.

The public configuration uses a placeholder WebSocket password and a `1920 × 1080` primary display. Replace the password and adjust the display values locally before running it. All runtime logic is committed as readable JavaScript; there is no hidden executable, minified bundle, telemetry, or cloud component.

**[Open the complete cursor-zoom setup, configuration, architecture, privacy, and troubleshooting guide](Documentation/FULL_GUIDE.md#5-five-click-cursor-zoom)**

## Complete beginner guide

The full beginner-proof guide, including OBS setup, Alt-drag cropping, exact **Edit Transform** crop values, higher-resolution Browser Sources, testing, troubleshooting, security, and privacy guidance, is here:

**[Open the complete setup guide](Documentation/FULL_GUIDE.md)**

> **Stuck?** I highly recommend using AI to troubleshoot. Give it the exact error message, the step you reached, and the relevant OBS, Node.js, Vencord, or Browser Source settings. Never share passwords, cookies, account tokens, or other private credentials, and verify suggested commands before running them.

## Feedback and feature suggestions

Want to give feedback or suggest new features? [Check out my Discord!](https://discordapp.com/users/693783735304323102)

## License

The original overlays, bridge, launcher, cursor-zoom helper, tests, and documentation use the repository's MIT License. The Vencord integration retains its GPL-3.0-or-later notice. The optional OpenAI Sans files are separate third-party assets. See [`Documentation/docs/NOTICE.md`](Documentation/docs/NOTICE.md).
