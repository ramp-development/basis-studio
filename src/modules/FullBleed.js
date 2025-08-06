import { gsap, ScrollTrigger, SplitText } from '@utils/GSAP.js'

export default class FullBleed
{
    constructor(instance, app, main)
    {
        this.instance = instance
        this.app = app
        this.main = main

        // this.world = this.app.gl.world
        this.destroyed = false

        this.wrapper = this.instance.querySelector('.full_wrapper')
        this.items = this.instance.querySelectorAll('.full_item')

        this.init()
        this.app.on('resize', () => this.resize())
        this.app.on('destroy', () => this.destroy())
    }

    init()
    {
        this.splits = []
        this.scrolls = []

        // OLD HEIGHT - commented for easy rollback
        // gsap.set(this.wrapper, {height: this.items.length * 100 + 'vh'})
        
        // NEW HEIGHT - extra space for last item to dwell
        gsap.set(this.wrapper, {height: (this.items.length * 100) + 50 + 'vh'})
        ScrollTrigger.refresh()

        this.height = this.instance.getBoundingClientRect().height
        // OLD TIMING - commented for easy rollback
        // this.itemPart = this.height / (this.items.length + 1)
        
        // NEW TIMING - more spacing between animations
        this.itemPart = this.height / (this.items.length - 0.5)

        this.items.forEach((item, index) =>
        {
            const title = item.querySelector('.f-64')
            const descr = item.querySelector('p')

            const splitTitle = new SplitText(title, { type: 'chars, words', charsClass: 'full_char' })
            const splitTitleParent = new SplitText(title, { type: 'lines', linesClass: 'full_line-parent' })
            const splitDescr = new SplitText(descr, { type: 'lines', linesClass: 'full_line' })
            const splitDescrParent = new SplitText(descr, { type: 'lines', linesClass: 'full_line-parent' })

            this.splits.push(splitDescr, splitTitle, splitDescrParent)

            splitDescr.lines.forEach((line, index) =>
            {
                const delay = index * 0.1 + 0.1
                line.style.setProperty('--delay', delay + 's')
            })

            splitTitle.chars.forEach((char, index) =>
            {
                const delay = Math.abs(index - splitTitle.chars.length / 2) * 0.02 + 0.1
                char.style.setProperty('--delay', delay + 's')
            })

            this.scrolls[index] = ScrollTrigger.create(
            {
                trigger: item,
                start: `top center-=${this.itemPart * index}`,
                end: `+=${this.itemPart}`,
                onEnter: () =>
                {
                    this.items.forEach(el => el.classList.remove('active'))
                    item.classList.add('active')
                    item.classList.add('show-bg')
                    
                    if(window.innerWidth < 991) {
                        // Mobile: manually switch videos
                        this.items.forEach(el => {
                            const video = el.querySelector('video')
                            if(video) video.style.opacity = '0'
                        })
                        const currentVideo = item.querySelector('video')
                        if(currentVideo) currentVideo.style.opacity = '1'
                        return
                    }
                    this.app.gl.world.full.meshs[index].tl.play()
                },
                onEnterBack: () =>
                {
                    this.items.forEach(el => el.classList.remove('active'))
                    item.classList.add('active')
                    
                    if(window.innerWidth < 991) {
                        // Mobile: show current video when entering back
                        this.items.forEach(el => {
                            const video = el.querySelector('video')
                            if(video) video.style.opacity = '0'
                        })
                        const currentVideo = item.querySelector('video')
                        if(currentVideo) currentVideo.style.opacity = '1'
                        return
                    }
                },
                onLeaveBack: () =>
                {
                    item.classList.remove('show-bg')
                    
                    if(window.innerWidth < 991) {
                        // Mobile: hide current video
                        const currentVideo = item.querySelector('video')
                        if(currentVideo) currentVideo.style.opacity = '0'
                        return
                    }
                    this.app.gl.world.full.meshs[index].tl.reverse()
                },
            })
        })
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