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

        this.titleSplit = new SplitText(this.title, { type: 'lines'})
        this.titleSplitSecond = new SplitText(this.title, { type: 'lines', linesClass: 'line-second' })
        gsap.set(this.titleSplitSecond.lines, { overflow: 'clip', paddingBottom: '0.1em', marginBottom: '-0.1em', perspective: 1000 })

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

        this.tl.fromTo(this.titleSplit.lines,
            {y: '120%'}, {y: '0%', stagger: 0.1, ease: 'power3', stagger: 0.1}, 0.6)
        .fromTo(this.titleSplit.lines,
            {rotateX: '-35deg', rotateY: '-5deg', z: '-1rem', transformStyle: 'preserve-3d', transformOrigin: '50% 0'},
            {rotateX: '0deg', rotateY: '0deg', z: '0rem', stagger: 0.1, ease: 'power2', stagger: 0.1}, '<')
    }

    resize()
    {
        if(this.destroyed) return

        this.titleSplit?.revert()
        this.descrSplit?.revert()
    }

    destroy()
    {
        if(this.destroyed) return

        this.destroyed = true
    }
}