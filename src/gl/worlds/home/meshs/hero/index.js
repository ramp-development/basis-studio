import { Uniform, PlaneGeometry, ShaderMaterial, Mesh, Vector2, Color } from 'three'
import gsap from 'gsap'

import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { UpdateGeometry } from '@gl/UpdateGeometry.js'

export default class index
{
    constructor(app, gl, scene, main, resources)
    {
        this.app = app
        this.gl = gl
        this.scene = scene
        this.main = main
        this.resources = resources.items

        this.sizes = this.app.sizes
        this.time = this.app.time

        this.items = this.main.querySelectorAll('.hero_image')
        this.mouse = new Vector2(0, 0)
        this.offset = new Vector2(0, 0)
        this.outputOffset = new Vector2(0, 0)

        this.offsetQuicks =
        {
            x: gsap.quickTo(this.outputOffset, 'x', { duration: 0.4, ease: 'power2', onUpdate: () => this.meshs.forEach(({material}) => material.uniforms.uMouse.value.set(this.outputOffset.x, this.outputOffset.y))}),
            y: gsap.quickTo(this.outputOffset, 'y', { duration: 0.4, ease: 'power2' })
        }

        this.init()
    }

    init()
    {
        this.setMaterial()
        this.setMesh()
        this.debug()
    }

    debug()
    {
        if(!this.app.debug.active) return

        const gui = this.app.debug.gui
        const folder = gui.addFolder('Home/Hero')

        // folder.add(this.material.uniforms.uOffset, 'value', -100, 100, 1).name('uOffset').onChange((value) =>
        // {
        //     this.meshs.forEach(({material}) => material.uniforms.uOffset.value = value)
        // })
    }

    setMaterial()
    {
        this.material = new ShaderMaterial(
        {
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            depthTest: false,
            uniforms:
            {
                uTexture: new Uniform(null),
                uRes: new Uniform(new Vector2(this.sizes.width, this.sizes.height)),
                uAspect: new Uniform(new Vector2(16, 9)),
                uSize: new Uniform(new Vector2(0, 0)),
                uBorder: new Uniform(0),
                uTime: new Uniform(0),
                uFluid: new Uniform(null),
                uHovered: new Uniform(0),
                uColor: new Uniform(new Color(255 / 255, 118 / 255, 162 / 255)),
                uMouse: new Uniform(this.mouse),
            },
        })
    }

    setMesh()
    {
        this.meshs = [...this.items].map((item, index) =>
        {
            const roots = window.getComputedStyle(item).getPropertyValue('border-radius').split('px')
            const rect = item.getBoundingClientRect()
            const geometry = new PlaneGeometry(rect.width, rect.height, 200, 200)
            const material = this.material.clone()

            material.uniforms.uSize.value.set(rect.width, rect.height)
            material.uniforms.uBorder.value = parseFloat(roots[0])
            material.uniforms.uTexture.value = this.resources[index]

            const image = item.querySelector('img')
            const url = image.getAttribute('src')
            const newImage = new Image()
            newImage.src = url
            newImage.crossOrigin = 'anonymous'
            newImage.onload = () =>
            {
                material.uniforms.uAspect.value.set(newImage.width, newImage.height)
            }

            const mesh = new Mesh(geometry, material)

            const tl = gsap.timeline({ paused: true })
            tl.to(mesh.material.uniforms.uHovered, { value: 1, duration: 0.4, ease: 'power1.inOut' })

            this.scene.add(mesh)

            item.style.setProperty('opacity', '0')
            this.app.observer.instance.observe(item)

            return {mesh, item, material, tl}
        })

        this.meshs.forEach(({item}, index) =>
        {
            item.addEventListener('mouseenter', () =>
            {
                this.meshs.forEach(({tl}, i) =>
                {
                    if(i != index) tl.play()
                })
            })

            item.addEventListener('mouseleave', () =>
            {
                this.meshs.forEach(({tl}, i) =>
                {
                    tl.reverse()
                })
            })
        })

        this.setPosition()
    }

    setPosition()
    {
        this.meshs.forEach(({mesh, item}) =>
        {
            if(item.dataset.visible == 'false') return

            const rect = item.getBoundingClientRect()
            mesh.position.x = rect.left + rect.width / 2 - this.sizes.width / 2
            mesh.position.y = -rect.top - rect.height / 2 + this.sizes.height / 2
        })
    }

    onMouseMove(e)
    {
        this.mouse.x = e.clientX - window.innerWidth / 2
        this.mouse.y = e.clientY - window.innerHeight / 2

        this.offset.x = this.lerp(this.offset.x, this.mouse.x, 0.1)
        this.offset.y = this.lerp(this.offset.y, this.mouse.y, 0.1)

        this.offsetQuicks.x(-(this.mouse.x - this.offset.x) * 0.1)
        this.offsetQuicks.y((this.mouse.y - this.offset.y) * 0.02)
    }

    resize()
    {
        this.meshs.forEach(({mesh, item}) =>
        {
            const rect = item.getBoundingClientRect()
            UpdateGeometry(mesh, new PlaneGeometry(rect.width, rect.height, 200, 200))
            mesh.material.uniforms.uSize.value.set(rect.width, rect.height)

            const roots = window.getComputedStyle(item).getPropertyValue('border-radius').split('px')
            mesh.material.uniforms.uBorder.value = parseFloat(roots[0])
        })
    }

    update()
    {
        this.meshs.forEach(({mesh, material}) =>
        {
            material.uniforms.uFluid.value = this.gl.fluidTexture
        })

        this.offsetQuicks.x(0)
        this.offsetQuicks.y(0)
    }

    destroy()
    {
        this.meshs.forEach(({mesh, material}) =>
        {
            material.dispose()
            mesh.geometry.dispose()
            this.scene.remove(mesh)
        })
    }

    lerp(start, end, t)
    {
        return start * ( 1 - t ) + end * t;
    }
}