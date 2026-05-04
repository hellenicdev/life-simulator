const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory "database"
let sessions = [];

// Generate probabilistic life events
function generateLife({ age, sleep, work, fun }) {
    let timeline = [];
    let currentAge = Number(age);

    for (let i = 0; i < 6; i++) {
        currentAge += Math.floor(Math.random() * 10) + 3;

        let event = "";

        const roll = Math.random();

        if (sleep < 5 && roll < 0.3) {
            event = "Health issues appear due to lack of sleep";
        } else if (work > 10 && roll < 0.5) {
            event = "Career success but personal burnout";
        } else if (fun > 6 && roll < 0.6) {
            event = "Strong friendships shape your life";
        } else if (fun < 2 && roll < 0.5) {
            event = "Isolation changes your perspective";
        } else {
            const randomEvents = [
                "You discover a passion that changes everything",
                "You move to a new country",
                "A risky decision pays off",
                "An unexpected setback forces growth",
                "You build something meaningful",
            ];
            event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        }

        timeline.push({
            age: currentAge,
            text: event
        });
    }

    return timeline;
}

// Create simulation
app.post("/simulate", (req, res) => {
    const data = req.body;
    const timeline = generateLife(data);

    const session = {
        id: uuidv4(),
        input: data,
        timeline
    };

    sessions.push(session);

    res.json(session);
});

// Re-roll same input
app.post("/reroll", (req, res) => {
    const { input } = req.body;
    const timeline = generateLife(input);

    res.json({ timeline });
});

// Stats (optional)
app.get("/stats", (req, res) => {
    res.json({
        totalRuns: sessions.length
    });
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});