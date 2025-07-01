import { Uniform, PlaneGeometry, ShaderMaterial, Mesh, Vector2, Color } from 'three'
import { gsap, ScrollTrigger } from '@utils/GSAP.js'

import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { UpdateGeometry } from '@gl/UpdateGeometry.js'

export default class index
{
    constructor(app, gl, scene, item, texture)
    {
        this.app = app
        this.gl = gl
        this.scene = scene
        this.item = item
        this.texture = texture

        this.sizes = this.app.sizes
        this.time = this.app.time

        this.init()
    }

    init()
    {
        this.setMaterial()
        this.setMesh()
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
                uTexture: new Uniform(this.texture),
                uRes: new Uniform(new Vector2(this.sizes.width, this.sizes.height)),
                uAspect: new Uniform(new Vector2(16, 9)),
                uSize: new Uniform(new Vector2(0, 0)),
                uFluid: new Uniform(null),
                uColor: new Uniform(new Color(255 / 255, 118 / 255, 162 / 255)),
            },
        })
    }

    setMesh()
    {
        this.rect = this.item.getBoundingClientRect()
        this.geometry = new PlaneGeometry(this.rect.width, this.rect.height, 1, 1)
        this.material.uniforms.uSize.value.set(this.rect.width, this.rect.height)
        this.material.uniforms.uAspect.value.set(this.rect.width, this.rect.height)

        this.mesh = new Mesh(this.geometry, this.material)
        this.mesh.renderOrder = 10

        this.scene.add(this.mesh)

        this.setPosition()
    }

    setPosition()
    {
        this.rect = this.item.getBoundingClientRect()
        this.mesh.position.x = this.rect.left + this.rect.width / 2 - this.sizes.width / 2
        this.mesh.position.y = -this.rect.top - this.rect.height / 2 + this.sizes.height / 2
    }

    resize()
    {
        this.rect = this.item.getBoundingClientRect()
        UpdateGeometry(this.mesh, new PlaneGeometry(this.rect.width, this.rect.height, 1, 1))
        this.mesh.material.uniforms.uSize.value.set(this.rect.width, this.rect.height)
    }

    update()
    {
        this.material.uniforms.uFluid.value = this.gl.fluidTexture
    }

    destroy()
    {
        this.material.dispose()
        this.geometry.dispose()
        this.scene.remove(this.mesh)
    }
}