import { gsap, ScrollTrigger, SplitText, def } from '@utils/GSAP.js'

export default class CharAnimation
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.text = this.instance.children.length > 0 ? this.instance.children : this.instance

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        if(this.instance.dataset.scroll === 'false') return

        this.split = new SplitText(this.text, { type: 'lines'})
        this.splitSecond = new SplitText(this.text, { type: 'lines'})
        gsap.set(this.splitSecond.lines, { overflow: 'clip', paddingBottom: '0.1em', marginBottom: '-0.1em', perspective: 1000 })

        this.tl = gsap.timeline({paused: true, defaults: {duration: 1.2}, onComplete: () => this.split.revert()})

        this.tl.fromTo(this.split.lines,
            {y: '120%'}, {y: '0%', stagger: 0.1, ease: 'power3', stagger: 0.1}, '<0.2')
        .fromTo(this.split.lines,
            {rotateX: '-35deg', rotateY: '-5deg', z: '-1rem', transformStyle: 'preserve-3d', transformOrigin: '50% 0'},
            {rotateX: '0deg', rotateY: '0deg', z: '0rem', stagger: 0.1, ease: 'power2', stagger: 0.1}, '<')

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

        this.played = false

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