export const CheckPages = async (app, main) => {
  const container = main ? main : document.querySelector("main");
  const page = container.getAttribute("data-transition-page");

  // Prevent duplicate page loading
  if (app.pagesLoaded && app.pagesLoaded.has(page)) return app.page;

  const mod = await import(`@pages/${page}/index.js`);
  app.page = new mod.default(main, app);
  if (app.pagesLoaded) app.pagesLoaded.add(page);
  return app.page;
};
