import { gsap, SplitText } from 'gsap/all'
import { def } from '@utils/GSAP.js'

gsap.registerPlugin(SplitText)

export default class Loader
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.hero = this.main.querySelector('.hero')
        this.meshs = this.app.gl.world.hero.meshs
        this.title = this.hero.querySelector('h1')
        this.descr = this.hero.querySelector('p')
        this.btn = this.hero.querySelector('.btn')

        this.titleSplit = new SplitText(this.title, { type: 'chars, words'})
        this.descrSplit = new SplitText(this.descr, { type: 'words' })

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

        this.meshs.forEach(({mesh}, index) =>
        {
            this.tl.fromTo(mesh.position, {z: 1500}, {z: 0, duration: 3.5}, index * 0.1 + 0.4)
        })

        this.tl.fromTo(this.titleSplit.chars,
            {opacity: 0, filter: 'blur(10px)'},
            {opacity: 1, filter: 'blur(0px)', stagger: {each: 0.01, from: 'random'}, duration: 1.1}, 0.8)
        .fromTo(this.descrSplit.words,
            {opacity: 0, filter: 'blur(10px)'},
            {opacity: 1, filter: 'blur(0px)', stagger: {each: 0.05, from: 'random'}, duration: 1.1}, '<0.2')
        .fromTo(this.btn, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)',}, '<0.3')
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

        this.tl?.kill()
    }
}