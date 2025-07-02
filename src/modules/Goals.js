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

            titleSplit.lines.forEach((line, lineIndex) =>
            {
                const words = line.querySelectorAll('.word')
                words.forEach((word, wordIndex) =>
                {
                    const position = wordIndex * 0.02 + lineIndex * 0.08
                    word.style.setProperty('--delay', position + 's')
                })
            })

            descrSplit.lines.forEach((line, lineIndex) =>
            {
                const words = line.querySelectorAll('.word')
                words.forEach((word, wordIndex) =>
                {
                    const position = wordIndex * 0.02 + lineIndex * 0.08
                    word.style.setProperty('--delay', position + 's')
                })
            })

            return { title: titleSplit, descr: descrSplit }
        })

        this.tls = [...this.items].map((item, index) =>
        {
            // const split = this.splits[index]

            // const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3', duration: def.duration, stagger: { from: 'center', each: def.stagger } } })

            // if(index > 0)
            // {
            //     this.splits[index - 1].title.lines.forEach((line, lineIndex) =>
            //     {
            //         const chars = line.querySelectorAll('.char')
            //         chars.forEach((char, charIndex) =>
            //         {
            //             const position = Math.abs(charIndex - chars.length / 2) * 0.04 + lineIndex * 0.08
            //             tl.to(char, { yPercent: 110, overwrite: 'auto' }, position)
            //         })
            //     })

            //     this.splits[index - 1].descr.lines.forEach((line, lineIndex) =>
            //     {
            //         const words = line.querySelectorAll('.word')
            //         words.forEach((word, wordIndex) =>
            //         {
            //             const position = Math.abs(wordIndex - words.length / 2) * 0.04 + lineIndex * 0.08
            //             tl.to(word, { yPercent: 110, overwrite: 'auto' }, position)
            //         })
            //     })

            //     const number = this.items[index - 1].querySelector('.goals_number')

            //     tl.to(number, { yPercent: 110, overwrite: 'auto' }, 0)
            // }

            // split.title.lines.forEach((line, lineIndex) =>
            // {
            //     const chars = line.querySelectorAll('.char')
            //     chars.forEach((char, charIndex) =>
            //     {
            //         const start = index > 0 ? 0.1 : 0
            //         const position = Math.abs(charIndex - chars.length / 2) * 0.04 + lineIndex * 0.08 + start
            //         tl.fromTo(char, { yPercent: -110 }, { yPercent: 0, overwrite: 'auto'}, position)
            //     })
            // })

            // split.descr.lines.forEach((line, lineIndex) =>
            // {
            //     const words = line.querySelectorAll('.word')
            //     words.forEach((word, wordIndex) =>
            //     {
            //         const start = index > 0 ? 0.1 : 0
            //         const position = Math.abs(wordIndex - words.length / 2) * 0.04 + lineIndex * 0.08 + start
            //         tl.fromTo(word, { yPercent: -110 }, { yPercent: 0, overwrite: 'auto'}, position)
            //     })
            // })

            // const number = item.querySelector('.goals_number')
            // tl.fromTo(number, { yPercent: -110 }, { yPercent: 0, overwrite: 'auto', immediateRender: false}, 0)

            const scroll = ScrollTrigger.create(
            {
                trigger: this.instance,
                start: `top top-=${index * this.itemPart}`,
                end: `+=${this.itemPart - 100}`,
                onEnter: () =>
                {
                    this.items.forEach(el => el.classList.remove('active'))
                    item.classList.add('active')
                    item.classList.remove('past')
                    if(index !== 0)
                    {
                        this.items[index - 1].classList.remove('active')
                        this.items[index - 1].classList.add('past')
                    }
                },
                onEnterBack: () =>
                {
                    this.items.forEach(el => el.classList.remove('active'))
                    item.classList.add('active')
                    item.classList.remove('past')
                    // if(index !== this.items.length - 1)
                    // {
                    //     this.items[index + 1].classList.remove('active')
                    //     this.items[index + 1].classList.add('past')
                    // }
                }
            })

            return { scroll }
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

        this.tls.forEach(({ scroll }) =>
        {
            // tl.kill()
            scroll.kill()
        })

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}