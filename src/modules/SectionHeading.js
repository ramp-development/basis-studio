import { gsap, ScrollTrigger, SplitText, def } from '@utils/GSAP.js'

export default class SectionHeading
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.divider = this.instance.querySelector('.section-heading_line')
        this.dot = this.instance.querySelector('.section-heading_circle')
        this.title = this.instance.querySelector('h3')

        this.destroyed = false
        this.played = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.split = new SplitText(this.title, { type: 'words, lines'})
        gsap.set(this.split.lines, {overflow: 'clip'})
        this.tl = gsap.timeline({paused: true, defaults: {ease: def.ease, duration: def.duration}})

        this.tl.fromTo(this.divider, {transformOrigin: 'left', scaleX: 0}, {scaleX: 1})
        .fromTo(this.dot, {scale: 0}, {scale: 1}, '<0.1')
        .fromTo(this.split.words, {yPercent: 110}, {yPercent: 0, stagger: def.stagger}, '<0.1')

        this.scroll = ScrollTrigger.create(
        {
            trigger: this.instance,
            start: 'top 80%',
            onEnter: () =>
            {
                if(this.played) return
                this.played = true

                this.tl.play()
            }
        })
    }

    resize()
    {
        if(this.destroyed) return

        this.split?.revert()
        this.tl?.kill()
        this.scroll?.kill()

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}