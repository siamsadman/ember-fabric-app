# CLAUDE.md — Grid Shift (ember-fabric-app)

Portfolio project by Siam Sadman (BI Developer, Dhaka). Microsoft Fabric end to end:
Dataflow Gen2 -> Fabric Warehouse -> semantic model -> Fabric App (preview, Rayfin SDK).
Data: Ember Electricity Data (CC BY 4.0). Story: Bangladesh's power grid vs South Asia and the world.

## Read first
- docs/BRIEF.md  : scope, verified data facts, model, screens
- docs/SCHEDULE.md : day-by-day plan; the Fabric trial ends about Nov 5, 2026 (confirm exact date in the portal)

## Hard rules
- Never invent numbers. Every figure shown in the app, README or posts must come from the data.
- Honesty over polish: README claims only what was actually built and verified. Mark preview features as preview.
- Attribute Ember in the app footer and README: "Ember, Electricity Data (CC BY 4.0)".
- No secrets, tokens, tenant IDs, workspace IDs or emails in the repo. data/ and *.csv are git-ignored.
- Do not run destructive commands (delete, force push, reset --hard) without asking.
- Any PowerShell block must start with Set-Location "L:\Python_Env\ember-fabric-app".
- Keep the UI work framed as dashboard UX within a BI project.

## Tools
- Fabric skills (install in Claude Code):  /plugin marketplace add microsoft/skills-for-fabric
  /plugin install fabric-skills@fabric-collection   and   /plugin install powerbi-authoring@fabric-collection
  Needs Azure CLI: az login. Use them for Dataflow Gen2, Warehouse T-SQL, semantic model, Git integration.
- Rayfin (Fabric Apps): npm create @microsoft/rayfin@latest -- "<app>" --template dataapp --workspace <ws>
  then npx rayfin dev / npx rayfin up. Verify exact flags with --help; docs may have changed.

## Layout
docs/ dataflow/ warehouse/ semantic-model/ app/ assets/ data/(ignored)
