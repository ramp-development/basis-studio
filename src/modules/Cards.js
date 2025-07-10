import Core from 'smooothy'
import Tempus from "tempus"
import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

export default class Cards
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.wrapper = this.instance.querySelector('[wrapper]')
        this.cards = this.instance.querySelectorAll('.card')
        // this.clones = [...this.cards].map(item =>
        // {
        //     const clone = item.cloneNode(true)
        //     this.wrapper.appendChild(clone)
        //     return clone
        // })

        // this.rotations = [...this.cards].map(item => gsap.quickTo(item, 'rotation', {duration: 0.4, ease: 'power2'}))
        // this.yMove = [...this.cards].map(item => gsap.quickTo(item, 'yPercent', {duration: 0.4, ease: 'power2'}))

        // this.cards.forEach((item, index) =>
        // {
        //     // this.setRotation(item, index)
        // })

        this.quicks = [...this.cards].map(item =>
        {
            const rotation = gsap.quickTo(item, 'rotation', { duration: 0.4, ease: 'power2' })
            const y = gsap.quickTo(item, 'yPercent', { duration: 0.4, ease: 'power2' })
            const x = gsap.quickTo(item, 'x', { duration: 0.4, ease: 'power2' })

            // this.setRotation(item, this.quicks.length - 1)

            return { rotation, y, x, item }
        })

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.height = this.cards[0].getBoundingClientRect().height
        this.width = this.cards[0].getBoundingClientRect().width
        this.cards.forEach(item => item.classList.add('absolute'))

        gsap.set(this.wrapper, { height: this.height + 'px' })
        const wrapperWidth = this.wrapper.getBoundingClientRect().width
        const cardsTotalWidth = this.cards.length * this.width
        const offset = (wrapperWidth - cardsTotalWidth) / 2
        console.log(offset)

        this.tl = gsap.timeline({paused: true, defaults: { duration: 1.2, ease: 'power2' }})
        this.scrollValue = { value: 0 }

        this.tl.fromTo(this.scrollValue, { value: 0 },
            {
                value: 1,
                onUpdate: () =>
                {
                    this.quicks.forEach(({rotation, y, x, item}, index) =>
                    {
                        const progress = this.scrollValue.value
                        let centerIndex = Math.abs(index - (this.quicks.length - 1) / 2)
                        if(index > (this.quicks.length - 1) / 2) centerIndex *= -1
                        // fil all cards inside the wrapper
                        const startX = window.innerWidth
                        const endX = startX * (1 - progress) + (offset * centerIndex) * progress
                        const rotationValue = this.setRotation(item, index)

                        x(endX)
                        rotation(rotationValue)
                        y(Math.abs(rotationValue))

                    })
                }
            })

        this.srcoll = ScrollTrigger.create(
        {
            trigger: this.wrapper,
            start: 'top 80%',
            onEnter: () => this.tl.restart(),
        })
        // this.slider = new Core(this.wrapper,
        // {
        //     infinite: true,
        //     snap: true,
        // })
        // Tempus.add(() => this.slider.update())
    }

    setRotation(item, index)
    {
        const { x, width, height } = item.getBoundingClientRect()
        const windowCenter = window.innerWidth / 2

        const itemCenterDistance = x + width / 2 - windowCenter
        const rotation = Math.sin(itemCenterDistance / windowCenter) * 25
        // const yMove = Math.abs(Math.sin(itemCenterDistance / windowCenter) * 0.5 * height)
        const yMove = Math.abs(rotation)
        // const yMove = Math.abs(rotation * 0.01 * height)
        // this.rotations[index](rotation)
        // this.yMove[index](Math.abs(rotation))
        return rotation
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