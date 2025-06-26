import { gsap, ScrollTrigger } from '@utils/GSAP.js'

export default class Hero
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.hero = this.main.querySelector('.cases')
        this.wrapper = this.hero.querySelector('.cases_wrapper')
        this.list = this.hero.querySelector('.cases_list')
        this.items = this.hero.querySelectorAll('.cases_item')

        this.destroyed = false

        // this.quicks = [...this.images].map((image, index) =>
        // {
        //     const x = gsap.quickTo(image, 'x', { duration: 0.5, ease: 'power2', onUpdate: () =>
        //         {
        //             if(index !== 0) return
        //             this.app.gl.world.hero.setPosition()
        //         }
        //     })
        //     const y = gsap.quickTo(image, 'y', { duration: 0.5, ease: 'power2' })

        //     const random = gsap.utils.random(0.8, 1.2, 0.1)

        //     return {x, y, random}
        // })

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.hero.style.setProperty('--length', this.items.length)
        const left = this.hero.getBoundingClientRect().left
        const start = this.wrapper.getBoundingClientRect().left
        const width = this.list.getBoundingClientRect().width
        const end = width + start - window.innerWidth + left

        this.tl = gsap.timeline(
        {

        })

        this.tl.fromTo(this.list, {x: 0}, {x: -end, ease: 'none', duration: 1.5})

        this.srcoll = ScrollTrigger.create(
        {
            trigger: this.hero,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            animation: this.tl,
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