import { gsap, SplitText, ScrollTrigger } from 'gsap/all'
import { def } from '@utils/GSAP.js'
import Snap from 'lenis/snap'

gsap.registerPlugin(SplitText, ScrollTrigger)

export default class HomeCta
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app
        this.scroll = this.app.scroll.lenis

        this.destroyed = false

        this.section = this.instance.querySelector('.h-cta')
        this.items = this.instance.querySelectorAll('.h-cta_item')
        this.section.style.setProperty('--length', `${this.items.length}`)
        ScrollTrigger.refresh()

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.snap = new Snap(this.scroll, { duration: 2,})

        this.splits = [...this.items].map(item =>
        {
            const text = item.querySelector('.heading_span')
            return new SplitText(text, { type: 'lines, chars, words', charsClass: 'char', linesClass: 'line' })
        })

        this.sectionHeight = this.section.offsetHeight - window.innerHeight * 0.8
        this.itemPart = this.sectionHeight / this.items.length

        this.tls = [...this.items].map((item, index) =>
        {
            const split = this.splits[index]

            const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3', duration: def.duration, stagger: { from: 'center', each: def.stagger } } })

            if(index > 0)
            {
                this.splits[index - 1].lines.forEach((line, lineIndex) =>
                {
                    const chars = line.querySelectorAll('.char')
                    chars.forEach((char, charIndex) =>
                    {
                        const position = Math.abs(charIndex - chars.length / 2) * 0.04 + lineIndex * 0.08
                        tl.to(char, { yPercent: 110, overwrite: 'auto' }, position)
                    })
                })
            }
            split.lines.forEach((line, lineIndex) =>
            {
                const chars = line.querySelectorAll('.char')
                chars.forEach((char, charIndex) =>
                {
                    const start = index > 0 ? 0.1 : 0
                    const position = Math.abs(charIndex - chars.length / 2) * 0.04 + lineIndex * 0.08 + start
                    tl.fromTo(char, { yPercent: -110 }, { yPercent: 0, overwrite: 'auto'}, position)
                })
            })

            const top = this.getTop(this.section) + (this.itemPart - 100) * (index + 1)
            if(window.innerWidth > 992) this.snap.add(top)

            const scroll = ScrollTrigger.create(
            {
                trigger: this.section,
                start: `top top-=${index * this.itemPart}`,
                end: `+=${this.itemPart - 100}`,
                animation: tl,
                scrub: true,
                // toggleActions: 'play none none reverse',
                onLeave: () =>
                {
                    if(index === this.items.length - 1) this.snap.stop()
                },
                onLeaveBack: () =>
                {
                    if(index === 0) this.snap.stop()
                },
                onEnter: () =>
                {
                    if(index === 0) this.snap.start()
                },
                onEnterBack: () =>
                {
                    if(index === this.items.length - 1) this.snap.start()
                }
            })

            return { tl, scroll }
        })
    }

    getTop(el)
    {
        let top = 0
        while(el && el !== document.body)
        {
            top += el.offsetTop || 0
            el = el.offsetParent
        }
        return top
    }

    resize()
    {
        if(this.destroyed) return

        this.splits.forEach(split => split.revert())
        this.tls.forEach(({tl, scroll}) =>
        {
            tl.kill()
            scroll.kill()
        })

        this.snap.destroy()

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
        this.snap.destroy()
    }
}