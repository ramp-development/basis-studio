import { gsap, ScrollTrigger } from '@utils/GSAP.js'
import { LoadImages } from '@utils/LoadImages.js'

export default class Marquee
{
    constructor(instance, app, main)
    {
        this.instance = instance
        this.app = app
        this.main = main
        this.scroll = this.app.scroll.lenis
        this.observer = this.app.observer.instance

        this.destroyed = false

        this.multiDirection = this.instance.dataset.direction === '1' ? 1 : -1
        this.direction = 1 * this.multiDirection
        this.prevDirection = this.direction
        this.velocity = { value: 0 }
        this.enter = { value: 1 }
        this.move = 0

        this.wrappers = this.instance.querySelectorAll('.marquee_wrapper')
        LoadImages(this.instance)

        this.quicks = [...this.wrappers].map(el => gsap.quickSetter(el, 'x', '%'))
        this.changeVelocity = gsap.quickTo(this.velocity, 'value', {duration: 0.2, ease: 'power2'})

        this.scroll.on('scroll', (e) =>
        {
            if(this.destroyed) return
            this.changeVelocity(Math.abs(e.velocity))
            if(this.prevDirection === e.direction) return
            this.direction = e.direction * this.multiDirection

            this.prevDirection = e.direction
        })

        this.observer.observe(this.instance)

        this.wrappers.forEach(wrapper =>
        {
            wrapper.addEventListener('mouseenter', () =>
            {
                this.enterTl?.kill()
                this.enterTl = gsap.to(this.enter, { value: 0, duration: 0.6, ease: 'power3' })
            })
            wrapper.addEventListener('mouseleave', () =>
            {
                this.enterTl?.kill()
                this.enterTl = gsap.to(this.enter, { value: 1, duration: 0.6, ease: 'power3' })
            })
        })

        this.app.on('tick', () => this.tick())
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    tick()
    {
        if(this.destroyed || this.instance.dataset.visible == 'false') return

        this.quicks.forEach(quick => quick(this.move))
        const velocity = gsap.utils.mapRange(0, 100, 0, 1, this.velocity.value)
        this.move += (this.direction * (0.05 + velocity)) * this.enter.value

        if(this.move > 100 || this.move < -100) this.move = 0

        this.changeVelocity(0)
    }

    resize()
    {
        if (this.destroyed) return
    }

    destroy()
    {
        if (this.destroyed) return

        this.destroyed = true
    }
}