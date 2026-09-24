# mcp-espn

ESPN MCP — keyless multi-sport live scores, teams, and news via ESPN's public site API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_scoreboard` | Live sports scores: NFL/NBA/MLB/NHL/soccer/college scores for today's games and results. Returns each game with teams, scores, status (live/final), clock, and period. |
| `get_teams` | List all teams (rosters/franchises) for a league: names, abbreviations, locations, and colors. Works for NFL/NBA/MLB/NHL/soccer/college. |
| `get_news` | Latest sports news headlines for a league: NFL/NBA/MLB/NHL/soccer/college articles with summaries and links. |
| `get_standings` | League standings / table: win-loss records, win %, games behind (and points/draws for soccer), grouped by conference/division. PREFER for "NBA standings", "Premier League table", "NFL division standings", "who is leading <league>". |
| `get_team_schedule` | A team's schedule — upcoming and recent games with dates, opponents, and (for finished games) scores and result. PREFER for "when do the Lakers play next", "<team>'s schedule", "<team> recent results". Get the numeric team_id from get_teams. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "espn": {
      "url": "https://gateway.pipeworx.io/espn/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/espn/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/get_scoreboard \
  -H 'Content-Type: application/json' \
  -d '{"sport":"football","league":"nfl"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/get_scoreboard`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "espn": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-espn"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-espn
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Espn data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
