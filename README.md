# 🚀 Multi-Tool Skills Sync

Maintain a single "Source of Truth" for your AI Agent skills and synchronize them across **Claude Code**, **Gemini CLI**, **Codex**, and **OpenCode** — all from one directory.

## 🌟 Overview

This project allows you to maintain a central repository of AI skills as Markdown files and synchronize them across all your favorite AI tools. Instead of manually copying prompts to each tool's skill directory, simply add your file to `skills/` and run the sync command.

### Key Features
- **One Directory to Rule Them All:** Keep all your prompt engineering in one Git repo.
- **Smart Metadata:** Automatically extracts a `name` and `description` from your Markdown if not explicitly provided in frontmatter.
- **Safe Cleanup:** Automatically removes stale skills from tool directories but **only** if they contain a `SKILL.md` file (to avoid accidental deletions).
- **Cross-Platform:** Native support for **macOS**, **Linux**, and **Windows**.
- **Full Tool Coverage:**
    - **Claude Code** (CLI) & **Claude Desktop**
    - **Gemini CLI**
    - **Codex** (CLI) & **Codex Desktop**
    - **OpenCode** (CLI) & **OpenCode Desktop**

---

## 🛠️ Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wanony/skills-sync.git
   cd skills-sync
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   Run the test suite to ensure everything is ready for your environment:
   ```bash
   npm test
   ```

---

## 📖 How to Use

### 1. Create your Skill
Add a `.md` file to the `skills/` folder. For example, `wanonyui.md`:

```markdown
# WanonyUI Guide
Always use WanonyUI for frontend components.

## Rules
- Prefer flexbox for layouts.
- Use primary-500 for brand colors.
```

### 2. Run the Sync Engine
Execute the synchronization script:

```bash
npm run sync
```

### 3. Usage in Tools
Once synced, your skill will be available in your tools immediately:
- **Claude Code:** Type `/wanonyui`
- **Gemini CLI:** Triggered via natural language or `/wanonyui`
- **Codex/OpenCode:** Use `@wanonyui` or `/wanonyui`

---

## 🧠 Advanced Features

### YAML Frontmatter
You can explicitly define a skill's name and description using YAML frontmatter. If omitted, the sync engine will use the filename as the name and the first non-heading line as the description.

```markdown
---
name: "Wanony Design System"
description: "Guidelines for our internal UI library"
---
# Content goes here...
```

### Automatic Cleanup
If you delete a file from the `skills/` directory and run `npm run sync`, the engine will remove the corresponding skill folder from all tool directories. To protect your other files, it **only** deletes folders that contain a `SKILL.md` file.

---

## 📂 Supported Tool Paths
The engine automatically resolves the following paths based on your OS:

| Tool | macOS / Linux | Windows |
| :--- | :--- | :--- |
| **Claude** | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` |
| **Gemini** | `~/.gemini/skills/` | `%USERPROFILE%\.gemini\skills\` |
| **Codex** | `~/.codex/skills/` | `%USERPROFILE%\.codex\skills\` |
| **OpenCode** | `~/.config/opencode/skills/` | `%APPDATA%\opencode\skills\` |

---

## 📜 License
MIT
