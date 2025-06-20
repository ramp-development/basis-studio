// Enhanced fluid implementation
// src/js/world/meshs/fluid/index.js

import { Uniform, PlaneGeometry, ShaderMaterial, Mesh, Color, Vector2 } from 'three'
import * as THREE from 'three'

import baseVertex from './vertex.glsl'
import clearShader from './clearShader.glsl'
import splatShader from './splatShader.glsl'
import advectionShader from './advectionShader.glsl'
import divergenceShader from './divergenceShader.glsl'
import curlShader from './curlShader.glsl'
import vorticityShader from './vorticityShader.glsl'
import pressureShader from './pressureShader.glsl'
import gradientSubtractShader from './gradientSubtractShader.glsl'

import { UpdateGeometry } from '@gl/UpdateGeometry'

export default class FluidSimulation {
    constructor(app, gl) {
        this.app = app;
        this.gl = gl;

        this.renderer = this.gl.renderer.instance;
        this.camera = this.gl.camera.instance;
        this.scene = this.gl.scene;
        this.sizes = this.app.sizes;

        // Mouse tracking
        this.mouse = new Vector2();
        this.lastMouse = new Vector2(-1);
        this.splats = [];

        // Simulation settings - tunable parameters
        this.simRes = 128;  // Fluid simulation resolution
        this.dyeRes = 512;  // Fluid visualization resolution (higher = more detailed)
        this.iterations = 3; // Pressure solver iterations (higher = more accurate)
        this.densityDissipation = 0.95; // How quickly dye fades (0.95-0.99)
        this.velocityDissipation = 0.95; // How quickly velocity fades (0.95-0.99)
        this.pressureDissipation = 0.8; // Pressure dissipation (0.7-0.9)
        this.curlStrength = 36; // Vorticity strength (10-30)
        this.radius = this.sizes.width / 10000; // Splat radius (0.1-0.3)
        this.splatForce = 2000; // Amplifies mouse movement impact (3000-10000)
        this.outputColor = new Color(1,1,1); // Default output color

        this.init();
    }

    init() {
        this.createFramebuffers();
        this.createSimulationMeshes();
    }

    createFramebuffers() {
        // Define texture formats
        this.format = THREE.RGBAFormat;
        this.type = THREE.HalfFloatType; // Use HalfFloat for better precision

        // Set up texel size uniform for shaders
        this.texelSize = new Vector2(1 / this.simRes, 1 / this.simRes);
        this.dyeTexelSize = new Vector2(1 / this.dyeRes, 1 / this.dyeRes);

        // Create double buffered FBOs for ping-pong rendering
        this.density = this.createDoubleFBO(this.dyeRes, this.dyeRes, THREE.LinearFilter);
        this.velocity = this.createDoubleFBO(this.simRes, this.simRes, THREE.LinearFilter);
        this.pressure = this.createDoubleFBO(this.simRes, this.simRes, THREE.NearestFilter);

        // Create single render targets for intermediate steps
        this.curl = new THREE.WebGLRenderTarget(this.simRes, this.simRes, {
            format: this.format,
            type: this.type,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter
        });

        this.divergence = new THREE.WebGLRenderTarget(this.simRes, this.simRes, {
            format: this.format,
            type: this.type,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter
        });
    }

    createDoubleFBO(width, height, filter) {
        const options = {
            format: this.format,
            type: this.type,
            minFilter: filter,
            magFilter: filter,
            depthBuffer: false,
            stencilBuffer: false
        };

        return {
            read: new THREE.WebGLRenderTarget(width, height, options),
            write: new THREE.WebGLRenderTarget(width, height, options),
            swap: function() {
                const temp = this.read;
                this.read = this.write;
                this.write = temp;
            }
        };
    }

    createSimulationMeshes() {
        // Create all the shader meshes used for simulation steps
        this.clearMesh = this.createShaderMesh(clearShader, {
            texelSize: new Uniform(this.texelSize),
            uTexture: new Uniform(null),
            value: new Uniform(this.pressureDissipation)
        });

        this.splatMesh = this.createShaderMesh(splatShader, {
            texelSize: new Uniform(this.texelSize),
            uTarget: new Uniform(null),
            aspectRatio: new Uniform(this.sizes.width / this.sizes.height),
            color: new Uniform(new Color()),
            point: new Uniform(new Vector2()),
            radius: new Uniform(this.radius / 100)
        });

        this.advectionMesh = this.createShaderMesh(advectionShader, {
            texelSize: new Uniform(this.texelSize),
            dyeTexelSize: new Uniform(this.dyeTexelSize),
            uVelocity: new Uniform(null),
            uSource: new Uniform(null),
            dt: new Uniform(0.016),
            dissipation: new Uniform(1.0)
        });

        this.divergenceMesh = this.createShaderMesh(divergenceShader, {
            texelSize: new Uniform(this.texelSize),
            uVelocity: new Uniform(null)
        });

        this.curlMesh = this.createShaderMesh(curlShader, {
            texelSize: new Uniform(this.texelSize),
            uVelocity: new Uniform(null)
        });

        this.vorticityMesh = this.createShaderMesh(vorticityShader, {
            texelSize: new Uniform(this.texelSize),
            uVelocity: new Uniform(null),
            uCurl: new Uniform(null),
            curl: new Uniform(this.curlStrength),
            dt: new Uniform(0.016)
        });

        this.pressureMesh = this.createShaderMesh(pressureShader, {
            texelSize: new Uniform(this.texelSize),
            uPressure: new Uniform(null),
            uDivergence: new Uniform(null)
        });

        this.gradientSubtractMesh = this.createShaderMesh(gradientSubtractShader, {
            texelSize: new Uniform(this.texelSize),
            uPressure: new Uniform(null),
            uVelocity: new Uniform(null)
        });
    }

    createShaderMesh(fragmentShader, uniforms) {
        // Helper to create a full-screen quad with a shader
        const material = new ShaderMaterial({
            vertexShader: baseVertex,
            fragmentShader,
            uniforms: { ...uniforms },
            depthTest: false,
            depthWrite: false
        });

        const geometry = new PlaneGeometry(this.sizes.width, this.sizes.height); // Full screen quad in NDC space
        return new Mesh(geometry, material);
    }

    // Add a splat at the given location with given velocity
    splat({ x, y, dx, dy }) {
        // Apply velocity splat
        this.splatMesh.material.uniforms.uTarget.value = this.velocity.read.texture;
        this.splatMesh.material.uniforms.aspectRatio.value = this.sizes.width / this.sizes.height;
        this.splatMesh.material.uniforms.point.value.set(x, y);
        this.splatMesh.material.uniforms.color.value.set(dx, dy, 1.0);
        this.splatMesh.material.uniforms.radius.value = this.radius / 100;

        this.renderer.setRenderTarget(this.velocity.write);
        this.renderer.render(this.splatMesh, this.camera);
        this.velocity.swap();

        // Apply density (color) splat
        this.splatMesh.material.uniforms.uTarget.value = this.density.read.texture;
        // Random color for visual interest
        const r = Math.random() * 2 + 0.5;
        const g = Math.random() * 2 + 0.5;
        const b = Math.random() * 2 + 0.5;
        this.splatMesh.material.uniforms.color.value.set(this.outputColor);

        this.renderer.setRenderTarget(this.density.write);
        this.renderer.render(this.splatMesh, this.camera);
        this.density.swap();
    }

    simulateFluid() {
        // Process all inputs/splats
        for (let i = this.splats.length - 1; i >= 0; i--) {
            this.splat(this.splats.splice(i, 1)[0]);
        }

        // Calculate curl
        this.curlMesh.material.uniforms.uVelocity.value = this.velocity.read.texture;
        this.renderer.setRenderTarget(this.curl);
        this.renderer.render(this.curlMesh, this.camera);

        // Apply vorticity confinement (enhances rotational features)
        this.vorticityMesh.material.uniforms.uVelocity.value = this.velocity.read.texture;
        this.vorticityMesh.material.uniforms.uCurl.value = this.curl.texture;
        this.renderer.setRenderTarget(this.velocity.write);
        this.renderer.render(this.vorticityMesh, this.camera);
        this.velocity.swap();

        // Calculate divergence
        this.divergenceMesh.material.uniforms.uVelocity.value = this.velocity.read.texture;
        this.renderer.setRenderTarget(this.divergence);
        this.renderer.render(this.divergenceMesh, this.camera);

        // Clear pressure field
        this.clearMesh.material.uniforms.uTexture.value = this.pressure.read.texture;
        this.clearMesh.material.uniforms.value.value = this.pressureDissipation;
        this.renderer.setRenderTarget(this.pressure.write);
        this.renderer.render(this.clearMesh, this.camera);
        this.pressure.swap();

        // Solve pressure (iterative)
        this.pressureMesh.material.uniforms.uDivergence.value = this.divergence.texture;
        for (let i = 0; i < this.iterations; i++) {
            this.pressureMesh.material.uniforms.uPressure.value = this.pressure.read.texture;
            this.renderer.setRenderTarget(this.pressure.write);
            this.renderer.render(this.pressureMesh, this.camera);
            this.pressure.swap();
        }

        // Apply pressure force to velocity
        this.gradientSubtractMesh.material.uniforms.uPressure.value = this.pressure.read.texture;
        this.gradientSubtractMesh.material.uniforms.uVelocity.value = this.velocity.read.texture;
        this.renderer.setRenderTarget(this.velocity.write);
        this.renderer.render(this.gradientSubtractMesh, this.camera);
        this.velocity.swap();

        // Self-advect velocity
        this.advectionMesh.material.uniforms.dyeTexelSize.value.copy(this.texelSize);
        this.advectionMesh.material.uniforms.uVelocity.value = this.velocity.read.texture;
        this.advectionMesh.material.uniforms.uSource.value = this.velocity.read.texture;
        this.advectionMesh.material.uniforms.dissipation.value = this.velocityDissipation;
        this.renderer.setRenderTarget(this.velocity.write);
        this.renderer.render(this.advectionMesh, this.camera);
        this.velocity.swap();

        // Advect dye/density
        this.advectionMesh.material.uniforms.dyeTexelSize.value.copy(this.dyeTexelSize);
        this.advectionMesh.material.uniforms.uVelocity.value = this.velocity.read.texture;
        this.advectionMesh.material.uniforms.uSource.value = this.density.read.texture;
        this.advectionMesh.material.uniforms.dissipation.value = this.densityDissipation;
        this.renderer.setRenderTarget(this.density.write);
        this.renderer.render(this.advectionMesh, this.camera);
        this.renderer.setRenderTarget(null);
        this.density.swap();

        this.gl.fluidTexture = this.density.read.texture;
    }

    resize() {
        // Update texel sizes when resizing
        this.texelSize.set(1 / this.simRes, 1 / this.simRes);
        this.dyeTexelSize.set(1 / this.dyeRes, 1 / this.dyeRes);

        // Update all the uniforms that depend on the texel size
        this.updateTexelSizeUniforms();
    }

    updateTexelSizeUniforms() {
        const meshes = [
            this.clearMesh,
            this.splatMesh,
            this.advectionMesh,
            this.divergenceMesh,
            this.curlMesh,
            this.vorticityMesh,
            this.pressureMesh,
            this.gradientSubtractMesh
        ];

        meshes.forEach(mesh => {
            if (mesh && mesh.material && mesh.material.uniforms.texelSize) {
                mesh.material.uniforms.texelSize.value.copy(this.texelSize);
            }

            UpdateGeometry(mesh, new PlaneGeometry(this.sizes.width, this.sizes.height));
        });
    }

    update() {
        this.simulateFluid();
    }

    // Track mouse movement to create fluid interaction
    getMouse(e, mouse) {
        // Get normalized mouse position
        const x = e.clientX / this.sizes.width;
        const y = 1.0 - e.clientY / this.sizes.height;

        // If this is the first point, initialize lastMouse
        if (this.lastMouse.x < 0) {
            this.lastMouse.set(x, y);
            return;
        }

        // Calculate mouse velocity (scaled for more impact)
        const deltaX = (x - this.lastMouse.x) * this.splatForce;
        const deltaY = (y - this.lastMouse.y) * this.splatForce;

        // Update last mouse position
        this.lastMouse.set(x, y);

        // Only add a splat if the mouse has moved significantly
        if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
            this.splats.push({
                x: x,
                y: y,
                dx: deltaX,
                dy: deltaY
            });
        }
    }
}