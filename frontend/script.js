const API_URL = "https://life-simulator-qc4p.onrender.com";

let lastInput = null;
let currentData = null;

const SLIDERS = ["age","sleep","work","fun","exercise","social","diet","education","finance","risk"];
SLIDERS.forEach(id => {
  const el = document.getElementById(id);
  const val = document.getElementById(id + "Val");
  if (el && val) el.oninput = () => val.textContent = el.value;
});

const TYPE_NAMES = {
  health:"health challenges", wealth:"financial", career:"career", relationship:"relationship",
  education:"learning", adventure:"adventure", setback:"setbacks", milestone:"milestones",
  lifestyle:"lifestyle", loss:"loss", success:"success", passion:"passion",
  family:"family", finance:"financial", spirituality:"spiritual", fun:"fun"
};

const POSITIVE_TYPES = ["success","milestone","passion","adventure","family","fun","education","lifestyle","spirituality","relationship"];

function getIcon(type) {
  const ICONS = {
    health:"🏥", wealth:"💰", career:"💼", relationship:"💕",
    education:"🎓", adventure:"🗺️", setback:"⚠️", milestone:"🌟",
    lifestyle:"🏠", loss:"💔", success:"🏆", passion:"🎨",
    family:"👪", finance:"📈", spirituality:"🕊️", fun:"🎉"
  };
  return ICONS[type] || "📌";
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("hidden", !show);
  document.getElementById("simBtn").disabled = show;
  document.getElementById("rerollBtn").disabled = show;
}

async function startSimulation() {
  const input = {
    age: document.getElementById("age").value,
    sleep: document.getElementById("sleep").value,
    work: document.getElementById("work").value,
    fun: document.getElementById("fun").value,
    exercise: document.getElementById("exercise").value,
    social: document.getElementById("social").value,
    diet: document.getElementById("diet").value,
    education: document.getElementById("education").value,
    finance: document.getElementById("finance").value,
    risk: document.getElementById("risk").value
  };
  lastInput = input;

  showLoading(true);
  try {
    const res = await fetch(API_URL + "/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    currentData = data;
    renderTimeline(data.timeline);
    renderScoreboard(data.finalScores, data.lifeScore);
  } catch (err) {
    document.getElementById("timeline").innerHTML = `<div class="error">Failed to simulate. Check your connection.</div>`;
  }
  showLoading(false);
}

async function reroll() {
  if (!lastInput) return;

  showLoading(true);
  try {
    const res = await fetch(API_URL + "/reroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: lastInput })
    });
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    currentData = data;
    renderTimeline(data.timeline);
    renderScoreboard(data.finalScores, data.lifeScore);
  } catch (err) {
    document.getElementById("timeline").innerHTML = `<div class="error">Failed to reroll. Check your connection.</div>`;
  }
  showLoading(false);
}

function renderTimeline(events) {
  const container = document.getElementById("timeline");
  const summary = document.getElementById("summary");
  const scoreboard = document.getElementById("scoreboard");

  container.innerHTML = "";
  summary.innerHTML = "";
  scoreboard.classList.add("hidden");

  events.forEach(e => {
    const type = e.type || "milestone";
    const icon = e.icon || getIcon(type);

    const div = document.createElement("div");
    div.className = `event event-${type}`;

    const ageLabel = document.createElement("div");
    ageLabel.className = "event-age";
    ageLabel.textContent = `Age ${e.age}`;

    const iconSpan = document.createElement("span");
    iconSpan.className = "event-icon";
    iconSpan.textContent = icon;

    const textSpan = document.createElement("span");
    textSpan.className = "event-text";
    textSpan.textContent = e.text;

    div.appendChild(ageLabel);
    div.appendChild(iconSpan);
    div.appendChild(textSpan);

    container.appendChild(div);
  });

  handleScrollAnimations();
  generateSummary(events);
  loadStats();
}

function handleScrollAnimations() {
  const events = document.querySelectorAll(".event");
  const sound = document.getElementById("popSound");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    });
  }, { threshold: 0.3 });

  events.forEach(e => observer.observe(e));
}

function renderScoreboard(scores, lifeScore) {
  const board = document.getElementById("scoreboard");
  if (!scores) return;
  board.classList.remove("hidden");

  const labels = {
    health:"Health", wealth:"Wealth", happiness:"Happiness",
    career:"Career", relationships:"Relationships"
  };
  const colors = {
    health:"#ff6b6b", wealth:"#ffd93d", happiness:"#69db7c",
    career:"#4d96ff", relationships:"#ff6b9d"
  };

  const getGrade = score => score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : score >= 20 ? "D" : "F";
  const ls = lifeScore != null ? lifeScore : Math.round(Object.values(scores).reduce((a,b) => a + b, 0) / Object.keys(scores).length);

  let bars = "";
  for (const [key, label] of Object.entries(labels)) {
    const val = Math.round(scores[key] || 0);
    bars += `
      <div class="score-row">
        <span class="score-label">${label}</span>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width:${val}%;background:${colors[key]}"></div>
        </div>
        <span class="score-value">${val}</span>
      </div>`;
  }

  board.innerHTML = `
    <div class="scoreboard-inner">
      <h2>📊 Life Score: <span class="life-score">${ls}</span> <span class="life-grade">${getGrade(ls)}</span></h2>
      <div class="score-grid">${bars}</div>
    </div>`;
}

function generateSummary(events) {
  const summary = document.getElementById("summary");

  let typeCounts = {};
  let positiveCount = 0;

  events.forEach(e => {
    const t = e.type || "milestone";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
    if (POSITIVE_TYPES.includes(t)) positiveCount++;
  });

  const topEntry = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  let text = `Your life spanned ${events.length} major events. `;
  if (topEntry) {
    text += `The most common theme was <strong>${TYPE_NAMES[topEntry[0]] || topEntry[0]}</strong>. `;
  }

  const ratio = positiveCount / events.length;
  if (ratio > 0.7) text += "Life was full of joy and growth. ✨";
  else if (ratio > 0.5) text += "There were ups and downs, but you found your way. 🌊";
  else text += "It was a challenging journey, but you persevered. 💪";

  summary.innerHTML = `<h2>📝 Life Summary</h2><p>${text}</p>`;
}

async function loadStats() {
  try {
    const res = await fetch(API_URL + "/stats");
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();

    if (data.totalRuns === 0) {
      document.getElementById("stats").innerHTML = `<p>No global stats yet. Be the first!</p>`;
      return;
    }

    const grade = s => s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : s >= 20 ? "D" : "F";

    if ("avgLifeScore" in data) {
      document.getElementById("stats").innerHTML = `
        <h2>🌍 Global Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card"><span class="stat-num">${data.totalRuns}</span><span class="stat-label">Total Simulations</span></div>
          <div class="stat-card"><span class="stat-num">${data.avgLifeScore}</span><span class="stat-label">Avg Life Score (${grade(data.avgLifeScore)})</span></div>
          <div class="stat-card"><span class="stat-num">${data.avgHealth}</span><span class="stat-label">Avg Health</span></div>
          <div class="stat-card"><span class="stat-num">${data.avgWealth}</span><span class="stat-label">Avg Wealth</span></div>
          <div class="stat-card"><span class="stat-num">${data.avgHappiness}</span><span class="stat-label">Avg Happiness</span></div>
          <div class="stat-card"><span class="stat-num">${data.avgCareer}</span><span class="stat-label">Avg Career</span></div>
          <div class="stat-card"><span class="stat-num">${data.avgRelationships}</span><span class="stat-label">Avg Relationships</span></div>
          <div class="stat-card"><span class="stat-num">${data.topScore}</span><span class="stat-label">Highest Score</span></div>
          <div class="stat-card"><span class="stat-num">${data.mostCommonEventType}</span><span class="stat-label">Most Common Event</span></div>
        </div>`;
    } else {
      document.getElementById("stats").innerHTML = `
        <h2>🌍 Global Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card"><span class="stat-num">${data.totalRuns}</span><span class="stat-label">Total Simulations</span></div>
          <div class="stat-card"><span class="stat-num">${data.burnoutRate || 0}%</span><span class="stat-label">Experienced Burnout</span></div>
          <div class="stat-card"><span class="stat-num">${data.successRate || 0}%</span><span class="stat-label">Built Friendships</span></div>
          <div class="stat-card"><span class="stat-num">${data.lonelinessRate || 0}%</span><span class="stat-label">Felt Loneliness</span></div>
        </div>`;
    }
  } catch (err) {
    document.getElementById("stats").innerHTML = `<p>Stats unavailable</p>`;
  }
}
