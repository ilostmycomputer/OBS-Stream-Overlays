# Notices

The original overlay, bridge, launcher, and test files are covered by the
repository's existing MIT License in `../LICENSE`.

`overlays and plugins/integrations/vencord/TypingNotifications/index.tsx` is a Vencord user-plugin
integration and retains its upstream Vencord GPL-3.0-or-later header. Vencord
is a separate third-party project; this repository only distributes the
integration source file and does not install or redistribute Vencord itself.
The full GPL text is kept at `docs/LICENSES/GPL-3.0-or-later.txt`.

The Vencord integration uses a short generated tone by default and does not
redistribute audio. Any custom notification sound is selected and stored by
the user through the plugin settings.

The animated subscriber border also uses the separately maintained
[Stroke Glow Shadow plugin](https://github.com/FiniteSingularity/obs-stroke-glow-shadow).
The plugin is not included in this repository; install it from its own
[release page](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases)
and review its upstream license and release notes.

The OpenAI Sans font files beside the countdown in `overlays and plugins/overlays/countdown/` are
optional third-party assets. They are not covered by this repository's MIT
License; use them in accordance with OpenAI's applicable font and brand terms. See the
[OpenAI design guidelines](https://openai.com/brand/).

