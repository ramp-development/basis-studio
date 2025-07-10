import Core from 'smooothy'
import Tempus from "tempus"
import { gsap, ScrollTrigger, MotionPathPlugin } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

export default class Cards
{
    constructor(instance, app)
    {
        this.instance = instance
        this.app = app

        this.wrapper = this.instance.querySelector('[wrapper]')
        this.cards = this.instance.querySelectorAll('.card')
        this.path = this.instance.querySelector('.curve-path').querySelector('path')

        this.quicks = [...this.cards].map((item, index) =>
        {
            const rotation = gsap.quickTo(item, 'rotation', { duration: 0.4, ease: 'power2' })
            const y = gsap.quickTo(item, 'y', { duration: 0.4, ease: 'power2' })
            const x = gsap.quickTo(item, 'x', { duration: 0.4, ease: 'power2' })

            return { rotation, y, x, item, endY: 0 }
        })

        let count = 0

        this.cards.forEach((item, index) =>
        {
            const centerIndex = (1 - Math.abs(index - (this.quicks.length - 1) / 2) / (this.quicks.length - 1)) / 2

            item.addEventListener('mouseenter', () =>
            {
                this.quicks[index].y(item.getBoundingClientRect().height * -0.1 * centerIndex)
                item.style.setProperty('z-index', count++)
            })

            item.addEventListener('mouseleave', () =>
            {
                this.quicks[index].y(this.quicks[index].endY)
            })
        })

        this.destroyed = false

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.cards.forEach(item => item.classList.add('absolute'))
        this.height = this.cards[0].getBoundingClientRect().height
        this.width = this.cards[0].getBoundingClientRect().width

        gsap.set(this.wrapper, { height: this.height + 'px' })
        const wrapperWidth = this.wrapper.getBoundingClientRect().width
        const cardsTotalWidth = this.cards.length * this.width
        const offset = (wrapperWidth - cardsTotalWidth) / this.cards.length
        console.log(wrapperWidth, this.width, this.cards.length, cardsTotalWidth, offset)

        this.staggerAmount = 0.5
        this.staggerDelay = 0.2
        this.rotation = 25

        this.tl = gsap.timeline({paused: true, defaults: { duration: 2, ease: 'power2' }})
        this.scrollValue = { value: 0 }
        this.rawPath = MotionPathPlugin.getRawPath(this.path)

        this.tl.fromTo(this.scrollValue, {value: 0},
            {
                value: 1,
                onUpdate: () =>
                {
                    const progress = this.scrollValue.value
                    this.quicks.forEach(({rotation, y, x, item}, index) =>
                    {
                        let centerIndex = Math.abs(index - (this.quicks.length - 1) / 2)
                        if(index > (this.quicks.length - 1) / 2) centerIndex *= -1
                        const staggerOffset = index * this.staggerDelay
                        const staggeredProgress = Math.max(0, Math.min(1,
                            (progress - staggerOffset * this.staggerAmount) / (1 - this.staggerAmount)
                        ))
                        // fil all cards inside the wrapper
                        const startX = window.innerWidth
                        const endX = startX * (1 - staggeredProgress) + (offset * centerIndex) * staggeredProgress
                        const rotateProgres = 1 - ((index + 1) / this.quicks.length) * progress

                        const point = MotionPathPlugin.getPositionOnPath(this.rawPath, rotateProgres , true)
                        // const rotationValue = 5 * (1 - staggeredProgress) + point.angle * staggeredProgress
                        const rotationValue = point.angle / 2
                        const yValue = window.innerHeight * 0.15 * (1 - staggeredProgress) + point.y / 2 * staggeredProgress

                        // Apply position from motion path
                        x(endX)
                        y(yValue)
                        rotation(-rotationValue)
                        this.quicks[index].endY = yValue

                    })
                }
            })

        this.srcoll = ScrollTrigger.create(
        {
            trigger: this.wrapper,
            start: 'top 80%',
            onEnter: () => this.tl.play(),
        })
        // this.slider = new Core(this.wrapper,
        // {
        //     infinite: true,
        //     snap: true,
        // })
        // Tempus.add(() => this.slider.update())
    }

    resize()
    {
        if(this.destroyed) return

        this.tl?.kill()
        this.srcoll?.kill()

        this.init()
    }

    destroy()
    {
        if(this.destroyed) return
        this.destroyed = true
    }
}