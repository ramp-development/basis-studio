import gsap from 'gsap'
import { SplitText, def } from '@utils/GSAP.js'

export default class Loader
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.hero = this.main.querySelector('.cases')
        this.items = this.main.querySelectorAll('.cases_item')
        this.meshs = this.app.gl.world.items.meshs
        this.title = this.hero.querySelector('h1')

        this.firstTwoItems = [...this.items].slice(0, 2)
        this.firstTwoMeshs = this.meshs.slice(0, 2)

        this.titleSplit = new SplitText(this.title, { type: 'chars, words'})

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

        this.tl.fromTo(this.titleSplit.chars, {opacity: 0, filter: 'blur(10px)'}, {opacity: 1, filter: 'blur(0px)', stagger: {each: 0.02, from: 'random'}}, 0.4)
        .fromTo(this.firstTwoItems, {yPercent: 20, opacity: 0}, {yPercent: 0, opacity: 1, onUpdate: () => this.app.gl.world.items.setPosition()}, '<0.2')

        this.firstTwoMeshs.forEach(({material}) =>
        {
            this.tl.fromTo(material.uniforms.uLoading, {value: 0}, {value: 1, duration: 1}, '<0.1')
        })
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