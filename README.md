# mcp-espn

ESPN MCP — keyless multi-sport live scores, teams, and news via ESPN's public site API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 776+ live data sources.

## Tools

| Tool | Description |
|------|-------------|

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

Or connect to the full Pipeworx gateway for access to all 776+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
