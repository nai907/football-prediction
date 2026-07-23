/* =========================
   TEAM LOGOS
========================= */
const teamLogos = {
    "Arsenal": "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/120px-Arsenal_FC.svg.png",
    "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Aston_Villa_FC_new_crest.svg/120px-Aston_Villa_FC_new_crest.svg.png",
    "Bournemouth": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/120px-AFC_Bournemouth_%282013%29.svg.png",
    "Brentford": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/120px-Brentford_FC_crest.svg.png",
    "Brighton Hove": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Brighton_and_Hove_Albion_FC_crest.svg/120px-Brighton_and_Hove_Albion_FC_crest.svg.png",
    "Burnley": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Burnley_FC_Logo.svg/120px-Burnley_FC_Logo.svg.png",
    "Chelsea": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/120px-Chelsea_FC.svg.png",
    "Crystal Palace": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Crystal_Palace_FC_logo.svg/120px-Crystal_Palace_FC_logo.svg.png",
    "Everton": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/120px-Everton_FC_logo.svg.png",
    "Fulham": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/120px-Fulham_FC_%28shield%29.svg.png",
    "Leeds United": "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Leeds_United_F.C._logo.svg/120px-Leeds_United_F.C._logo.svg.png",
    "Liverpool": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/120px-Liverpool_FC.svg.png",
    "Man City": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/120px-Manchester_City_FC_badge.svg.png",
    "Man United": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/120px-Manchester_United_FC_crest.svg.png",
    "Newcastle": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/120px-Newcastle_United_Logo.svg.png",
    "Nottingham": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/120px-Nottingham_Forest_F.C._logo.svg.png",
    "Sunderland": "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Arms_of_Sunderland.svg/120px-Arms_of_Sunderland.svg.png",
    "Tottenham": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/120px-Tottenham_Hotspur.svg.png",
    "West Ham": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/120px-West_Ham_United_FC_logo.svg.png",
    "Wolverhampton": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/120px-Wolverhampton_Wanderers.svg.png"
};

/* =========================
   POLLING INTERVAL (replaces Socket.io)
========================= */
const LEADERBOARD_POLL_MS = 8000;

/* =========================
   VUE APP
========================= */
const app = Vue.createApp({
    data() {
        return {
            message: "Football Prediction",
            matches: [],
            currentMatch: null,
            currentMatchday: null,

            homePrediction: 0,
            awayPrediction: 0,

            username: "",
            score: 0,

            resultMessage: "",
            leaderboard: []
        };
    },

    methods: {

        /* =========================
           LOGO
        ========================= */
        getLogo(team) {
            return teamLogos[team] || "https://via.placeholder.com/60";
        },

        /* =========================
           FETCH MATCHES
        ========================= */
        async getMatches() {
            try {
                const res = await fetch("/api/matches");
                const data = await res.json();

                this.matches = data;
                this.nextRandomMatch();

            } catch (err) {
                console.error("Match error:", err);
            }
        },

        /* =========================
           RANDOM MATCH
        ========================= */
        nextRandomMatch() {
            if (!this.matches.length) return;

            const i = Math.floor(Math.random() * this.matches.length);
            this.currentMatch = this.matches[i];
            this.currentMatchday = this.currentMatch.matchday;

            this.homePrediction = 0;
            this.awayPrediction = 0;
            this.resultMessage = "";
        },

        /* =========================
           SUBMIT PREDICTION
        ========================= */
        async submitPrediction() {
            if (!this.currentMatch) return;

            const realH = this.currentMatch.homeScore;
            const realA = this.currentMatch.awayScore;

            let message = "";

            if (
                this.homePrediction == realH &&
                this.awayPrediction == realA
            ) {
                this.score += 3;
                message = "Exact score +3 points";
            } else {
                const predicted =
                    this.homePrediction > this.awayPrediction
                        ? "home"
                        : this.homePrediction < this.awayPrediction
                        ? "away"
                        : "draw";

                const real =
                    realH > realA
                        ? "home"
                        : realH < realA
                        ? "away"
                        : "draw";

                if (predicted === real) {
                    this.score += 1;
                    message = "Correct winner +1 point";
                } else {
                    message = "Wrong prediction";
                }
            }

            this.resultMessage = message;

            await this.saveScore();

            setTimeout(() => {
                this.nextRandomMatch();
            }, 1000);
        },

        /* =========================
           SAVE SCORE
        ========================= */
        async saveScore() {
            if (!this.username) return;

            try {
                const res = await fetch("/api/leaderboard", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: this.username,
                        score: this.score
                    })
                });

                this.leaderboard = await res.json();
            } catch (err) {
                console.error("Save score error:", err);
            }
        },

        /* =========================
           LOAD LEADERBOARD
        ========================= */
        async loadLeaderboard() {
            try {
                const res = await fetch("/api/leaderboard");
                this.leaderboard = await res.json();
            } catch (err) {
                console.error("Leaderboard error:", err);
            }
        }
    },

    /* =========================
       INIT + POLLING
    ========================= */
    mounted() {
        this.getMatches();
        this.loadLeaderboard();

        setInterval(() => {
            this.loadLeaderboard();
        }, LEADERBOARD_POLL_MS);
    },

    /* =========================
       TEMPLATE
    ========================= */
    template: `
    <div class="container py-4">

        <h1 class="text-center mb-3">{{ message }}</h1>

        <p class="text-center">Score: {{ score }}</p>
        <p class="text-center text-white-50">English Premier League season 2025/2026</p>

        <p class="text-center">Matchday: {{ currentMatchday }}</p>

        <!-- MATCH DISPLAY -->
        <div class="d-flex justify-content-center align-items-center gap-4 my-3">

            <div class="text-center">
                <img :src="getLogo(currentMatch?.homeTeam)" width="60">
                <div>{{ currentMatch?.homeTeam }}</div>
            </div>

            <h4>VS</h4>

            <div class="text-center">
                <img :src="getLogo(currentMatch?.awayTeam)" width="60">
                <div>{{ currentMatch?.awayTeam }}</div>
            </div>

        </div>

        <!-- INPUT -->
        <div class="d-flex justify-content-center gap-2 my-2">
            <input v-model="homePrediction" type="number" class="form-control w-25">
            <input v-model="awayPrediction" type="number" class="form-control w-25">
        </div>

        <!-- USERNAME -->
        <div class="text-center my-2">
            <input v-model="username" class="form-control w-50 mx-auto" placeholder="Enter username">
        </div>

        <!-- BUTTON -->
        <div class="text-center my-2">
            <button class="btn btn-primary"
                @click="submitPrediction"
                :disabled="!username">
                Submit Prediction
            </button>
        </div>

        <!-- RESULT -->
        <p class="text-center">{{ resultMessage }}</p>

        <!-- LEADERBOARD -->
        <h3 class="text-center mt-4">Leaderboard</h3>

        <ul class="list-group w-50 mx-auto">
            <li class="list-group-item d-flex justify-content-between"
                v-for="(u, i) in leaderboard"
                :key="i">
                <span>#{{ i + 1 }} {{ u.username }}</span>
                <span>{{ u.score }} pts</span>
            </li>
        </ul>

    </div>
    `
});

app.mount("#content");
