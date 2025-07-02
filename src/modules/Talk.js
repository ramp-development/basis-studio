import { gsap, SplitText, ScrollTrigger } from 'gsap/all'
import { def } from '@utils/GSAP.js'

gsap.registerPlugin(SplitText, ScrollTrigger)

export default class Talk
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.list = this.instance.querySelector('.talk_item')
        this.items = this.list.querySelectorAll('.f-96')

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.splits = [...this.items].map(item =>
        {
            return new SplitText(item, { type: 'chars', charsClass: 'char' })
        })

        this.tls = [...this.items].map((item, index) =>
        {
            const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3', duration: def.duration, stagger: { from: 'center', each: def.stagger } } })

            tl.fromTo(this.splits[index].chars, { yPercent: -110 }, { yPercent: 0 })

            const scroll = ScrollTrigger.create(
            {
                trigger: item,
                start: 'top 80%',
                end: 'center center',
                scrub: true,
                animation: tl,
            })

            const height = item.getBoundingClientRect().height

            const centerScroll = ScrollTrigger.create(
            {
                trigger: item,
                start: `center center`,
                onEnter: () =>
                {
                    this.items.forEach(i => i.classList.remove('active'))
                    item.classList.add('active')
                },
                onEnterBack: () =>
                {
                    this.items.forEach(i => i.classList.remove('active'))
                    item.classList.add('active')
                },
            })

            return { tl, scroll, centerScroll }
        })
    }

    resize()
    {
        if(this.destroyed) return

        this.splits.forEach(split => split.revert())
        this.tls.forEach(({ tl, scroll, centerScroll }) =>
        {
            tl.kill()
            scroll.kill()
            centerScroll.kill()
        })

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}