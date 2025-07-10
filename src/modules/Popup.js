import { gsap } from 'gsap'

export default class Popup
{
    constructor(instance, app, main)
    {
        this.instance = instance
        this.app = app
        this.main = main
        this.scroll = this.app.scroll.lenis

        this.bodyMain = document.body
        this.btns = this.main.querySelectorAll('[data-popup-trigger="true"], [data-popup-trigger]:not(.btn)')
        this.close = this.instance.querySelector('.btn')
        this.body = this.instance.querySelector('.popup_body')
        this.overlay = this.instance.querySelector('.popup_overlay')

        this.init()
    }

    init()
    {
        this.enterTl = gsap.timeline(
        {
            paused: true,
            defaults: { duration: 1, ease: 'power2' },
            onStart: () =>
            {
                this.instance.classList.add('active')
                this.scroll.stop()
                this.bodyMain.classList.add('hide-nav')
            },
        })

        this.enterTl.fromTo(this.body, { yPercent: 100, scale: 0.9, opacity: 1 }, { opacity: 1, yPercent: 0, scale: 1, overwrite: 'auto' })
        .fromTo(this.overlay, { opacity: 0 }, { opacity: 1, overwrite: 'auto' }, '<')

        this.btns.forEach(btn => btn.addEventListener('click', () => this.enterTl.restart()))

        this.leaveTl = gsap.timeline(
        {
            paused: true,
            defaults: { duration: 0.6, ease: 'power2' },
            onStart: () =>
            {
                this.scroll.start()
                this.bodyMain.classList.remove('hide-nav')
            },
            onComplete: () =>
            {
                this.instance.classList.remove('active')

            }
        })

        this.leaveTl.to(this.body, { opacity: 0, overwrite: 'auto' })
        .to(this.overlay, { opacity: 0, overwrite: 'auto' }, '<')

        this.close.addEventListener('click', () => this.leaveTl.restart())
    }
}