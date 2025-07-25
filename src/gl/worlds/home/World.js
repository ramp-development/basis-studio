import { WebGLRenderTarget, Box3 } from 'three'
import Resources from '@utils/Resources'
import gsap from 'gsap'

import Video from './meshs/video/index.js'
import Full from './meshs/full/index.js'
import Hero from './meshs/hero/index.js'
import FluidMask from '@gl/utils/fluidMask/index.js'
import Testimonials from './meshs/testimonials/index.js'

export default class World
{
    constructor(gl, app, scene, main, index)
    {
        this.gl = gl
        this.app = app
        this.scene = scene
        this.main = main
        this.index = index

        this.sizes = this.app.sizes
        this.renderer = this.gl.renderer.instance
        this.camera = this.gl.camera.instance
        this.scene = scene

        this.load()
    }

    load()
    {
        this.count = 0
        this.items = this.main.querySelectorAll('.hero_image')
        this.footerLogo = this.main.querySelector('.footer_logo')
        this.nowText = this.main.querySelector('.now_texture')
        this.testimonials = this.main.querySelector('.testimonials')

        this.sources = [...this.items].map((item, index) =>
        {
            const image = item.querySelector('img')
            const url = image.getAttribute('src')

            return { type: 'textureLoader', url, name: index }
        })

        if(this.footerLogo)
        {
            const textures = this.getTextureAttributes(this.footerLogo)
            textures.forEach(({value}, index) =>
            {
                this.sources.push({ type: 'textureLoader', url: value, name: `footer-${index}` })
            })
            gsap.set(this.footerLogo, {opacity: 0})
        }

        if(this.nowText)
        {
            const textures = this.getTextureAttributes(this.nowText)
            textures.forEach(({value}, index) =>
            {
                this.sources.push({ type: 'textureLoader', url: value, name: `nowText-${index}` })
            })
        }

        this.resources = new Resources(this.sources)
        this.resources.on('ready', () => this.init())
    }

    init()
    {
        this.gl.loaded = true

        this.video = new Video(this.app, this.gl, this.scene, this.main)
        this.full = new Full(this.app, this.gl, this.scene, this.main)
        this.hero = new Hero(this.app, this.gl, this.scene, this.main, this.resources)
        this.testimonialsMesh = new Testimonials(this.app, this.gl, this.scene, this.main, this.testimonials)

        if(this.footerLogo)
        {
            this.footerMeshs = []
            const textures = this.getTextureAttributes(this.footerLogo)
            this.footerTextures = textures.map((_, index) =>
            {
                const name = `footer-${index}`
                return this.resources.items[name]
            })
            this.footerTextures.forEach((texture, index) =>
            {
                this.footerMeshs[index] = new FluidMask(this.app, this.gl, this.scene, this.footerLogo, texture, index)
            })
        }

        if(this.nowText)
        {
            this.nowMeshs = []
            const textures = this.getTextureAttributes(this.nowText)
            this.nowTextTextures = textures.map((_, index) =>
            {
                const name = `nowText-${index}`
                return this.resources.items[name]
            })
            this.nowTextTextures.forEach((texture, index) =>
            {
                this.nowMeshs[index] = new FluidMask(this.app, this.gl, this.scene, this.nowText, texture, index)
            })
        }

        this.app.trigger('loadedWorld')

        if(!this.app.onceLoaded)
        {
            this.app.globalLoader.tl.play()
            this.app.page.triggerLoad()
        }
    }

    setScroll(e)
    {
        this.video?.setPosition()
        this.full?.setPosition()
        this.hero?.setPosition()
        this.footerMeshs?.forEach(mesh => mesh.setPosition())
        this.nowMeshs?.forEach(mesh => mesh.setPosition())
        this.testimonialsMesh?.setPosition()
    }

    update()
    {
        this.video?.update()
        this.full?.update()
        this.hero?.update()
        this.footerMeshs?.forEach(mesh => mesh.update())
        this.nowMeshs?.forEach(mesh => mesh.update())
        this.testimonialsMesh?.update()
    }

    createTexture(target)
    {
        this.renderer.setRenderTarget(target)
        this.renderer.render(this.scene, this.camera)
        this.renderer.setRenderTarget(null)

        return target.texture
    }

    resize()
    {
        this.video?.resize()
        this.full?.resize()
        this.hero?.resize()
        this.footerMeshs?.forEach(mesh => mesh.resize())
        this.nowMeshs?.forEach(mesh => mesh.resize())
        this.testimonialsMesh?.resize()
    }

    onMouseMove(e, mouse)
    {
        this.hero?.onMouseMove(e, mouse)
    }

    destroy()
    {
        this.video?.destroy()
        this.full?.destroy()
        this.hero?.destroy()
        this.footerMeshs?.forEach(mesh => mesh.destroy())
        this.nowMeshs?.forEach(mesh => mesh.destroy())
        this.testimonialsMesh?.destroy()
    }

    getTextureAttributes(element)
    {
        return element.getAttributeNames()
            .filter(name => name.startsWith('data-texture-'))
            .map(name => ({
                name: name,
                value: element.getAttribute(name),
                number: parseInt(name.split('-')[2]) // Extract the number
            }))
            .sort((a, b) => a.number - b.number); // Sort by number
    }
}