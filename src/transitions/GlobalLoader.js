import gsap from 'gsap'
import { Flip } from '@utils/GSAP.js'

export default class GlobalLoader
{
    constructor(container, toLoad, app)
    {
        this.app = app
        this.toLoad = toLoad
        this.main = container.container
        this.container = container

        this.app.globalLoader = this

        this.loader = document.querySelector('.loader')
        this.nav = document.querySelector('.nav')
        this.navLogo = this.nav.querySelector('.nav_logo')
        this.loaderText = this.loader.querySelectorAll('.f-48')
        this.loaderLayer = this.loader.querySelectorAll('.loader_layer')
        this.loaderLogo = this.loaderLayer[0].querySelector('.loader_logo')
        this.progress = { value: 0 }

        gsap.to([this.main], {autoAlpha: 1})

        this.tl = gsap.timeline(
        {
            defaults: {ease: 'power2', duration: 1}, paused: true,
            onComplete: () => this.loader.classList.add('loaded'),
        })

        // this.tl.fromTo(this.loaderLayer, {'--clip': 0}, {'--clip': 70})
        this.tl.fromTo(this.progress,
            {value: 0},
            {
                value: 70,
                onUpdate: () => this.updateTextProgress(),
                onComplete: () => this.load(),
            }, 0.2)
        .addLabel('start', '>')
        .to(this.progress,
            {
                value: 100,
                duration: 0.8,
                ease: 'power2.inOut',
                onUpdate: () => this.updateTextProgress(),
                onStart: () => this.startFlip()
            }, '>')
        .fromTo(this.loader, {'--clip': 0}, {'--clip': 100, duration: 0.8}, '<0.5')

        this.tl.tweenTo('start')
    }

    startFlip()
    {
        const logo = this.navLogo.querySelector('.logo')
        const loaderLogo = this.loaderLogo.querySelector('.logo')
        const state = Flip.getState(loaderLogo)

        logo.remove()
        gsap.set(this.nav, {autoAlpha: 1})
        this.navLogo.appendChild(loaderLogo)

        Flip.from(state,
        {
            duration: 0.8,
            ease: 'power2.inOut',
            absolute: true,
            onComplete: () => gsap.to(document.querySelector('.nav_dots'), {autoAlpha: 1}),
        })
    }

    updateTextProgress()
    {
        const value = Math.round(this.progress.value)

        this.loaderText.forEach((text) =>
        {
            text.textContent = value + '%'
        })

        this.loaderLayer[1].style.setProperty('--clip', this.progress.value)
    }

    async load()
    {
        await this.toLoad(this.main, this.app)
    }
}