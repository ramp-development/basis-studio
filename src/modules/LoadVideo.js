export default class LoadVideo {
  constructor(instance) {
    if (window.innerWidth > 992 && !instance.hasAttribute("data-hard-load"))
      return;

    const video = instance.querySelector("video") || instance;

    const source = video.querySelector("source");
    const url = source.dataset.src;

    source.setAttribute("src", url);
    video.load();
    video.addEventListener("loadeddata", () => {
      video.play();
      video.classList.add("loaded");
    });
  }
}
