import { WebGLRenderTarget, Box3 } from 'three'
import Resources from '@utils/Resources'
import gsap from 'gsap'

import Video from './meshs/video/index.js'
import Full from './meshs/full/index.js'
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
        this.count = 0
        this.items = this.main.querySelectorAll('.hero_image')
        this.sources = [...this.items].map((item, index) =>
        {
            const image = item.querySelector('img')
            const url = image.getAttribute('src')

            return { type: 'textureLoader', url, name: index }
        })

        this.resources = new Resources(this.sources)
        this.resources.on('ready', () => this.init())
    }

    init()
    {
        this.gl.loaded = true

        this.video = new Video(this.app, this.gl, this.scene, this.main)
        this.full = new Full(this.app, this.gl, this.scene, this.main)
        this.hero = new Hero(this.app, this.gl, this.scene, this.main, this.resources)

        this.app.page.triggerLoad()
        if(!this.app.onceLoaded) this.app.globalLoader.tl.play()
    }

    setScroll(e)
    {
        this.video?.setPosition()
        this.full?.setPosition()
        this.hero?.setPosition()
    }

    update()
    {
        this.video?.update()
        this.full?.update()
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
        this.video?.resize()
        this.full?.resize()
        this.hero?.resize()
    }

    onMouseMove(e, mouse)
    {
        this.hero?.onMouseMove(e, mouse)
    }

    destroy()
    {
        this.video?.destroy()
    }
}