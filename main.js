/* Vintage Vault — Field of Memories */

const IMG = "https://images.squarespace-cdn.com/content/v1/690228b440f75e406c0a7e07/";

/* ---------- The Vault: add a card by adding an entry here ----------
   year: leave null if unknown (the card still shows under "All").
   note: optional line printed on the back of the card.            */
const CARDS = [
  { player: "Willie Mays",      team: "San Francisco Giants", pos: "Center Field", year: 1961, set: "Topps All-Star",  img: IMG + "f228d1d3-bf9a-4a76-91f6-50f23e4bd96b/WillieMays_06.jpg" },
  { player: "Bill Mazeroski",   team: "Pittsburgh Pirates",   pos: "Second Base",  year: null, set: "Topps",           img: IMG + "2d2ae856-96a2-45b6-972f-ef17794bf2b4/BillMaxeroski.jpg" },
  { player: "Willie Mays",      team: "San Francisco Giants", pos: "Outfield",     year: 1963, set: "Topps",           img: IMG + "a82abdef-d7a1-42dd-9476-14cc61b49a22/4ukd1t45sfp4vv9t7f9uv7mkdu10.jpg" },
  { player: "Hank Aaron",       team: "Milwaukee Braves",     pos: "Outfield",     year: 1963, set: "Topps",           img: IMG + "2c2d5bf9-ca62-4d26-a8df-a70984cf1bac/1600.jpg" },
  { player: "Carl Yastrzemski", team: "Boston Red Sox",       pos: "Outfield",     year: 1970, set: "Topps",           img: IMG + "2a66f8c2-4b16-4047-8f0e-95a2a19d2f47/CarlYastrgenski.jpg" },
  { player: "1983 Highlight",   team: "Reds · Royals · Red Sox", pos: "Bench, Perry & Yastrzemski retire", year: 1984, set: "Topps Highlights", img: IMG + "445eb1cd-77f5-440f-94e4-87412d0c5c20/1983_Highlight.jpg" },
];
/* ---------- Loader cards ----------
   Images in Assets/Loading/ that tumble onto the pile, in order (last one lands on top).
   If this list is empty, the loader uses the Vault cards above. */
const LOADER_CARDS = [];

const src = (url, w) => url.startsWith("http") ? `${url}?format=${w}w` : url;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

/* ---------- Loader ---------- */
(function loader() {
  const el = $("#loader");
  if (!el) return;
  const finish = () => {
    if (el.classList.contains("done")) return;
    el.classList.add("done");
    document.body.classList.remove("is-loading");
    setTimeout(() => el.classList.add("gone"), 1000);
  };

  // Plays on every page load / refresh (skipped only for visitors who prefer reduced motion)
  if (reduceMotion) { el.classList.add("gone"); document.body.classList.remove("is-loading"); return; }

  const stack = $("#loaderStack");
  const STEP = 260;
  const pile = LOADER_CARDS.length ? LOADER_CARDS.map(f => ({ img: "Assets/Loading/" + f })) : CARDS;
  pile.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "loader-card";
    card.style.backgroundImage = `url("${src(c.img, 500)}")`;
    const r = (Math.random() * 24 - 12).toFixed(1);             // resting tilt
    const x = (Math.random() * 30 - 15).toFixed(0);             // resting offset
    const fx = (Math.random() * 400 - 200).toFixed(0);          // where it falls from
    const fr = (Math.random() * 160 - 80).toFixed(0);           // spin while falling
    card.style.cssText += `--r:${r}deg;--x:${x}px;--fx:${fx}px;--fr:${fr}deg;animation-delay:${i * STEP}ms;z-index:${i}`;
    stack.appendChild(card);
    setTimeout(() => {                                          // pile shudders on landing
      stack.classList.remove("thud"); void stack.offsetWidth; stack.classList.add("thud");
    }, i * STEP + 520);
  });

  const total = pile.length * STEP + 600;
  setTimeout(() => el.classList.add("show-word"), total - 200);
  setTimeout(finish, total + 1100);
  $("#loaderSkip").addEventListener("click", finish);
})();

/* ---------- Header ---------- */
const header = $(".site-header");
const onScroll = () => header.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const toggle = $(".menu-toggle"), nav = $("#nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
$$("#nav a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }));

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach(el => io.observe(el));

/* ---------- Hero book tilt ---------- */
const heroTilt = $("#heroTilt");
if (heroTilt && finePointer && !reduceMotion) {
  const hero = $(".hero");
  hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    heroTilt.style.transform = `rotateY(${-14 + px * 22}deg) rotateX(${4 - py * 14}deg) rotateZ(2deg)`;
  });
  hero.addEventListener("mouseleave", () => { heroTilt.style.transform = ""; });
}

/* ---------- Photo band parallax ---------- */
const bandImg = $("#bandImg");
if (bandImg && !reduceMotion) {
  const band = bandImg.parentElement;
  const move = () => {
    const r = band.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    bandImg.style.transform = `translateY(${p * -12 - 8}%)`;
  };
  addEventListener("scroll", move, { passive: true });
  move();
}

/* ---------- The Vault gallery ---------- */
(function vault() {
  const grid = $("#cardGrid");
  if (!grid) return;

  CARDS.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "vcard reveal";
    b.style.transitionDelay = `${(i % 4) * 80}ms`;
    b.dataset.index = i;
    b.dataset.decade = c.year ? `${Math.floor(c.year / 10) * 10}s` : "";
    b.setAttribute("aria-label", `${c.player}${c.year ? ", " + c.year : ""} ${c.set}. Open card.`);
    b.innerHTML = `
      <div class="face"><img src="${src(c.img, 500)}" alt="" loading="lazy"><div class="glare"></div></div>
      <div class="meta"><strong>${c.player}</strong><span>${c.year ?? ""}</span></div>`;
    grid.appendChild(b);
    io.observe(b);

    if (finePointer && !reduceMotion) {
      const face = $(".face", b);
      b.addEventListener("mousemove", e => {
        const r = face.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        face.style.setProperty("--ry", `${(px - 0.5) * 22}deg`);
        face.style.setProperty("--rx", `${(0.5 - py) * 22}deg`);
        face.style.setProperty("--gx", `${px * 100}%`);
        face.style.setProperty("--gy", `${py * 100}%`);
      });
      b.addEventListener("mouseleave", () => { face.style.setProperty("--rx", "0deg"); face.style.setProperty("--ry", "0deg"); });
    }
    b.addEventListener("click", () => openLB(i));
  });

  // Decade filters, built from whatever years are in CARDS
  const decades = [...new Set(CARDS.filter(c => c.year).map(c => `${Math.floor(c.year / 10) * 10}s`))].sort();
  const filters = $("#filters");
  ["All", ...decades].forEach((d, i) => {
    const f = document.createElement("button");
    f.type = "button";
    f.textContent = d;
    f.setAttribute("aria-pressed", i === 0);
    f.addEventListener("click", () => {
      $$("button", filters).forEach(x => x.setAttribute("aria-pressed", x === f));
      $$(".vcard", grid).forEach(card => card.classList.toggle("hide", d !== "All" && card.dataset.decade !== d));
    });
    filters.appendChild(f);
  });

  // Lightbox
  const lb = $("#lightbox"), flip = $("#lbFlip");
  let current = 0, lastFocus = null;

  function visibleIndexes() { return $$(".vcard:not(.hide)", grid).map(c => +c.dataset.index); }

  function fill(i) {
    const c = CARDS[i];
    current = i;
    flip.classList.remove("flipped");
    $("#lbImg").src = src(c.img, 750);
    $("#lbImg").alt = `${c.player} ${c.year ?? ""} ${c.set} card`;
    $("#lbKicker").textContent = [c.year, c.set].filter(Boolean).join(" · ");
    $("#lbName").textContent = c.player;
    $("#lbSub").textContent = `${c.team} — ${c.pos}`;
    $("#lbBack").innerHTML = `
      <div class="cb-top"><h4>${c.player}</h4><span class="cb-no">${String(i + 1).padStart(2, "0")}</span></div>
      <dl>
        <dt>Team</dt><dd>${c.team}</dd>
        <dt>Position</dt><dd>${c.pos}</dd>
        <dt>Year</dt><dd>${c.year ?? "—"}</dd>
        <dt>Set</dt><dd>${c.set}</dd>
      </dl>
      <p class="cb-note">${c.note ?? "From the shoeboxes of the Vintage Vault collection."}</p>
      <p class="cb-brand">Vintage Vault · Field of Memories</p>`;
  }

  function openLB(i) {
    lastFocus = document.activeElement;
    fill(i);
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add("open"));
    document.body.style.overflow = "hidden";
    flip.focus();
  }
  function closeLB() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { lb.hidden = true; }, 350);
    lastFocus && lastFocus.focus();
  }
  function step(dir) {
    const list = visibleIndexes();
    const pos = list.indexOf(current);
    fill(list[(pos + dir + list.length) % list.length]);
  }

  flip.addEventListener("click", () => flip.classList.toggle("flipped"));
  $("#lbClose").addEventListener("click", closeLB);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
  addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();

/* ---------- Forms (preview only until connected to a real service) ---------- */
$$("form[data-demo-form]").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const msg = form.parentElement.querySelector(".form-msg");
    if (msg) msg.textContent = form.dataset.success || "You’re on the list — thanks for joining!";
    form.reset();
  });
});

/* Placeholder social links */
$$("a[data-todo]").forEach(a => a.addEventListener("click", e => e.preventDefault()));

$$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- Rick's baseball card ---------- */
(function rickCard() {
  const card = $("#rickCard");
  if (!card) return;
  const inner = $(".rc-inner", card);
  card.addEventListener("click", () => card.classList.toggle("flipped"));
  if (!finePointer || reduceMotion) return;
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    inner.style.setProperty("--ry", `${(px - 0.5) * (card.classList.contains("flipped") ? -18 : 18)}deg`);
    inner.style.setProperty("--rx", `${(0.5 - py) * 18}deg`);
    card.style.setProperty("--gx", `${px * 100}%`);
    card.style.setProperty("--gy", `${py * 100}%`);
  });
  card.addEventListener("mouseleave", () => { inner.style.setProperty("--rx", "0deg"); inner.style.setProperty("--ry", "0deg"); });
})();
