import { gsap } from "@utils/GSAP.js";
import BaseAnimation from "@utils/BaseAnimation.js";

export default class Footer extends BaseAnimation {
  constructor(instance, app, main) {
    super(instance, app);
    this.main = main;

    this.init();
  }

  init() {
    this.clocks = this.instance.querySelectorAll(".footer_clock-item");
    this.clockLines = this.instance.querySelectorAll(".footer_clock-lines");

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
        // Store data for animation
        this.clockData.push({
          clock,
          timeDiv,
          timezone,
          clockLines,
        });

        // Initially set clock hands to 0 for animation
        clock.style.setProperty("--time", 0);
      }
    });

    // Start continuous time updates regardless of visibility
    this.startTimeUpdates();
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

  startTimeUpdates() {
    // Update time continuously, regardless of visibility
    const updateTime = () => {
      this.clockData.forEach((clockInfo) => {
        const { timeDiv, timezone, clock } = clockInfo;
        const { time, totalMinutes } = this.getTime(timezone);

        timeDiv.textContent = time;

        // Only update clock hands if already animated
        if (this.hasAnimated) {
          clock.style.setProperty("--time", totalMinutes);
        }
      });
    };

    // Initial time update
    updateTime();

    // Update every 10 seconds
    const interval = setInterval(() => {
      updateTime();
      if (this.destroyed) clearInterval(interval);
    }, 10000);
  }

  animateIn() {
    if (!this.hasAnimated) {
      this.animateClocks();
    }
    super.animateIn();
  }

  animateOut() {
    // Do nothing on animate out since reAnimate = false
    super.animateOut();
  }

  animateClocks() {
    this.clockData.forEach((clockInfo, index) => {
      const { clock, timezone } = clockInfo;

      // Get current correct time
      const { totalMinutes } = this.getTime(timezone);

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
    this.destroyed = true;
    super.destroy();
  }
}
