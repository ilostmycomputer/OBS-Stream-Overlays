# Notices

The original overlay, bridge, launcher, and test files are covered by the
repository's existing MIT License in `LICENSE`.

`integrations/vencord/TypingNotifications/index.tsx` is a Vencord user-plugin
integration and retains its upstream Vencord GPL-3.0-or-later header. Vencord
itself is a separate project; this repository only distributes the integration
source file. The full GPL text is kept at `LICENSES/GPL-3.0-or-later.txt`.

The Vencord integration imports a notification sound named
`fears-to-fathom-notification-sound.mp3` from the Vencord user-plugin folder at
build time. This repository does not redistribute that audio asset; users must
supply a sound they have permission to use or edit the plugin to use its
generated fallback tone.

The animated subscriber border also uses the separately maintained
[Stroke Glow Shadow plugin](https://github.com/FiniteSingularity/obs-stroke-glow-shadow).
The plugin is not included in this repository; install it from its own
[release page](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases)
and review its upstream license and release notes.

