import {
  Uniform,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  Color,
  Group,
  VideoTexture,
} from "three";
import gsap from "gsap";
import { UpdateGeometry } from "@gl/UpdateGeometry.js";
import VideoLoader from "@modules/VideoLoader.js";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

export default class index {
  constructor(app, gl, scene, main, resources) {
    this.app = app;
    this.gl = gl;
    this.scene = scene;
    this.main = main;
    this.resources = resources.items;

    this.sizes = this.app.sizes;
    this.time = this.app.time;

    this.items = this.main.querySelectorAll(".hero_image, .hero_video");
    this.mouse = new Vector2(0, 0);
    this.offset = new Vector2(0, 0);
    this.outputOffset = new Vector2(0, 0);
    this.mouseEnabled = false; // Disable mouse interactions initially

    this.offsetQuicks = {
      x: gsap.quickTo(this.outputOffset, "x", {
        duration: 0.4,
        ease: "power2",
        onUpdate: () => {
          if (!this.mouseEnabled) return;
          this.meshs.forEach(({ material }) =>
            material.uniforms.uMouse.value.set(
              this.outputOffset.x,
              this.outputOffset.y
            )
          )
        },
      }),
      y: gsap.quickTo(this.outputOffset, "y", {
        duration: 0.4,
        ease: "power2",
      }),
    };

    // Enable mouse interactions after home animation completes
    this.app.on('homeAnimationComplete', () => {
      this.mouseEnabled = true;
    });

    this.init();
  }

  init() {
    this.setMaterial();
    this.setMesh();
    this.debug();
  }

  debug() {
    if (!this.app.debug.active) return;

    const gui = this.app.debug.gui;
    const folder = gui.addFolder("Home/Hero");

    // folder.add(this.material.uniforms.uOffset, 'value', -100, 100, 1).name('uOffset').onChange((value) =>
    // {
    //     this.meshs.forEach(({material}) => material.uniforms.uOffset.value = value)
    // })
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
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
        uOpacity: new Uniform(0),
      },
    });
  }

  setMesh() {
    this.group = new Group();
    this.scene.add(this.group);

    this.meshs = [...this.items].map((item, index) => {
      // Calculate correct resource index for images only
      const imageItems = [...this.items].filter((i) => i.querySelector("img"));
      const resourceIndex = imageItems.indexOf(item);
      const borderRadius = window
        .getComputedStyle(item)
        .getPropertyValue("border-radius");
      const rect = item.getBoundingClientRect();
      // Reduce geometry complexity for better performance
      const geometry = new PlaneGeometry(rect.width, rect.height, 50, 50);
      const material = this.material.clone();

      material.uniforms.uSize.value.set(rect.width, rect.height);
      material.uniforms.uBorder.value = parseFloat(borderRadius) || 0;

      // Detect content type and handle accordingly
      const image = item.querySelector("img");
      const video = item.querySelector("video");

      if (video) {
        // Handle video content
        if (video._videoLoaderInstance) {
          const videoLoader = video._videoLoaderInstance;
          if (videoLoader.isLoaded) {
            const texture = new VideoTexture(video);
            material.uniforms.uTexture.value = texture;
            material.uniforms.uAspect.value.set(
              videoLoader.width || video.videoWidth,
              videoLoader.height || video.videoHeight
            );
          } else {
            videoLoader.on("loaded", () => {
              const texture = new VideoTexture(video);
              material.uniforms.uTexture.value = texture;
              material.uniforms.uAspect.value.set(
                videoLoader.width,
                videoLoader.height
              );
            });
          }
        } else {
          // Fallback: create VideoLoader if module doesn't exist
          const videoLoader = new VideoLoader(video, { lazyLoad: false });
          videoLoader.on("loaded", () => {
            const texture = new VideoTexture(video);
            material.uniforms.uTexture.value = texture;
            material.uniforms.uAspect.value.set(
              videoLoader.width,
              videoLoader.height
            );
          });
        }
      } else if (image) {
        // Handle image content (existing logic)
        material.uniforms.uTexture.value = this.resources[resourceIndex];
        const url = image.getAttribute("src");
        const newImage = new Image();
        newImage.src = url;
        newImage.crossOrigin = "anonymous";
        newImage.onload = () => {
          material.uniforms.uAspect.value.set(newImage.width, newImage.height);
        };
      }

      const mesh = new Mesh(geometry, material);

      const tl = gsap.timeline({ paused: true });
      tl.to(mesh.material.uniforms.uHovered, {
        value: 1,
        duration: 0.4,
        ease: "power1.inOut",
      });

      this.group.add(mesh);

      item.style.setProperty("opacity", "0");
      this.app.observer.instance.observe(item);

      return { mesh, item, material, tl };
    });

    this.meshs.forEach(({ item }, index) => {
      item.addEventListener("mouseenter", () => {
        this.meshs.forEach(({ tl }, i) => {
          if (i != index) {
            tl.play();
          }
        });
      });

      item.addEventListener("mouseleave", () => {
        this.meshs.forEach(({ tl }, i) => {
          tl.reverse();
        });
      });
    });

    this.setPosition();
  }

  setPosition() {
    this.meshs.forEach(({ mesh, item }) => {
      if (item.dataset.visible == "false") return;

      const rect = item.getBoundingClientRect();
      mesh.position.x = rect.left + rect.width / 2 - this.sizes.width / 2;
      mesh.position.y = -rect.top - rect.height / 2 + this.sizes.height / 2;
    });
  }

  onMouseMove(e) {
    if (!this.mouseEnabled) return;
    
    this.mouse.x = e.clientX - window.innerWidth / 2;
    this.mouse.y = e.clientY - window.innerHeight / 2;

    this.offset.x = this.lerp(this.offset.x, this.mouse.x, 0.1);
    this.offset.y = this.lerp(this.offset.y, this.mouse.y, 0.1);

    this.offsetQuicks.x(-(this.mouse.x - this.offset.x) * 0.1);
    this.offsetQuicks.y((this.mouse.y - this.offset.y) * 0.02);
  }

  resize() {
    this.meshs.forEach(({ mesh, item }) => {
      const rect = item.getBoundingClientRect();
      UpdateGeometry(
        mesh,
        new PlaneGeometry(rect.width, rect.height, 50, 50)
      );
      mesh.material.uniforms.uSize.value.set(rect.width, rect.height);

      const borderRadius = window
        .getComputedStyle(item)
        .getPropertyValue("border-radius");
      mesh.material.uniforms.uBorder.value = parseFloat(borderRadius) || 0;
    });
  }

  update() {
    this.meshs.forEach(({ mesh, material }) => {
      material.uniforms.uFluid.value = this.gl.fluidTexture;
    });

    this.offsetQuicks.x(0);
    this.offsetQuicks.y(0);
  }

  destroy() {
    this.meshs.forEach(({ mesh, material }) => {
      material.dispose();
      mesh.geometry.dispose();
      // Remove from group, not scene directly
      this.group.remove(mesh);
    });

    // Remove the entire group from the scene
    if (this.group) {
      this.scene.remove(this.group);
    }
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
}
