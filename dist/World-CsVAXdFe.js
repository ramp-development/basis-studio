import{R as C}from"./Resources-CxYDS8p8.js";import{i as z}from"./index-B4R9HsQ2.js";import{S as p,U as n,C as g,V as l,P as f,M as x,a as c,b as R}from"./GL-CDREo0df.js";import y from"./VideoLoader-K1Zmm6xk.js";import"./app.js";import"./isSafari-DYs6RIMp.js";var A=`uniform float uOffset;

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
}`,T=`uniform sampler2D uTexture;
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

    
    

    float alphaFade = step(uScroll, uv.y);
    color.a *= alphaFade;

    gl_FragColor = color;
}`;let S=class{constructor(e,t,o,s,v,i){this.app=e,this.gl=t,this.scene=o,this.main=s,this.item=v,this.resources=(i==null?void 0:i.items)||null,this.sizes=this.app.sizes,this.time=this.app.time,this.rect=this.item.getBoundingClientRect(),this.init()}init(){this.setMaterial(),this.setMesh()}setMaterial(){this.material=new p({vertexShader:A,fragmentShader:T,transparent:!0,depthTest:!1,uniforms:{uTexture:new n(null),uRes:new n(new l(this.sizes.width,this.sizes.height)),uAspect:new n(new l(16,9)),uSize:new n(new l(0,0)),uBorder:new n(0),uReveal:new n(0),uRotate:new n(0),uRotateX:new n(0),uRotateY:new n(0),uRadius:new n(.02),uScroll:new n(0),uZoom:new n(.55),uTime:new n(0),uFluid:new n(null),uOffset:new n(null),uParallax:new n(0),uColor:new n(new g(255/255,118/255,162/255))}})}setMesh(){this.geometry=new f(this.rect.width,this.rect.height,1,1),this.mesh=new x(this.geometry,this.material),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height);const e=this.item.querySelector("video");if(e&&!e.parentElement.classList.contains("w-condition-invisible"))if(e.style.opacity=0,e._videoLoaderInstance){const t=e._videoLoaderInstance;if(t.isLoaded){const o=new c(e);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(t.width||e.videoWidth,t.height||e.videoHeight)}else t.on("loaded",()=>{const o=new c(e);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(t.width,t.height)})}else{const t=new y(e,{lazyLoad:!1});t.on("loaded",()=>{const o=new c(e);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(t.width,t.height)})}this.scene.add(this.mesh),this.setPosition()}setPosition(){this.rect=this.item.getBoundingClientRect(),this.mesh.position.x=this.rect.left+this.rect.width/2-this.sizes.width/2,this.mesh.position.y=-this.rect.top-this.rect.height/2+this.sizes.height/2}resize(){this.rect=this.item.getBoundingClientRect(),R(this.mesh,new f(this.rect.width,this.rect.height,1,1)),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height),this.material.uniforms.uRes.value.set(this.sizes.width,this.sizes.height)}update(){this.material.uniforms.uFluid.value=this.gl.fluidTexture}destroy(){this.material.dispose(),this.mesh.geometry.dispose(),this.scene.remove(this.mesh)}};var P=`varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    
    gl_Position = projectionMatrix * viewMatrix * modelPoisition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,L=`uniform sampler2D uTexture;
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
}`;class M{constructor(e,t,o,s){this.app=e,this.gl=t,this.scene=o,this.main=s,this.sizes=this.app.sizes,this.time=this.app.time,this.items=this.main.querySelectorAll(".double-video, .cases_video"),this.init()}init(){this.setMaterial(),this.setMesh()}debug(){if(!this.app.debug.active)return;const e=this.app.debug.gui;this.folder=e.addFolder("Home/Video"),this.folder.add(this.material.uniforms.uReveal,"value",0,1,.01).name("uReveal").onChange(t=>{this.meshs.forEach(({material:o})=>o.uniforms.uReveal.value=t)}),this.folder.add(this.material.uniforms.uRotate,"value",0,2,.01).name("uRotate").onChange(t=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotate.value=t)}),this.folder.add(this.material.uniforms.uRadius,"value",0,1,.01).name("uRadius").onChange(t=>{this.meshs.forEach(({material:o})=>o.uniforms.uRadius.value=t)}),this.folder.add(this.material.uniforms.uRotateX,"value",-1,1,.01).name("uRotateX").onChange(t=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotateX.value=t)}),this.folder.add(this.material.uniforms.uRotateY,"value",-1,1,.01).name("uRotateY").onChange(t=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotateY.value=t)}),this.folder.add(this.material.uniforms.uZoom,"value",-1,1,.01).name("uZoom").onChange(t=>{this.meshs.forEach(({material:o})=>o.uniforms.uZoom.value=t)})}setMaterial(){this.material=new p({vertexShader:P,fragmentShader:L,transparent:!0,depthTest:!1,uniforms:{uTexture:new n(null),uRes:new n(new l(this.sizes.width,this.sizes.height)),uAspect:new n(new l(16,9)),uSize:new n(new l(0,0)),uBorder:new n(0),uReveal:new n(0),uRotate:new n(0),uRotateX:new n(0),uRotateY:new n(0),uRadius:new n(.02),uZoom:new n(.55),uTime:new n(0),uFluid:new n(null),uParallax:new n(0),uColor:new n(new g(255/255,118/255,162/255))}})}setMesh(){this.meshs=[...this.items].map((e,t)=>{const o=window.getComputedStyle(e).getPropertyValue("border-radius").split("px"),s=e.getBoundingClientRect(),v=new f(s.width,s.height,1,1),i=this.material.clone();i.uniforms.uSize.value.set(s.width,s.height),i.uniforms.uBorder.value=parseFloat(o[0]);const w=e.classList.contains("cases_video"),U=e.classList.contains("double-video");w?i.uniforms.uZoom.value=.55:U?i.uniforms.uZoom.value=1:i.uniforms.uZoom.value=.9;const h=new x(v,i);e.classList.contains("cases_video")&&(h.visible=!1);const a=e.querySelector("video");if(a)if(a._videoLoaderInstance){const r=a._videoLoaderInstance;if(r.isLoaded){const u=new c(a);i.uniforms.uTexture.value=u,i.uniforms.uAspect.value.set(r.width||a.videoWidth,r.height||a.videoHeight)}else r.on("loaded",()=>{const u=new c(a);i.uniforms.uTexture.value=u,i.uniforms.uAspect.value.set(r.width,r.height)})}else{const r=new y(a,{lazyLoad:!1});r.on("loaded",()=>{const u=new c(a);i.uniforms.uTexture.value=u,i.uniforms.uAspect.value.set(r.width,r.height)})}this.scene.add(h),this.app.observer.instance.observe(e);const d=gsap.timeline({paused:!0,defaults:{duration:1,ease:"power3.out"}});return e.classList.contains("talk_full")?(h.scale.set(.3,.3,.3),d.to(i.uniforms.uReveal,{value:1,duration:.1}).to(h.scale,{x:1,y:1,z:1,duration:1.2,ease:"back.out(1.2)"},"<0.1").fromTo(i.uniforms.uRotate,{value:-.3},{value:0},"<0.1").fromTo(i.uniforms.uRotateY,{value:.8},{value:0},"<0.1").fromTo(i.uniforms.uRotateX,{value:-.8},{value:0},"<0.1").fromTo(i.uniforms.uRadius,{value:0},{value:.02,duration:.2},"<0.8")):d.to(i.uniforms.uReveal,{value:1}).fromTo(i.uniforms.uRotate,{value:-.3},{value:0},"<").fromTo(i.uniforms.uRotateY,{value:.8},{value:0},"<").fromTo(i.uniforms.uRotateX,{value:-.8},{value:0},"<").fromTo(i.uniforms.uRadius,{value:0},{value:.02,duration:.2},"<"),ScrollTrigger.create({trigger:e,start:"top 90%",onEnter:()=>d.play()}),ScrollTrigger.create({trigger:e,start:"top bottom",onLeaveBack:()=>d.pause(0)}),e.classList.contains("preview_img")&&ScrollTrigger.create({trigger:e,start:"top bottom",end:"bottom top",onUpdate:r=>{const u=r.progress,b=gsap.utils.mapRange(0,1,-.2,.2,u);i.uniforms.uParallax.value=b}}),{mesh:h,item:e,material:i}}),this.setPosition()}setPosition(){this.meshs.forEach(({mesh:e,item:t})=>{if(t.dataset.visible=="false"||t.classList.contains("cases_video")){e.visible=!1;return}//! HERE FOR POSITION
e.visible=!0;const o=t.getBoundingClientRect();e.position.x=o.left+o.width/2-this.sizes.width/2,e.position.y=-o.top-o.height/2+this.sizes.height/2})}resize(){this.meshs.forEach(({mesh:e,item:t})=>{const o=t.getBoundingClientRect();R(e,new f(o.width,o.height,1,1)),e.material.uniforms.uSize.value.set(o.width,o.height);const s=window.getComputedStyle(t).getPropertyValue("border-radius").split("px");e.material.uniforms.uBorder.value=parseFloat(s[0])})}update(){this.meshs.forEach(({material:e})=>{e.uniforms.uFluid.value=this.gl.fluidTexture})}destroy(){this.meshs.forEach(({mesh:e,material:t})=>{t.dispose(),e.geometry.dispose(),this.scene.remove(e)})}}class I{constructor(e,t,o,s){this.gl=e,this.app=t,this.scene=o,this.main=s,this.sizes=this.app.sizes,this.renderer=this.gl.renderer.instance,this.camera=this.gl.camera.instance,this.scene=o,this.load()}load(){this.isCasesPage=document.querySelector("main").dataset.transitionPage==="case-inner",this.heroInner=this.main.querySelector(".inner-hero"),this.heroItem=this.heroInner.querySelector(".inner-hero_bg"),this.footerLogo=this.main.querySelector(".footer_logo"),this.sources=[],this.footerLogo&&(this.getTextureAttributes(this.footerLogo).forEach(({value:t},o)=>{this.sources.push({type:"textureLoader",url:t,name:`footer-${o}`})}),gsap.set(this.footerLogo,{opacity:0})),this.resources=new C(this.sources),this.resources.on("ready",()=>this.init())}init(){if(this.gl.loaded=!0,this.video=new M(this.app,this.gl,this.scene,this.main),this.footerLogo){this.footerMeshs=[];const e=this.getTextureAttributes(this.footerLogo);this.footerTextures=e.map((t,o)=>{const s=`footer-${o}`;return this.resources.items[s]}),this.footerTextures.forEach((t,o)=>{this.footerMeshs[o]=new z(this.app,this.gl,this.scene,this.footerLogo,t,o)})}this.isCasesPage&&(this.hero=new S(this.app,this.gl,this.scene,this.main,this.heroItem)),this.app.trigger("loadedWorld"),this.app.onceLoaded||(this.app.globalLoader.tl.play(),this.app.page.triggerLoad())}setScroll(e){var t,o,s;(t=this.video)==null||t.setPosition(),(o=this.hero)==null||o.setPosition(e),(s=this.footerMeshs)==null||s.forEach(v=>v.setPosition(e))}update(){var e,t,o;(e=this.video)==null||e.update(),(t=this.hero)==null||t.update(),(o=this.footerMeshs)==null||o.forEach(s=>s.update())}createTexture(e){return this.renderer.setRenderTarget(e),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null),e.texture}resize(){var e,t,o;(e=this.video)==null||e.resize(),(t=this.hero)==null||t.resize(),(o=this.footerMeshs)==null||o.forEach(s=>s.resize())}onMouseMove(e,t){}destroy(){var e,t,o;(e=this.video)==null||e.destroy(),(t=this.hero)==null||t.destroy(),(o=this.footerMeshs)==null||o.forEach(s=>s.destroy())}getTextureAttributes(e){return e.getAttributeNames().filter(t=>t.startsWith("data-texture-")).map(t=>({name:t,value:e.getAttribute(t),number:parseInt(t.split("-")[2])})).sort((t,o)=>t.number-o.number)}}export{I as default};
