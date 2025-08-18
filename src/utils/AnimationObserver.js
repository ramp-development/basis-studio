export default class AnimationObserver {
  constructor() {
    this.instance = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.dataset.animationVisible = entry.isIntersecting
            ? "true"
            : "false";
        });
      },
      {
        root: null,
        rootMargin: "-25% 0px 7.5% 0px",
      }
    );
  }
}
