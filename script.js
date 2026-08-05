document.getElementById("year").textContent = String(new Date().getFullYear());

const revealTargets = document.querySelectorAll(
  ".expertise-item, .case, .portfolio-panel, .connect-inner, .trust-list"
);

if ("IntersectionObserver" in window) {
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

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

const style = document.createElement("style");
style.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal.is-visible {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
`;
document.head.appendChild(style);
