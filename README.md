# OBS Stream Overlays

Free, local browser-source overlays for OBS Studio. **You do not need to install or download the whole repository if you only want one overlay.** Pick the feature you want below and download only its listed files.

Downloading the repository ZIP does not install anything. It only copies the files to your computer, so using the ZIP and deleting the folders you do not need is also fine.

## What to download for each overlay

| Feature | Files needed from this repository | Install or access separately |
| --- | --- | --- |
| **Countdown** | [`summer-update-countdown.html`](overlays/countdown/summer-update-countdown.html) | [OBS Studio](https://obsproject.com/download). The five OpenAI Sans font files in `overlays/countdown/` are optional and only provide the intended clean typography. |
| **Confetti** | [`confetti.html`](overlays/confetti/confetti.html) | [OBS Studio](https://obsproject.com/download) only. |
| **Animated YouTube Studio subscriber count** | [`gradient.html`](overlays/gradient-stroke/gradient.html) | [OBS Studio](https://obsproject.com/download), access to your channel in YouTube Studio, and the compiled [Stroke Glow Shadow installer](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases). |
| **Discord typing alert** | The entire `overlays/typing-notifications/` folder, plus [`integrations/vencord/TypingNotifications/index.tsx`](integrations/vencord/TypingNotifications/index.tsx) | OBS Studio, Discord Desktop, [Node.js 22 or newer](https://nodejs.org/en/download), pnpm `11.9.0`, and [Vencord source](https://github.com/Vendicated/Vencord). Git is optional. |

## Downloading one file

1. Open the linked file above.
2. Select **Download raw file** near the top-right of the GitHub file page.
3. Save it with its original filename inside a permanent folder.
4. Do not move it after adding it to OBS, because OBS remembers the file path.

For the countdown's intended appearance, the optional font files are:

- `OpenAI-Sans-Bold.otf`
- `OpenAI-Sans-Light.otf`
- `OpenAI-Sans-Medium.otf`
- `OpenAI-Sans-Regular.otf`
- `OpenAI-Sans-Semibold.otf`

The countdown still works without them and falls back to a normal system sans-serif font.

## Feature-specific notes

### Countdown

You need only `summer-update-countdown.html`. Edit its target date in Notepad, then add it to OBS as a local Browser Source at `700 × 180`.

[Open the complete countdown instructions](FULL_GUIDE.md#1-countdown)

### Confetti

You need only `confetti.html`. Add it as a local Browser Source using the same resolution as your OBS canvas.

[Open the complete confetti instructions](FULL_GUIDE.md#2-confetti)

### Animated subscriber count

The only file needed from this repository is `gradient.html`. The subscriber number itself comes from a signed-in YouTube Studio Browser Source.

Stroke Glow Shadow is easy to install when you choose its **compiled installer**: close OBS, run the installer, follow the prompts, and reopen OBS. Do not download GitHub's **Source code (zip)** archive because that is not an installer.

[Open the complete subscriber-count instructions](FULL_GUIDE.md#3-animated-youtube-studio-subscriber-count)

### Discord typing alert

This is the only feature that needs several files and programs. Keep every file inside `overlays/typing-notifications/` together, and also download the Vencord plugin file at `integrations/vencord/TypingNotifications/index.tsx`.

For this feature, downloading the repository ZIP is usually easier. You may then delete or ignore the countdown, confetti, gradient, `.github`, `docs`, and `scripts` folders.

[Open the complete Discord typing-alert instructions](FULL_GUIDE.md#4-discord-typing-alert)

## Complete beginner guide

The full beginner-proof guide, including OBS setup, Alt-drag cropping, exact **Edit Transform** crop values, higher-resolution Browser Sources, testing, troubleshooting, security, and privacy guidance, is here:

**[Open the complete setup guide](FULL_GUIDE.md)**

> **Stuck?** I highly recommend using AI to troubleshoot. Give it the exact error message, the step you reached, and the relevant OBS, Node.js, Vencord, or Browser Source settings. Never share passwords, cookies, account tokens, or other private credentials, and verify suggested commands before running them.

## Feedback and feature suggestions

Want to give feedback or suggest new features? [Check out my Discord!](https://discordapp.com/users/693783735304323102)

## License

The original overlays, bridge, launcher, tests, and documentation use the repository's MIT License. The Vencord integration retains its GPL-3.0-or-later notice. The optional OpenAI Sans files are separate third-party assets. See [`docs/NOTICE.md`](docs/NOTICE.md).