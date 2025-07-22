import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default class Batch
{
    constructor(instance, main, app)
    {
        this.instance = instance
        this.main = main
        this.app = app

        this.maxLine = this.instance.dataset.line || 4

        this.items = this.instance.children
        this.items = [...this.items].filter((item) => !item.classList.contains('dashed'))

        this.destroyed = false

        this.init()
    }

    init()
    {
        if(this.instance.dataset.nomob === 'true' && window.innerWidth <= 991) return

        gsap.set(this.items, {opacity: 0, filter: 'blur(10px)'})

        this.scroll = ScrollTrigger.batch(this.items,
        {
            interval: 0.05,
            batchMax: this.maxLine,
            onEnter: (batch) => gsap.to(batch, {opacity: 1, filter: 'blur(0px)', overwrite: true, stagger: 0.1}),
            start: 'top 90%',
        })
    }

    resize()
    {
        if(this.destroyed) return

        if(this.scroll) this.scroll.forEach(scroll => scroll.kill())
        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}