interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ESPN MCP — keyless multi-sport live scores, teams, and news via ESPN's public site API.
 *
 * Common sport/league pairs (pass as `sport` + `league`):
 *   football/nfl, football/college-football,
 *   basketball/nba, basketball/wnba, basketball/mens-college-basketball,
 *   baseball/mlb, hockey/nhl,
 *   soccer/eng.1 (Premier League), soccer/usa.1 (MLS),
 *   soccer/esp.1 (La Liga), soccer/uefa.champions (Champions League).
 */


const BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const PAIRS =
  'Common sport/league pairs: football/nfl, football/college-football, basketball/nba, ' +
  'basketball/wnba, basketball/mens-college-basketball, baseball/mlb, hockey/nhl, ' +
  'soccer/eng.1 (Premier League), soccer/usa.1 (MLS), soccer/esp.1 (La Liga), ' +
  'soccer/uefa.champions (Champions League).';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_scoreboard',
    description:
      'Live sports scores: NFL/NBA/MLB/NHL/soccer/college scores for today\'s games and results. ' +
      'Returns each game with teams, scores, status (live/final), clock, and period. ' +
      PAIRS,
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', description: "Sport, e.g. 'football', 'basketball', 'baseball', 'hockey', 'soccer'." },
        league: { type: 'string', description: "League slug, e.g. 'nfl', 'nba', 'mlb', 'nhl', 'eng.1'." },
        dates: { type: 'string', description: 'Optional YYYYMMDD date filter. Default = today\'s games.' },
      },
      required: ['sport', 'league'],
    },
  },
  {
    name: 'get_teams',
    description:
      'List all teams (rosters/franchises) for a league: names, abbreviations, locations, and colors. ' +
      'Works for NFL/NBA/MLB/NHL/soccer/college. ' +
      PAIRS,
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', description: "Sport, e.g. 'basketball'." },
        league: { type: 'string', description: "League slug, e.g. 'nba'." },
      },
      required: ['sport', 'league'],
    },
  },
  {
    name: 'get_news',
    description:
      'Latest sports news headlines for a league: NFL/NBA/MLB/NHL/soccer/college articles with summaries and links. ' +
      PAIRS,
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', description: "Sport, e.g. 'baseball'." },
        league: { type: 'string', description: "League slug, e.g. 'mlb'." },
        limit: { type: 'number', description: 'Max articles to return (default 10).' },
      },
      required: ['sport', 'league'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_scoreboard': {
      const sport = reqStr(args, 'sport', "'football'");
      const league = reqStr(args, 'league', "'nfl'");
      const dates = typeof args.dates === 'string' && args.dates.trim() ? args.dates.trim() : undefined;
      const qs = dates ? `?dates=${encodeURIComponent(dates)}` : '';
      const data = (await espnGet(`/${seg(sport)}/${seg(league)}/scoreboard${qs}`)) as ScoreboardResp;
      if (isError(data)) return data;
      const events = data.events ?? [];
      return {
        games: events.map((e) => {
          const c = e.competitions?.[0]?.competitors ?? [];
          const home = c.find((x) => x.homeAway === 'home');
          const away = c.find((x) => x.homeAway === 'away');
          return {
            id: e.id,
            name: e.shortName,
            date: e.date,
            status: e.status?.type?.description,
            clock: e.status?.displayClock,
            completed: e.status?.type?.completed,
            home: home?.team?.abbreviation,
            home_score: home?.score,
            away: away?.team?.abbreviation,
            away_score: away?.score,
          };
        }),
      };
    }
    case 'get_teams': {
      const sport = reqStr(args, 'sport', "'basketball'");
      const league = reqStr(args, 'league', "'nba'");
      const data = (await espnGet(`/${seg(sport)}/${seg(league)}/teams`)) as TeamsResp;
      if (isError(data)) return data;
      const teams = data.sports?.[0]?.leagues?.[0]?.teams ?? [];
      return {
        teams: teams.map((t) => ({
          id: t.team?.id,
          name: t.team?.displayName,
          abbreviation: t.team?.abbreviation,
          location: t.team?.location,
          color: t.team?.color,
        })),
      };
    }
    case 'get_news': {
      const sport = reqStr(args, 'sport', "'football'");
      const league = reqStr(args, 'league', "'nfl'");
      const limit = typeof args.limit === 'number' && args.limit > 0 ? Math.floor(args.limit) : 10;
      const data = (await espnGet(`/${seg(sport)}/${seg(league)}/news?limit=${limit}`)) as NewsResp;
      if (isError(data)) return data;
      const articles = data.articles ?? [];
      return {
        articles: articles.slice(0, limit).map((a) => ({
          headline: a.headline,
          description: a.description,
          published: a.published,
          byline: a.byline,
          url: a.links?.web?.href,
        })),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function espnGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) return { error: res.status, message: await res.text().then((t) => t.slice(0, 500)) };
  return res.json();
}

function isError(data: unknown): data is { error: number; message: string } {
  return typeof data === 'object' && data !== null && 'error' in data;
}

/** URL-encode a single path segment. */
function seg(v: string): string {
  return encodeURIComponent(v.replace(/^\/+|\/+$/g, ''));
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v.trim();
}

interface ScoreboardResp {
  events?: Array<{
    id?: string;
    name?: string;
    shortName?: string;
    date?: string;
    status?: { type?: { description?: string; completed?: boolean }; displayClock?: string; period?: number };
    competitions?: Array<{
      competitors?: Array<{
        homeAway?: string;
        score?: string;
        team?: { displayName?: string; abbreviation?: string };
        records?: unknown;
      }>;
    }>;
  }>;
}

interface TeamsResp {
  sports?: Array<{
    leagues?: Array<{
      teams?: Array<{
        team?: { id?: string; displayName?: string; abbreviation?: string; location?: string; name?: string; color?: string; logos?: unknown };
      }>;
    }>;
  }>;
}

interface NewsResp {
  articles?: Array<{
    headline?: string;
    description?: string;
    published?: string;
    links?: { web?: { href?: string } };
    byline?: string;
  }>;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
