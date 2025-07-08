import gsap from 'gsap'
import { SplitText, def } from '@utils/GSAP.js'

export default class Loader
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.hero = this.main.querySelector('.h-services')
        // // this.meshs = this.app.gl.world.items.meshs
        this.title = this.hero.querySelector('h1')

        this.titleSplit = new SplitText(this.title, { type: 'chars, words'})

        // gsap.set([this.titleSplit.words, this.descr], {overflow: 'clip'})
        // gsap.set(this.titleSplit.words, {paddingBottom: '0.1em', marginBottom: '-0.1em'})

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

        this.tl.fromTo(this.titleSplit.chars,
            {opacity: 0, filter: 'blur(10px)'},
            {opacity: 1, filter: 'blur(0px)', stagger: {each: 0.01, from: 'random'}, duration: 1.1}, 0.8)
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