import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const guideFiles = ["README.md", "FULL_GUIDE.md"];

function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(fullPath) : [fullPath];
    });
}

function validateInlineScripts(filePath) {
    const html = fs.readFileSync(filePath, "utf8");
    const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

    assert.ok(scripts.length > 0 || !html.includes("<script"), `${filePath} contains an unparseable script tag.`);

    scripts.forEach((match, index) => {
        new vm.Script(match[1], { filename: `${filePath}#inline-script-${index + 1}` });
    });
}

function validateGuideLinks() {
    for (const relativeGuidePath of guideFiles) {
        const guidePath = path.join(root, relativeGuidePath);
        assert.ok(fs.existsSync(guidePath), `${relativeGuidePath} is missing.`);

        const guide = fs.readFileSync(guidePath, "utf8");
        const links = [...guide.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1].trim());

        for (const rawTarget of links) {
            const target = rawTarget.replace(/^<|>$/g, "").split(/\s+['\"]/)[0];
            if (/^(?:https?:|mailto:|#)/i.test(target)) continue;

            const localPath = decodeURIComponent(target.split("#")[0]);
            assert.ok(localPath, `${relativeGuidePath} contains an empty local link: ${rawTarget}`);
            assert.ok(
                fs.existsSync(path.resolve(root, localPath)),
                `${relativeGuidePath} local link does not exist: ${localPath}`,
            );
        }
    }
}

function validateGuideStructure() {
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

    assert.ok(
        readme.includes("## What to download for each overlay"),
        "README must explain the files required for each overlay.",
    );
    assert.ok(
        readme.includes("FULL_GUIDE.md"),
        "README must link to the complete beginner guide.",
    );
}

function validatePinnedDependency() {
    const directory = path.join(root, "overlays", "typing-notifications");
    const packageJson = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
    const lockfile = JSON.parse(fs.readFileSync(path.join(directory, "package-lock.json"), "utf8"));

    assert.equal(packageJson.engines.node, ">=22");
    assert.equal(packageJson.dependencies.ws, "8.21.1");
    assert.equal(lockfile.packages[""].dependencies.ws, packageJson.dependencies.ws);
    assert.equal(lockfile.packages["node_modules/ws"].version, packageJson.dependencies.ws);
}

function validateBridgePortAgreement() {
    const files = [
        "overlays/typing-notifications/bridge.mjs",
        "overlays/typing-notifications/overlay.html",
        "integrations/vencord/TypingNotifications/index.tsx",
    ];

    for (const relativePath of files) {
        const content = fs.readFileSync(path.join(root, relativePath), "utf8");
        assert.ok(content.includes("8765"), `${relativePath} no longer contains the default bridge port.`);
    }
}

function validateYouTubeStudioGuide() {
    const guides = guideFiles
        .map(relativePath => fs.readFileSync(path.join(root, relativePath), "utf8"))
        .join("\n");
    const requiredInstructions = [
        "https://studio.youtube.com/",
        "Select **Interact**",
        "Analytics → Overview → Realtime → SEE LIVE COUNT",
        "**+ → Color Key**",
        "Remove YouTube Studio Background",
        "Subscriber Border Gradient",
        "**+ → Stroke**",
        "Fill Type** to **Source",
    ];

    for (const instruction of requiredInstructions) {
        assert.ok(guides.includes(instruction), `Setup guides are missing: ${instruction}`);
    }

    assert.ok(!/livecounts\.io/i.test(guides), "Setup guides must not use Livecounts.io.");
}

const htmlFiles = walk(path.join(root, "overlays")).filter(file => file.endsWith(".html"));
assert.ok(htmlFiles.length >= 4, "Expected at least four overlay HTML files.");
htmlFiles.forEach(validateInlineScripts);
validateGuideLinks();
validateGuideStructure();
validatePinnedDependency();
validateBridgePortAgreement();
validateYouTubeStudioGuide();

console.log(`Repository validation passed for ${htmlFiles.length} HTML overlays and ${guideFiles.length} guide files.`);
