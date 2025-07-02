import { gsap, ScrollTrigger, SplitText } from '@utils/GSAP.js'

export default class FullBleed
{
    constructor(instance, app, main)
    {
        this.instance = instance
        this.app = app
        this.main = main

        this.world = this.app.gl.world
        this.destroyed = false

        this.wrapper = this.instance.querySelector('.full_wrapper')
        this.items = this.instance.querySelectorAll('.full_item')

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.splits = []
        this.scrolls = []

        gsap.set(this.wrapper, {height: this.items.length * 100 + 'vh'})
        ScrollTrigger.refresh()

        this.height = this.instance.getBoundingClientRect().height
        this.itemPart = this.height / (this.items.length + 1)

        this.items.forEach((item, index) =>
        {
            const title = item.querySelector('.f-64')
            const descr = item.querySelector('p')

            const splitTitle = new SplitText(title, { type: 'chars', charsClass: 'full_char' })
            const splitDescr = new SplitText(descr, { type: 'lines', linesClass: 'full_line' })
            const splitDescrParent = new SplitText(descr, { type: 'lines', linesClass: 'full_line-parent' })

            this.splits.push(splitDescr, splitTitle, splitDescrParent)

            splitDescr.lines.forEach((line, index) =>
            {
                const delay = index * 0.1 + 0.1
                line.style.setProperty('--delay', delay + 's')
            })

            splitTitle.chars.forEach((char, index) =>
            {
                const delay = Math.abs(index - splitTitle.chars.length / 2) * 0.02 + 0.1
                char.style.setProperty('--delay', delay + 's')
            })

            this.scrolls[index] = ScrollTrigger.create(
            {
                trigger: item,
                start: `top center-=${this.itemPart * index}`,
                end: `+=${this.itemPart}`,
                onEnter: () =>
                {
                    this.items.forEach(el => el.classList.remove('active'))
                    item.classList.add('active')
                    this.app.gl.world.full.meshs[index].tl.play()
                },
                onEnterBack: () =>
                {
                    this.items.forEach(el => el.classList.remove('active'))
                    item.classList.add('active')
                },
                onLeaveBack: () => this.app.gl.world.full.meshs[index].tl.reverse(),
            })
        })
    }

    resize()
    {
        if(this.destroyed) return
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}