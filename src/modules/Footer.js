import LinkAnimation from "@utils/LinkAnimation.js";
import { gsap, ScrollTrigger } from "@utils/GSAP.js";

gsap.registerPlugin(ScrollTrigger);

export default class Footer {
  constructor(instance, app, main) {
    this.instance = instance;
    this.app = app;
    this.main = main;

    this.clocks = this.instance.querySelectorAll(".footer_clock-item");
    this.clockLines = this.instance.querySelectorAll(".footer_clock-lines");
    this.app.observer.instance.observe(this.instance);

    this.hasAnimated = false;

    this.links = this.instance.querySelectorAll(".footer_link");
    // this.links.forEach((link) => new LinkAnimation(link, this.app));

    // Store clock data for later use
    this.clockData = [];

    this.clocks.forEach((clock, index) => {
      const city = clock.querySelector("[data-city]");
      const timeDiv = clock.querySelector("[data-time]");
      const clockLines = clock.querySelector(".footer_clock-lines");

      const timezoneMap = {
        London: "Europe/London",
        Bangkok: "Asia/Bangkok",
        Bucharest: "Europe/Bucharest",
      };

      const cityName = city.textContent.trim();
      const timezone = timezoneMap[cityName];

      if (timezone) {
        const { time, totalMinutes } = this.getTime(timezone);
        timeDiv.textContent = time;

        // Store data for scroll animation
        this.clockData.push({
          clock,
          timeDiv,
          timezone,
          finalTime: totalMinutes,
          clockLines,
        });

        // Initially set clock hands to 0 for animation
        clock.style.setProperty("--time", 0);

        const interval = setInterval(() => {
          if (this.instance.dataset.visible == "true" && this.hasAnimated) {
            const { time, totalMinutes } = this.getTime(timezone);
            timeDiv.textContent = time;
            clock.style.setProperty("--time", totalMinutes);
          }

          if (this.destroyed) clearInterval(interval);
        }, 10000);
      }
    });

    // Setup scroll trigger animation
    this.setupScrollAnimation();

    this.destroyed = false;
    this.app.on("destroy", () => this.destroy());
  }

  getTime(timezone) {
    const time = new Date().toLocaleString("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Parse hours and minutes
    const [hours, minutes] = time.split(":").map(Number);

    // Calculate rotations in degrees for analog watch
    const minuteRotation = minutes * 6; // 360° / 60 minutes = 6° per minute
    const totalMinutes = (hours % 12) * 30 + minutes * 0.5; // 30° per hour + minute adjustment

    return {
      time,
      minuteRotation,
      totalMinutes,
    };
  }

  setupScrollAnimation() {
    ScrollTrigger.create({
      trigger: this.instance,
      start: window.innerWidth < 992 ? "top+=20% 80%" : "top+=50% 80%",
      once: true,
      onEnter: () => {
        if (!this.hasAnimated) {
          this.animateClocks();
          this.hasAnimated = true;
        }
      },
    });
  }

  animateClocks() {
    this.clockData.forEach((clockInfo, index) => {
      const { clock, timeDiv, timezone, clockLines } = clockInfo;

      // Get current correct time
      const { time, totalMinutes } = this.getTime(timezone);
      timeDiv.textContent = time;

      // Create spinning animation that lands on correct time
      const spinAmount = 360 + totalMinutes; // 2 full rotations + final position

      gsap.to(clock, {
        "--time": spinAmount,
        duration: 1.6 + index * 0.3, // Stagger each clock
        ease: "power2.out",
        onComplete: () => {
          // Set to correct time after animation
          clock.style.setProperty("--time", totalMinutes);
        },
      });
    });
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
