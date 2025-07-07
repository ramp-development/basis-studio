import gsap from 'gsap'
import { SplitText, def } from '@utils/GSAP.js'

export default class Loader
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.hero = this.main.querySelector('.inner-hero')
        // this.meshs = this.app.gl.world.items.meshs
        this.title = this.hero.querySelector('h1')

        this.titleSplit = new SplitText(this.title, { type: 'chars, words'})

        gsap.set([this.titleSplit.words, this.descr], {overflow: 'clip'})
        gsap.set(this.titleSplit.words, {paddingBottom: '0.1em', marginBottom: '-0.1em'})

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.tl = gsap.timeline(
        {
            defaults: {ease: def.ease, duration: 1}
        })

        // this.meshs.forEach(({mesh}, index) =>
        // {
        //     this.tl.fromTo(mesh.position, {z: 1500}, {z: 0, duration: 1.5}, index * 0.1)
        // })

        this.tl.fromTo(this.titleSplit.chars, {yPercent: 110}, {yPercent: 0, stagger: 0.01}, 0.2)
    }

    resize()
    {
        if(this.destroyed) return

        this.titleSplit.revert()
        this.descrSplit.revert()
    }

    destroy()
    {
        if(this.destroyed) return

        this.destroyed = true
    }
}