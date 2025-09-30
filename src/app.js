import "./css/style.scss";
import barba from "@barba/core";
import barbaPrefetch from "@barba/prefetch";
import EventEmitter from "@utils/EventEmitter.js";
import { RestartWebflow } from "@utils/RestartWebflow.js";
import { defaultTransition } from "@transitions/schema/defaultTransition.js";
import { caseTransition } from "@transitions/schema/caseTransition.js";
import { CheckPages } from "@transitions/CheckPages.js";
import FontFaceObserver from "fontfaceobserver";

let instance = null;

export default class App extends EventEmitter {
  constructor() {
    super();

    this.initialized = false;
    this.pagesLoaded = new Set();

    history.scrollRestoration = "manual";

    this.font = new FontFaceObserver("Saans");
    this.font.load(null, 8000).then(
      () => this.init(),
      () => this.init()
    );
  }

  static getInstance() {
    if (!instance) {
      instance = new App();
    }
    return instance;
  }

  init() {
    barba.use(barbaPrefetch);

    barba.init({
      schema: {
        prefix: "data-transition",
        namespace: "page",
      },
      debug: true,
      timeout: 7000,
      prevent: ({ el, event }) => {
        if (event.type == "click") {
          event.preventDefault();
          event.stopPropagation();

          if (el.classList.contains("go")) window.location = el.href;

          if (el.classList.contains("prevent")) return true;
          if (el.href.includes("#")) return true;
        }
      },
      transitions: [
        {
          name: "once",
          once: ({ next }) => this.onceLoad(next),
        },
        caseTransition(this, CheckPages),
        defaultTransition("transition", this, CheckPages),
        defaultTransition("self", this, CheckPages),
      ],
    });

    barba.hooks.enter(async (data) => {
      // Clear loaded pages on navigation to allow reloading when returning
      if (this.pagesLoaded) {
        this.pagesLoaded.clear();
      }

      // Restart Webflow BEFORE loading modules and content
      await RestartWebflow();
    });
  }

  async loadMainComponentsOnce(main) {
    const app = App.getInstance();
    console.trace("loadMainComponentsOnce", {
      app: app,
      main,
    });
    if (app.initialized) {
      console.warn(
        "App already initialized, skipping duplicate initialization"
      );
      return;
    }

    app.initialized = true;
    app.onceLoaded = false;
    app.moduleLoaded = false;

    const [
      Scroll,
      Sizes,
      Time,
      ModuleLoader,
      Observer,
      AnimationObserver,
      Debug,
      GL,
      Nav,
    ] = await Promise.all([
      import("@utils/Scroll.js"),
      import("@utils/Sizes.js"),
      import("@utils/Tick.js"),
      import("@utils/ModuleLoader.js"),
      import("@utils/Observer.js"),
      import("@utils/AnimationObserver.js"),
      import("@utils/Debug.js"),
      import("@gl/GL.js"),
      import("@utils/Nav.js"),
    ]);

    app.scroll = new Scroll.default();
    app.sizes = new Sizes.default();
    app.tick = new Time.default();
    app.moduleLoader = new ModuleLoader.default(app);
    app.observer = new Observer.default();
    app.animationObserver = new AnimationObserver.default();
    app.debug = new Debug.default();
    app.nav = new Nav.default();

    await CheckPages(app, main);
    app.gl = new GL.default(document.querySelector(".canvas"), app, main);
    await app.moduleLoader.loadModules(main);

    app.moduleLoader.on("loaded", () => {
      app.trigger("modulesLoaded");
      app.moduleLoaded = true;
    });
    app.sizes.on("resize", () => app.trigger("resize"));
    app.tick.on("tick", () => app.trigger("tick"));
  }

  async onceLoad(next) {
    this.once = await import("@transitions/GlobalLoader.js").then(
      (module) => new module.default(next, this.loadMainComponentsOnce, this)
    );
  }
}
