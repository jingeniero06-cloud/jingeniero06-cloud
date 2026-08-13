document.getElementById("year").textContent = String(new Date().getFullYear());

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-solid", window.scrollY > 48);
}

function closeNav() {
  if (!header || !navToggle) return;
  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
  document.body.style.overflow = "";
}

function toggleNav() {
  if (!header || !navToggle) return;
  const open = !header.classList.contains("is-open");
  header.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
navToggle?.addEventListener("click", toggleNav);
nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

const revealTargets = document.querySelectorAll(".reveal, .work-item, .system-item, .mega-stats, .mega-featured, .mega-directory");

if (!prefersReduced && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i * 0.03, 0.18)}s`;
    observer.observe(el);
  });
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

if (!prefersReduced) {
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg) {
    window.addEventListener(
      "scroll",
      () => {
        const y = Math.min(window.scrollY, 500);
        heroBg.style.transform = `scale(${1 + y * 0.00008}) translateY(${y * 0.12}px)`;
      },
      { passive: true }
    );
  }
}

/* Mega Inc. fleet directory */
(function initMegaDirectory() {
  const root = document.querySelector("[data-mega-directory]");
  if (!root) return;

  const tbody = root.querySelector("[data-mega-tbody]");
  const countEl = root.querySelector("[data-mega-count]");
  const searchEl = root.querySelector("[data-mega-search]");
  const platformEl = root.querySelector("[data-mega-platform]");
  const batchEl = root.querySelector("[data-mega-batch]");

  let sites = [];

  function platformKey(site) {
    const p = `${site.platform} ${site.status}`.toLowerCase();
    if (p.includes("static")) return "static";
    if (p.includes("wordpress")) return "wordpress";
    return "other";
  }

  function platformLabel(site) {
    const key = platformKey(site);
    if (key === "static") return "Appex Static";
    if (key === "wordpress") return "WordPress";
    return site.platform || "Other";
  }

  function customerLabel(site) {
    const c = (site.customer || "").trim();
    if (!c || c === "0") return "—";
    return c;
  }

  function render(list) {
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5">No sites match your filters.</td></tr>`;
      if (countEl) countEl.textContent = "Showing 0 of " + sites.length + " domains";
      return;
    }

    const rows = list
      .map((site) => {
        const key = platformKey(site);
        const badgeClass = key === "static" ? "mega-badge is-static" : "mega-badge";
        const href = site.url || `https://${site.domain}/`;
        return `<tr>
          <td><a href="${href}" target="_blank" rel="noopener noreferrer">${site.name || site.domain}</a></td>
          <td class="domain">${site.domain}</td>
          <td>${customerLabel(site)}</td>
          <td>${site.batch || "—"}</td>
          <td><span class="${badgeClass}">${platformLabel(site)}</span></td>
        </tr>`;
      })
      .join("");

    tbody.innerHTML = rows;
    if (countEl) {
      countEl.textContent = `Showing ${list.length.toLocaleString()} of ${sites.length.toLocaleString()} domains`;
    }
  }

  function applyFilters() {
    const q = (searchEl?.value || "").trim().toLowerCase();
    const platform = platformEl?.value || "all";
    const batch = batchEl?.value || "all";

    const filtered = sites.filter((site) => {
      if (platform !== "all" && platformKey(site) !== platform) return false;
      if (batch !== "all" && String(site.batch) !== batch) return false;
      if (!q) return true;
      const hay = `${site.name} ${site.domain} ${site.customer} ${site.platform}`.toLowerCase();
      return hay.includes(q);
    });

    render(filtered);
  }

  fetch("assets/mega-ai-sites.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load fleet inventory");
      return res.json();
    })
    .then((data) => {
      sites = Array.isArray(data.sites) ? data.sites : [];
      applyFilters();
    })
    .catch(() => {
      if (tbody) tbody.innerHTML = `<tr><td colspan="5">Could not load Mega Inc. fleet inventory.</td></tr>`;
      if (countEl) countEl.textContent = "Fleet inventory unavailable";
    });

  searchEl?.addEventListener("input", applyFilters);
  platformEl?.addEventListener("change", applyFilters);
  batchEl?.addEventListener("change", applyFilters);
})();
