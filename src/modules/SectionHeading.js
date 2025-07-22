import { gsap, SplitText, ScrollTrigger } from 'gsap/all'
import { def } from '@utils/GSAP.js'

gsap.registerPlugin(SplitText, ScrollTrigger)

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
        this.split = new SplitText(this.title, { type: 'lines'})
        this.splitSecond = new SplitText(this.title, { type: 'lines'})
        gsap.set(this.splitSecond.lines, { overflow: 'clip', paddingBottom: '0.1em', marginBottom: '-0.1em'})
        this.tl = gsap.timeline({paused: true, defaults: {ease: def.ease, duration: 1.2}})

        this.tl.fromTo(this.divider, {transformOrigin: 'left', scaleX: 0}, {scaleX: 1})
        .fromTo(this.dot, {scale: 0}, {scale: 1}, '<0.1')
        .fromTo(this.split.lines, {y: '120%'}, {y: '0%', stagger: 0.1, ease: 'power3'}, '<0.1')

        this.scroll = ScrollTrigger.create(
        {
            trigger: this.instance,
            start: 'top 90%',
            onEnter: () => this.tl.play()
        })

        this.srcollBack = ScrollTrigger.create(
        {
            trigger: this.instance,
            start: 'top bottom',
            onLeaveBack: () => this.tl.pause(0)
        })
    }

    resize()
    {
        if(this.destroyed) return

        this.split?.revert()
        this.tl?.kill()
        this.scroll?.kill()
        this.srcollBack?.kill()

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}