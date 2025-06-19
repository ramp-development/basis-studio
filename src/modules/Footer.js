export default class Footer
{
    constructor(instance, app, main)
    {
        this.instance = instance
        this.app = app
        this.main = main

        this.clocks = this.instance.querySelectorAll('.footer_clock-item')
        this.app.observer.instance.observe(this.instance)

        this.clocks.forEach(clock =>
        {
            const city = clock.querySelector('[data-city]')
            const timeDiv = clock.querySelector('[data-time]')

            const timezoneMap =
            {
                'London': 'Europe/London',
                'Bangkok': 'Asia/Bangkok',
                'Bucharest': 'Europe/Bucharest'
            }

            const cityName = city.textContent.trim()
            const timezone = timezoneMap[cityName]

            if(timezone)
            {
                const { time, totalMinutes } = this.getTime(timezone)
                timeDiv.textContent = time
                clock.style.setProperty('--time', totalMinutes)

                const interval =  setInterval(() =>
                {
                    if(this.instance.dataset.visible == 'true')
                    {
                        const { time, totalMinutes } = this.getTime(timezone)
                        timeDiv.textContent = time
                        clock.style.setProperty('--time', totalMinutes)
                    }

                    if(this.destroyed) clearInterval(interval)
                }, 10000)
            }
        })

        this.destroyed = false
        this.app.on('destroy', () => this.destroy())
    }

    getTime(timezone)
    {
        const time = new Date().toLocaleString('en-US',
        {
            timeZone: timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        })

        // Parse hours and minutes
        const [hours, minutes] = time.split(':').map(Number)

        // Calculate rotations in degrees for analog watch
        const minuteRotation = minutes * 6  // 360° / 60 minutes = 6° per minute
        const totalMinutes = (hours % 12) * 30 + minutes * 0.5  // 30° per hour + minute adjustment

        return {
            time,
            minuteRotation,
            totalMinutes
        }
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}