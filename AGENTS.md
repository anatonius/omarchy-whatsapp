# AGENTS.md

Guidance for AI coding agents working in this repository.

## Overview

Omarchy shell bar plugin for WhatsApp, in two parts:

- **Bar plugin (QML):** `BarWidget.qml`, `Panel.qml`, `WhatsAppClient.qml`, `Model.js`. Parses NDJSON from the daemon socket only.
- **Bridge daemon (Node, ESM):** `daemon/`, built on Baileys. `index.js` is the entry point; `daemon/lib/` holds the store, media cache, notifier, preferences and socket server.
- **Shell helpers:** `bin/` (`_common.sh` does dependency install and service setup), `install.sh`, `systemd/`.

## Commands

```sh
cd daemon && npm ci --omit=dev --no-bin-links   # install (npm 12 needs npm_config_allow_git=root for libsignal)
cd daemon && npm test                           # node --test
bash tests/test_lifecycle.sh                    # shell lifecycle test
omarchy plugin validate .                       # manifest check
```

## Rules

- Never link a WhatsApp account, read `~/.local/state/omarchy-whatsapp/auth/`, or print chat contents or credentials in logs and output.
- Do not set `allow-git=all` or add a global `.npmrc` for it. `libsignal` stays a root dependency pinned to a commit in `daemon/package.json` and the lockfile.
- Keep `baileys` pinned at `6.7.24`; do not bump it without checking GHSA-qvv5-jq5g-4cgg.
- Passing user-controlled text (contact names, message bodies) to a command needs argv safety. See `buildNotifyArgs` in `daemon/lib/notify.js`.
- Archived chats must stay out of `Store.chatList()`; they remain in the store.
- Retention and privacy behaviour is controlled by `OMARCHY_WHATSAPP_*` environment variables, with defaults that keep existing behaviour sensible. Document new options in the README's privacy section.
- Add or update tests in `daemon/test/` for daemon changes. Tests use temporary state/cache dirs via `XDG_STATE_HOME` and `XDG_CACHE_HOME`.
- Keep changes surgical, and comment only code that needs clarification.

## Installed copy

The plugin may be installed at `~/.config/omarchy/plugins/io.github.ricky.whatsapp` as a git clone of this fork. Do not modify that copy directly; commit and push here, then update it with `git pull --ff-only` followed by `install.sh`.
