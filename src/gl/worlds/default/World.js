import { WebGLRenderTarget, Box3, VideoTexture } from 'three'
import Resources from '@utils/Resources'
import gsap from 'gsap'

import FluidMask from '@gl/utils/fluidMask/index.js'


export default class World
{
    constructor(gl, app, scene, main)
    {
        this.gl = gl
        this.app = app
        this.scene = scene
        this.main = main

        this.sizes = this.app.sizes
        this.renderer = this.gl.renderer.instance
        this.camera = this.gl.camera.instance
        this.scene = scene

        this.load()
    }

    load()
    {
        this.footerLogo = this.main.querySelector('.footer_logo')
        this.sources = []

        if(this.footerLogo)
        {
            const texture = this.footerLogo.dataset.texture
            this.sources.push({ type: 'textureLoader', url: texture, name: 'footerLogo' })
            gsap.set(this.footerLogo, {opacity: 0})
        }

        this.resources = new Resources(this.sources)

        this.resources.on('ready', () => this.init())
    }

    init()
    {
        this.gl.loaded = true

        if(this.footerLogo)
        {
            this.footerFluid = new FluidMask(this.app, this.gl, this.scene, this.footerLogo, this.resources.items.footerLogo)
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
        this.footerFluid?.setPosition(e)
    }

    update()
    {
        this.footerFluid?.update()
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
        this.footerFluid?.resize()
    }

    onMouseMove(e, mouse)
    {

    }

    destroy()
    {
        this.footerFluid?.destroy()
    }
}