import { gsap, SplitText, ScrollTrigger } from 'gsap/all'
import { def } from '@utils/GSAP.js'

gsap.registerPlugin(SplitText, ScrollTrigger)

export default class Goals
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.list = this.instance.querySelector('.goals_list')
        this.items = this.list.querySelectorAll('.goals_item')

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.sectionHeight = this.instance.offsetHeight - window.innerHeight * 0.8
        this.itemPart = this.sectionHeight / this.items.length

        this.splits = [...this.items].map(item =>
        {
            const left = item.querySelector('.v-flex-left-center')
            const right = item.querySelector('.v-flex-right-center')

            const titleSplit = new SplitText(left.querySelector('p'), { type: 'lines, words', wordsClass: 'word', linesClass: 'line' })
            const descrSplit = new SplitText(right.querySelector('p'), { type: 'lines, words', wordsClass: 'word', linesClass: 'line' })

            return { title: titleSplit, descr: descrSplit }
        })

        this.mastelTL = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

        this.tls = [...this.items].map((item, index) =>
        {
            const split = this.splits[index]

            const tl = gsap.timeline({ defaults: { ease: 'power3', duration: def.duration, stagger: { from: 'center', each: def.stagger } } })

            if(index > 0)
            {
                tl.to(this.splits[index - 1].title.words, {opacity: 0, filter: 'blur(10px)', overwrite: 'auto', stagger: {each: 0.01, from: 'random'}, duration: 0.8}, 0)
                .to(this.splits[index - 1].descr.words, {opacity: 0, filter: 'blur(10px)', overwrite: 'auto', stagger: {each: 0.01, from: 'random'}, duration: 0.8}, 0)
                .to(this.items[index - 1].querySelector('.goals_number'), {opacity: 0, filter: 'blur(10px)', overwrite: 'auto'}, 0)
            }

            tl.fromTo(split.title.words,
                { autoAlpha: 0, filter: 'blur(10px)' },
                { autoAlpha: 1, filter: 'blur(0px)', stagger: {each: 0.01, from: 'random'}, overwrite: 'auto' }, '<50%')
            .fromTo(split.descr.words,
                { autoAlpha: 0, filter: 'blur(10px)' },
                { autoAlpha: 1, filter: 'blur(0px)', stagger: {each: 0.05, from: 'random'}, overwrite: 'auto' }, '<0.1')
            .fromTo(item.querySelector('.goals_number'), { autoAlpha: 0, filter: 'blur(10px)' }, { autoAlpha: 1, filter: 'blur(0px)', overwrite: 'auto' }, '<0.1')

            const start = index === 0 ? 0 : '>0.2'

            this.mastelTL.add(tl, start)

            return tl
        })

        this.mastelTL.fromTo(this.instance.querySelectorAll('.goals_number'), { scale: 1 }, { scale: 1.4, stagger: 0, duration: this.mastelTL.duration() }, 0)

        this.scroll = ScrollTrigger.create(
        {
            trigger: this.instance,
            start: 'top top',
            end: 'bottom bottom+=100%',
            scrub: true,
            animation: this.mastelTL,
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

        this.splits.forEach(split =>
        {
            split.title.revert()
            split.descr.revert()
        })

        this.tls.forEach(({ tl }) => tl.kill())
        this.mastelTL.kill()
        this.scroll.kill()

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}