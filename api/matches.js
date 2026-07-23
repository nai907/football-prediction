export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = process.env.FOOTBALL_API_TOKEN;
    const teamId = process.env.FOOTBALL_TEAM_ID || "66";
    const season = process.env.FOOTBALL_SEASON || "2025";
    const url = `https://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&season=${season}`;

    try {
        const response = await fetch(url, {
            headers: { "X-Auth-Token": token || "" }
        });

        if (!response.ok) {
            const detail = await response.text();
            return res.status(response.status).json({ error: "Football API error", detail });
        }

        const data = await response.json();

        const matches = (data.matches || [])
            .filter(match => match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null)
            .map(match => ({
                matchday: match.matchday,
                homeTeam: match.homeTeam.shortName,
                awayTeam: match.awayTeam.shortName,
                homeScore: match.score.fullTime.home,
                awayScore: match.score.fullTime.away
            }));

        res.status(200).json(matches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
}
