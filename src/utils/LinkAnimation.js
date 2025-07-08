import { gsap, SplitText } from 'gsap/all'
import { def } from '@utils/GSAP.js'

gsap.registerPlugin(SplitText)

export default class LinkAnimation
{
    constructor(item, app)
    {
        this.item = item
        this.app = app
        this.text = this.item.querySelectorAll('[link-text]')

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.splits = [...this.text].map(text => new SplitText(text, { type: 'chars' }))

        this.tl = gsap.timeline({ paused: true, defaults: { ease: def.ease, duration: def.duration } })

        this.tl.fromTo(this.splits[0].chars, {opacity: 1, filter: 'blur(0px)'}, {opacity: 0, filter: 'blur(5px)', stagger: {each: 0.04, from: 'start'}})
        .fromTo(this.splits[1].chars, {opacity: 0, filter: 'blur(5px)'}, {opacity: 1, filter: 'blur(0px)', stagger: {each: 0.04, from: 'start'}}, '<0.2')

        this.item.addEventListener('mouseenter', () => this.tl.timeScale(1).play())
        this.item.addEventListener('mouseleave', () => this.tl.timeScale(1.5).reverse())
    }

    resize()
    {
        if(this.destroyed) return

        this.item.removeEventListener('mouseenter', () => this.tl.timeScale(1).play())
        this.item.removeEventListener('mouseleave', () => this.tl.timeScale(1.5).reverse())

        this.splits.forEach(split => split.revert())
        this.tl.kill()

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return

        this.destroyed = true
    }
}