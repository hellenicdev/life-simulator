const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory storage
let sessions = [];

let stats = {
  burnout: 0,
  success: 0,
  loneliness: 0,
  total: 0
};

// Life generator
function generateLife({ age, sleep, work, fun }) {
  let timeline = [];
  let currentAge = Number(age);

  for (let i = 0; i < 8; i++) {
    currentAge += Math.floor(Math.random() * 10) + 3;

    let event = "";
    const roll = Math.random();

    if (sleep < 5 && roll < 0.3) {
      event = "Health issues appear due to lack of sleep";
    } else if (work > 10 && roll < 0.5) {
      event = "Career success but personal burnout";
      stats.burnout++;
    } else if (fun > 6 && roll < 0.6) {
      event = "Strong friendships shape your life";
      stats.success++;
    } else if (fun < 2 && roll < 0.5) {
      event = "Isolation changes your perspective";
      stats.loneliness++;
    } else {
      const randomEvents = [
        "You discover a passion that changes everything",
        "You move to another country",
        "A risky decision pays off",
        "An unexpected setback forces growth",
        "You build something meaningful",
        "A relationship changes your direction"
      ];
      event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    }

    timeline.push({ age: currentAge, text: event });
  }

  return timeline;
}

// simulate
app.post("/simulate", (req, res) => {
  const input = req.body;
  const timeline = generateLife(input);

  stats.total++;

  const session = {
    id: uuidv4(),
    input,
    timeline
  };

  sessions.push(session);

  res.json(session);
});

// reroll
app.post("/reroll", (req, res) => {
  const { input } = req.body;
  const timeline = generateLife(input);

  res.json({ timeline });
});

// stats
app.get("/stats", (req, res) => {
  res.json({
    burnoutRate: ((stats.burnout / stats.total) * 100 || 0).toFixed(1),
    successRate: ((stats.success / stats.total) * 100 || 0).toFixed(1),
    lonelinessRate: ((stats.loneliness / stats.total) * 100 || 0).toFixed(1),
    totalRuns: stats.total
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});