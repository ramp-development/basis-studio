import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

export default class Cards
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.cards = this.instance.querySelectorAll('.card')

        this.rotations = [...this.cards].map(item => gsap.quickTo(item, 'rotation', {duration: 0.4, ease: 'power2'}))
        this.yMove = [...this.cards].map(item => gsap.quickTo(item, 'yPercent', {duration: 0.4, ease: 'power2'}))

        this.cards.forEach((item, index) =>
        {
            this.setRotation(item, index)
        })

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {

    }

    setRotation(item, index)
    {
        const { x, width, height } = item.getBoundingClientRect()
        const windowCenter = window.innerWidth / 2

        const itemCenterDistance = x + width / 2 - windowCenter
        const rotation = Math.sin(itemCenterDistance / windowCenter) * 30
        const yMove = Math.abs(Math.sin(itemCenterDistance / windowCenter) * 0.5 * height)
        // const yMove = Math.abs(rotation * 0.01 * height)
        this.rotations[index](rotation)
        this.yMove[index](Math.abs(rotation))
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