# mcp-espn

ESPN MCP — keyless multi-sport live scores, teams, and news via ESPN's public site API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Espn data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
