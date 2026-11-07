# Project instructions

## What this is

Hackathon workspace. No application code yet. Every system we build lives under
`Systems/<name>/`.

## Non-negotiables

1. **One writer at a time.** Only `coder` edits. While a `coder` runs, do not
   edit, write, or `git commit` in that system folder. Read, plan, update notes.
2. **Never delete or recreate a system's junction.** Without it the system's
   agents are invisible.
3. **Verify before claiming.** Run the command and quote the output. Never report
   a result you did not observe.

## Systems

A system is self-contained: `Systems/<name>/` holds `DESIGN.md`, its code, and
its own `.opencode/agents/`.

Agent discovery depends on a junction:

```
.opencode/agents/Systems/<name>  ->  Systems/<name>/.opencode/agents
```

Add a system:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File Systems/_template/new-system.ps1 -Name <name>
```

Then fill in `DESIGN.md` before writing code. It is the file agents read instead
of this conversation.

## Agent team

Every system gets five agents. All are `mode: subagent`, all on
`opencode-go/deepseek-v4.1-flash`.

| ID | Writes | Shell | Job |
|---|---|---|---|
| `Systems/<name>/coder` | yes | yes | implements one task |
| `Systems/<name>/verifier` | no | yes | checks the brief, runs tests |
| `Systems/<name>/reviewer` | no | no | spec compliance and quality |
| `Systems/<name>/explorer` | no | no | maps code, returns paths |
| `Systems/<name>/tester` | no | yes | runs the suite, reports failures |

`edit: deny` removes the editing tools entirely, so `reviewer` and `explorer`
cannot write. `verifier` and `tester` keep a shell, which *can* write — their
read-only status is policy, not enforcement.

## Dispatch contract

1. Write the brief to `task-N-brief.md` with exact values and acceptance
   criteria. Pass the path, not the text.
2. Tell the agent to write its full report to `task-N-report.md`.
3. Ask for a short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
4. Subagents never dispatch subagents.

## Skills

- Main session: load `using-superpowers` and follow it.
- `coder`: `test-driven-development`, plus `frontend-design` for any UI work.
- `verifier` and `tester`: `verification-before-completion`.
- `reviewer`: `requesting-code-review`.
- Do not ask a subagent to load `using-superpowers` — it instructs subagents to
  ignore it.

## Verification

- Run the tests yourself before accepting a subagent's report.
- Confirm a change stayed inside its system folder.
- For UI work, check the heading outline, the spacing scale, and contrast.

## Environment quirks

- `opencode agent list` and `opencode debug agent` fail with
  `Database is not empty and has no session table`. Verify discovery by launching
  an agent ID instead.
- Windows PowerShell 5.1: no `pwsh`, no `Join-String`.
- Python's unittest writes its summary to stderr. That is not a failure; judge by
  exit code and the `OK` / `FAILED` line.
- Not a git repository: no diffs for `reviewer` (it reads the changed files
  directly) and no worktree isolation.

## Current state

- `Systems/System1/` is KabsatLearn: a Capacitor-wrapped Android app. Design and
  progress live in `DESIGN.md` and `PLAN.md`. All feature tasks are built; the
  APK is at `Systems/System1/pitch/kabsatlearn-debug.apk` (4.07 MB).
- 54 tests pass via `npx vitest run` from `Systems/System1/app`.
- The APK has not yet been installed on a physical phone. `adb devices` is empty,
  so on-device and airplane-mode verification is outstanding.
- `.opencode/skills/frontend-design/SKILL.md` exists and was verified against a
  baseline.
- The `probe` system was deleted after capability testing.
