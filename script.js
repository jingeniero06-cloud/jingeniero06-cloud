document.getElementById("year").textContent = String(new Date().getFullYear());

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealTargets = document.querySelectorAll(
  ".expertise-item, .project-card, .portfolio-panel, .connect-inner, .trust-list, .section-head"
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
    { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i * 0.05, 0.28)}s`;
    observer.observe(el);
  });
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}
