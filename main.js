let lastRepoData = [];

// ============================================================
// 1. MATRIX RAIN
// ============================================================
(function initMatrixRain() {
  const canvas = document.querySelector("#matrix-canvas");
  const ctx = canvas.getContext("2d");
  let cols, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 14);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = "rgba(2,13,5,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font = "14px Share Tech Mono";
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 14, drops[i] * 14);
      if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  setInterval(draw, 50);
  window.addEventListener("resize", resize);
})();

// ============================================================
// 2. BOXEN
// ============================================================
const BOXEN_DATA = [
  {
    title: "// Dexter",
    text: "Meine Lieblingsszene aus Dexter – der Meister des Blutspritzmusters.",
    href: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.redd.it%2Fu7lozj3xywo91.jpg&f=1&nofb=1&ipt=a153d15962a2a85581aa907baea4b38eed0783c12f7938021fbb7655e453ea31",
    label: "→ Bild ansehen",
  },
  {
    title: "// Hacking",
    text: "Cybersecurity ist mein Hauptinteresse – ethisches Hacking, CTFs und Netzwerksicherheit.",
    href: "#about",
    label: "→ Mehr über mich",
  },
  {
    title: "// Open Source",
    text: "Live-Suche in der GitHub-API nach spannenden Security- und Linux-Projekten.",
    href: "#github-repos",
    label: "→ Repository-Suche",
  },
  {
    title: "// Projekte",
    text: "Alle Übungen und Projekte aus dem WMC-Kurs sind auf GitHub verfügbar.",
    href: "https://github.com/HJakobTL/WMC-Jakob",
    label: "→ GitHub Repo",
  },
];

(function buildBoxen() {
  const grid = document.querySelector("#boxen-grid");

  BOXEN_DATA.forEach((data) => {
    const box = document.createElement("div");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    const link = document.createElement("a");

    box.classList.add("box-item");

    h3.innerText = data.title;
    p.innerText = data.text;
    link.innerText = data.label;
    link.href = data.href;

    if (data.href.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener";
    }

    box.addEventListener("mouseenter", () => box.classList.add("box-hovered"));
    box.addEventListener("mouseleave", () =>
      box.classList.remove("box-hovered"),
    );

    box.appendChild(h3);
    box.appendChild(p);
    box.appendChild(link);
    grid.appendChild(box);
  });
})();

// ============================================================
// 5. NAV
// ============================================================
(function initNavScroll() {
  const sectionIds = [
    "home",
    "about",
    "blog",
    "github-repos",
    "boxen",
    "lernnotizen",
    "kontakt",
  ];
  const navLinks = [...document.querySelectorAll("nav.topnav a")];

  window.addEventListener("scroll", () => {
    let current = "home";
    for (const [, id] of sectionIds.entries()) {
      const el = document.querySelector(`#${id}`);
      if (el && window.scrollY >= el.offsetTop - 80) current = id;
    }
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  });
})();

// ============================================================
// 6. GITHUB TRENDING API
// ============================================================
const GH_BASE = "https://api.github.com/search/repositories";
let currentPage = 1;
let lastSize = 20;
let allData = [];

const TOPICS = [
  { label: "Linux Kernel", q: "topic:linux language:c stars:>1000" },
  { label: "Hacking Tools", q: "topic:hacking stars:>500" },
  { label: "Security", q: "topic:cybersecurity stars:>500" },
  { label: "CTF Tools", q: "topic:ctf stars:>200" },
  { label: "Malware Analysis", q: "topic:malware stars:>100" },
];

function setStatus(msg, type = "") {
  const el = document.querySelector("#status-msg");
  el.innerText = msg;
  el.className = type ? `status-${type}` : "";
}

function setLoading(active) {
  document.querySelector("#loading-bar").classList.toggle("active", active);
  document.querySelector("#fetch-btn").disabled = active;
}

async function fetchRepos() {
  currentPage = 1;
  await runFetch();
}

async function fetchLatest() {
  document.querySelector("#search-input").value = "";
  document.querySelector("#country-input").value = "";
  document.querySelector("#score-input").value = "";
  currentPage = 1;
  await runFetch();
}

async function runFetch() {
  setLoading(true);
  setStatus("Fetching data…", "load");
  document.querySelector("#results-body").innerHTML =
    `<tr><td colspan="6" style="color:var(--warn);text-align:center;padding:20px;">Lade Daten…</td></tr>`;

  try {
    const search = document.querySelector("#search-input").value.trim();
    const topic = document.querySelector("#search-field").value;
    const minStars = document.querySelector("#score-input").value.trim();
    const sort = document.querySelector("#sort-select").value;
    const lang = document
      .querySelector("#country-input")
      .value.trim()
      .toLowerCase();
    lastSize = parseInt(document.querySelector("#size-select").value);

    let q = topic;
    if (search) q += ` ${search}`;
    if (lang) q += ` language:${lang}`;
    if (minStars) q += ` stars:>${minStars}`;

    const ghSort =
      sort === "-score" ? "stars" : sort === "date" ? "updated" : "stars";
    const ghOrder = sort === "date" ? "asc" : "desc";

    const url = `${GH_BASE}?q=${encodeURIComponent(q)}&sort=${ghSort}&order=${ghOrder}&per_page=100`;

    const resp = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!resp.ok) throw new Error(`GitHub API: HTTP ${resp.status}`);
    const json = await resp.json();

    allData = (json.items || []).map((r) => ({
      id: r.id,
      url: r.html_url,
      date: r.updated_at,
      countrycode: r.language || "??",
      tld: (r.topics || [])[0] || "repo",
      score: Math.min(10, Math.log10(r.stargazers_count + 1) * 2.5).toFixed(1),
      title: r.full_name,
      description: r.description || "",
      stars: r.stargazers_count,
      forks: r.forks_count,
    }));

    lastRepoData = allData;
    const page = allData.slice(
      (currentPage - 1) * lastSize,
      currentPage * lastSize,
    );
    renderResults(page, allData.length);
    updateCharts(allData);
    updateTicker(allData);
    document.querySelector("#stat-threats").innerText =
      json.total_count?.toLocaleString() || allData.length;
  } catch (err) {
    setStatus(`Fehler: ${err.message}`, "err");
    document.querySelector("#results-body").innerHTML =
      `<tr><td colspan="6" style="color:var(--danger);text-align:center;padding:20px;">
        Fehler beim Laden.<br><small>${err.message}</small>
      </td></tr>`;
  } finally {
    setLoading(false);
  }
}

// ============================================================
// 7. RENDER, CHARTS, TICKER, PAGINATION, CLEAR
// ============================================================

function renderResults(data, total) {
  const tbody = document.querySelector("#results-body");
  const pag = document.querySelector("#pagination-wrap");

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:30px;">Keine Ergebnisse.</td></tr>`;
    pag.style.display = "none";
    setStatus("Keine Ergebnisse.", "");
    document.querySelector("#result-count").innerText = "";
    return;
  }

  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  data.forEach((item) => {
    const score = parseFloat(item.score) || 0;
    const scoreClass =
      score >= 7 ? "score-high" : score >= 4 ? "score-med" : "score-low";
    const dateStr = item.date ? item.date.substring(0, 10) : "—";
    const rawUrl = item.url || "—";
    const shortUrl =
      item.title ||
      (rawUrl.length > 50 ? rawUrl.substring(0, 50) + "…" : rawUrl);

    const tr = document.createElement("tr");
    const tdId = document.createElement("td");
    const tdScore = document.createElement("td");
    const tdUrl = document.createElement("td");
    const tdLand = document.createElement("td");
    const tdTld = document.createElement("td");
    const tdDate = document.createElement("td");

    tdId.innerText = item.id || "—";
    tdId.style.color = "var(--muted)";
    tdId.style.fontSize = "11px";

    const starsLabel =
      item.stars != null
        ? `★ ${item.stars.toLocaleString()}`
        : score.toFixed(1);
    tdScore.innerHTML = `<span class="score-badge ${scoreClass}">${starsLabel}</span>`;

    tdUrl.classList.add("url-cell");
    tdUrl.title = rawUrl;
    tdUrl.innerHTML = `<a href="${rawUrl}" target="_blank" rel="noopener noreferrer">${shortUrl}</a>`;

    tdLand.innerHTML = `<span class="country-tag">${item.countrycode || "??"}</span>`;
    tdTld.innerText = item.tld || "?";
    tdTld.style.color = "var(--muted)";
    tdDate.innerText = dateStr;
    tdDate.style.color = "var(--muted)";
    tdDate.style.fontSize = "11px";

    [tdId, tdScore, tdUrl, tdLand, tdTld, tdDate].forEach((td) =>
      tr.appendChild(td),
    );
    tbody.appendChild(tr);
  });

  pag.style.display = "flex";
  document.querySelector("#prev-btn").disabled = currentPage <= 1;
  document.querySelector("#next-btn").disabled =
    currentPage * lastSize >= (total || data.length);
  document.querySelector("#page-info").innerText =
    `Seite ${currentPage} · ${total || data.length} Repos`;
  setStatus("Daten erfolgreich geladen.", "ok");
  document.querySelector("#result-count").innerText =
    `${total || data.length} Repos`;
}

function updateCharts(data) {
  if (!data || data.length === 0) return;
  document.querySelector("#stats-charts").style.display = "grid";

  const langCounts = {};
  data.forEach((d) => {
    const c = d.countrycode || "??";
    langCounts[c] = (langCounts[c] || 0) + 1;
  });
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxL = topLangs[0]?.[1] || 1;
  const countryChart = document.querySelector("#country-chart");
  countryChart.innerHTML = "";
  topLangs.forEach(([lang, n]) => {
    const row = document.createElement("div");
    const lbl = document.createElement("div");
    const trk = document.createElement("div");
    const fil = document.createElement("div");
    const val = document.createElement("div");
    row.classList.add("bar-item");
    lbl.classList.add("bar-label");
    trk.classList.add("bar-track");
    fil.classList.add("bar-fill");
    val.classList.add("bar-val");
    lbl.innerText = lang;
    fil.style.width = `${((n / maxL) * 100).toFixed(0)}%`;
    val.innerText = n;
    trk.appendChild(fil);
    [lbl, trk, val].forEach((el) => row.appendChild(el));
    countryChart.appendChild(row);
  });

  const bands = {
    "<100": 0,
    "100–1K": 0,
    "1K–10K": 0,
    "10K–50K": 0,
    "50K+": 0,
  };
  data.forEach((d) => {
    const s = d.stars || 0;
    if (s < 100) bands["<100"]++;
    else if (s < 1000) bands["100–1K"]++;
    else if (s < 10000) bands["1K–10K"]++;
    else if (s < 50000) bands["10K–50K"]++;
    else bands["50K+"]++;
  });
  const maxS = Math.max(...Object.values(bands)) || 1;
  const scoreChart = document.querySelector("#score-chart");
  scoreChart.innerHTML = "";
  Object.entries(bands).forEach(([lbl, n]) => {
    const row = document.createElement("div");
    const le = document.createElement("div");
    const trk = document.createElement("div");
    const fil = document.createElement("div");
    const val = document.createElement("div");
    row.classList.add("bar-item");
    le.classList.add("bar-label");
    trk.classList.add("bar-track");
    fil.classList.add("bar-fill");
    val.classList.add("bar-val");
    le.innerText = lbl;
    fil.style.width = `${((n / maxS) * 100).toFixed(0)}%`;
    val.innerText = n;
    trk.appendChild(fil);
    [le, trk, val].forEach((el) => row.appendChild(el));
    scoreChart.appendChild(row);
  });
}

function updateTicker(data) {
  if (!data || data.length === 0) return;
  const sample = data
    .slice(0, 5)
    .map(
      (d) =>
        `[${d.countrycode || "??"}] ${d.title || d.url} ★${(d.stars || 0).toLocaleString()}`,
    )
    .join("  ›  ");
  document.querySelector("#ticker-text").innerText = "⭐ " + sample;
}

function clearResults() {
  lastRepoData = [];
  allData = [];
  document.querySelector("#results-body").innerHTML =
    `<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:30px;">Noch keine Daten geladen.</td></tr>`;
  document.querySelector("#pagination-wrap").style.display = "none";
  document.querySelector("#stats-charts").style.display = "none";
  document.querySelector("#stat-threats").innerText = "—";
  document.querySelector("#result-count").innerText = "";
  document.querySelector("#ticker-text").innerText = "Verbinde mit GitHub API…";
  setStatus("Bereit.", "");
}

async function changePage(dir) {
  const maxPage = Math.ceil(lastRepoData.length / lastSize);
  currentPage = Math.min(maxPage, Math.max(1, currentPage + dir));
  const page = lastRepoData.slice(
    (currentPage - 1) * lastSize,
    currentPage * lastSize,
  );
  renderResults(page, lastRepoData.length);
}

// ============================================================
// 8. addEventListener
// ============================================================
document.querySelector("#fetch-btn").addEventListener("click", fetchRepos);
document.querySelector("#latest-btn").addEventListener("click", fetchLatest);
document.querySelector("#clear-btn").addEventListener("click", clearResults);
document
  .querySelector("#prev-btn")
  .addEventListener("click", () => changePage(-1));
document
  .querySelector("#next-btn")
  .addEventListener("click", () => changePage(1));

// Enter-Taste in Suchfeldern
["search-input", "country-input", "score-input"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("keydown", (e) => {
    if (e.key === "Enter") fetchRepos();
  });
});

// ============================================================
// 9. AUTO-LOAD
// ============================================================
fetchLatest();
