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

        this.split = new SplitText(this.text, { type: 'chars, lines'})
        this.tl = gsap.timeline({paused: true, defaults: {ease: def.ease, duration: def.duration}})

        this.tl.fromTo(this.split.chars,
            { autoAlpha: 0, filter: 'blur(10px)' },
            { autoAlpha: 1, filter: 'blur(0px)', stagger: {each: 0.01, from: 'random'} }, '<0.1')

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

        this.played = false

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