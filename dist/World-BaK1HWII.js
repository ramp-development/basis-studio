import{A as x}from"./app.js";import{R as P}from"./Resources-DGiz5Izq.js";import{i as M}from"./index-_L0I9zhC.js";import{S as A,U as n,C as b,V as l,P as f,M as C,a as c,b as z}from"./GL-D_VvO4-c.js";import S from"./VideoLoader-CTtbx0ai.js";import"./isSafari-DYs6RIMp.js";var B=`uniform float uOffset;

varying vec2 vUv;
varying vec2 screenUv;

#define PI 3.14159265359

vec3 deformationCurve(vec3 position, vec2 uv, float offset)
{
    vec3 deformedPos = position;

    deformedPos.x += sin(uv.y * PI) * offset;

    return deformedPos;
}

void main()
{
    vUv = uv;

    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    
    vec2 largeUv = vec2(projectedPosition.xy / projectedPosition.w) * 0.5 + 0.5;

    
    vec3 deformedPosition = vec3(position.x, position.y, position.z);
    deformedPosition.x = deformationCurve(position, largeUv, uOffset).x;

    
    modelPosition = modelMatrix * vec4(deformedPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,D=`uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uBorder;
uniform float uParallax;
uniform float uScroll;

varying vec2 vUv;
varying vec2 screenUv;

vec2 getCoverUv(vec2 uv, vec2 uTextureResolution, vec2 uItemSizes)
{
    vec2 tempUv = uv - vec2(0.5);

    float quadAspectRatio = uItemSizes.x / uItemSizes.y;
    float textureAspectRatio = uTextureResolution.x / uTextureResolution.y;

    if (quadAspectRatio < textureAspectRatio) {
        tempUv = tempUv * vec2(quadAspectRatio / textureAspectRatio, 1.0);
    } else {
        tempUv = tempUv * vec2(1.0, textureAspectRatio / quadAspectRatio);
    }

    return tempUv + vec2(0.5);
}
float getAlpha(vec2 uRes, float uBorder, vec2 uv)
{
    vec2 aspect = uRes / max(uRes.x, uRes.y);

    vec2 alphaUv = uv - 0.5;

    float borderRadius = min(uBorder, min(uRes.x, uRes.y) * 0.5);

    vec2 offset = vec2(borderRadius) / uRes;
    vec2 alphaXY = smoothstep(vec2(0.5 - offset), vec2(0.5 - offset - 0.001), abs(alphaUv));
    float alpha = min(1.0, alphaXY.x + alphaXY.y);

    vec2 aplhaUV2 = abs(uv - 0.5);
    float radius = borderRadius / max(uRes.x, uRes.y);
    aplhaUV2 = (aplhaUV2 - 0.5) * aspect + radius;
    float roundedAlpha = smoothstep(radius + 0.001, radius, length(aplhaUV2));

    return alpha = min(1.0, alpha + roundedAlpha);
}
vec4 applyBlur(sampler2D tex, vec2 uv, float blurAmount) {
    vec2 texelSize = 1.0 / uRes;
    vec4 color = vec4(0.0);

    
    float total = 0.0;
    for(int x = -2; x <= 2; x++) {
        for(int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * texelSize * blurAmount;
            color += texture2D(tex, uv + offset);
            total += 1.0;
        }
    }

    return color / total;
}

vec4 fastGaussianBlur(sampler2D tex, vec2 uv, float blurAmount) {
    vec2 texelSize = 1.0 / uRes;
    vec4 color = vec4(0.0);

    
    float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

    
    color += texture2D(tex, uv) * weights[0];
    for(int i = 1; i < 5; i++) {
        vec2 offset = vec2(float(i) * texelSize.x * blurAmount, 0.0);
        color += texture2D(tex, uv + offset) * weights[i];
        color += texture2D(tex, uv - offset) * weights[i];
    }

    return color;
}

vec4 fakeBlur(sampler2D tex, vec2 uv, float blurAmount) {
    
    vec2 noise = vec2(
        fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453)
    ) - 0.5;

    vec2 offset = noise * blurAmount * 0.01;
    return texture2D(tex, uv + offset);
}
vec3 applyTint(vec3 originalColor, vec3 tintColor, float strength) {
    return mix(originalColor, originalColor * tintColor, strength);
}

vec3 applyOverlayTint(vec3 originalColor, vec3 tintColor, float strength) {
    vec3 overlay = mix(originalColor, tintColor, 0.5);
    return mix(originalColor, overlay, strength);
}

vec3 applyMultiplyTint(vec3 originalColor, vec3 tintColor, float strength) {
    vec3 multiplied = originalColor * tintColor;
    return mix(originalColor, multiplied, strength);
}

void main()
{
    vec2 uv = vUv;
    vec2 coverUv = getCoverUv(uv, uAspect, uSize);

    coverUv -= 0.5;
    coverUv *= 0.9 + (1. - uScroll) * 0.1;
    coverUv += 0.5;

    coverUv.y -= uScroll * 0.1;

    vec4 color = texture2D(uTexture, coverUv);
    float alpha = getAlpha(uSize, uBorder, uv);
    float cursor = texture2D(uFluid, screenUv).r;

    color.a *= alpha;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    color.rgb = applyOverlayTint(color.rgb, uColor, tintAmount);
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor * 5.).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor * 0.5);

    float fadeArea = smoothstep(0.0, 0.5, uv.y);
    color.rgb = mix(color.rgb * 0.2, color.rgb, fadeArea);

    float alphaFade = step(uScroll, uv.y);
    color.a *= alphaFade;

    gl_FragColor = color;
}`;const y=x.getInstance();let w=null,L=class{constructor(t,e,o,r){w=t,this.scene=e,this.main=o,this.item=r,this.sizes=y.sizes,this.time=y.time,this.rect=this.item.getBoundingClientRect(),this.init()}init(){this.setMaterial(),this.setMesh()}setMaterial(){this.material=new A({vertexShader:B,fragmentShader:D,transparent:!0,depthTest:!1,uniforms:{uTexture:new n(null),uRes:new n(new l(this.sizes.width,this.sizes.height)),uAspect:new n(new l(16,9)),uSize:new n(new l(0,0)),uBorder:new n(0),uReveal:new n(0),uRotate:new n(0),uRotateX:new n(0),uRotateY:new n(0),uRadius:new n(.02),uScroll:new n(0),uZoom:new n(.55),uTime:new n(0),uFluid:new n(null),uOffset:new n(null),uParallax:new n(0),uColor:new n(new b(255/255,118/255,162/255))}})}setMesh(){this.geometry=new f(this.rect.width,this.rect.height,1,1),this.mesh=new C(this.geometry,this.material),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height);const t=this.item.querySelector("video");if(t)if(t.style.opacity=0,t._videoLoaderInstance){const e=t._videoLoaderInstance;if(e.isLoaded){const o=new c(t);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(e.width||t.videoWidth,e.height||t.videoHeight)}else e.on("loaded",()=>{const o=new c(t);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(e.width,e.height)})}else{const e=new S(t,{lazyLoad:!1});e.on("loaded",()=>{const o=new c(t);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(e.width,e.height)})}this.scene.add(this.mesh),this.setPosition()}setPosition(t){this.rect=this.item.getBoundingClientRect(),this.mesh.position.x=this.rect.left+this.rect.width/2-this.sizes.width/2,this.mesh.position.y=-this.rect.top-this.rect.height/2+this.sizes.height/2}resize(){this.rect=this.item.getBoundingClientRect(),z(this.mesh,new f(this.rect.width,this.rect.height,1,1)),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height),this.material.uniforms.uRes.value.set(this.sizes.width,this.sizes.height)}update(){this.material.uniforms.uFluid.value=w.fluidTexture}destroy(){this.material.dispose(),this.mesh.geometry.dispose(),this.scene.remove(this.mesh)}};var X=`varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    
    gl_Position = projectionMatrix * viewMatrix * modelPoisition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,Y=`uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uBorder;
uniform float uReveal;
uniform float uRotate;
uniform float uRotateX;
uniform float uRotateY;
uniform float uRadius; 
uniform float uZoom;
uniform float uParallax;

varying vec2 vUv;
varying vec2 screenUv;

vec2 getCoverUv(vec2 uv, vec2 uTextureResolution, vec2 uItemSizes)
{
    vec2 tempUv = uv - vec2(0.5);

    float quadAspectRatio = uItemSizes.x / uItemSizes.y;
    float textureAspectRatio = uTextureResolution.x / uTextureResolution.y;

    if (quadAspectRatio < textureAspectRatio) {
        tempUv = tempUv * vec2(quadAspectRatio / textureAspectRatio, 1.0);
    } else {
        tempUv = tempUv * vec2(1.0, textureAspectRatio / quadAspectRatio);
    }

    return tempUv + vec2(0.5);
}
float getAlpha(vec2 uRes, float uBorder, vec2 uv)
{
    vec2 aspect = uRes / max(uRes.x, uRes.y);

    vec2 alphaUv = uv - 0.5;

    float borderRadius = min(uBorder, min(uRes.x, uRes.y) * 0.5);

    vec2 offset = vec2(borderRadius) / uRes;
    vec2 alphaXY = smoothstep(vec2(0.5 - offset), vec2(0.5 - offset - 0.001), abs(alphaUv));
    float alpha = min(1.0, alphaXY.x + alphaXY.y);

    vec2 aplhaUV2 = abs(uv - 0.5);
    float radius = borderRadius / max(uRes.x, uRes.y);
    aplhaUV2 = (aplhaUV2 - 0.5) * aspect + radius;
    float roundedAlpha = smoothstep(radius + 0.001, radius, length(aplhaUV2));

    return alpha = min(1.0, alpha + roundedAlpha);
}
vec2 rotateUV(vec2 uv, float angle) {
    vec2 center = vec2(0.5);
    uv -= center;

    float cosAngle = cos(angle);
    float sinAngle = sin(angle);

    vec2 rotated;
    rotated.x = uv.x * cosAngle - uv.y * sinAngle;
    rotated.y = uv.x * sinAngle + uv.y * cosAngle;

    return rotated + center;
}

vec2 rotateUVX(vec2 uv, float angleX) {
    vec2 center = vec2(0.5);
    uv -= center;

    
    vec3 pos = vec3(uv.x, uv.y, 0.0);

    
    float cosX = cos(angleX);
    float sinX = sin(angleX);

    vec3 rotated;
    rotated.x = pos.x;
    rotated.y = pos.y * cosX - pos.z * sinX;
    rotated.z = pos.y * sinX + pos.z * cosX;

    
    float perspective = 1.0 / (1.0 - rotated.z * 0.5);
    vec2 result = vec2(rotated.x, rotated.y) * perspective;

    return result + center;
}

vec2 rotateUVY(vec2 uv, float angleY) {
    vec2 center = vec2(0.5);
    uv -= center;

    
    vec3 pos = vec3(uv.x, uv.y, 0.0);

    
    float cosY = cos(angleY);
    float sinY = sin(angleY);

    vec3 rotated;
    rotated.x = pos.x * cosY + pos.z * sinY;
    rotated.y = pos.y;
    rotated.z = -pos.x * sinY + pos.z * cosY;

    
    float perspective = 1.0 / (1.0 - rotated.z * 0.5);
    vec2 result = vec2(rotated.x, rotated.y) * perspective;

    return result + center;
}
vec4 applyBlur(sampler2D tex, vec2 uv, float blurAmount) {
    vec2 texelSize = 1.0 / uRes;
    vec4 color = vec4(0.0);

    
    float total = 0.0;
    for(int x = -2; x <= 2; x++) {
        for(int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * texelSize * blurAmount;
            color += texture2D(tex, uv + offset);
            total += 1.0;
        }
    }

    return color / total;
}

vec4 fastGaussianBlur(sampler2D tex, vec2 uv, float blurAmount) {
    vec2 texelSize = 1.0 / uRes;
    vec4 color = vec4(0.0);

    
    float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

    
    color += texture2D(tex, uv) * weights[0];
    for(int i = 1; i < 5; i++) {
        vec2 offset = vec2(float(i) * texelSize.x * blurAmount, 0.0);
        color += texture2D(tex, uv + offset) * weights[i];
        color += texture2D(tex, uv - offset) * weights[i];
    }

    return color;
}

vec4 fakeBlur(sampler2D tex, vec2 uv, float blurAmount) {
    
    vec2 noise = vec2(
        fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453)
    ) - 0.5;

    vec2 offset = noise * blurAmount * 0.01;
    return texture2D(tex, uv + offset);
}
vec3 applyTint(vec3 originalColor, vec3 tintColor, float strength) {
    return mix(originalColor, originalColor * tintColor, strength);
}

vec3 applyOverlayTint(vec3 originalColor, vec3 tintColor, float strength) {
    vec3 overlay = mix(originalColor, tintColor, 0.5);
    return mix(originalColor, overlay, strength);
}

vec3 applyMultiplyTint(vec3 originalColor, vec3 tintColor, float strength) {
    vec3 multiplied = originalColor * tintColor;
    return mix(originalColor, multiplied, strength);
}

float roundedRect(vec2 uv, vec2 size, float radius) {
    vec2 center = vec2(0.5);
    vec2 pos = abs(uv - center) - (size * 0.5 - radius);
    return length(max(pos, 0.0)) + min(max(pos.x, pos.y), 0.0) - radius;
}

void main()
{
    vec2 uv = vUv;
    vec2 coverUv = getCoverUv(uv, uAspect, uSize);

    coverUv -= 0.5;
    coverUv *= uZoom;
    coverUv += 0.5;

    
    coverUv.y -= uParallax * - 1.0;

    vec2 rotatedUv = rotateUV(uv, uRotate);
    rotatedUv = rotateUVX(rotatedUv, uRotateX);
    rotatedUv = rotateUVY(rotatedUv, uRotateY);

    vec4 color = texture2D(uTexture, coverUv);
    float alpha = getAlpha(uSize, uBorder, uv);
    float cursor = texture2D(uFluid, screenUv).r;

    float maxDistance = 0.5;
    float reveal = maxDistance * uReveal;
    vec2 areaSize = vec2(reveal * 2.0);

    
    float sdf = roundedRect(rotatedUv, areaSize, uRadius);
    float area = 1.0 - smoothstep(-0.001, 0.001, sdf);

    color.a *= alpha * area;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    color.rgb = applyOverlayTint(color.rgb, uColor, tintAmount);
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor * 5.).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor * 0.5);

    gl_FragColor = color;
}`;const h=x.getInstance();let U=null;class I{constructor(t,e,o){U=t,this.scene=e,this.main=o,this.sizes=h.sizes,this.time=h.time,this.items=this.main.querySelectorAll(".cases_video, .double-video"),this.init()}init(){this.setMaterial(),this.setMesh(),this.debug()}debug(){if(!h.debug.active)return;const t=h.debug.gui;this.folder=t.addFolder("Fintech/Video"),this.folder.add(this.material.uniforms.uReveal,"value",0,1,.01).name("uReveal").onChange(e=>{this.meshs.forEach(({material:o})=>o.uniforms.uReveal.value=e)}),this.folder.add(this.material.uniforms.uRotate,"value",0,2,.01).name("uRotate").onChange(e=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotate.value=e)}),this.folder.add(this.material.uniforms.uRadius,"value",0,1,.01).name("uRadius").onChange(e=>{this.meshs.forEach(({material:o})=>o.uniforms.uRadius.value=e)}),this.folder.add(this.material.uniforms.uRotateX,"value",-1,1,.01).name("uRotateX").onChange(e=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotateX.value=e)}),this.folder.add(this.material.uniforms.uRotateY,"value",-1,1,.01).name("uRotateY").onChange(e=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotateY.value=e)}),this.folder.add(this.material.uniforms.uZoom,"value",-1,1,.01).name("uZoom").onChange(e=>{this.meshs.forEach(({material:o})=>o.uniforms.uZoom.value=e)})}setMaterial(){this.material=new A({vertexShader:X,fragmentShader:Y,transparent:!0,depthTest:!1,uniforms:{uTexture:new n(null),uRes:new n(new l(this.sizes.width,this.sizes.height)),uAspect:new n(new l(16,9)),uSize:new n(new l(0,0)),uBorder:new n(0),uReveal:new n(0),uRotate:new n(0),uRotateX:new n(0),uRotateY:new n(0),uRadius:new n(.02),uZoom:new n(.55),uTime:new n(0),uFluid:new n(null),uParallax:new n(0),uColor:new n(new b(255/255,118/255,162/255))}})}setMesh(){this.meshs=[...this.items].map((t,e)=>{const o=window.getComputedStyle(t).getPropertyValue("border-radius").split("px"),r=t.getBoundingClientRect(),m=new f(r.width,r.height,1,1),i=this.material.clone();i.uniforms.uSize.value.set(r.width,r.height),i.uniforms.uBorder.value=parseFloat(o[0]);const T=t.classList.contains("double-video");i.uniforms.uZoom.value=T?1:.9;const p=new C(m,i);t.classList.contains("cases_video")&&(p.visible=!1);const a=t.querySelector("video");if(a)if(a._videoLoaderInstance){const s=a._videoLoaderInstance;if(s.isLoaded){const v=new c(a);i.uniforms.uTexture.value=v,i.uniforms.uAspect.value.set(s.width||a.videoWidth,s.height||a.videoHeight)}else s.on("loaded",()=>{const v=new c(a);i.uniforms.uTexture.value=v,i.uniforms.uAspect.value.set(s.width,s.height)})}else{const s=new S(a,{lazyLoad:!1});s.on("loaded",()=>{const v=new c(a);i.uniforms.uTexture.value=v,i.uniforms.uAspect.value.set(s.width,s.height)})}this.scene.add(p),h.observer.instance.observe(t);const g=gsap.timeline({paused:!0,defaults:{duration:1,ease:"power3.out"}});return g.to(i.uniforms.uReveal,{value:1}).fromTo(i.uniforms.uRotate,{value:-.3},{value:0},"<").fromTo(i.uniforms.uRotateY,{value:.8},{value:0},"<").fromTo(i.uniforms.uRotateX,{value:-.8},{value:0},"<").fromTo(i.uniforms.uRadius,{value:0},{value:.02,duration:.2},"<"),ScrollTrigger.create({trigger:t,start:"top 90%",onEnter:()=>g.play()}),ScrollTrigger.create({trigger:t,start:"top bottom",onLeaveBack:()=>g.pause(0)}),{mesh:p,item:t,material:i}}),this.setPosition()}setPosition(){this.meshs.forEach(({mesh:t,item:e})=>{if(e.dataset.visible=="false"||e.classList.contains("cases_video")){t.visible=!1;return}t.visible=!0;const o=e.getBoundingClientRect();t.position.x=o.left+o.width/2-this.sizes.width/2,t.position.y=-o.top-o.height/2+this.sizes.height/2})}resize(){this.meshs.forEach(({mesh:t,item:e})=>{const o=e.getBoundingClientRect();z(t,new f(o.width,o.height,1,1)),t.material.uniforms.uSize.value.set(o.width,o.height);const r=window.getComputedStyle(e).getPropertyValue("border-radius").split("px");t.material.uniforms.uBorder.value=parseFloat(r[0])})}update(){this.meshs.forEach(({mesh:t,material:e})=>{e.uniforms.uFluid.value=U.fluidTexture})}destroy(){this.meshs.forEach(({mesh:t,material:e})=>{e.dispose(),t.geometry.dispose(),this.scene.remove(t)})}}const d=x.getInstance();let u=null;class O{constructor(t,e,o){u=t,this.scene=e,this.main=o,this.sizes=d.sizes,this.renderer=u.renderer.instance,this.camera=u.camera.instance,this.scene=e,this.load()}load(){this.heroInner=this.main.querySelector(".inner-hero"),this.heroItem=this.heroInner.querySelector(".inner-hero_bg"),this.footerLogo=this.main.querySelector(".footer_logo"),this.sources=[],this.footerLogo&&(this.getTextureAttributes(this.footerLogo).forEach(({value:e},o)=>{this.sources.push({type:"textureLoader",url:e,name:`footer-${o}`})}),gsap.set(this.footerLogo,{opacity:0})),this.resources=new P(this.sources),this.resources.on("ready",()=>this.init())}init(){u.loaded=!0,this.hero=new L(u,this.scene,this.main,this.heroItem),this.items=new I(u,this.scene,this.main),this.footerMeshs=[];const t=this.getTextureAttributes(this.footerLogo);this.footerTextures=t.map((e,o)=>{const r=`footer-${o}`;return this.resources.items[r]}),this.footerTextures.forEach((e,o)=>{this.footerMeshs[o]=new M(u,this.scene,this.footerLogo,e,o)}),d.trigger("loadedWorld"),d.onceLoaded||(d.globalLoader.tl.play(),d.page.triggerLoad())}setScroll(t){var e,o,r;(e=this.items)==null||e.setPosition(t),(o=this.hero)==null||o.setPosition(t),(r=this.footerMeshs)==null||r.forEach(m=>m.setPosition())}update(){var t,e,o;(t=this.items)==null||t.update(),(e=this.hero)==null||e.update(),(o=this.footerMeshs)==null||o.forEach(r=>r.update())}createTexture(t){return this.renderer.setRenderTarget(t),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null),t.texture}resize(){var t,e,o;(t=this.items)==null||t.resize(),(e=this.hero)==null||e.resize(),(o=this.footerMeshs)==null||o.forEach(r=>r.resize())}onMouseMove(t,e){}destroy(){var t,e,o;(t=this.items)==null||t.destroy(),(e=this.hero)==null||e.destroy(),(o=this.footerMeshs)==null||o.forEach(r=>r.destroy())}getTextureAttributes(t){return t.getAttributeNames().filter(e=>e.startsWith("data-texture-")).map(e=>({name:e,value:t.getAttribute(e),number:parseInt(e.split("-")[2])})).sort((e,o)=>e.number-o.number)}}export{O as default};
