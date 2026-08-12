document.getElementById("year").textContent = String(new Date().getFullYear());

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-solid", window.scrollY > 48);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const revealTargets = document.querySelectorAll(
  ".reveal, .section-head, .proof-row"
);

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
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i * 0.04, 0.24)}s`;
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
