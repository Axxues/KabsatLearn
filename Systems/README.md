# Systems

Every system we build lives in its own folder here: `Systems/<name>/`.

A system is self-contained. Its design doc, its code, and its own agent team all
sit inside its folder, so a system can be read, moved, or deleted as one unit.

```
Systems/
  README.md                     this file
  _template/                    starting point for every new system
    DESIGN.md                   fill this in first
    new-system.ps1              scaffolds a new system + its junction
    .opencode/agents/           the five-agent team
  <name>/                       one system
    DESIGN.md
    .opencode/agents/           that system's own copy of the team
    (code)
```

## Why the junction

OpenCode discovers agents only under `.opencode/agents/**`, and it looks *upward*
from the working directory, never down into subfolders. So agents living at
`Systems/<name>/.opencode/agents/` would be invisible from the repo root.

Each system gets a junction that solves this:

```
.opencode/agents/Systems/<name>   ->   Systems/<name>/.opencode/agents
```

Files stay where they belong. The junction makes them discoverable, and the
nested path becomes part of the agent ID.

| System folder | Agent ID |
|---|---|
| `Systems/alerts/.opencode/agents/coder.md` | `Systems/alerts/coder` |
| `Systems/alerts/.opencode/agents/reviewer.md` | `Systems/alerts/reviewer` |

## Adding a system

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File Systems/_template/new-system.ps1 -Name alerts
```

That creates `Systems/alerts/`, copies the design template and the agent team
into it, and creates the junction. Then fill in `Systems/alerts/DESIGN.md`
before writing any code.

Creating the folder by hand works too, but you must create the junction
yourself or the agents will not be found.

## The team

Five agents, all on `deepseek-v4.1-flash`. Exactly one of them can write.

| Agent | Writes | Shell | Purpose |
|---|---|---|---|
| `coder` | yes | yes | implements one task inside this system |
| `verifier` | no | yes | checks the change against the brief, runs tests |
| `reviewer` | no | no | reviews a diff for spec compliance and quality |
| `explorer` | no | no | maps the code and returns paths |
| `tester` | no | yes | runs the suite and reports failures |

Each system gets its own copy, so you can tune one system's team without
touching another's.

## Dispatch contract

Keep prompts short by handing over files, not prose.

1. **Brief in a file.** The controller writes `task-N-brief.md` with the exact
   requirements, values, and acceptance criteria, and passes the path.
2. **Report out to a file.** The agent writes its full report to
   `task-N-report.md` and replies with a short status.
3. **One writer at a time.** Only `coder` edits. While a `coder` is running, the
   controller does not edit any file in that system — no `edit`, no `write`, no
   `git commit`. Read, plan, and update notes instead.
4. **Readers never write.** `edit: deny` removes the editing tools from an
   agent's catalog entirely — `reviewer` and `explorer` cannot write at all.
   `verifier` and `tester` keep a shell, and a shell can write, so their
   read-only status is policy, not enforcement. Keep their commands read-only.
5. **No nesting.** Every agent denies the `subagent` action, so nobody can spawn
   grandchildren.

## Checking that discovery works

There is no reliable CLI for this in the current install (`opencode agent list`
fails with a database error), so verify functionally: launch the agent by its ID.

```
subagent(agent: "Systems/<name>/explorer", prompt: "...")
```

If the ID is accepted, the junction is being followed.
