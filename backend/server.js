const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let sessions = [];

const ICONS = {
  health: "🏥", wealth: "💰", career: "💼", relationship: "💕",
  education: "🎓", adventure: "🗺️", setback: "⚠️", milestone: "🌟",
  lifestyle: "🏠", loss: "💔", success: "🏆", passion: "🎨",
  family: "👪", finance: "📈", spirituality: "🕊️", fun: "🎉"
};

const EVENT_TYPES = ["health", "wealth", "career", "relationship", "education", "adventure", "setback", "milestone", "lifestyle", "loss", "success", "passion", "family", "finance", "spirituality", "fun"];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function weightedRandom(entries) {
  const total = entries.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of entries) { r -= e.weight; if (r <= 0) return e.value; }
  return entries[entries.length - 1].value;
}

function generateLife(input) {
  const age = clamp(Number(input.age) || 20, 10, 100);
  const sleep = clamp(Number(input.sleep) || 7, 0, 12);
  const work = clamp(Number(input.work) || 8, 0, 16);
  const fun = clamp(Number(input.fun) || 4, 0, 24);
  const exercise = clamp(Number(input.exercise) || 3, 0, 14);
  const social = clamp(Number(input.social) || 5, 0, 14);
  const diet = clamp(Number(input.diet) || 6, 0, 10);
  const education = clamp(Number(input.education) || 5, 0, 10);
  const finance = clamp(Number(input.finance) || 5, 0, 10);
  const risk = clamp(Number(input.risk) || 5, 0, 10);

  let timeline = [];
  let year = age;

  let scores = {
    health: 50 + diet * 3 + exercise * 2 + sleep * 1.5 - work * 1,
    wealth: 20 + work * 3 + finance * 4 + education * 1.5 - fun * 0.5,
    happiness: 30 + fun * 4 + social * 3 + sleep * 1 - work * 1.5,
    career: 10 + work * 4 + education * 3 + risk * 1,
    relationships: 20 + social * 5 + fun * 1.5 - work * 1.5
  };

  for (const k of Object.keys(scores)) scores[k] = clamp(scores[k], 0, 100);

  let yearsElapsed = 0;
  const maxEvents = 18;

  while (year < 100 && yearsElapsed < maxEvents) {
    if (yearsElapsed > 0) {
      scores.health += (diet * 0.3 + exercise * 0.2 + sleep * 0.15 - work * 0.1 - (scores.health < 30 ? 0.5 : 0)) * (0.8 + Math.random() * 0.4);
      scores.wealth += (work * 0.2 + finance * 0.4 + (scores.career > 60 ? 0.3 : 0)) * (0.8 + Math.random() * 0.4);
      scores.happiness += (fun * 0.3 + social * 0.25 + sleep * 0.1 - work * 0.15 + (scores.health > 60 ? 0.2 : -0.3)) * (0.8 + Math.random() * 0.4);
      scores.career += (work * 0.15 + education * 0.2 + risk * 0.1) * (0.8 + Math.random() * 0.4);
      scores.relationships += (social * 0.4 + (fun > 5 ? 0.15 : 0) - work * 0.1) * (0.8 + Math.random() * 0.4);
      for (const k of Object.keys(scores)) scores[k] = clamp(scores[k], 0, 100);
    }

    const isYoung = year < 30;
    const isMid = year >= 30 && year < 55;
    const isSenior = year >= 55;

    let jump;
    if (isYoung) jump = weightedRandom([{ value: 2, weight: 3 }, { value: 3, weight: 4 }, { value: 4, weight: 2 }, { value: 5, weight: 1 }]);
    else if (isMid) jump = weightedRandom([{ value: 2, weight: 2 }, { value: 3, weight: 3 }, { value: 4, weight: 3 }, { value: 5, weight: 2 }, { value: 6, weight: 1 }]);
    else jump = weightedRandom([{ value: 2, weight: 1 }, { value: 3, weight: 2 }, { value: 4, weight: 3 }, { value: 5, weight: 3 }, { value: 6, weight: 2 }]);
    year += jump;

    if (year > 100) break;

    yearsElapsed++;

    let roll = Math.random();
    let event = null;
    let eventType = "milestone";

    const healthRisk = scores.health < 30 ? 0.3 : scores.health < 50 ? 0.15 : 0.05;
    const burnoutRisk = work > 10 && fun < 3 ? 0.35 : work > 8 && fun < 4 ? 0.2 : 0.05;
    const relationshipRisk = social < 2 ? 0.3 : social < 4 ? 0.15 : 0.05;

    if (roll < healthRisk && !isYoung) {
      const issues = ["Chronic health issue slows you down", "A health scare changes your priorities", "You spend time recovering from an illness", "Medical expenses strain your finances"];
      event = pick(issues);
      eventType = "health";
      scores.health -= 15 + Math.random() * 10;
    } else if (roll < healthRisk + burnoutRisk) {
      const burnouts = ["Burnout forces you to step back from work", "You take a sabbatical to recover", "Stress takes a toll on your well-being", "You quit your job to prioritize health"];
      event = pick(burnouts);
      eventType = "health";
      scores.health -= 10;
      scores.happiness -= 5;
    } else if (roll < healthRisk + burnoutRisk + relationshipRisk && !isYoung) {
      if (scores.relationships < 30) {
        const lonely = ["You feel isolated despite your achievements", "Loneliness creeps in", "You struggle to maintain connections"];
        event = pick(lonely);
        eventType = "relationship";
      } else {
        const relEvents = ["A close friendship deepens", "You find your community", "A mentor changes your perspective", "You reconnect with an old friend"];
        event = pick(relEvents);
        eventType = "relationship";
        scores.relationships += 8;
        scores.happiness += 5;
      }
    } else if (isYoung && roll < 0.4) {
      const youngEvents = [
        { text: "You discover a passion that shapes your future", type: "passion", h: 8, c: 3 },
        { text: "You travel abroad and gain new perspectives", type: "adventure", h: 10, r: 5 },
        { text: "You decide to pursue higher education", type: "education", c: 10, w: 3, e: 5 },
        { text: "You start your first serious relationship", type: "relationship", r: 8, h: 5 },
        { text: "You learn a valuable life skill", type: "education", e: 5, c: 3 },
        { text: "You take a risk that opens new doors", type: "adventure", c: 5, w: 5 },
        { text: "You build a strong circle of friends", type: "relationship", r: 10, h: 5 },
        { text: "You start a creative project", type: "passion", h: 5, c: 3 }
      ];
      const ev = pick(youngEvents);
      event = ev.text;
      eventType = ev.type;
      if (ev.h) scores.happiness += ev.h;
      if (ev.c) scores.career += ev.c;
      if (ev.r) scores.relationships += ev.r;
      if (ev.w) scores.wealth += ev.w;
      if (ev.e) scores.health += ev.e || 0;
    } else if (isMid) {
      roll = Math.random();
      if (roll < 0.25) {
        const careerEv = [
          { text: "You get a major career promotion", type: "career", c: 15, w: 10 },
          { text: "You switch careers unexpectedly", type: "career", c: 8, w: 3 },
          { text: "You start your own business", type: "finance", w: 15, c: 10 },
          { text: "You become a recognized expert in your field", type: "success", c: 12, w: 8 },
          { text: "You mentor someone who succeeds greatly", type: "success", c: 5, h: 8 }
        ];
        const ev = pick(careerEv);
        event = ev.text; eventType = ev.type;
        if (ev.c) scores.career += ev.c; if (ev.w) scores.wealth += ev.w; if (ev.h) scores.happiness += ev.h;
      } else if (roll < 0.45) {
        const familyEv = [
          { text: "A new family member arrives", type: "family", h: 15, r: 10, w: -5 },
          { text: "You buy your first home", type: "lifestyle", w: -8, h: 10 },
          { text: "You celebrate a milestone with loved ones", type: "family", h: 10, r: 8 },
          { text: "You care for an aging parent", type: "family", r: 5, h: -3 }
        ];
        const ev = pick(familyEv);
        event = ev.text; eventType = ev.type;
        if (ev.h) scores.happiness += ev.h; if (ev.r) scores.relationships += ev.r; if (ev.w) scores.wealth += ev.w;
      } else if (roll < 0.60) {
        const wealthEv = [
          { text: "A wise investment pays off", type: "finance", w: 15, c: 3 },
          { text: "You experience a financial setback", type: "setback", w: -10, h: -5 },
          { text: "You achieve financial independence", type: "success", w: 10, h: 10 },
          { text: "You start a side business that grows", type: "finance", w: 8, c: 5 }
        ];
        const ev = pick(wealthEv);
        event = ev.text; eventType = ev.type;
        if (ev.w) scores.wealth += ev.w; if (ev.h) scores.happiness += ev.h; if (ev.c) scores.career += ev.c;
      } else {
        const lifeEv = [
          { text: "You take up a new hobby that brings joy", type: "fun", h: 8 },
          { text: "You travel to a dream destination", type: "adventure", h: 12, w: -3 },
          { text: "You volunteer for a cause you believe in", type: "spirituality", h: 10, r: 5 },
          { text: "You face a personal challenge with courage", type: "milestone", h: 5, c: 5 },
          { text: "You rekindle an old passion", type: "passion", h: 10 }
        ];
        const ev = pick(lifeEv);
        event = ev.text; eventType = ev.type;
        if (ev.h) scores.happiness += ev.h; if (ev.r) scores.relationships += ev.r; if (ev.c) scores.career += ev.c; if (ev.w) scores.wealth += ev.w;
      }
    } else {
      roll = Math.random();
      if (roll < 0.2) {
        const legacy = [
          { text: "You leave a legacy that inspires others", type: "success", h: 12, c: 5 },
          { text: "You write a book about your experiences", type: "passion", h: 10 },
          { text: "You spend more time with grandchildren", type: "family", h: 15, r: 10 }
        ];
        const ev = pick(legacy);
        event = ev.text; eventType = ev.type;
        if (ev.h) scores.happiness += ev.h; if (ev.r) scores.relationships += ev.r; if (ev.c) scores.career += ev.c;
      } else if (roll < 0.45) {
        const healthSenior = [
          { text: "You adopt a healthier lifestyle in later years", type: "health", e: 10, h: 8 },
          { text: "You reflect deeply on life's meaning", type: "spirituality", h: 10 },
          { text: "You enjoy a peaceful retirement", type: "lifestyle", h: 10 }
        ];
        const ev = pick(healthSenior);
        event = ev.text; eventType = ev.type;
        if (ev.e) scores.health += ev.e; if (ev.h) scores.happiness += ev.h;
      } else {
        const miscSenior = [
          { text: "You share wisdom with the younger generation", type: "milestone", h: 8 },
          { text: "You travel to places you always dreamed of", type: "adventure", h: 10 },
          { text: "You downsize to a simpler life", type: "lifestyle", h: 5, w: 3 }
        ];
        const ev = pick(miscSenior);
        event = ev.text; eventType = ev.type;
        if (ev.h) scores.happiness += ev.h; if (ev.w) scores.wealth += ev.w;
      }
    }

    for (const k of Object.keys(scores)) scores[k] = clamp(scores[k], 0, 100);

    const lifePhase = isYoung ? "young" : isMid ? "mid" : "senior";

    timeline.push({
      age: year,
      text: event,
      type: eventType,
      icon: ICONS[eventType] || "📌",
      phase: lifePhase,
      scores: { ...scores }
    });
  }

  const lifeScore = Math.round(
    scores.health * 0.2 + scores.wealth * 0.15 + scores.happiness * 0.3 +
    scores.career * 0.15 + scores.relationships * 0.2
  );

  return { timeline, finalScores: scores, lifeScore };
}

app.post("/simulate", (req, res) => {
  try {
    const input = req.body;
    const result = generateLife(input);

    const session = {
      id: uuidv4(),
      input,
      timeline: result.timeline,
      finalScores: result.finalScores,
      lifeScore: result.lifeScore,
      createdAt: new Date().toISOString()
    };

    sessions.push(session);

    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/reroll", (req, res) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Missing input" });
    const result = generateLife(input);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/stats", (req, res) => {
  if (sessions.length === 0) {
    return res.json({
      totalRuns: 0, avgLifeScore: 0,
      avgHealth: 0, avgWealth: 0, avgHappiness: 0, avgCareer: 0, avgRelationships: 0,
      topScore: 0, bottomScore: 0,
      mostCommonEventType: "N/A"
    });
  }

  const avg = key => Math.round(sessions.reduce((s, se) => s + se.finalScores[key], 0) / sessions.length);
  const scores = sessions.map(s => s.lifeScore);
  const eventTypeCounts = {};
  sessions.forEach(s => s.timeline.forEach(e => { eventTypeCounts[e.type] = (eventTypeCounts[e.type] || 0) + 1; }));
  const mostCommon = Object.entries(eventTypeCounts).sort((a, b) => b[1] - a[1])[0];

  res.json({
    totalRuns: sessions.length,
    avgLifeScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    avgHealth: avg("health"),
    avgWealth: avg("wealth"),
    avgHappiness: avg("happiness"),
    avgCareer: avg("career"),
    avgRelationships: avg("relationships"),
    topScore: Math.max(...scores),
    bottomScore: Math.min(...scores),
    mostCommonEventType: mostCommon ? mostCommon[0] : "N/A"
  });
});

app.get("/history", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  res.json(sessions.slice(-limit).reverse());
});

app.post("/stats/reset", (req, res) => {
  sessions = [];
  res.json({ message: "Stats reset" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), sessions: sessions.length });
});

app.listen(PORT, () => {
  console.log("Life Simulator v2 running on port " + PORT);
});
