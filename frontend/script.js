const API_URL = "https://your-render-url.onrender.com";

let lastInput = null;

// Update slider values live
["age", "sleep", "work", "fun"].forEach(id => {
  const el = document.getElementById(id);
  const val = document.getElementById(id + "Val");

  el.oninput = () => val.textContent = el.value;
});

async function startSimulation() {
  const input = {
    age: document.getElementById("age").value,
    sleep: document.getElementById("sleep").value,
    work: document.getElementById("work").value,
    fun: document.getElementById("fun").value
  };

  lastInput = input;

  const res = await fetch(API_URL + "/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const data = await res.json();
  renderTimeline(data.timeline);
}

async function reroll() {
  if (!lastInput) return;

  const res = await fetch(API_URL + "/reroll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: lastInput })
  });

  const data = await res.json();
  renderTimeline(data.timeline);
}

function renderTimeline(events) {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  events.forEach((e, i) => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `<strong>Age ${e.age}</strong><br>${e.text}`;

    container.appendChild(div);

    setTimeout(() => {
      div.classList.add("visible");
    }, i * 600);
  });
}