# Animated YouTube Subscriber Count

This guide creates the complete effect from an empty OBS scene:

```text
Livecounts.io YouTube counter
        ↓
OBS Browser Source
        ↓
Crop away the webpage controls
        ↓
Color Key removes the solid background
        ↓
Stroke Glow Shadow draws around the visible digits
        ↓
gradient.html supplies the animated stroke colours
```

The result is a live YouTube subscriber count whose digits remain visible with
an animated coloured outline.

## Requirements

- OBS Studio with Browser Source support.
- An internet connection while streaming.
- Your YouTube channel URL or `@handle`.
- The [Stroke Glow Shadow OBS plugin](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases).
- [`gradient.html`](gradient.html) from this folder.
- A public live-count service. These instructions use
  [Livecounts.io's YouTube subscriber counter](https://livecounts.io/youtube-live-subscriber-counter).

Livecounts.io is a separate third-party website. Its layout can change without
this repository changing. The dedicated OBS/embed URL described below is less
fragile than permanently displaying and cropping the full website.

## 1. Install Stroke Glow Shadow

1. Check the plugin's latest release notes and confirm that the release supports
   your installed OBS version and operating system.
2. Close OBS completely.
3. Open the plugin's
   [Releases page](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases).
4. Download the compiled installer for your operating system. Do not download
   GitHub's automatically generated **Source code (zip)** file.
5. Run the installer.
6. Reopen OBS.

The plugin is installed correctly when **Stroke** appears under **Effect
Filters** after you right-click a source and select **Filters**.

## 2. Add the live YouTube counter as a Browser Source

1. In OBS, select the scene that should contain the subscriber count.
2. In **Sources**, select **+ → Browser**.
3. Select **Create new**.
4. Name the source `YouTube Live Subscriber Count`.
5. Select **OK**.
6. Leave **Local file** disabled.
7. Put this address in **URL**:

   ```text
   https://livecounts.io/youtube-live-subscriber-counter
   ```

8. Set **Width** to `1920` and **Height** to `1080` initially. A large browser
   area makes the website controls easier to use before cropping.
9. Leave **Shutdown source when not visible** disabled so the counter can remain
   loaded between scene changes.
10. Leave **Refresh browser when scene becomes active** disabled. Enabling it can
    reload the page whenever the scene becomes active.
11. Select **OK**.

The entire website may now appear in the OBS preview. That is expected.

## 3. Select your YouTube channel through Interact

Normal clicks in the OBS preview select and transform sources; they do not click
buttons inside a webpage. Use OBS's separate interaction window instead.

1. Right-click `YouTube Live Subscriber Count` in **Sources**.
2. Select **Interact**.
3. In the interaction window, find and select **Change User** beneath the live
   count.
4. Enter one of these:
   - your full YouTube channel URL;
   - your channel ID;
   - your `@handle`;
   - your channel name, if it is distinctive.
5. Select the correct channel from the results.
6. Confirm that the displayed channel name and subscriber count belong to you.

Do not stop here. The interaction window has navigated away from the generic
counter page, but OBS can return to the configured generic URL after a source
refresh or restart.

## 4. Save the channel-specific OBS URL

1. While still in **Interact**, open the selected channel page's **Embed** or
   **Embed on your website** section.
2. Find the option specifically described for OBS or streaming software.
3. Select its **Copy** button to copy the direct Browser Source URL.
4. Close the **Interact** window.
5. Right-click `YouTube Live Subscriber Count` and select **Properties**.
6. Replace the generic URL with the copied OBS/embed URL.
7. Select **OK**.
8. Right-click the source and select **Refresh cache of current page**.

The same channel counter should return after the refresh. This proves that the
channel selection is stored in the Browser Source URL rather than only in the
temporary interaction session.

If the site does not offer an OBS/embed URL, copy the selected channel page URL
in a normal web browser and place that URL in the OBS Browser Source instead.
Do not rely only on navigation performed inside **Interact**.

## 5. Crop the source to the number

Remove the website header, channel information, buttons, graph, and other page
elements so only the desired counter remains.

### Fast visual method

1. Select `YouTube Live Subscriber Count` in the OBS preview.
2. Hold **Alt** on Windows or **Option** on macOS.
3. While holding the key, drag each red bounding-box edge inward.
4. Stop when the box contains only the subscriber digits and any text you
   deliberately want to retain.

The bounding edges turn green where they have been cropped.

### Precise method

1. Right-click the source.
2. Select **Transform → Edit Transform**.
3. Increase **Crop Left**, **Crop Top**, **Crop Right**, and **Crop Bottom** until
   only the required counter remains.
4. Close the window.

After cropping, drag a corner handle to resize the count and drag from the
middle to position it. Avoid stretching only one axis because that distorts the
digits.

## 6. Remove the background with Color Key

Use **Color Key**, not Chroma Key, when the counter page has a flat dark, black,
white, or otherwise non-green background.

1. Right-click `YouTube Live Subscriber Count`.
2. Select **Filters**.
3. Under **Effect Filters**, select **+ → Color Key**.
4. Name it `Remove Counter Background`.
5. Set **Key Color Type** to **Custom Color**.
6. Select **Key Color**, then choose the solid colour directly behind the
   subscriber digits. Use the colour picker or eyedropper if your OBS build
   exposes one.
7. Raise **Similarity** gradually until the background becomes transparent.
8. Adjust **Smoothness** only enough to soften jagged edges.
9. Keep **Opacity**, **Contrast**, **Brightness**, and **Gamma** at their defaults
   unless the digits themselves need correction.
10. Stop increasing Similarity if parts of the digits begin disappearing.

The preview behind the count should now be visible through the removed
background.

### Required filter order

OBS processes Effect Filters in list order. Keep them in this order:

```text
Remove Counter Background (Color Key)
Stroke
```

The Color Key must be above Stroke. Otherwise the stroke sees the original
opaque webpage rectangle and outlines that rectangle instead of the digits.

## 7. Add the animated gradient source

1. In **Sources**, select **+ → Browser**.
2. Name the source `Subscriber Border Gradient`.
3. Enable **Local file**.
4. Select **Browse** and choose [`gradient.html`](gradient.html).
5. Give it the same original Browser Source dimensions used by the subscriber
   counter: `1920 × 1080` in this guide.
6. Select **OK**.
7. Keep the source available in the scene, but place it below the content that
   viewers should see. Do not cover the stream with the full-screen gradient.

Do not resize the gradient to the small cropped rectangle. Matching the original
counter Browser Source dimensions gives the Stroke filter a correctly aligned
fill texture.

If the gradient becomes visible over the stream, move it lower in the Sources
list. Avoid disabling it with the eye icon until you have confirmed that your
plugin version continues rendering hidden fill sources.

## 8. Add the animated stroke

1. Right-click `YouTube Live Subscriber Count`.
2. Select **Filters**.
3. Under **Effect Filters**, select **+ → Stroke**.
4. Name it `Animated Subscriber Stroke`.
5. Move it below `Remove Counter Background` if OBS inserted it elsewhere.
6. Set the stroke position to **Outer**.
7. Start with a stroke thickness of `4` to `8` pixels.
8. Start with an offset of `0`.
9. Enable anti-aliasing if the plugin exposes that option.
10. Set the stroke's fill type to **Source**.
11. Select `Subscriber Border Gradient` as the fill source.
12. Adjust the thickness while watching the preview.
13. Close the Filters window.

The moving yellow gradient from `gradient.html` should now travel around the
outside of the visible subscriber digits.

## 9. Change the gradient colours

1. In File Explorer, right-click `gradient.html`.
2. Select **Open with → Notepad** or another plain-text editor.
3. Find the colours inside `conic-gradient`:

   ```css
   #fde047
   #facc15
   #ca8a04
   #facc15
   #fde047
   ```

4. Replace them with your preferred CSS hex colours.
5. Save the file.
6. In OBS, right-click `Subscriber Border Gradient`.
7. Select **Refresh cache of current page**.

## 10. Verify that the finished source survives a restart

1. Note the current subscriber number.
2. Close OBS normally.
3. Reopen OBS.
4. Open the scene containing the counter.
5. Confirm that:
   - the correct channel appears without using **Interact** again;
   - only the cropped count is visible;
   - the background remains transparent;
   - the stroke follows the digits rather than a rectangle;
   - the animated gradient is moving.

A counter that returns to the generic search page after restarting OBS does not
have a persistent channel-specific URL. Repeat **Save the channel-specific OBS
URL**.

## Troubleshooting

### Interact opens, but clicks do nothing

- Wait for the site to finish loading.
- Click once inside the interaction window before typing.
- Refresh the Browser Source and reopen **Interact**.
- Confirm the source has internet access and is not a local-file source.

### The counter returns to the search page after refreshing

The source still contains the generic counter URL. Copy the selected channel's
dedicated OBS/embed URL and paste it into the source's **URL** field.

### The entire webpage is still visible

Crop the Browser Source using **Alt-drag** or **Transform → Edit Transform**.
Color Key removes a colour; it does not remove unrelated headers or controls.

### Color Key removes parts of the number

- Lower **Similarity**.
- Reduce **Smoothness**.
- Ensure the chosen key colour matches the background and not a colour used in
  the digits.
- Change the live-count page theme if its background and digits are too similar.

### The stroke outlines a rectangle

The source is still opaque when Stroke processes it. Move Color Key above
Stroke and refine the key until the area around the digits is genuinely
transparent.

### The stroke is a single colour

Open the Stroke settings and verify that:

- fill type is **Source**;
- fill source is `Subscriber Border Gradient`;
- `Subscriber Border Gradient` is loaded and refreshing correctly.

### No counter appears after opening OBS

- Confirm the computer is online.
- Open the Browser Source properties and verify its saved URL.
- Select **Refresh cache of current page**.
- Open **Interact** to check whether the third-party counter service is showing
  an error or consent page.

## Data accuracy note

Third-party live counters normally display public YouTube subscriber data. For
channels with at least 1,000 subscribers, YouTube abbreviates the public count,
so a public counter may not expose every individual subscriber change. The
creator's own YouTube Studio live count can contain more precise private
analytics, but it is not the public counter workflow documented here.
