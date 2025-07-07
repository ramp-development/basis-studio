import { WebGLRenderTarget, Box3, VideoTexture } from 'three'
import Resources from '@utils/Resources'
import gsap from 'gsap'

import Hero from './meshs/hero/index.js'


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
        this.hero = this.main.querySelector('.h-services')
        this.texture = this.hero.querySelector('.h-services_bg').querySelector('img')

        this.sources = [{ type: 'textureLoader', url: this.texture.getAttribute('src'), name: 'hero' }]
        this.resources = new Resources(this.sources)

        this.resources.on('ready', () => this.init())
    }

    init()
    {
        this.gl.loaded = true

        this.hero = new Hero(this.app, this.gl, this.scene, this.main, this.resources.items.hero, this.texture)

        this.app.page.triggerLoad()
        if(!this.app.onceLoaded) this.app.globalLoader.tl.play()
        else this.app.enterPage.tl.play()

        this.app.trigger('loadedWorld')
    }

    setScroll(e)
    {
        this.hero?.setPosition(e)
    }

    update()
    {
        this.hero?.update()
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
        this.hero?.resize()
    }

    onMouseMove(e, mouse)
    {

    }

    destroy()
    {
        this.hero?.destroy()
    }
}