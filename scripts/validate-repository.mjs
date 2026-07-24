import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

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

function validateReadmeLinks() {
    const readmePath = path.join(root, "README.md");
    const readme = fs.readFileSync(readmePath, "utf8");
    const links = [...readme.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1].trim());

    for (const rawTarget of links) {
        const target = rawTarget.replace(/^<|>$/g, "").split(/\s+['\"]/)[0];
        if (/^(?:https?:|mailto:|#)/i.test(target)) continue;

        const localPath = decodeURIComponent(target.split("#")[0]);
        assert.ok(localPath, `README contains an empty local link: ${rawTarget}`);
        assert.ok(
            fs.existsSync(path.resolve(root, localPath)),
            `README local link does not exist: ${localPath}`,
        );
    }
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

const htmlFiles = walk(path.join(root, "overlays")).filter(file => file.endsWith(".html"));
assert.ok(htmlFiles.length >= 4, "Expected at least four overlay HTML files.");
htmlFiles.forEach(validateInlineScripts);
validateReadmeLinks();
validatePinnedDependency();
validateBridgePortAgreement();

console.log(`Repository validation passed for ${htmlFiles.length} HTML overlays.`);
