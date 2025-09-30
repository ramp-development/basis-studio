import App from "@app";

import Loader from "./Loader.js";
import Hero from "./Hero.js";

const app = App.getInstance();

export default class index {
  constructor(main) {
    this.main = main;
    this.once = false;

    this.triggerLoad = async () => this.load();
    if (app.onceLoaded) this.load();
  }

  load() {
    this.loader = new Loader(this.main);
    this.hero = new Hero(this.main);

    this.once = true;
  }
}
