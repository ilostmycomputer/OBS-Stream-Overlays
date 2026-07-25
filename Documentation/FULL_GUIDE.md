# OBS Stream Overlays

Free, local browser-source overlays for OBS Studio. The standalone overlays need
only OBS. The optional Discord typing alert also needs Node.js, a local bridge,
and a custom Vencord source build.

This guide assumes that you have never configured OBS before. Follow the steps
in order and complete each test before moving on.

## What is included?

| Overlay | File | Purpose | Recommended Browser Source size |
| --- | --- | --- | --- |
| Countdown | [`Overlays & Plugins/overlays/countdown/summer-update-countdown.html`](../Overlays%20%26%20Plugins/overlays/countdown/summer-update-countdown.html) | Counts down to an event with rolling digits. | `700 × 180` |
| Stream countdown | [`Overlays & Plugins/overlays/countdown/stream-countdown.html`](../Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html) | Counts down from an editable duration with rolling digits and an editable title. | `700 × 180` |
| Animated subscriber stroke | [`Overlays & Plugins/overlays/gradient-stroke/gradient.html`](../Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html) | Supplies animated colours to a Stroke filter around the YouTube Studio live subscriber count. | Match the YouTube Studio Browser Source. |
| Confetti | [`Overlays & Plugins/overlays/confetti/confetti.html`](../Overlays%20%26%20Plugins/overlays/confetti/confetti.html) | Plays transparent falling confetti whenever the page loads or refreshes. | Match your OBS canvas. |
| Discord typing alert | [`Overlays & Plugins/overlays/typing-notifications/overlay.html`](../Overlays%20%26%20Plugins/overlays/typing-notifications/overlay.html) | Shows a person's avatar and username when they start typing in a watched Discord channel. | `720 × 200` |
| Five-click cursor zoom | [`Overlays & Plugins/tools/obs-five-click-cursor-zoom/`](../Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom/) | Triggers a smooth cursor-following OBS zoom after five rapid clicks. | Not a Browser Source |

## Dependencies

Install only the items required by the feature you intend to use.

| Dependency | Required for | Notes |
| --- | --- | --- |
| [OBS Studio](https://obsproject.com/download) | Every overlay and the five-click cursor zoom | Install the official OBS package. It includes Browser Source and OBS WebSocket. |
| A text editor such as Windows Notepad | Customisation | Used to change dates, titles, colours, and ports. Do not use Microsoft Word. |
| Bundled OpenAI Sans `.otf` files | Intended countdown typography (optional) | OpenAI Sans is the intended typeface for the countdown's clean visual design. The countdown still works without it and falls back to a system sans-serif font. |
| A Google account with access to your YouTube channel | YouTube subscriber count | The account must be able to open that channel in YouTube Studio. |
| [Stroke Glow Shadow](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases) | Animated subscriber stroke | Third-party OBS plugin. Confirm that its current release supports your OBS version and operating system. |
| [Node.js 22 or newer](https://nodejs.org/en/download) | Discord typing bridge, Vencord source build, and five-click cursor zoom | Node.js includes `npm`. |
| `ws` version `8.21.1` | Discord typing bridge | Installed locally by `npm ci`. Do not download it manually. |
| [Git](https://git-scm.com/downloads) | Cloning Vencord source | Optional if you download the Vencord source ZIP instead. |
| `pnpm` version `11.9.0` | Building Vencord | Installed globally with the command in this guide. |
| [Vencord source](https://github.com/Vendicated/Vencord) | Reading Discord typing events | Separate third-party project. This repository supplies only the custom plugin source. |
| Discord Desktop | Documented Vencord injection path | The instructions target the normal desktop Discord client. |

No database, cloud server, API key, port forwarding, or paid service is needed.
The Discord typing bridge listens only on `127.0.0.1`, meaning your own computer.

---

# Beginner setup

## Download the files

1. Open this repository on GitHub.
2. Select **Code**.
3. Select **Download ZIP**.
4. Open your Downloads folder.
5. Right-click the downloaded ZIP and select **Extract All**.
6. Move the extracted folder somewhere permanent, for example:

   ```text
   C:\Users\YourName\Documents\OBS-Stream-Overlays
   ```

7. Do not move or rename this folder after adding its files to OBS. OBS stores
   the file locations and will show a blank local source if those locations
   later change.

## Install and open OBS

1. Download and install [OBS Studio](https://obsproject.com/download).
2. Open OBS.
3. Complete the **Auto-Configuration Wizard** if it appears.
4. At the bottom of OBS, locate **Scenes**, **Sources**, **Audio Mixer**,
   **Scene Transitions**, and **Controls**.

If **Browser** is missing when adding a source, reinstall OBS using the official
installer. Browser Source is included with normal official OBS installations.

## Find your canvas size

Your full-screen overlays must match OBS's **Base (Canvas) Resolution**.

1. Select **Settings** in the Controls panel.
2. Select **Video**.
3. Note the two numbers beside **Base (Canvas) Resolution**.
4. Select **Cancel** if you did not change anything.

Common canvas sizes include:

- `1920 × 1080`
- `2560 × 1440`
- `3840 × 2160`

Do not automatically use `1920 × 1080` if your canvas uses another size.

## Create a scene

1. In **Scenes**, select **+**.
2. Enter a name such as `Main Stream`.
3. Select **OK**.

A scene is a collection of sources. Sources higher in the Sources list appear
in front of sources lower in the list.

## Add a local HTML overlay

Use this procedure whenever a later section tells you to add one of this
repository's `.html` files.

1. Select the required scene.
2. In **Sources**, select **+ → Browser**.
3. Select **Create new**.
4. Give the source a descriptive name.
5. Select **OK**.
6. Enable **Local file**.
7. Select **Browse** and choose the required `.html` file.
8. Enter the Width and Height stated in this README.
9. Leave **Shutdown source when not visible** disabled unless a section says
   otherwise.
10. Leave **Refresh browser when scene becomes active** disabled unless you
    specifically want the page to restart whenever the scene opens.
11. Select **OK**.
12. Drag the overlay above the game, display capture, or camera source that it
    should appear over.

To fit a full-screen source exactly to the canvas:

1. Right-click the source.
2. Select **Transform → Fit to Screen**.

To reload an edited HTML file:

1. Right-click its Browser Source.
2. Select **Refresh cache of current page**.

The eye icon beside a source shows or hides it without deleting it.

## Crop, resize, and sharpen sources

### Crop quickly with Alt-drag

Cropping hides unwanted parts of a source without changing the original webpage,
image, video, or capture.

1. Select the source in the OBS preview. A red bounding box appears around it.
2. Hold **Alt** on Windows or Linux. Hold **Option** on macOS.
3. While holding the key, drag one of the red edge or corner handles inward.
4. Repeat for the other sides until only the area you want remains.

A cropped edge turns green. Dragging without Alt or Option resizes the source
instead of cropping it.

### Enter exact crop values with Edit Transform

Use exact crop values when several sources or copies need to line up perfectly.

1. Right-click the source.
2. Select **Transform → Edit Transform**.
3. Find **Crop Left**, **Crop Top**, **Crop Right**, and **Crop Bottom**.
4. Enter the required pixel values.
5. Note or copy those four values.
6. Open **Edit Transform** on the other source and enter the same crop values.

This is more accurate than trying to match two crops by eye. On Windows and
Linux, selecting a source and pressing **Ctrl+E** also opens Edit Transform. On
macOS, use **Cmd+E**.

Transform cropping belongs to that particular source item in that scene. If you
need one crop to affect every instance of the same source in every scene, add a
**Crop/Pad** effect filter instead.

### Render Browser Sources at a higher resolution

A Browser Source has its own internal Width and Height. These values control the
webpage's render viewport. They are separate from the size of the source on the
OBS canvas.

If browser text, numbers, logos, or curved edges look soft or pixelated:

1. Right-click the Browser Source.
2. Select **Properties**.
3. Increase **Width** and **Height** while keeping the same aspect ratio.
4. Select **OK**.
5. Resize the source smaller on the OBS canvas using a corner handle.
6. Recheck the crop in **Transform → Edit Transform**, because changing the
   Browser Source dimensions can change the webpage layout and crop positions.

For example, a `1920 × 1080` Browser Source can be rendered at:

- `2560 × 1440` for a moderate quality increase; or
- `3840 × 2160` for a larger quality increase.

Rendering at a higher resolution and scaling down can make browser text and
edges appear sharper. It also increases CPU, GPU, and memory use. Use the lowest
resolution that looks clean during an OBS test recording.

Do not change only one dimension unless you deliberately want a different
webpage layout. Keep the same aspect ratio, such as `16:9`, when you only want a
higher-resolution version of the same view.

---

# 1. Countdown

File: [`Overlays & Plugins/overlays/countdown/summer-update-countdown.html`](../Overlays%20%26%20Plugins/overlays/countdown/summer-update-countdown.html)

## Configure the target date

1. Right-click `summer-update-countdown.html` in File Explorer.
2. Select **Open with → Notepad**.
3. Near the bottom, find:

   ```js
   const TARGET_DATE_TIME = "2026-07-25T12:00:00Z";
   ```

4. Replace only the date inside the quotation marks.
5. Use an ISO 8601 date that includes a timezone.

Examples:

```js
// 8:00 PM during UK summer time (BST)
const TARGET_DATE_TIME = "2026-07-25T20:00:00+01:00";

// 8:00 PM during UK winter time (GMT/UTC)
const TARGET_DATE_TIME = "2026-12-20T20:00:00+00:00";
```

6. Save the file.
7. Add it to OBS as a Browser Source at `700 × 180`.
8. If it was already in OBS, select **Refresh cache of current page**.

The countdown reaches zero and stops. If it immediately shows zero, the target
time is in the past or the timezone is wrong.

## OpenAI Sans (intended, but optional)

The countdown is designed to use the three bundled OpenAI Sans `.otf` files for
its intended clean appearance. They are not required for the countdown to work.

1. Open `Overlays & Plugins\overlays\countdown`.
2. Select `OpenAI-Sans-Light.otf`, `OpenAI-Sans-Medium.otf`, and `OpenAI-Sans-Bold.otf`.
3. Right-click the selection.
4. Select **Install** or **Install for all users**.
5. Restart OBS or refresh the Browser Source.

Without these files, the countdown still functions and uses a fallback system
sans-serif font. Only the intended typography and clean appearance change.

## Stream countdown

File: [`Overlays & Plugins/overlays/countdown/stream-countdown.html`](../Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html)

This variant is a simple duration timer rather than a target-date countdown. It
uses the same rolling-digit motion, with a white card, black text, a yellow
perimeter sweep, and an editable title above the time. By default it starts at
`1:59` and displays `Stream Countdown`.

### Change the title

1. Right-click `stream-countdown.html` in File Explorer.
2. Select **Open with → Notepad**.
3. Find:

   ```html
   <div class="stream-countdown-title">Stream Countdown</div>
   ```

4. Replace only `Stream Countdown` with the text you want to display.

### Change the starting time

Near the bottom of the same file, find:

```js
const START_SECONDS = 1 * 60 + 59;
```

The first number is the minutes and the final number is the extra seconds. For
example:

```js
const START_SECONDS = 5 * 60 + 0;
```

starts the timer at `5:00`.

After editing:

1. Save the file.
2. Add it to OBS as a local Browser Source at `700 × 180`.
3. If it is already in OBS, select **Refresh cache of current page**.

The timer begins when the Browser Source loads and stops at `0:00`. Refresh the
Browser Source whenever you want to restart it from the configured duration.
`OpenAI-Sans-Bold.otf` in the same folder is optional and provides the intended
typography; the timer still works without it.

---

# 2. Confetti

File: [`Overlays & Plugins/overlays/confetti/confetti.html`](../Overlays%20%26%20Plugins/overlays/confetti/confetti.html)

1. Add `confetti.html` as a Browser Source.
2. Set its Width and Height to your OBS Base Canvas Resolution.
3. Right-click it and select **Transform → Fit to Screen**.
4. Move it above the sources it should cover.
5. Leave **Shutdown source when not visible** disabled.
6. Leave **Refresh browser when scene becomes active** disabled for manual
   control.

The confetti plays once whenever the page loads. To play it again:

1. Right-click the `Confetti` source.
2. Select **Refresh cache of current page**.

For automatic confetti whenever a dedicated celebration scene opens, edit the
Browser Source and enable **Refresh browser when scene becomes active**.

---

# 3. Animated YouTube Studio subscriber count

This section starts from an empty scene and creates the complete effect:

```text
YouTube Studio Live Count
        ↓
OBS Browser Source
        ↓
Crop the page to the subscriber number
        ↓
Color Key removes the page background
        ↓
Stroke draws around the visible digits
        ↓
gradient.html supplies the animated stroke colours
```

This method uses the private live subscriber count available to the channel
owner in YouTube Studio. It does not use a third-party subscriber-count site.

## 1. Install Stroke Glow Shadow

1. Close OBS completely.
2. Open the plugin's
   [Releases page](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases).
3. Confirm that the latest release supports your operating system and OBS
   version.
4. Download the compiled installer. Do not download GitHub's automatically
   generated **Source code (zip)** archive.

Using the compiled installer is the easy way to install Stroke Glow Shadow: run it, follow the prompts, and reopen OBS. The **Source code (zip)** archive is not an installer.
5. Run the installer.
6. Reopen OBS.
7. Right-click any source and select **Filters**.
8. Under **Effect Filters**, select **+** and confirm that **Stroke** appears.

Do not continue until the Stroke filter is available.

## 2. Add YouTube Studio as a Browser Source

1. Select the scene that should contain the subscriber count.
2. In **Sources**, select **+ → Browser**.
3. Select **Create new**.
4. Name it `YouTube Studio Live Subscriber Count`.
5. Select **OK**.
6. Leave **Local file** disabled.
7. Enter this URL:

   ```text
   https://studio.youtube.com/
   ```

8. Set Width to `1920` and Height to `1080` initially. The large browser area
   makes YouTube Studio easier to navigate before cropping.
9. Leave **Shutdown source when not visible** disabled. This helps preserve the
   signed-in browser session while OBS remains open.
10. Leave **Refresh browser when scene becomes active** disabled. Otherwise the
    page can return to the configured starting URL whenever the scene opens.
11. Select **OK**.

The YouTube Studio page should now appear in the OBS preview.

If the final subscriber digits look soft, return to **Properties** and try
`2560 × 1440` or `3840 × 2160`. Scale the source down on the canvas afterward.
Changing the Browser Source resolution may move the webpage elements, so reopen
**Transform → Edit Transform** and correct the crop values afterward.

## 3. Sign in through OBS Interact

Clicks in the normal OBS preview select and resize the source. They do not click
buttons inside the webpage. You must use **Interact**.

1. Right-click `YouTube Studio Live Subscriber Count` in **Sources**.
2. Select **Interact**.
3. In the Interact window, select **Sign in**.
4. Sign in with the Google account that owns or manages the channel.
5. Complete any two-factor authentication prompts.
6. Confirm that YouTube Studio opens for the correct channel.

The login belongs to OBS's embedded browser session. It is separate from your
normal Chrome, Edge, or Firefox login.

If Google displays a message saying that the browser is unsupported or not
secure, the sign-in has been blocked by Google in OBS's embedded browser. This
exact Browser Source method cannot proceed until sign-in succeeds. Do not enter
your password into any page other than Google's real sign-in page.

## 4. Open the live subscriber count

Keep the **Interact** window open.

1. In YouTube Studio's left menu, select **Analytics**.
2. Confirm that **Overview** is selected.
3. Find the **Realtime** card.
4. Select **SEE LIVE COUNT**.
5. Confirm that the large number shown is your channel's subscriber count.
6. Choose the page theme that gives the strongest contrast between the number
   and its background:
   - dark background with light digits; or
   - light background with dark digits.
7. Close the Interact window when the live count is visible.

YouTube's documented route is **YouTube Studio → Analytics → Overview →
Realtime → SEE LIVE COUNT**.

### Before each stream

Navigation performed through Interact can return to the YouTube Studio dashboard
after OBS or the Browser Source is restarted. Before going live:

1. Right-click the source.
2. Select **Interact**.
3. Return to **Analytics → Overview → Realtime → SEE LIVE COUNT** if necessary.
4. Close Interact only after the live count is visible again.

Do not enable **Refresh browser when scene becomes active** for this source.

## 5. Crop the Browser Source to the number

Remove the YouTube Studio menu, cards, buttons, graph, and account information so
only the subscriber number remains in the visible source area.

### Fast method: Alt-drag

1. Select the source in the OBS preview.
2. Hold **Alt** on Windows or Linux, or **Option** on macOS.
3. While holding the key, drag each red bounding-box edge inward.
4. Stop when the box contains only the live subscriber number and any label you
   deliberately want to keep.

Cropped edges appear green. If you accidentally resize instead of crop, undo the
change and make sure Alt or Option is held before dragging.

### Precise method: Edit Transform

1. Right-click the source.
2. Select **Transform → Edit Transform**.
3. Adjust **Crop Left**, **Crop Top**, **Crop Right**, and **Crop Bottom** until
   only the required area remains.
4. Write down the values if another source must use the same crop.
5. Enter those exact values in the other source's Edit Transform window.
6. Close the window.

Drag a corner handle to resize the cropped counter. Do not stretch only one
axis, because that distorts the digits.

## 6. Remove the background with Color Key

Use **Color Key** because the YouTube Studio live-count page uses a flat light or
dark background behind the number.

1. Right-click `YouTube Studio Live Subscriber Count`.
2. Select **Filters**.
3. Under **Effect Filters**, select **+ → Color Key**.
4. Name it `Remove YouTube Studio Background`.
5. Set **Key Color Type** to **Custom Color**.
6. Select **Key Color**.
7. Choose the exact colour behind the subscriber digits:
   - choose the dark page background when using dark theme; or
   - choose the light page background when using light theme.
8. Increase **Similarity** gradually until the background disappears.
9. Adjust **Smoothness** only enough to clean the digit edges.
10. Stop increasing Similarity if the digits begin to disappear.
11. Leave the other colour-correction controls at their defaults unless the
    digits genuinely need correction.

The gameplay or source behind the count should now be visible through the
removed background.

## 7. Add the animated gradient Browser Source

1. Return to the main OBS window.
2. In **Sources**, select **+ → Browser**.
3. Name the new source `Subscriber Border Gradient`.
4. Enable **Local file**.
5. Select **Browse**.
6. Choose [`Overlays & Plugins/overlays/gradient-stroke/gradient.html`](../Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html).
7. Give it the same Width and Height as the YouTube Studio Browser Source. If you
   increased the Studio source to `2560 × 1440` or `3840 × 2160`, use the same
   dimensions here.
8. Select **OK**.
9. Move `Subscriber Border Gradient` below your visible stream content so its
   full-screen colour field does not cover the stream.

Keep the gradient source loaded. Some plugin versions may stop using it as a
fill source when it is disabled with the eye icon, so placing it underneath
other sources is safer than disabling it.

## 8. Add the animated Stroke filter

1. Right-click `YouTube Studio Live Subscriber Count`.
2. Select **Filters**.
3. Confirm that `Remove YouTube Studio Background` is already present.
4. Under **Effect Filters**, select **+ → Stroke**.
5. Name it `Animated Subscriber Stroke`.
6. Move the Stroke filter below the Color Key filter if OBS inserted it above.
7. Set **Position** to **Outer**.
8. Start with **Stroke Size** around `4` to `8` pixels.
9. Set **Offset** to `0`.
10. Enable **Auto padding** if the plugin exposes that setting, so the outside
    stroke is not clipped.
11. Set **Fill Type** to **Source**.
12. Select `Subscriber Border Gradient` as the fill source.
13. Adjust Stroke Size while watching the preview.
14. Close the Filters window.

The required Effect Filter order is:

```text
Remove YouTube Studio Background (Color Key)
Animated Subscriber Stroke (Stroke)
```

The Color Key must be above Stroke. If Stroke runs first, it sees the original
opaque YouTube Studio page and can outline a rectangle instead of the digits.

## 9. Position and lock the finished counter

1. Select the cropped subscriber count in the preview.
2. Drag it to the intended position.
3. Resize it using a corner handle.
4. In **Sources**, select the padlock beside the source.

Locking it prevents accidental movement or crop changes while arranging other
stream elements.

## 10. Change the gradient colours

1. In File Explorer, open `Overlays & Plugins\overlays\gradient-stroke`.
2. Right-click `gradient.html`.
3. Select **Open with → Notepad**.
4. Find the colours inside `conic-gradient`.
5. Replace the CSS hex values with your preferred colours.
6. Save the file.
7. In OBS, right-click `Subscriber Border Gradient`.
8. Select **Refresh cache of current page**.

## 11. Test before going live

1. Open **Interact** and confirm that **SEE LIVE COUNT** is still open.
2. Confirm that only the intended subscriber number is visible.
3. Confirm that no email address, channel-management menu, or account information
   is visible inside the crop.
4. Confirm that the background is transparent.
5. Confirm that the stroke follows the digits rather than a rectangle.
6. Confirm that the gradient is moving through the stroke.
7. Confirm that the counter looks sharp at the stream's output resolution.
8. Record a short local OBS test before starting the real stream.

Because this source displays a signed-in YouTube Studio page, always inspect it
before going live. A failed crop, page reload, or changed YouTube layout could
otherwise expose private Studio information on stream.

---

# 4. Discord typing alert

This is the only feature with a multi-program installation. Complete it in this
order:

1. Install and test the local bridge.
2. Add and test the OBS overlay without Discord.
3. Build and inject the Vencord integration.
4. Enable the plugin and choose channels.
5. Test using another Discord account or another person.

The plugin intentionally ignores your own typing events.

## How the typing alert works

```text
Another Discord user starts typing
        ↓
Custom Vencord plugin
        ↓
Local WebSocket bridge at 127.0.0.1:8765
        ↓
OBS Browser Source
```

## A. Install and test the bridge

### 1. Install Node.js

1. Install [Node.js 22 or newer](https://nodejs.org/en/download).
2. Close every existing PowerShell window after installation.
3. Open a new PowerShell window.
4. Verify Node.js and npm:

   ```powershell
   node --version
   npm.cmd --version
   ```

The Node.js command must show version `22` or newer.

### 2. Open PowerShell in the bridge folder

1. In File Explorer, open:

   ```text
   OBS-Stream-Overlays\Overlays & Plugins\overlays\typing-notifications
   ```

2. Click the address bar.
3. Type `powershell`.
4. Press Enter.

### 3. Install the exact dependency versions

Run:

```powershell
npm.cmd ci
```

This installs the locked `ws` dependency into the local `node_modules` folder.

### 4. Run the automated bridge test

Run:

```powershell
npm.cmd test
```

Expected final output:

```text
Bridge smoke test passed.
```

Do not continue if this test fails.

### 5. Start the bridge

Run:

```powershell
npm.cmd start
```

Expected output:

```text
Typing OBS bridge listening on ws://127.0.0.1:8765
```

Leave this PowerShell window open while streaming.

## B. Add and test the OBS overlay

1. Add
   [`Overlays & Plugins/overlays/typing-notifications/overlay.html`](../Overlays%20%26%20Plugins/overlays/typing-notifications/overlay.html)
   as a local Browser Source.
2. Name it `Discord Typing Alert`.
3. Set Width to `720` and Height to `200`.
4. Leave **Shutdown source when not visible** disabled.
5. Leave **Refresh browser when scene becomes active** disabled.
6. Select **OK**.
7. Move it above the gameplay or display source.

If this browser source looks soft after being made much larger than `720 × 200`,
open its Properties and increase Width and Height proportionally. Scale it down
on the canvas afterward and recheck any Edit Transform crop values.

Test the bridge-to-OBS path without Discord:

1. Keep the bridge running.
2. Open a second PowerShell window in the same folder.
3. Run:

   ```powershell
   npm.cmd run test-event
   ```

4. OBS should show a `@test-user is typing` alert.

If this test does not appear, fix the bridge or OBS source before installing
Vencord.

## C. Install the custom Vencord source build

Vencord is a separate third-party Discord client modification.

### 1. Install Git and pnpm

1. Install [Git](https://git-scm.com/downloads).
2. Open a new PowerShell window.
3. Confirm Node.js is version 22 or newer:

   ```powershell
   node --version
   ```

4. Install pnpm:

   ```powershell
   npm.cmd install --global pnpm@11.9.0
   ```

5. Verify it:

   ```powershell
   pnpm.cmd --version
   ```

Expected output begins with `11.9.0`.

### 2. Download Vencord source

```powershell
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
```

If the folder already exists, open PowerShell in that folder instead.

### 3. Install Vencord dependencies

```powershell
pnpm.cmd install --frozen-lockfile
```

### 4. Copy the custom plugin

Create this exact folder inside Vencord:

```text
src\userplugins\typingNotifications
```

Copy:

```text
Overlays & Plugins\integrations\vencord\TypingNotifications\index.tsx
```

into it so the final path is:

```text
Vencord\src\userplugins\typingNotifications\index.tsx
```

Do not put it in Vencord's built-in `src\plugins` folder.

### 5. Build Vencord

```powershell
pnpm.cmd build
```

The command must finish without a build error.

### 6. Inject the build into Discord Desktop

Building does not install the build into Discord. Injection is a separate
required step.

1. Fully close Discord, including its system-tray icon.
2. Run:

   ```powershell
   pnpm.cmd inject
   ```

3. Follow the installer prompts and select your Discord installation.
4. Reopen Discord.

After changing the custom plugin, rebuild, close Discord, inject again, and
reopen Discord.

## D. Enable and configure TypingNotifications

### 1. Enable the plugin

1. In Discord, open **User Settings**.
2. Open **Vencord → Plugins**.
3. Search for `TypingNotifications`.
4. Enable it.
5. Open its settings to configure tracked user IDs, display names, notification
   sound, or a custom audio file.

If the plugin is absent, verify the exact path, rebuild, inject, and restart
Discord.

### 2. Choose channels to watch

1. Right-click a server text channel.
2. Open **Notification Settings**.
3. Enable the added **Typing** option.

The plugin includes a fallback that may place **Typing** beside the normal
notification item when Discord changes its submenu structure.

### 3. Perform the real test

1. Keep the bridge running.
2. Keep OBS open with `Discord Typing Alert` visible.
3. Keep TypingNotifications enabled.
4. Ask another person to type in the watched channel, or use a separate Discord
   account.
5. Do not use your own account. The plugin deliberately ignores your own typing.

You should receive both the Vencord notification and the OBS alert.

## E. Easier Windows startup

After the manual tests succeed, run this from
`Overlays & Plugins\overlays\typing-notifications`:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-obs.ps1
```

The launcher:

- verifies Node.js and the local dependency;
- checks whether port `8765` is free or already running this bridge;
- starts and health-checks the bridge;
- starts OBS;
- stops the bridge it launched when OBS closes.

It refuses to launch a second OBS process. Close OBS first.

For a non-standard OBS installation:

```powershell
$env:OBS_PATH = "D:\Apps\obs-studio\bin\64bit\obs64.exe"
powershell -ExecutionPolicy Bypass -File .\start-obs.ps1
```

## F. Change the local bridge port

The default port is `8765`. All three components must use the same replacement
number.

1. Bridge and launcher:

   ```powershell
   $env:TYPING_OBS_PORT = "9876"
   npm.cmd start
   ```

2. Edit `BRIDGE_URL` in
   `Overlays & Plugins/overlays/typing-notifications/overlay.html`:

   ```js
   const BRIDGE_URL = "ws://127.0.0.1:9876";
   ```

3. Edit `OBS_BRIDGE_URL` in
   `Overlays & Plugins/integrations/vencord/TypingNotifications/index.tsx`:

   ```ts
   const OBS_BRIDGE_URL = "ws://127.0.0.1:9876";
   ```

4. Copy the changed Vencord plugin into the Vencord checkout again.
5. Run `pnpm.cmd build`.
6. Close Discord.
7. Run `pnpm.cmd inject`.
8. Reopen Discord.
9. Refresh the OBS Browser Source.

---

# 5. Five-click cursor zoom

Folder: [`Overlays & Plugins/tools/obs-five-click-cursor-zoom/`](../Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom/)

An open-source Windows helper for OBS Studio. Five rapid left-clicks in roughly the same area trigger a smooth `2.5×` zoom towards the cursor. The zoom follows the cursor with gentle easing for 15 seconds, hides the cursor in the recording or stream, then restores the original scene-item transform.

The committed defaults are safe for public distribution:

- OBS WebSocket password: `replace this`
- captured display: `1920 × 1080`
- activation mode: recording only
- tracking rate: 60 FPS
- follow smoothing: `0.18`

All project logic is readable in `src/`. There is no compiled helper, minified bundle, telemetry, cloud service, or concealed executable. `start.bat` directly runs `src/index.js`. The two third-party dependencies and their exact versions are declared in `package.json`; `node_modules` is generated locally by npm and is not committed.

## Requirements

- Windows 10 or 11
- OBS Studio 28 or newer with OBS WebSocket enabled
- Node.js 22 or newer
- A Display Capture source for the monitor being zoomed

## 1. Download only this tool

You do not need the entire repository.

1. Open this folder on GitHub.
2. Download these 10 files while preserving the `src` folder, or download the repository ZIP and keep only this folder.
3. Move the folder somewhere permanent, such as `Documents\OBS Five-Click Cursor Zoom`.

## 2. Configure OBS WebSocket

1. Open OBS.
2. Select **Tools → WebSocket Server Settings**.
3. Enable the WebSocket server.
4. Keep the port at `4455`, unless you deliberately change both OBS and `config.json`.
5. Enable authentication.
6. Set a password.
7. Open `config.json` in Notepad and replace:

   ```json
   "password": "replace this"
   ```

   with the exact same password.

Do not commit or publicly share your edited password.

## 3. Create the cursor-free zoom layer

1. In OBS, create a new scene named exactly `Click Zoom Layer`.
2. Inside that scene, add a **new Display Capture** for the monitor you want to zoom.
3. Disable **Capture Cursor** on that Display Capture.
4. Right-click the capture and select **Transform → Fit to Screen**.
5. Open each normal recording or streaming scene where you want the effect.
6. Add `Click Zoom Layer` as a **Scene** source.
7. Keep it as a top-level source rather than placing it inside a group.
8. Move it to the top of the Sources list.
9. Fit it to the screen.
10. Hide it using the eye icon.

Your ordinary Display Capture can keep its cursor enabled. During the effect, the helper temporarily enables the cursor-free duplicate above it.

## 4. Set the captured display

The public configuration assumes a primary `1920 × 1080` monitor:

```json
"display": {
  "left": 0,
  "top": 0,
  "width": 1920,
  "height": 1080
}
```

Change `width` and `height` to the resolution of the monitor OBS captures. Most single-monitor and primary-monitor setups should leave `left` and `top` at `0`.

For a secondary monitor, `left` and `top` represent its location in **Windows Settings → System → Display**. A monitor directly to the right of a `1920 × 1080` primary display usually begins at `left: 1920, top: 0`.

## 5. Install and run

1. Run `install.bat` once. It installs the exact dependencies listed in `package.json`.
2. Open OBS.
3. Run `start.bat`.
4. Keep the command window open.
5. Start recording.
6. Click five times rapidly in roughly the same area.

By default, clicks are ignored unless OBS is actively recording.

## How it works

```text
Global Windows mouse events
        ↓
Five left-clicks within 1.2 seconds and 180 pixels
        ↓
Check OBS recording/streaming state through WebSocket
        ↓
Find the top-level "Click Zoom Layer" scene item
        ↓
Enable the cursor-free capture and animate its crop/scale
        ↓
Ease the target towards the live cursor position at 60 FPS
        ↓
Restore the original transform and visibility after 15 seconds
```

The helper does not modify the Windows cursor or hide it on your physical monitor. Cursor hiding is achieved by showing an OBS Display Capture that has **Capture Cursor** disabled.

## Configuration reference

### Trigger

| Setting | Default | Purpose |
| --- | ---: | --- |
| `trigger.clicks` | `5` | Number of clicks required. |
| `trigger.windowMs` | `1200` | Maximum time for the click sequence. |
| `trigger.radiusPx` | `180` | Maximum distance from the first click. Set to `0` to disable the proximity check. |
| `trigger.cooldownMs` | `2000` | Delay before another sequence can trigger. |
| `trigger.activationMode` | `recording` | Use `recording`, `streaming`, or `either`. |

### Zoom

| Setting | Default | Purpose |
| --- | ---: | --- |
| `zoom.factor` | `2.5` | Maximum zoom level. |
| `zoom.trackMs` | `15000` | Tracking duration in milliseconds. |
| `zoom.zoomInMs` | `300` | Zoom-in animation duration. |
| `zoom.zoomOutMs` | `400` | Zoom-out animation duration. |
| `zoom.fps` | `60` | Target tracking update rate. |
| `zoom.followSmoothing` | `0.18` | Cursor-follow responsiveness from `0` to `1`. |

Suggested smoothing values:

- `0.10`: slower and more cinematic
- `0.18`: balanced default
- `0.30`: faster response
- `1.00`: immediate following

## File structure

```text
obs-five-click-cursor-zoom/
├── config.json
├── install.bat
├── package.json
├── start.bat
└── src/
    ├── click-detector.js
    ├── config.js
    ├── effect-timing.js
    ├── index.js
    ├── output-gate.js
    └── zoom-math.js
```

Each source file has one responsibility:

- `index.js`: mouse hooks, OBS connection, effect lifecycle and scene restoration
- `click-detector.js`: rapid-click timing, proximity and cooldown logic
- `config.js`: defaults and validation
- `effect-timing.js`: zoom-in, tracking and zoom-out phases
- `output-gate.js`: recording/streaming activation modes
- `zoom-math.js`: coordinate mapping, crop transforms and smoothing

## Troubleshooting

- **Cannot connect to OBS:** verify the WebSocket server, port and password in both OBS and `config.json`.
- **Source not found:** the active scene must contain a top-level Scene source named exactly `Click Zoom Layer`.
- **Wrong zoom position:** correct the `display` resolution and monitor position in `config.json`.
- **Clicks ignored in an elevated game:** run `start.bat` as administrator.
- **Cursor visible during the zoom:** disable **Capture Cursor** inside the dedicated `Click Zoom Layer` scene.
- **Effect does not activate while streaming:** change `trigger.activationMode` to `streaming` or `either`.

## Privacy and security

- The helper connects only to the OBS WebSocket address configured in `config.json`; the default is the local address `127.0.0.1`.
- It does not transmit click data, screenshots, passwords or analytics to any external service.
- Mouse coordinates remain inside the local Node.js process and are used only to calculate the OBS crop.
- Never commit your real OBS WebSocket password.

## Licence

This tool is released under the repository's MIT Licence. Its dependencies retain their own licences; inspect their package metadata before redistribution.

---

# Troubleshooting

> **Need more help?** If you're stuck, I highly recommend using AI to troubleshoot. Give it the exact error message, the step you reached, and the relevant OBS, Node.js, Vencord, or Browser Source settings. Never share passwords, cookies, account tokens, or other private credentials, and verify suggested commands before running them.

## Browser Source is missing

Reinstall OBS using the official installer. Normal official OBS packages include
Browser Source.

## A local overlay is blank

1. Edit the Browser Source.
2. Confirm **Local file** is enabled.
3. Confirm it points to the correct `.html` file.
4. Confirm Width and Height are not zero.
5. Select **Refresh cache of current page**.
6. Move it above the gameplay source.

## A source resized when I tried to crop it

Undo the change. Select the source, hold **Alt** on Windows or Linux or
**Option** on macOS, and then drag the red edge inward. A successful crop changes
the edge from red to green.

## Two crops do not line up

Open **Transform → Edit Transform** for both sources and enter identical **Crop
Left**, **Crop Top**, **Crop Right**, and **Crop Bottom** values. Do not rely on
matching them by eye.

## A Browser Source looks blurry or pixelated

1. Open the Browser Source's **Properties**.
2. Increase its Width and Height proportionally.
3. Scale the source down on the canvas.
4. Correct the crop in **Edit Transform** if the webpage layout moved.
5. Stop increasing the render size when it looks clean, because higher values use
   more system resources.

## Countdown is already at zero

- Confirm the target date is in the future.
- Include an explicit timezone such as `+01:00` for UK summer time or `+00:00`
  for UK winter time.
- Save and refresh the Browser Source.

## Confetti played only once

That is intentional. Select **Refresh cache of current page** to trigger it
again, or enable **Refresh browser when scene becomes active** for a dedicated
celebration scene.

## YouTube Studio opens, but the page cannot be clicked

Right-click the Browser Source and select **Interact**. The normal OBS preview is
for positioning sources, not interacting with webpages.

## Google will not allow sign-in inside OBS

Google can reject some embedded-browser sign-ins. Confirm that you are using a
current official OBS release. If Google's real sign-in page still reports that
the browser is unsupported or insecure, this Browser Source method cannot access
the private YouTube Studio page on that system.

## The subscriber count returns to the Studio dashboard

1. Right-click the source.
2. Select **Interact**.
3. Open **Analytics → Overview → Realtime → SEE LIVE COUNT** again.
4. Keep **Refresh browser when scene becomes active** disabled.

## The entire YouTube Studio page is visible

Crop the source using **Alt-drag** or **Transform → Edit Transform**. Color Key
removes a colour, but it does not crop menus, graphs, and controls.

## Color Key removes parts of the subscriber number

- Lower **Similarity**.
- Reduce **Smoothness**.
- Confirm that the chosen key colour matches the background rather than the
  digits.
- Switch YouTube Studio between light and dark theme to create stronger contrast.

## The stroke outlines a rectangle

The source is still opaque when Stroke processes it. Keep Color Key above Stroke
and refine the key until the area around the digits is transparent.

## The stroke is a single colour

Confirm that:

- Stroke **Fill Type** is **Source**;
- the fill source is `Subscriber Border Gradient`;
- the gradient Browser Source is loaded;
- `gradient.html` has been refreshed after any edit.

## Stroke is clipped

Enable **Auto padding** in the Stroke filter when available, reduce Stroke Size,
or leave more uncropped space around the digits.

## Stroke Glow Shadow does not appear

- Restart OBS after installation.
- Confirm you downloaded the compiled installer rather than GitHub's source ZIP.
- Confirm the release supports your OBS version and operating system.

## PowerShell says scripts are disabled or `npm` cannot run

Use the `.cmd` forms shown in this guide:

```powershell
npm.cmd ci
npm.cmd start
pnpm.cmd build
```

The launcher command already uses `-ExecutionPolicy Bypass` for that one script
process.

## `npm.cmd ci` fails

- Confirm PowerShell is open in `Overlays & Plugins\overlays\typing-notifications`.
- Confirm the folder contains `package.json` and `package-lock.json`.
- Confirm Node.js is version 22 or newer.
- Check the internet connection.

## Port 8765 is occupied

Close the other program or complete every port-change step above. Changing only
one component will not work.

## `npm.cmd run test-event` does not appear in OBS

1. Confirm the bridge is still running.
2. Confirm it says it is listening on `127.0.0.1:8765`.
3. Confirm OBS points to the correct `overlay.html` file.
4. Leave **Shutdown source when not visible** disabled.
5. Refresh the Browser Source.
6. Confirm the bridge and overlay use the same port.

## The test event works, but Discord typing does not

1. Confirm TypingNotifications is enabled.
2. Confirm the channel has **Typing** enabled.
3. Test with another user's typing.
4. Confirm Discord was fully closed before injection.
5. Rebuild, inject, and restart Discord.
6. Confirm the Vencord plugin and bridge use the same port.

## TypingNotifications is not listed

The final path must be:

```text
Vencord\src\userplugins\typingNotifications\index.tsx
```

Then run:

```powershell
pnpm.cmd build
pnpm.cmd inject
```

Restart Discord afterward.

## Avatar images are missing

The username alert can still function. Discord's avatar URL must be reachable by
the OBS Browser Source, so check the internet connection and firewall software.

---

# Updating later

## Update this repository

Downloading a new ZIP can replace files. Back up custom dates, titles, colours,
sounds, and port changes first.

## Update Vencord

From the Vencord source folder:

```powershell
git pull
pnpm.cmd install --frozen-lockfile
```

Confirm that Vencord's `package.json` still specifies compatible Node.js and pnpm
versions. Restore the custom plugin file, build, close Discord, inject, and
reopen Discord.

Vencord, Discord, YouTube Studio, and OBS are independently maintained. Their
interfaces can change after this guide is published.

---

# Security and privacy

- The Discord bridge binds to `127.0.0.1`, not your LAN or the public internet.
- It does not require a Discord token, API key, database, or cloud account.
- The Vencord plugin sends only the displayed username, channel name, avatar URL,
  and timestamp to the local bridge.
- The YouTube Studio Browser Source contains a signed-in private creator session.
  Crop it carefully, lock it, and inspect it before every stream.
- Review third-party OBS and Discord modifications before installing them.

# License

The original overlays, bridge, launcher, tests, and documentation use the
repository's MIT License. The Vencord integration retains its
GPL-3.0-or-later notice. The optional OpenAI Sans files are separate third-party
assets. See [`docs/NOTICE.md`](docs/NOTICE.md).
