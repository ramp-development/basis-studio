export const CheckPages = async (app, main) => {
  const container = main ? main : document.querySelector("main");
  const page = container.getAttribute("data-transition-page");

  // Prevent duplicate page loading
  if (app.pagesLoaded && app.pagesLoaded.has(page)) return app.page;

  // // Handle canvas z-index for case study pages
  // const canvasContainer = document.querySelector(".canvas-container");
  // if (canvasContainer) {
  //   // if (page === 'case-inner') {
  //   //     canvasContainer.style.zIndex = '2'
  //   //     canvasContainer.style.pointerEvents = 'none'
  //   // } else {
  //   // canvasContainer.style.zIndex = "-1";
  //   // }
  // }

  switch (page) {
    case "home": {
      const mod = await import("@pages/home");
      app.page = new mod.default(main, app);
      if (app.pagesLoaded) app.pagesLoaded.add(page);
      return app.page;
    }

    case "cases": {
      const mod = await import("@pages/cases");
      app.page = new mod.default(main, app);
      if (app.pagesLoaded) app.pagesLoaded.add(page);
      return app.page;
    }

    case "case-inner": {
      const mod = await import("@pages/case-inner");
      app.page = new mod.default(main, app);
      if (app.pagesLoaded) app.pagesLoaded.add(page);
      return app.page;
    }

    case "services": {
      const mod = await import("@pages/services");
      app.page = new mod.default(main, app);
      if (app.pagesLoaded) app.pagesLoaded.add(page);
      return app.page;
    }

    case "fintech": {
      const mod = await import("@pages/fintech");
      app.page = new mod.default(main, app);
      if (app.pagesLoaded) app.pagesLoaded.add(page);
      return app.page;
    }
  }
};
