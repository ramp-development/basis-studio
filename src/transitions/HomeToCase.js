import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default class HomeToCase
{
    constructor(data, done, checkPages, app)
    {
        this.app = app
        this.data = data
        this.checkPages = checkPages
        this.done = done
        this.container = data.next.container
        this.scroll = this.app.scroll.lenis

        this.loader = document.querySelector('.loader')
        this.nav = document.querySelector('.nav')
        this.loaderLayers = this.loader.querySelectorAll('.loader_layer')
        this.loaderLogo = this.loader.querySelector('.loader_logo')

        this.init()
    }

    init()
    {
        // Stop scroll and prepare loader
        this.scroll.stop()
        this.loader.classList.remove('hidden')
        this.nav.classList.remove('active')

        // Hide logo and show BASIS text for case transition
        if (this.loaderLogo) this.loaderLogo.style.opacity = '0'
        this.createBasisText()

        // Add class for bottom transition and set initial state (like normal Leave.js)
        this.loader.classList.add('bottom-transition')
        gsap.set(this.loader, {'--topClip': 0, '--bottomClip': 100})

        // Animate from top to bottom (like normal Leave.js: leftClip 100→0)
        gsap.to(this.loader, {
            '--bottomClip': 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => this.leave()
        })
    }

    createBasisText()
    {
        // Create BASIS text element if it doesn't exist
        if (!this.loader.querySelector('.basis-text')) {
            const basisText = document.createElement('div')
            basisText.className = 'basis-text'
            basisText.textContent = 'BASIS'
            basisText.style.cssText = `
                position: absolute;
                bottom: 4rem;
                left: 50%;
                transform: translateX(-50%);
                font-size: 8rem;
                font-weight: 900;
                color: inherit;
                z-index: 10;
                font-family: inherit;
                letter-spacing: -0.02em;
                line-height: 1;
            `
            this.loaderLayers[0].appendChild(basisText.cloneNode(true))
            this.loaderLayers[1].appendChild(basisText.cloneNode(true))
        }
    }

    leave()
    {
        // Trigger destroy and proceed to enter phase
        this.app.trigger('destroy')
        this.app.gl.loaded = false

        ScrollTrigger.killAll()
        this.done()

        this.app.onceLoaded = true
        this.app.scroll.destroy()
        window.scrollTo(0, 0)

        // Start enter phase
        this.enter()
    }

    enter()
    {
        gsap.set(this.container, {autoAlpha: 1})
        // Set initial state for enter phase (like normal Enter.js)
        this.loader.classList.add('bottom-transition')
        gsap.set(this.loader, {'--topClip': 0, '--bottomClip': 0})

        // Reset scroll position
        document.documentElement.style.scrollBehavior = 'instant'
        window.scrollTo({top: 0, left: 0, behavior: 'instant'})

        requestAnimationFrame(() => {
            window.scrollTo({top: 0, left: 0, behavior: 'instant'})
            requestAnimationFrame(() => {
                window.scrollTo({top: 0, left: 0, behavior: 'instant'})
                document.documentElement.style.scrollBehavior = ''
            })
        })

        // Load page content
        if(window.innerWidth > 992) {
            this.app.gl.loadWorld(this.container)
            this.app.on('loadedWorld', () => this.complete())
        } else {
            this.complete()
        }
    }

    complete()
    {
        this.checkPages(this.app, this.container)
        this.app.moduleLoader.loadModules(this.container)

        this.app.scroll.init()
        this.app.scroll.lenis.on('scroll', e => this.app.gl.setScroll(e))

        // Animate reveal from top to bottom (like normal Enter.js: clip 0→100)
        gsap.to(this.loader, {
            '--topClip': 100,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                this.loader.classList.add('hidden')
                // Remove bottom transition class and reset variables
                this.loader.classList.remove('bottom-transition')
                gsap.set(this.loader, { '--clip': 0, '--leftClip': 0, '--topClip': 0, '--bottomClip': 0 })
                // Restore logo and hide BASIS text
                if (this.loaderLogo) this.loaderLogo.style.opacity = '1'
                const basisTexts = this.loader.querySelectorAll('.basis-text')
                basisTexts.forEach(text => text.remove())
            }
        })

        ScrollTrigger.refresh()
    }
}