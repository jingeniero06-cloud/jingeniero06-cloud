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

if (document.body.classList.contains("inner-page") && header) {
  header.classList.add("is-solid");
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
navToggle?.addEventListener("click", toggleNav);
nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
    closeLightbox();
    closeSubnavs();
  }
});

document.querySelectorAll("[data-subnav]").forEach((group) => {
  const btn = group.querySelector("[data-subnav-btn]");
  btn?.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = !group.classList.contains("is-open");
    closeSubnavs();
    group.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll("[data-nested-nav]").forEach((group) => {
  const btn = group.querySelector("[data-nested-btn]");
  btn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = !group.classList.contains("is-open");
    closeNestedNavs();
    group.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
});

function closeNestedNavs() {
  document.querySelectorAll("[data-nested-nav]").forEach((group) => {
    group.classList.remove("is-open");
    group.querySelector("[data-nested-btn]")?.setAttribute("aria-expanded", "false");
  });
}

function closeSubnavs() {
  closeNestedNavs();
  document.querySelectorAll("[data-subnav]").forEach((group) => {
    group.classList.remove("is-open");
    group.querySelector("[data-subnav-btn]")?.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-subnav]")) closeSubnavs();
});

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = `<button class="lightbox-close" type="button" data-lightbox-close>Close</button><img alt="" />`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector("img");

function openLightbox(img) {
  if (!lightboxImg) return;
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = img.alt || "";
  lightbox.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  if (!header?.classList.contains("is-open")) document.body.style.overflow = "";
}

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.closest("[data-lightbox-close]")) closeLightbox();
});

document.querySelectorAll(".work-media img, .ops-mix-card img, .work-thumbs img").forEach((img) => {
  img.addEventListener("click", () => openLightbox(img));
});

const revealTargets = document.querySelectorAll(".work-item, .system-item, .mega-stats, .mega-featured, .mega-directory, .ops-mix, .systems-visual, .about-portrait, .about-copy, .connect-panel, .case-card, .success-did");

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
  const exportEl = root.querySelector("[data-mega-export]");
  const sortBtns = root.querySelectorAll("[data-mega-sort]");

  let sites = [];
  let currentList = [];
  let sortKey = null;
  let sortDir = 1;

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

  function sortValue(site, key) {
    switch (key) {
      case "name":
        return (site.name || site.domain || "").toLowerCase();
      case "domain":
        return (site.domain || "").toLowerCase();
      case "customer": {
        const label = customerLabel(site);
        return label === "—" ? "" : label.toLowerCase();
      }
      case "batch":
        return Number(site.batch) || 0;
      case "platform":
        return platformLabel(site).toLowerCase();
      default:
        return "";
    }
  }

  function sortList(list) {
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va < vb) return -1 * sortDir;
      if (va > vb) return 1 * sortDir;
      return 0;
    });
  }

  function updateSortIndicators() {
    sortBtns.forEach((btn) => {
      const th = btn.closest("th");
      if (!th) return;
      if (btn.getAttribute("data-mega-sort") === sortKey) {
        th.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
      } else {
        th.setAttribute("aria-sort", "none");
      }
    });
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

    currentList = sortList(filtered);
    if (exportEl) exportEl.disabled = currentList.length === 0;
    render(currentList);
  }

  function csvCell(value) {
    const s = String(value ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv() {
    if (!currentList.length) return;
    const header = ["Site", "Domain", "Customer", "Batch", "Platform"];
    const lines = [header.map(csvCell).join(",")];
    currentList.forEach((site) => {
      const customer = customerLabel(site);
      lines.push(
        [
          site.name || site.domain || "",
          site.domain || "",
          customer === "—" ? "" : customer,
          site.batch || "",
          platformLabel(site),
        ]
          .map(csvCell)
          .join(",")
      );
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mega-inc-fleet.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-mega-sort");
      if (sortKey === key) {
        sortDir *= -1;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      updateSortIndicators();
      applyFilters();
    });
  });

  exportEl?.addEventListener("click", exportCsv);
})();
