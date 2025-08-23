export const CheckPages = async (app, main) => {
  const container = main ? main : document.querySelector("main");
  const page = container.getAttribute("data-transition-page");

  // Handle canvas z-index for case study pages
  const canvasContainer = document.querySelector(".canvas-container");
  if (canvasContainer) {
    // if (page === 'case-inner') {
    //     canvasContainer.style.zIndex = '2'
    //     canvasContainer.style.pointerEvents = 'none'
    // } else {
    // canvasContainer.style.zIndex = "-1";
    // }
  }

  switch (page) {
    case "home": {
      const mod = await import("@pages/home");
      return (app.page = new mod.default(main, app));
    }

    case "cases": {
      const mod = await import("@pages/cases");
      return (app.page = new mod.default(main, app));
    }

    case "case-inner": {
      const mod = await import("@pages/case-inner");
      return (app.page = new mod.default(main, app));
    }

    case "services": {
      const mod = await import("@pages/services");
      return (app.page = new mod.default(main, app));
    }

    case "fintech": {
      const mod = await import("@pages/fintech");
      return (app.page = new mod.default(main, app));
    }
  }
};
