import { Uniform, PlaneGeometry, ShaderMaterial, Mesh, Vector2, VideoTexture } from 'three'
import gsap from 'gsap'

import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { UpdateGeometry } from '@gl/UpdateGeometry.js'
import VideoLoader from '@utils/VideoLoader.js'

export default class index
{
    constructor(app, gl, scene, main)
    {
        this.app = app
        this.gl = gl
        this.scene = scene
        this.main = main

        this.sizes = this.app.sizes
        this.time = this.app.time

        this.items = this.main.querySelectorAll('.preview_img')

        this.init()
    }

    init()
    {
        this.setMaterial()
        this.setMesh()
        // this.debug()
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
            },
        })
    }

    setMesh()
    {
        this.meshs = [...this.items].map((item, index) =>
        {
            const roots = window.getComputedStyle(item).getPropertyValue('border-radius').split('px')
            const rect = item.getBoundingClientRect()
            const geometry = new PlaneGeometry(rect.width, rect.height, 1, 1)
            const material = this.material.clone()
            material.uniforms.uSize.value.set(rect.width, rect.height)
            material.uniforms.uTexture.value = this.gl.gradientTexture
            material.uniforms.uBorder.value = parseFloat(roots[0])
            const mesh = new Mesh(geometry, material)

            const video = item.querySelector('video')
            if(video)
            {
                const videoLoader = new VideoLoader(video)
                videoLoader.on('loaded', () =>
                {
                    const texture = new VideoTexture(video)
                    material.uniforms.uTexture.value = texture
                    material.uniforms.uAspect.value.set(videoLoader.width, videoLoader.height)
                })
            }

            this.scene.add(mesh)

            this.app.observer.instance.observe(item)

            return {mesh, item, material}
        })

        this.setPosition()
    }

    setPosition()
    {
        this.meshs.forEach(({mesh, item}) =>
        {
            if(item.dataset.visible == 'false')
            {
                mesh.visible = false
                return
            }
            mesh.visible = true

            const rect = item.getBoundingClientRect()
            mesh.position.x = rect.left + rect.width / 2 - this.sizes.width / 2
            mesh.position.y = -rect.top - rect.height / 2 + this.sizes.height / 2
        })
    }

    resize()
    {
        this.meshs.forEach(({mesh, item}) =>
        {
            const rect = item.getBoundingClientRect()
            UpdateGeometry(mesh, new PlaneGeometry(rect.width, rect.height, 1, 1))
            mesh.material.uniforms.uSize.value.set(rect.width, rect.height)

            const roots = window.getComputedStyle(item).getPropertyValue('border-radius').split('px')
            mesh.material.uniforms.uBorder.value = parseFloat(roots[0])
        })
    }

    update()
    {
        // this.meshs.forEach(({mesh, material}) =>
        // {
        //     // material.uniforms.uTexture.value = this.gl.gradientTexture
        // })
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
}