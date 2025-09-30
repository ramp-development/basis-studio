export const caseTransition = (app, CheckPages) => {
  return {
    name: "case-transition",
    from: {
      namespace: ["home", "services", "cases", "fintech", "case-inner"],
    },
    to: {
      namespace: ["case-inner"],
    },
    async leave(data) {
      // Double-check that we're going TO a case study, not FROM one
      // const fromNamespace = data.current?.namespace
      const toNamespace = data.next?.namespace;

      if (toNamespace !== "case-inner") {
        return;
      }

      const done = this.async();
      const HomeToCase = await import("@transitions/HomeToCase.js");
      new HomeToCase.default(data, done, CheckPages, app);
    },
  };
};
