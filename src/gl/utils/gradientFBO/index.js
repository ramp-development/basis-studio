import { Uniform, PlaneGeometry, ShaderMaterial, Mesh, Vector2, Color, WebGLRenderTarget } from 'three'
import gsap from 'gsap'

import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { UpdateGeometry } from '@gl/UpdateGeometry.js'

export default class index
{
    constructor(app, gl, scene, camera)
    {
        this.app = app
        this.gl = gl
        this.scene = scene
        this.camera = camera
        this.renderer = this.gl.renderer.instance

        this.target = new WebGLRenderTarget(this.app.sizes.width * 0.5, this.app.sizes.height * 0.5)

        this.sizes = this.app.sizes

        this.init()
    }

    init()
    {
        this.props =
        {
            // Default colors
            colorMain: new Color(132 / 256, 92 / 256, 243 / 256),
            colorMid: new Color(106 / 256, 231 / 256, 208 / 256),
            colorGrey: new Color(4 / 256, 7 / 256, 15 / 256),
        }

        this.colors =
        [
            this.props.colorMain,
            this.props.colorMid,
        ]

        this.setMaterial()
        this.setMesh()

        this.mouse = { x: 0, y: 0 }

        this.quickX = gsap.quickTo(this.mouse, 'x', {duration: 0.4, onUpdate: () => this.material.uniforms.uMouse.value.x = this.mouse.x})
        this.quickY = gsap.quickTo(this.mouse, 'y', {duration: 0.4, onUpdate: () => this.material.uniforms.uMouse.value.y = this.mouse.y})
    }

    setMaterial()
    {
        this.material = new ShaderMaterial(
        {
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            uniforms:
            {
                uTime: new Uniform(0),
                uMain: new Uniform(this.props.colorMain),
                uBg: new Uniform(this.props.colorGrey),
                uMidColor: new Uniform(this.props.colorMid),
                uColors: new Uniform(this.colors),
            },
            // wireframe: true,
        })
    }

    onMouseMove(e, mouse)
    {
        // const x = (e.clientX / window.innerWidth) * 2 - 1
        // const y = ((e.clientY / window.innerHeight) * -2 + 1)

        // if(this.mouse)
        // {
        //     this.quickX(x)
        //     this.quickY(y)
        // }
    }

    setMesh()
    {
        const { width, height } = this.calculateFullscreenSize()

        this.geometry = new PlaneGeometry(width * 2, height * 2, 300, 300)

        this.mesh = new Mesh(this.geometry, this.material)
        this.mesh.rotation.x = -Math.PI / 6
        this.mesh.position.y = Math.PI / 6
        this.mesh.position.z = Math.PI / 6
        this.scene.add(this.mesh)
    }

    resize()
    {
        const { width, height } = this.calculateFullscreenSize()
        UpdateGeometry(this.mesh, new PlaneGeometry(width * 2, height * 2, 300, 300))
    }

    calculateFullscreenSize()
    {
        // Get the camera's field of view in radians
        const fovRad = this.camera.instance.fov * Math.PI / 180

        // Calculate the visible height at the z-position of the plane
        const distance = this.camera.instance.position.z
        const visibleHeight = 2 * Math.tan(fovRad / 2) * distance

        // Calculate the visible width using the aspect ratio
        const visibleWidth = visibleHeight * this.camera.instance.aspect

        // Return the dimensions needed to fill the screen
        return { width: visibleWidth, height: visibleHeight }
    }


    update()
    {
        this.material.uniforms.uTime.value = this.app.time.elapsed / 1000

        this.renderer.setRenderTarget(this.target)
        this.renderer.render(this.scene, this.camera.instance)
        this.renderer.setRenderTarget(null)

        this.gl.gradientTexture = this.target.texture
    }

    destroy()
    {
        this.material.dispose()
        this.geometry.dispose()
        this.scene.remove(this.mesh)
    }
}