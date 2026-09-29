const PAGES = [
  ["index.html", "Home"],
  ["wishes.html", "Wishes"],
  ["poetry.html", "Poetry"],
  ["memories.html", "Memories"],
  ["gallery.html", "Gallery"],
  ["surprise.html", "Surprise"],
];
const LBL = [
  "Begin the little story ✦",
  "Read the poetry ✦",
  "Walk through the memories ✦",
  "Open the gallery ✦",
  "One last surprise ✦",
];
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const file = () => location.pathname.split("/").pop() || "index.html";
const cur = () => PAGES.findIndex((p) => p[0] === file());
function chrome() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div id="bg"></div><div class="aurora"></div><div class="glow" id="glow"></div><div id="fireflies"></div><div class="progress"><i id="bar"></i></div>
  <nav class="nav"><a class="brand" href="index.html">Happy Birthday</a><div class="links">${PAGES.map(
    (p) => `<a href="${p[0]}">${p[1]}</a>`
  ).join("")}</div><span class="step" id="step"></span></nav>
  <button id="musicButton" class="music-control" aria-label="Toggle birthday music">♪</button>`
  );
  const f = $("#fireflies");
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("span");
    s.className = "firefly";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = 55 + Math.random() * 45 + "%";
    s.style.animationDelay = Math.random() * 8 + "s";
    s.style.animationDuration = 6 + Math.random() * 7 + "s";
    f.appendChild(s);
  }
  $("#musicButton").onclick = toggleSound;
  addEventListener("pointermove", (e) => {
    $("#glow").style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });
}
async function go(href, push = true) {
  document.body.classList.add("leaving");
  try {
    const [r] = await Promise.all([
      fetch(href),
      new Promise((r) => setTimeout(r, 450)),
    ]);
    if (!r.ok) throw 0;
    const d = new DOMParser().parseFromString(await r.text(), "text/html");
    $("#app").innerHTML = d.getElementById("app").innerHTML;
    document.body.className = d.body.className;
    document.title = d.title;
    if (push) history.pushState({}, "", href);
    scrollTo(0, 0);
    init();
  } catch (e) {
    location.href = href;
  }
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const h = a.getAttribute("href");
  if (
    !h ||
    /^(#|https?:|mailto)/.test(h) ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey
  )
    return;
  e.preventDefault();
  if (h !== file()) go(h);
});
addEventListener("popstate", () => go(file(), false));
function wordify(el) {
  let n = 0;
  (function walk(node) {
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((p) => {
          if (!p.trim()) f.append(p);
          else {
            const s = document.createElement("span");
            s.className = "w";
            s.textContent = p;
            s.dataset.i = n++;
            f.append(s);
          }
        });
        c.replaceWith(f);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
  })(el);
  const step = Math.min(0.12, 5 / Math.max(n, 1));
  $$(".w", el).forEach((w) =>
    w.style.setProperty("--d", w.dataset.i * step + "s")
  );
  el.classList.add("words");
}
function init() {
  const app = $("#app"),
    i = cur();
  app.classList.remove("in");
  void app.offsetWidth;
  app.classList.add("in");
  $$(".links a").forEach((a) =>
    a.classList.toggle("active", a.getAttribute("href") === file())
  );
  if (i >= 0) {
    $("#step").textContent = `${i + 1} / ${PAGES.length}`;
    $("#bar").style.width = ((i + 1) / PAGES.length) * 100 + "%";
  }
  const intro = $("#introScreen"),
    open = $("#openExperience");
  if (intro && open) {
    if (sessionStorage.getItem("birthdayOpened") === "yes")
      intro.classList.add("hidden");
    open.onclick = () => {
      sessionStorage.setItem("birthdayOpened", "yes");
      intro.classList.add("hidden");
      startBirthdaySound();
    };
  }
  const t = $(".typewriter");
  if (t) {
    const s = t.dataset.text || t.textContent.trim();
    t.innerHTML = "";
    const c = document.createElement("span");
    c.className = "cursor";
    t.append(c);
    let n = 0;
    (function tick() {
      if (n < s.length && c.isConnected) {
        c.before(document.createTextNode(s[n++]));
        setTimeout(tick, 32);
      }
    })();
  }
  const b = $("#revealButton"),
    m = $("#hiddenMessage");
  if (b && m)
    b.onclick = () => {
      m.classList.add("show");
      b.textContent = "A little more magic ✦";
      confetti();
      setTimeout(
        () => m.scrollIntoView({ behavior: "smooth", block: "center" }),
        200
      );
    };
  if (i >= 0) {
    const n = PAGES[i + 1],
      p = PAGES[i - 1],
      nx = n
        ? `<a class="nx" href="${n[0]}">${LBL[i]}</a>`
        : `<a class="nx" href="index.html">↺ Start again</a>`;
    const html = `<div class="pager" id="pager">${
      p ? `<a class="bk" href="${p[0]}">← ${p[1]}</a>` : ""
    }${nx}</div>`;
    const f = $("footer", app);
    f
      ? f.insertAdjacentHTML("beforebegin", html)
      : app.insertAdjacentHTML("beforeend", html);
    if (n && i > 0)
      app.insertAdjacentHTML(
        "beforeend",
        `<a class="nx fab" href="${n[0]}">Next ✦</a>`
      );
    new IntersectionObserver((e) =>
      document.body.classList.toggle("at-end", e[0].isIntersecting)
    ).observe($("#pager"));
  }
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("show");
      }),
    { threshold: 0.12 }
  );
  $$(
    ".eyebrow,h2,h3,.lead:not(.typewriter),.quote,.card p,.signature,footer",
    app
  ).forEach((e) => {
    if (
      !e.querySelector(".fade-line") &&
      !e.closest(".fade-line") &&
      !e.classList.contains("fade-line") &&
      !e.querySelector(".words")
    )
      wordify(e);
  });
  $$(".reveal,.words", app).forEach((e) => io.observe(e));
}
document.addEventListener("DOMContentLoaded", () => {
  chrome();
  init();
});
let audioCtx = null,
  master = null,
  timer = null,
  playing = false;
function startBirthdaySound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    master = audioCtx.createGain();
    master.gain.value = 0.035;
    master.connect(audioCtx.destination);
  }
  if (!playing) playAmbient();
}
function playAmbient() {
  playing = true;
  const b = $("#musicButton");
  if (b) {
    b.textContent = "♫";
    b.classList.add("playing");
  }
  const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
  let i = 0;
  (function beat() {
    if (!playing) return;
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain(),
      t = audioCtx.currentTime;
    o.type = "sine";
    o.frequency.value = notes[i++ % notes.length];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.3);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(t + 2.4);
    timer = setTimeout(beat, 700);
  })();
}
function toggleSound() {
  if (!audioCtx) startBirthdaySound();
  else if (playing) {
    playing = false;
    clearTimeout(timer);
    master.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
    this.classList.remove("playing");
    this.textContent = "♪";
  } else {
    master.gain.setTargetAtTime(0.035, audioCtx.currentTime, 0.15);
    playAmbient();
  }
}
function confetti() {
  for (let i = 0; i < 70; i++) {
    const c = document.createElement("i");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 1.3 + "s";
    c.style.background = `hsl(${Math.random() * 360},70%,75%)`;
    document.body.append(c);
    setTimeout(() => c.remove(), 5000);
  }
}
// Surprise page reveal logic for video
const revealButton = document.getElementById("revealButton");
const hiddenMessage = document.getElementById("hiddenMessage");
const sketchWrapper = document.getElementById("sketchWrapper");

if (revealButton) {
  revealButton.addEventListener("click", () => {
    if (hiddenMessage) {
      hiddenMessage.style.display = "block";
      hiddenMessage.classList.add("show");
    }

    setTimeout(() => {
      if (sketchWrapper) {
        sketchWrapper.classList.add("show");
      }

      const wishVideo = document.getElementById("wishVideo");
      if (wishVideo) {
        wishVideo.currentTime = 0;
        wishVideo.muted = false;
        wishVideo.play().catch((error) => {
          console.log("Autoplay with audio blocked; playing muted:", error);
          wishVideo.muted = true;
          wishVideo.play();
        });
      }
    }, 150);
  });
}