import EventEmitter from "./EventEmitter.js";

export default class ModuleLoader extends EventEmitter {
  constructor(app) {
    super();

    this.app = app;
    this.loadedModules = new WeakMap();
  }

  async loadModules(main) {
    try {
      const test = await import("./PageScrollProgress.js").then(
        (module) => new module.default(main, this.app)
      );

      const elements = main.querySelectorAll("[data-module]");

      if (elements.length < 1) return;
      let count = 0;
      let loaded = false;

      elements.forEach(async (element, index) => {
        // Check if modules already loaded for this element
        if (this.loadedModules.has(element)) {
          count++;
          if (count === elements.length && !loaded) {
            loaded = true;
            this.trigger("loaded");
          }
          return;
        }

        const moduleName = element.getAttribute("data-module");
        const moduleSet = new Set();

        const values = moduleName.split(" ");
        for (const value of values) {
          if (value === "" || value === " ") {
            count++;
            if (count === elements.length && !loaded) {
              loaded = true;
              this.trigger("loaded");
            }
            return;
          }

          try {
            const module = await import(`@modules/${value}.js`);
            const moduleInstance = new module.default(element, this.app, main);
            moduleSet.add(moduleInstance);

            count++;
            if (count === elements.length && !loaded) {
              loaded = true;
              this.trigger("loaded");
            }
          } catch (importError) {
            console.warn(`❌ ModuleLoader: Failed to load module "${value}": ${importError.message}`);
            
            // Still increment count so loading doesn't hang
            count++;
            if (count === elements.length && !loaded) {
              loaded = true;
              this.trigger("loaded");
            }
          }
        }

        // Mark element as having modules loaded
        if (moduleSet.size > 0) {
          this.loadedModules.set(element, moduleSet);
        }
      });
    } catch (error) {
      console.warn(`❌ ModuleLoader: Error loading modules: ${error.message}`);
    }
  }
}
