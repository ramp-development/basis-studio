import { gsap, ScrollTrigger, SplitText, def } from '@utils/GSAP.js'

export default class TextAnimation
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        // this.

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        if(this.instance.dataset.scroll === 'false') return
    }

    resize()
    {
        if(this.destroyed) return

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}