/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import * as DataStore from "@api/DataStore";
import { showNotification } from "@api/Notifications";
import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { Button, ChannelRouter, ChannelStore, Forms, GuildMemberStore, Menu, React, UserStore } from "@webpack/common";
import defaultSoundBase64 from "file://fears-to-fathom-notification-sound.mp3?base64";
import type { ReactElement } from "react";

const logger = new Logger("TypingNotifications");
const DATA_KEY = "TypingNotifications.watchedChannels";
const CUSTOM_SOUND_KEY = "TypingNotifications.customSound";
const DEFAULT_SOUND_URL = `data:audio/mpeg;base64,${defaultSoundBase64}`;
const MAX_CUSTOM_SOUND_BYTES = 10 * 1024 * 1024;
const AUDIO_FILE_PATTERN = /\.(?:aac|flac|m4a|mp3|ogg|opus|wav|webm)$/i;
const TYPING_MENU_ITEM_ID = "vc-typing-notifications";
const DEDUPE_WINDOW_MS = 10_000;
const OBS_BRIDGE_URL = "ws://127.0.0.1:8765";
const OBS_DISPLAY_NAME_MODES = {
    USERNAME: "username",
    NICKNAME: "nickname",
} as const;
const NOTIFICATION_MENU_IDS = new Set([
    "notification-settings",
    "channel-notification-settings",
    "channel-notifications",
    "notifications",
]);

const settings = definePluginSettings({
    trackedUserIds: {
        type: OptionType.STRING,
        displayName: "Tracked user IDs",
        description: "Only send typing events for these Discord user IDs. Separate IDs with commas or new lines. Leave blank to track everyone.",
        default: "",
        multiline: true,
        isValid(value) {
            if (typeof value !== "string") return "Enter valid Discord user IDs separated by commas or new lines.";
            const ids = value.split(/[\s,]+/).filter(Boolean);
            return ids.every(id => /^\d{15,25}$/.test(id)) || "Enter valid Discord user IDs separated by commas or new lines.";
        },
    },
    obsDisplayName: {
        type: OptionType.SELECT,
        displayName: "OBS display name",
        description: "Choose whether the OBS bridge shows usernames or server nicknames.",
        options: [
            { label: "Username", value: OBS_DISPLAY_NAME_MODES.USERNAME, default: true },
            { label: "Server nickname", value: OBS_DISPLAY_NAME_MODES.NICKNAME },
        ],
    },
    sound: {
        type: OptionType.BOOLEAN,
        displayName: "Typing sound",
        description: "Play a short sound when someone starts typing in a watched channel",
        default: true,
    },
});

const watchedChannels = new Set<string>();
const recentNotifications = new Map<string, number>();
let storeReady = false;
let soundContext: AudioContext | null = null;
let customSoundName: string | null = null;
let customSoundUrl: string | null = null;
let customSoundAudio: HTMLAudioElement | null = null;
let defaultSoundAudio: HTMLAudioElement | null = null;
let obsSocket: WebSocket | null = null;
let obsReconnectTimer: number | null = null;
let obsStopping = false;

function scheduleObsReconnect() {
    if (obsStopping || obsReconnectTimer != null) return;

    obsReconnectTimer = window.setTimeout(() => {
        obsReconnectTimer = null;
        connectObsBridge();
    }, 5000);
}

function connectObsBridge() {
    if (obsStopping) return;

    const state = obsSocket?.readyState;
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;

    try {
        const socket = new WebSocket(`${OBS_BRIDGE_URL}?role=publisher`);
        obsSocket = socket;

        socket.addEventListener("close", () => {
            if (obsSocket === socket) obsSocket = null;
            scheduleObsReconnect();
        });

        socket.addEventListener("error", () => socket.close());
    } catch (error) {
        logger.error("Failed to connect to the OBS bridge", error);
        scheduleObsReconnect();
    }
}

function sendObsEvent(event: object) {
    if (obsSocket?.readyState !== WebSocket.OPEN) return;

    try {
        obsSocket.send(JSON.stringify(event));
    } catch (error) {
        logger.error("Failed to send a typing event to the OBS bridge", error);
    }
}

function isTrackedUser(userId: string) {
    const configuredIds = settings.store.trackedUserIds.trim();
    if (!configuredIds) return true;

    return configuredIds.split(/[\s,]+/).includes(userId);
}

function getObsDisplayName(guildId: string, userId: string, username: string) {
    if (settings.store.obsDisplayName !== OBS_DISPLAY_NAME_MODES.NICKNAME) return username;
    return GuildMemberStore.getNick(guildId, userId) ?? username;
}

function stopObsBridge() {
    obsStopping = true;

    if (obsReconnectTimer != null) {
        window.clearTimeout(obsReconnectTimer);
        obsReconnectTimer = null;
    }

    obsSocket?.close();
    obsSocket = null;
}

type MenuChild = ReactElement<any> | null | undefined;

interface StoredCustomSound {
    name: string;
    type: string;
    data: ArrayBuffer;
}

async function loadWatchedChannels() {
    try {
        const stored = await DataStore.get<string[]>(DATA_KEY);
        if (Array.isArray(stored)) {
            stored.forEach(channelId => {
                if (typeof channelId === "string") watchedChannels.add(channelId);
            });
        }
    } catch (error) {
        logger.error("Failed to load watched channels", error);
    } finally {
        storeReady = true;
    }
}

function releaseCustomSound() {
    customSoundAudio?.pause();
    customSoundAudio = null;
    customSoundName = null;

    if (customSoundUrl) URL.revokeObjectURL(customSoundUrl);
    customSoundUrl = null;
}

function applyCustomSound(sound: StoredCustomSound) {
    releaseCustomSound();

    const blob = new Blob([sound.data], { type: sound.type });
    customSoundUrl = URL.createObjectURL(blob);
    customSoundAudio = new Audio(customSoundUrl);
    customSoundAudio.preload = "auto";
    customSoundName = sound.name;
}

async function loadCustomSound() {
    try {
        const stored = await DataStore.get<StoredCustomSound>(CUSTOM_SOUND_KEY);
        if (
            stored
            && typeof stored.name === "string"
            && typeof stored.type === "string"
            && stored.data instanceof ArrayBuffer
        ) {
            applyCustomSound(stored);
        }
    } catch (error) {
        logger.error("Failed to load custom typing sound", error);
    }
}

async function saveCustomSound(file: File) {
    if (!file.type.startsWith("audio/") && !AUDIO_FILE_PATTERN.test(file.name)) {
        throw new Error("Choose an audio file such as MP3, WAV, OGG, M4A, FLAC, or WebM.");
    }
    if (file.size > MAX_CUSTOM_SOUND_BYTES) {
        throw new Error("Custom sounds must be 10 MB or smaller.");
    }

    const stored: StoredCustomSound = {
        name: file.name,
        type: file.type || "application/octet-stream",
        data: await file.arrayBuffer(),
    };

    await DataStore.set(CUSTOM_SOUND_KEY, stored);
    applyCustomSound(stored);
}

async function clearCustomSound() {
    await DataStore.del(CUSTOM_SOUND_KEY);
    releaseCustomSound();
}

function saveWatchedChannels() {
    void DataStore.set(DATA_KEY, [...watchedChannels]).catch(error => {
        logger.error("Failed to save watched channels", error);
    });
}

function toggleChannel(channelId: string) {
    const checked = !watchedChannels.has(channelId);
    if (checked) watchedChannels.add(channelId);
    else watchedChannels.delete(channelId);

    saveWatchedChannels();
    return checked;
}

function createTypingMenuItem(channelId: string, checked: boolean, action: () => void) {
    return (
        <Menu.MenuCheckboxItem
            key={TYPING_MENU_ITEM_ID}
            id={TYPING_MENU_ITEM_ID}
            label="Typing"
            checked={checked}
            action={action}
        />
    );
}

function findNotificationMenuItem(children: unknown): ReactElement<any> | null {
    const items = Array.isArray(children) ? children : [children];

    for (const child of items) {
        if (!React.isValidElement(child)) continue;

        const element = child as ReactElement<any>;
        const id = element.props?.id;
        const label = element.props?.label;
        if (
            (typeof id === "string" && NOTIFICATION_MENU_IDS.has(id))
            || (typeof label === "string" && /notification settings/i.test(label))
        ) {
            return child;
        }

        const nested = findNotificationMenuItem(element.props?.children);
        if (nested) return nested;
    }

    return null;
}

function addTypingToNotificationMenu(children: MenuChild[], channelId: string, checked: boolean, action: () => void) {
    const notificationMenu = findNotificationMenuItem(children);
    if (!notificationMenu || notificationMenu.props?.children == null) return false;

    const nested = Array.isArray(notificationMenu.props.children)
        ? [...notificationMenu.props.children]
        : [notificationMenu.props.children];

    if (nested.some(child => React.isValidElement(child) && (child as ReactElement<any>).props?.id === TYPING_MENU_ITEM_ID)) return true;

    nested.push(
        <Menu.MenuSeparator key={`${TYPING_MENU_ITEM_ID}-separator`} />,
        createTypingMenuItem(channelId, checked, action),
    );
    notificationMenu.props.children = nested;
    return true;
}

const patchChannelContextMenu: NavContextMenuPatchCallback = (children, props) => {
    const [, setRevision] = React.useState(0);
    const channel = props?.channel;
    if (!channel?.id || !channel.guild_id) return;

    const checked = watchedChannels.has(channel.id);
    const action = () => {
        toggleChannel(channel.id);
        setRevision(revision => revision + 1);
    };

    if (addTypingToNotificationMenu(children, channel.id, checked, action)) return;

    // Discord has changed the notification submenu structure before. Keep a
    // visible fallback beside the native notification item if its submenu is
    // not available in the current client build.
    const group = findGroupChildrenByChildId(
        ["notification-settings", "channel-notification-settings", "channel-notifications", "mute-channel", "unmute-channel"],
        children,
    ) ?? children;
    const index = group.findIndex(child => child?.props?.id === "mute-channel" || child?.props?.id === "unmute-channel");

    group.splice(index === -1 ? group.length : index + 1, 0, createTypingMenuItem(channel.id, checked, action));
};

function getEventField(event: any, camelCase: string, snakeCase: string) {
    return event?.[camelCase] ?? event?.[snakeCase];
}

function playTypingTone(context: AudioContext) {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.14);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    oscillator.connect(gain).connect(context.destination);
    oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        gain.disconnect();
    });
    oscillator.start(now);
    oscillator.stop(now + 0.15);
}

function resumeTypingSound() {
    const context = soundContext;
    if (!context || context.state !== "suspended") return;

    void context.resume().catch(error => logger.error("Failed to resume typing sound", error));
}

function playFallbackTone() {
    if (typeof AudioContext === "undefined") return;

    try {
        let context = soundContext;
        if (!context || context.state === "closed") {
            context = soundContext = new AudioContext();
        }

        if (context.state === "suspended") {
            void context.resume()
                .then(() => {
                    if (soundContext === context) playTypingTone(context);
                })
                .catch(error => logger.error("Failed to resume typing sound", error));
            return;
        }

        playTypingTone(context);
    } catch (error) {
        logger.error("Failed to play typing sound", error);
    }
}

function playDefaultSound() {
    const audio = defaultSoundAudio ??= new Audio(DEFAULT_SOUND_URL);
    audio.preload = "auto";
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(error => {
        logger.error("Failed to play the default typing sound; using the fallback tone", error);
        playFallbackTone();
    });
}

function playCustomSound() {
    const audio = customSoundAudio;
    if (!audio) return false;

    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(error => {
        logger.error("Failed to play custom typing sound; using the default sound", error);
        playDefaultSound();
    });
    return true;
}

function playTypingSound(force = false) {
    if (!force && !settings.store.sound) return;
    if (!playCustomSound()) playDefaultSound();
}

function stopTypingSound() {
    const context = soundContext;
    soundContext = null;
    if (context && context.state !== "closed") {
        void context.close().catch(error => logger.error("Failed to close typing sound", error));
    }
    defaultSoundAudio?.pause();
    defaultSoundAudio = null;
    releaseCustomSound();
}

function openChannel(channelId: string) {
    try {
        ChannelRouter.transitionToChannel(channelId);
    } catch (error) {
        logger.error("Failed to open channel from typing notification", error);
    }
}

function SoundSettings() {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState<string | null>(customSoundName);
    const [status, setStatus] = React.useState<string | null>(null);
    const [busy, setBusy] = React.useState(false);

    async function upload(file: File) {
        setBusy(true);
        setStatus(null);
        try {
            await saveCustomSound(file);
            setFileName(file.name);
            setStatus("Custom sound saved. Use Test sound to preview it.");
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Failed to save the custom sound.");
        } finally {
            setBusy(false);
        }
    }

    async function reset() {
        setBusy(true);
        setStatus(null);
        try {
            await clearCustomSound();
            setFileName(null);
            setStatus("Custom sound removed.");
        } catch (error) {
            logger.error("Failed to remove custom typing sound", error);
            setStatus("Failed to remove the custom sound.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Forms.FormTitle tag="h5">Custom notification sound</Forms.FormTitle>
            <Forms.FormText>
                {fileName ? `Current sound: ${fileName}` : "No custom sound selected."}
            </Forms.FormText>
            <input
                ref={inputRef}
                type="file"
                accept="audio/*,.aac,.flac,.m4a,.mp3,.ogg,.opus,.wav,.webm"
                style={{ display: "none" }}
                onChange={event => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) void upload(file);
                }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Button disabled={busy} onClick={() => inputRef.current?.click()}>
                    {fileName ? "Replace sound" : "Upload sound"}
                </Button>
                <Button disabled={busy} onClick={() => playTypingSound(true)}>Test sound</Button>
                {fileName && <Button disabled={busy} onClick={() => void reset()}>Use default sound</Button>}
            </div>
            {status && <Forms.FormText>{status}</Forms.FormText>}
        </div>
    );
}

function handleTypingStart(event: any) {
    if (!storeReady) return;

    const channelId = getEventField(event, "channelId", "channel_id");
    const userId = getEventField(event, "userId", "user_id");
    if (typeof channelId !== "string" || typeof userId !== "string") return;
    if (!watchedChannels.has(channelId) || userId === UserStore.getCurrentUser()?.id) return;
    if (!isTrackedUser(userId)) return;

    const channel = ChannelStore.getChannel(channelId);
    const user = UserStore.getUser(userId);
    if (!channel?.guild_id || !user) return;

    const dedupeKey = `${channelId}:${userId}`;
    const now = Date.now();
    const lastNotification = recentNotifications.get(dedupeKey);
    if (lastNotification != null && now - lastNotification < DEDUPE_WINDOW_MS) return;
    recentNotifications.set(dedupeKey, now);

    sendObsEvent({
        type: "typing",
        username: getObsDisplayName(channel.guild_id, userId, user.username),
        channelName: channel.name ?? "channel",
        avatarUrl: user.getAvatarURL(channel.guild_id, 128),
        timestamp: now,
    });

    playTypingSound();
    const channelName = `#${channel.name ?? "channel"}`;
    showNotification({
        title: `@${user.username}`,
        body: `Started typing in ${channelName}`,
        richBody: (
            <span className="vc-notification-p" style={{ display: "block" }}>
                Started typing in{" "}
                <span
                    role="link"
                    tabIndex={0}
                    style={{
                        color: "var(--text-link)",
                        cursor: "pointer",
                        textDecoration: "underline",
                    }}
                    onClick={() => openChannel(channelId)}
                    onKeyDown={event => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        openChannel(channelId);
                    }}
                >
                    {channelName}
                </span>
            </span>
        ),
        icon: user.getAvatarURL(channel.guild_id, 128),
        replaceCurrent: true,
        transition: "slide",
        useNative: false,
    });
}

function handleTypingStop(event: any) {
    const channelId = getEventField(event, "channelId", "channel_id");
    const userId = getEventField(event, "userId", "user_id");
    if (typeof channelId === "string" && typeof userId === "string") {
        recentNotifications.delete(`${channelId}:${userId}`);
    }
}

export default definePlugin({
    name: "TypingNotifications",
    description: "Adds a per-channel Typing notification option that alerts when someone starts typing.",
    tags: ["Notifications", "Servers"],
    authors: [{ name: "compi", id: 693783735304323102n }],
    settings,

    start() {
        obsStopping = false;
        connectObsBridge();
        storeReady = false;
        document.addEventListener("pointerdown", resumeTypingSound, true);
        document.addEventListener("keydown", resumeTypingSound, true);
        if (settings.store.sound && typeof AudioContext !== "undefined") {
            try {
                soundContext = new AudioContext();
            } catch (error) {
                logger.error("Failed to initialize typing sound", error);
            }
        }
        void loadWatchedChannels();
        void loadCustomSound();
    },

    stop() {
        stopObsBridge();
        storeReady = false;
        recentNotifications.clear();
        document.removeEventListener("pointerdown", resumeTypingSound, true);
        document.removeEventListener("keydown", resumeTypingSound, true);
        stopTypingSound();
    },

    settingsAboutComponent: SoundSettings,

    contextMenus: {
        "channel-context": patchChannelContextMenu,
    },

    flux: {
        TYPING_START: handleTypingStart,
        TYPING_STOP: handleTypingStop,
    },
});

