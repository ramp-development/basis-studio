import App from "@app";

import Loader from "./Loader.js";

const app = App.getInstance();

export default class index {
  constructor(main) {
    this.main = main;

    this.once = false;

    this.triggerLoad = async () => this.load();
    if (app.onceLoaded) this.load();
  }

  load() {
    if (this.once) return;
    this.loader = new Loader(this.main);

    this.once = true;
  }
}
