document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");
  const field = document.getElementById("fireflies");
  if (field)
    for (let i = 0; i < 28; i++) {
      let f = document.createElement("span");
      f.className = "firefly";
      f.style.left = Math.random() * 100 + "%";
      f.style.top = 55 + Math.random() * 45 + "%";
      f.style.animationDelay = Math.random() * 8 + "s";
      f.style.animationDuration = 6 + Math.random() * 7 + "s";
      field.appendChild(f);
    }
  const intro = document.getElementById("introScreen"),
    open = document.getElementById("openExperience");
  if (intro && open) {
    if (sessionStorage.getItem("birthdayOpened") === "yes")
      intro.classList.add("hidden");
    open.onclick = () => {
      sessionStorage.setItem("birthdayOpened", "yes");
      intro.classList.add("hidden");
      startBirthdaySound();
    };
  }
  document.querySelectorAll("a[href]").forEach((a) => {
    let h = a.getAttribute("href");
    if (
      !h ||
      h.startsWith("#") ||
      h.startsWith("http") ||
      h.startsWith("mailto")
    )
      return;
    a.onclick = (e) => {
      e.preventDefault();
      document.body.classList.add("page-leave");
      setTimeout(() => (location.href = h), 480);
    };
  });
  const t = document.querySelector(".typewriter");
  if (t) {
    let s = t.dataset.text || t.textContent.trim();
    t.innerHTML = "";
    let c = document.createElement("span");
    c.className = "cursor";
    t.append(c);
    let i = 0;
    (function tick() {
      if (i < s.length) {
        c.before(document.createTextNode(s[i++]));
        setTimeout(tick, 32);
      }
    })();
  }

  // Surprise page reveal logic with instant mobile video initialization
  const b = document.getElementById("revealButton"),
    m = document.getElementById("hiddenMessage"),
    sw = document.getElementById("sketchWrapper"),
    v = document.getElementById("wishVideo");

  if (b && m) {
    b.onclick = () => {
      m.style.display = "block";
      m.classList.add("active");
      m.classList.add("show");
      if (sw) sw.classList.add("show");
      b.textContent = "A little more magic ✦";
      confetti();

      if (v) {
        v.load();
        v.muted = false;
        const playPromise = v.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Unmuted autoplay blocked, falling back to muted play:", error);
            v.muted = true;
            v.play();
          });
        }
      }
    };
  }

  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("show");
      }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((e) => io.observe(e));
  const mb = document.getElementById("musicButton");
  if (mb) mb.onclick = toggleSound;
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
  let b = document.getElementById("musicButton");
  if (b) {
    b.textContent = "♫";
    b.classList.add("playing");
  }
  let notes = [261.63, 329.63, 392, 523.25, 392, 329.63],
    i = 0;
  function beat() {
    if (!playing) return;
    let o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = notes[i++ % notes.length];
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.3);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(audioCtx.currentTime + 2.4);
    timer = setTimeout(beat, 700);
  }
  beat();
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
    let c = document.createElement("i");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 1.3 + "s";
    c.style.background = `hsl(${Math.random() * 360},70%,75%)`;
    document.body.append(c);
    setTimeout(() => c.remove(), 5000);
  }
}