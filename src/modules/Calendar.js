import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

export default class Calendar
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app
        this.destroyed = false

        // Check if Cal.com script is already loaded
        this.calLoaded = false
        this.calNamespace = this.generateNamespace() // Generate unique namespace for each instance
        this.calendarId = `my-cal-inline-${Math.random().toString(36).substr(2, 9)}`

        // Get configuration from data attributes
        this.config = this.getConfigFromAttributes()

        this.init()
        this.app.on('destroy', () => this.destroy())
        this.app.on('resize', () => this.resize())
    }

    generateNamespace()
    {
        return `cal_${Math.random().toString(36).substr(2, 9)}`
    }

    getConfigFromAttributes()
    {
        return {
            calLink: this.instance.dataset.calLink || 'stabondar/secret',
            theme: this.instance.dataset.theme || 'dark',
            layout: this.instance.dataset.layout || 'month_view',
            hideEventTypeDetails: this.instance.dataset.hideEventTypeDetails !== 'true'
        }
    }

    init()
    {
        // Create the calendar container
        this.createCalendarContainer()

        // Load Cal.com if not already loaded
        this.loadCalScript()
    }

    createCalendarContainer()
    {
        // Clear any existing content
        this.instance.innerHTML = ''

        // Create the calendar container div
        this.calendarDiv = document.createElement('div')
        this.calendarDiv.id = this.calendarId
        this.calendarDiv.style.width = '100%'
        this.calendarDiv.style.height = '100%'
        this.calendarDiv.style.overflow = 'scroll'

        this.instance.appendChild(this.calendarDiv)
    }

    loadCalScript()
    {
        // Check if Cal is already available globally
        if (window.Cal) {
            this.initCalendar()
            return
        }

        // Prevent multiple script loads
        if (window.calScriptLoading) {
            // Wait for existing script to load
            const checkCal = () => {
                if (window.Cal) {
                    this.initCalendar()
                } else {
                    setTimeout(checkCal, 100)
                }
            }
            checkCal()
            return
        }

        window.calScriptLoading = true

        // Create and load the Cal.com script only once
        const existingScript = document.querySelector('script[src*="cal.com/embed/embed.js"]')
        if (existingScript) {
            this.initCalendar()
            return
        }

        // Initialize Cal.com loader function
        this.initCalLoader()

        // Wait for Cal to be available
        const checkCal = () => {
            if (window.Cal) {
                window.calScriptLoading = false
                this.initCalendar()
            } else {
                setTimeout(checkCal, 100)
            }
        }
        checkCal()
    }

    initCalLoader()
    {
        // Only initialize if not already done
        if (window.Cal) return

        // Cal.com initialization code (runs once globally)
        (function (C, A, L) {
            let p = function (a, ar) { a.q.push(ar); };
            let d = C.document;
            C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];
                    d.head.appendChild(d.createElement("script")).src = A;
                    cal.loaded = true;
                }
                if (ar[0] === L) {
                    const api = function () { p(api, arguments); };
                    const namespace = ar[1];
                    api.q = api.q || [];
                    if(typeof namespace === "string"){
                        cal.ns[namespace] = cal.ns[namespace] || api;
                        p(cal.ns[namespace], ar);
                        p(cal, ["initNamespace", namespace]);
                    } else p(cal, ar);
                    return;
                }
                p(cal, ar);
            };
        })(window, "https://app.cal.com/embed/embed.js", "init")
    }

    initCalendar()
    {
        if (!window.Cal) {
            console.error('Cal.com script not loaded')
            return
        }

        if (this.destroyed) {
            return // Don't initialize if already destroyed
        }

        try {
            // Initialize Cal.com with unique namespace
            window.Cal("init", this.calNamespace, {origin:"https://cal.com"})

            // Wait a bit for Cal to be fully initialized
            setTimeout(() => {
                if (this.destroyed) return // Check again after timeout

                // Configure the inline calendar
                window.Cal.ns[this.calNamespace]("inline", {
                    elementOrSelector: `#${this.calendarId}`,
                    config: {
                        "layout": this.config.layout,
                        "theme": this.config.theme
                    },
                    calLink: this.config.calLink,
                })

                // Set UI theme
                window.Cal.ns[this.calNamespace]("ui", {
                    "theme": this.config.theme,
                    "hideEventTypeDetails": this.config.hideEventTypeDetails,
                    "layout": this.config.layout
                })

                // Store reference for cleanup
                this.calInstance = window.Cal.ns[this.calNamespace]

                // Trigger any custom events
                this.onCalendarLoaded()
            }, 200) // Increased timeout for better reliability

        } catch (error) {
            console.error('Error initializing Cal.com calendar:', error)
        }
    }

    onCalendarLoaded()
    {
        // Add any custom logic after calendar is loaded
        // console.log('Cal.com calendar loaded successfully')

        // You can trigger custom events here if needed
        // this.app.trigger('calendarLoaded')
        setTimeout(() => ScrollTrigger.refresh(), 100) // Refresh ScrollTrigger if needed
    }

    // Method to update calendar configuration
    updateConfig(config)
    {
        if (!this.calInstance) {
            console.warn('Calendar not initialized yet')
            return
        }

        try {
            this.calInstance("ui", config)
        } catch (error) {
            console.error('Error updating calendar config:', error)
        }
    }

    // Method to change theme
    setTheme(theme = 'dark')
    {
        this.config.theme = theme
        this.updateConfig({
            "theme": theme,
            "hideEventTypeDetails": this.config.hideEventTypeDetails,
            "layout": this.config.layout
        })
    }

    // Resize handler for responsive behavior
    resize()
    {
        if (this.destroyed || !this.calInstance) return

        // Re-trigger calendar resize if needed
        setTimeout(() => {
            if (this.calInstance && !this.destroyed) {
                try {
                    // Force calendar to recalculate dimensions
                    this.calInstance("ui", {
                        "theme": this.config.theme,
                        "hideEventTypeDetails": this.config.hideEventTypeDetails,
                        "layout": this.config.layout
                    })
                } catch (error) {
                    console.error('Error resizing calendar:', error)
                }
            }
        }, 100)
    }

    destroy()
    {
        if (this.destroyed) return

        this.destroyed = true

        // Clean up the calendar instance
        if (this.calendarDiv) {
            this.calendarDiv.innerHTML = ''
        }

        // Clean up Cal.com namespace
        if (window.Cal && window.Cal.ns && window.Cal.ns[this.calNamespace]) {
            try {
                // Attempt to clean up the namespace
                delete window.Cal.ns[this.calNamespace]
            } catch (error) {
                console.warn('Could not clean up Cal.com namespace:', error)
            }
        }

        this.calInstance = null
    }
}