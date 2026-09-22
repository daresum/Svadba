(function () {
  const cfg = window.SVADBA;
  if (!cfg) return;

  const state = {
    lang: localStorage.getItem("svadba-lang") || cfg.defaultLang || "en",
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function deepGet(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  function pickLang(value) {
    if (value && typeof value === "object" && (value.en || value.mk)) {
      return value[state.lang] || value.en || "";
    }
    return value == null ? "" : String(value);
  }

  function t(key) {
    return deepGet(cfg.i18n[state.lang] || cfg.i18n.en, key) || deepGet(cfg.i18n.en, key) || "";
  }

  function dateDisplay() {
    const custom = t("dateLong");
    if (custom) return custom;
    const date = new Date(cfg.date.iso);
    try {
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (err) {
      return date.toDateString();
    }
  }

  function timeDisplay() {
    const date = new Date(cfg.date.iso);
    try {
      return new Intl.DateTimeFormat(state.lang === "mk" ? "mk-MK" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch (err) {
      return "";
    }
  }

  const bindFns = {
    dateDisplay,
    timeDisplay,
    venueName: () => pickLang(cfg.venue.name),
    venueAddress: () => pickLang(cfg.venue.address),
  };

  function applyCopy() {
    document.documentElement.lang = state.lang === "mk" ? "mk" : "en";
    document.title = t("metaTitle");

    $$("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    $$("[data-bind]").forEach((el) => {
      const value = deepGet(cfg, el.getAttribute("data-bind"));
      if (value != null) el.textContent = pickLang(value);
    });

    $$("[data-bind-i18n]").forEach((el) => {
      const fn = bindFns[el.getAttribute("data-bind-i18n")];
      if (fn) el.textContent = fn();
    });

    $$("[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === state.lang ? "true" : "false");
    });
  }

  function setLang(lang) {
    state.lang = lang;
    localStorage.setItem("svadba-lang", lang);
    applyCopy();
  }

  $$("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
  });

  const mapsLink = $("#maps-link");
  if (mapsLink) {
    mapsLink.href = cfg.venue.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${cfg.venue.lat},${cfg.venue.lng}`;
  }

  const photo = $("#us-photo");
  const img = $("#us-img");
  if (photo && img && cfg.photo) {
    const showPhoto = () => {
      photo.classList.remove("is-empty");
      img.hidden = false;
    };
    const hidePhoto = () => {
      photo.classList.add("is-empty");
      img.hidden = true;
    };
    img.addEventListener("load", showPhoto);
    img.addEventListener("error", hidePhoto);
    img.src = cfg.photo;
  }

  const form = $("#rsvp-form");
  const errorEl = $("#form-error");
  const submitBtn = $("#submit-btn");

  function payloadFromForm() {
    const data = new FormData(form);
    return {
      attending: data.get("attending"),
      name: String(data.get("name") || "").trim(),
      song: String(data.get("song") || "").trim(),
    };
  }

  function submitGoogleForm(payload) {
    const action = (cfg.rsvp.googleFormAction || "").trim();
    if (!action) return Promise.reject(new Error("missing form"));

    const attendingValue = cfg.rsvp.attendingValues[payload.attending] || payload.attending;
    const body = new URLSearchParams();
    body.set(cfg.rsvp.attendingEntry, attendingValue);
    body.set(cfg.rsvp.nameEntry, payload.name);
    body.set(cfg.rsvp.songEntry, payload.song);

    const iframe = document.createElement("iframe");
    iframe.name = "svadba-gform";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.display = "none";

    const post = document.createElement("form");
    post.action = action;
    post.method = "POST";
    post.target = "svadba-gform";
    post.acceptCharset = "UTF-8";
    post.style.display = "none";
    body.forEach((value, name) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      post.appendChild(input);
    });

    return new Promise((resolve, reject) => {
      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        iframe.remove();
        post.remove();
        ok ? resolve() : reject(new Error("form"));
      };

      let submitted = false;
      iframe.addEventListener("load", () => {
        if (submitted) done(true);
      });
      document.body.append(iframe, post);
      try {
        post.submit();
        submitted = true;
        setTimeout(() => done(true), 1600);
      } catch (err) {
        done(false);
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const payload = payloadFromForm();
    if (!payload.attending || !payload.name) {
      errorEl.textContent = t("rsvp.required");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("rsvp.sending");

    try {
      await submitGoogleForm(payload);
      form.hidden = true;
      $("#rsvp-success").hidden = false;
      $("#success-copy").textContent =
        payload.attending === "yes" ? t("rsvp.successYes") : t("rsvp.successNo");
    } catch (err) {
      errorEl.textContent = t("rsvp.error");
      submitBtn.disabled = false;
      submitBtn.textContent = t("rsvp.submit");
    }
  });

  applyCopy();

  /* Disco balls + sparkles */
  (function glitter() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = $("#disco-layer");
    const srcs = ["assets/images/disco-1.png", "assets/images/disco-2.png"];

    function scatterBalls() {
      if (!layer) return;
      layer.innerHTML = "";
      const tall = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      layer.style.height = tall + "px";
      const narrow = window.innerWidth < 700;
      const spots = narrow
        ? [
            { top: 1.5, side: "left", inset: 2, size: 72 },
            { top: 10, side: "right", inset: 1, size: 58 },
            { top: 24, side: "left", inset: 0, size: 64 },
            { top: 88, side: "right", inset: 2, size: 70 },
            { top: 93, side: "left", inset: 4, size: 54 },
          ]
        : [
            { top: 3, side: "left", inset: 3, size: 92 },
            { top: 8, side: "right", inset: 4, size: 70 },
            { top: 22, side: "left", inset: 1, size: 78 },
            { top: 28, side: "right", inset: 2, size: 110 },
            { top: 48, side: "left", inset: 2, size: 128 },
            { top: 52, side: "right", inset: 1, size: 96 },
            { top: 70, side: "left", inset: 5, size: 84 },
            { top: 78, side: "right", inset: 3, size: 72 },
            { top: 90, side: "left", inset: 2, size: 100 },
          ];
      spots.forEach((spot, i) => {
        const wrap = document.createElement("div");
        wrap.className = "disco-ball";
        const img = document.createElement("img");
        img.src = srcs[i % srcs.length];
        img.alt = "";
        wrap.appendChild(img);
        wrap.style.width = spot.size + Math.random() * 12 - 4 + "px";
        wrap.style.top = spot.top + Math.random() * 2 + "%";
        wrap.style[spot.side] = spot.inset + "%";
        wrap.style.animationDelay = -Math.random() * 8 + "s, " + -Math.random() * 3 + "s";
        wrap.style.opacity = String(0.82 + Math.random() * 0.18);
        layer.appendChild(wrap);
      });
    }
    scatterBalls();
    window.addEventListener("resize", scatterBalls);

    const canvas = document.createElement("canvas");
    canvas.className = "sparkles";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const particles = [];
    const colors = ["#fff6e4", "#ffd9a0", "#ffe3ea", "#ffffff", "#ffc9c9"];
    let lastSpawn = 0;
    let dpr = 1;
    let ambientAcc = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(x, y, kind) {
      let n = 1;
      let sizeMin = 2.4;
      let sizeRange = 4;
      let speedBase = 0.08;
      let speedRange = 0.35;
      let decayMin = 0.008;
      let decayRange = 0.012;
      if (kind === "mouse") {
        n = 3 + ((Math.random() * 2) | 0);
        sizeMin = 9;
        sizeRange = 14;
        speedBase = 0.25;
        speedRange = 1.1;
        decayMin = 0.012;
        decayRange = 0.018;
      } else if (kind === "burst") {
        n = 14;
        sizeMin = 10;
        sizeRange = 16;
        speedBase = 0.8;
        speedRange = 1.8;
        decayMin = 0.016;
        decayRange = 0.02;
      }
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = speedBase + Math.random() * speedRange;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (kind === "ambient" ? 0.08 : 0.4),
          life: 1,
          decay: decayMin + Math.random() * decayRange,
          size: sizeMin + Math.random() * sizeRange,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.2,
          color: colors[(Math.random() * colors.length) | 0],
        });
      }
      if (particles.length > 220) particles.splice(0, particles.length - 220);
    }

    function drawStar(p) {
      const s = p.size * dpr;
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(0, s);
        ctx.lineTo(s * 0.22, s * 0.22);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ambientAcc += 1;
      if (ambientAcc % 2 === 0) {
        spawn(Math.random() * window.innerWidth, Math.random() * window.innerHeight, "ambient");
        if (Math.random() < 0.35) {
          spawn(Math.random() * window.innerWidth, Math.random() * window.innerHeight, "ambient");
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012;
        p.rot += p.spin;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
        else drawStar(p);
      }
      requestAnimationFrame(tick);
    }
    tick();

    function pointFrom(e) {
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    function onMove(e) {
      const now = performance.now();
      if (now - lastSpawn < 18) return;
      lastSpawn = now;
      const pt = pointFrom(e);
      spawn(pt.x, pt.y, "mouse");
    }

    function onDown(e) {
      const pt = pointFrom(e);
      spawn(pt.x, pt.y, "burst");
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
  })();
})();
