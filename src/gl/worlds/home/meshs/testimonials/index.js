import { Uniform, PlaneGeometry, ShaderMaterial, Mesh, Vector2, Color } from 'three'
import gsap from 'gsap'

import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { UpdateGeometry } from '@gl/UpdateGeometry.js'

export default class index
{
    constructor(app, gl, scene, main, section)
    {
        this.app = app
        this.gl = gl
        this.scene = scene
        this.main = main
        this.section = section

        this.sizes = this.app.sizes
        this.time = this.app.time

        this.items = this.section.querySelectorAll('.testimonials_item')
        this.mouse = new Vector2(0, 0)
        this.offset = new Vector2(0, 0)
        this.outputOffset = new Vector2(0, 0)
        this.velocity = { value: 0 }
        this.quick = gsap.quickTo(this.velocity, 'value', { duration: 0.5, ease: 'power2' })

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
                uRes: new Uniform(new Vector2(this.sizes.width, this.sizes.height)),
                uSize: new Uniform(new Vector2(0, 0)),
                uBorder: new Uniform(0),
                uTime: new Uniform(0),
                uOffset: new Uniform(new Vector2(0, 0)),
                uHovered: new Uniform(0),
                uColor: new Uniform(new Color(24 / 255, 24 / 255, 24 / 255)),
                uHoverColor: new Uniform(new Color(1, 1, 1)),
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

            const mesh = new Mesh(geometry, material)

            const tl = gsap.timeline({ paused: true })
            tl.to(mesh.material.uniforms.uHovered, { value: 1, duration: 0.4, ease: 'power1.inOut' })

            this.scene.add(mesh)

            this.app.observer.instance.observe(item)

            return {mesh, item, material, tl}
        })

        this.meshs.forEach(({item, tl}, index) =>
        {
            item.addEventListener('mouseenter', () => tl.play())
            item.addEventListener('mouseleave', () => tl.reverse())
        })

        this.setPosition()
    }

    setPosition(e)
    {
        this.meshs.forEach(({mesh, item}) =>
        {
            if(item.dataset.visible == 'false') return

            const rect = item.getBoundingClientRect()
            mesh.position.x = rect.left + rect.width / 2 - this.sizes.width / 2
            mesh.position.y = -rect.top - rect.height / 2 + this.sizes.height / 2
        })

        if(e)
        {
            this.quick(-e.velocity * 1.5)
            this.meshs.forEach(({material}) => material.uniforms.uOffset.value.y = this.velocity.value)
        }
    }

    setCarouselPosition(speed)
    {
        this.meshs.forEach(({mesh, item}) =>
        {
            if(item.dataset.visible == 'false') return

            const rect = item.getBoundingClientRect()
            mesh.position.x = rect.left + rect.width / 2 - this.sizes.width / 2
            mesh.position.y = -rect.top - rect.height / 2 + this.sizes.height / 2
            mesh.material.uniforms.uOffset.value.x = speed * 2
        })
    }

    onMouseMove(e)
    {
        // this.mouse.x = e.clientX - window.innerWidth / 2
        // this.mouse.y = e.clientY - window.innerHeight / 2

        // this.offset.x = this.lerp(this.offset.x, this.mouse.x, 0.1)
        // this.offset.y = this.lerp(this.offset.y, this.mouse.y, 0.1)

        // this.offsetQuicks.x(-(this.mouse.x - this.offset.x) * 0.15)
        // this.offsetQuicks.y((this.mouse.y - this.offset.y) * 0.09)
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
        // this.offsetQuicks.x(0)
        // this.offsetQuicks.y(0)
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