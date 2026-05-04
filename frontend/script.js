const API_URL = "https://life-simulator-qc4p.onrender.com";

let lastInput = null;

// slider updates
["age","sleep","work","fun"].forEach(id => {
  const el = document.getElementById(id);
  const val = document.getElementById(id + "Val");
  el.oninput = () => val.textContent = el.value;
});

async function startSimulation() {
  const input = {
    age: age.value,
    sleep: sleep.value,
    work: work.value,
    fun: fun.value
  };

  lastInput = input;

  const res = await fetch(API_URL + "/simulate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(input)
  });

  const data = await res.json();
  renderTimeline(data.timeline);
}

async function reroll() {
  if (!lastInput) return;

  const res = await fetch(API_URL + "/reroll", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ input: lastInput })
  });

  const data = await res.json();
  renderTimeline(data.timeline);
}

function renderTimeline(events) {
  const container = document.getElementById("timeline");
  const summary = document.getElementById("summary");

  container.innerHTML = "";
  summary.innerHTML = "";

  events.forEach(e => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `<strong>Age ${e.age}</strong><br>${e.text}`;
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
        sound.play();
      }
    });
  }, { threshold: 0.5 });

  events.forEach(e => observer.observe(e));
}

function generateSummary(events) {
  const summary = document.getElementById("summary");

  let text = "Your life was ";

  const burnout = events.some(e => e.text.includes("burnout"));
  const friends = events.some(e => e.text.includes("friendships"));
  const lonely = events.some(e => e.text.includes("Isolation"));

  if (burnout) text += "ambitious but exhausting. ";
  if (friends) text += "full of strong relationships. ";
  if (lonely) text += "sometimes lonely. ";

  if (!burnout && !lonely) text += "balanced and peaceful.";

  summary.innerHTML = `<h2>Life Summary</h2><p>${text}</p>`;
}

async function loadStats() {
  const res = await fetch(API_URL + "/stats");
  const data = await res.json();

  document.getElementById("stats").innerHTML = `
    <p>${data.burnoutRate}% experienced burnout</p>
    <p>${data.successRate}% built strong friendships</p>
    <p>${data.lonelinessRate}% felt loneliness</p>
    <p>Total runs: ${data.totalRuns}</p>
  `;
}