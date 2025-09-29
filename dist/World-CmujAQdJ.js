import{R as h}from"./Resources-CxYDS8p8.js";import{i as c}from"./index-B4R9HsQ2.js";import{S as v,U as i,C as f,V as s,P as a,M as m,a as n,b as d}from"./GL-CDREo0df.js";import p from"./VideoLoader-K1Zmm6xk.js";import"./app.js";import"./isSafari-DYs6RIMp.js";var g=`uniform float uOffset;

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
}`,x=`uniform sampler2D uTexture;
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
    float oldCursor = cursor;
    cursor = smoothstep(0.2, 1.0, cursor);
    cursor = clamp(cursor, 0.0, 1.0);
    cursor = pow(cursor, 2.5); 

    color.a *= alpha;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    
    
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, oldCursor * 5.).rgb;
    blurColor = applyOverlayTint(blurColor, uColor, cursor);
    color.rgb = mix(color.rgb, blurColor, cursor * 2.0);

    float fadeArea = smoothstep(0.0, 0.5, uv.y);
    color.rgb = mix(color.rgb * 0.2, color.rgb, fadeArea);

    float alphaFade = step(uScroll, uv.y);
    color.a *= alphaFade;

    gl_FragColor = color;
}`;class w{constructor(t,e,o,r,l){this.app=t,this.gl=e,this.scene=o,this.main=r,this.item=l,this.sizes=this.app.sizes,this.time=this.app.time,this.rect=this.item.getBoundingClientRect(),this.init()}init(){this.setMaterial(),this.setMesh()}setMaterial(){this.material=new v({vertexShader:g,fragmentShader:x,transparent:!0,depthTest:!1,uniforms:{uTexture:new i(null),uRes:new i(new s(this.sizes.width,this.sizes.height)),uAspect:new i(new s(16,9)),uSize:new i(new s(0,0)),uBorder:new i(0),uReveal:new i(0),uRotate:new i(0),uRotateX:new i(0),uRotateY:new i(0),uRadius:new i(.02),uScroll:new i(0),uZoom:new i(.55),uTime:new i(0),uFluid:new i(null),uOffset:new i(null),uParallax:new i(0),uColor:new i(new f(255/255,118/255,162/255))}})}setMesh(){this.geometry=new a(this.rect.width,this.rect.height,1,1),this.mesh=new m(this.geometry,this.material),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height);const t=this.item.querySelector("video");t&&this.setupVideoTexture(t),this.scene.add(this.mesh),this.setPosition()}setupVideoTexture(t){if(t._videoLoaderInstance){const e=t._videoLoaderInstance;if(e.isLoaded){const o=new n(t);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(e.width||t.videoWidth,e.height||t.videoHeight)}else e.on("loaded",()=>{const o=new n(t);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(e.width,e.height)})}else{const e=new p(t,{lazyLoad:!1});e.on("loaded",()=>{const o=new n(t);this.material.uniforms.uTexture.value=o,this.material.uniforms.uAspect.value.set(e.width,e.height)})}}setPosition(t){this.rect=this.item.getBoundingClientRect(),this.mesh.position.x=this.rect.left+this.rect.width/2-this.sizes.width/2,this.mesh.position.y=-this.rect.top-this.rect.height/2+this.sizes.height/2}resize(){this.rect=this.item.getBoundingClientRect(),d(this.mesh,new a(this.rect.width,this.rect.height,1,1)),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height),this.material.uniforms.uRes.value.set(this.sizes.width,this.sizes.height)}update(){this.material.uniforms.uFluid.value=this.gl.fluidTexture}destroy(){this.material.dispose(),this.mesh.geometry.dispose(),this.scene.remove(this.mesh)}}class z{constructor(t,e,o,r){this.gl=t,this.app=e,this.scene=o,this.main=r,this.sizes=this.app.sizes,this.renderer=this.gl.renderer.instance,this.camera=this.gl.camera.instance,this.scene=o,this.load()}load(){this.hero=this.main.querySelector(".h-services"),this.item=this.hero.querySelector(".h-services_bg"),this.footerLogo=this.main.querySelector(".footer_logo"),this.sources=[],this.footerLogo&&(this.getTextureAttributes(this.footerLogo).forEach(({value:e},o)=>{this.sources.push({type:"textureLoader",url:e,name:`footer-${o}`})}),gsap.set(this.footerLogo,{opacity:0})),this.resources=new h(this.sources),this.resources.on("ready",()=>this.init())}init(){if(this.gl.loaded=!0,this.hero=new w(this.app,this.gl,this.scene,this.main,this.item),this.footerLogo){this.footerMeshs=[];const t=this.getTextureAttributes(this.footerLogo);this.footerTextures=t.map((e,o)=>{const r=`footer-${o}`;return this.resources.items[r]}),this.footerTextures.forEach((e,o)=>{this.footerMeshs[o]=new c(this.app,this.gl,this.scene,this.footerLogo,e,o)})}this.app.trigger("loadedWorld"),this.app.onceLoaded||(this.app.globalLoader.tl.play(),this.app.page.triggerLoad())}setScroll(t){var e,o;(e=this.hero)==null||e.setPosition(t),(o=this.footerMeshs)==null||o.forEach(r=>r.setPosition())}update(){var t,e;(t=this.hero)==null||t.update(),(e=this.footerMeshs)==null||e.forEach(o=>o.update())}createTexture(t){return this.renderer.setRenderTarget(t),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null),t.texture}resize(){var t,e;(t=this.hero)==null||t.resize(),(e=this.footerMeshs)==null||e.forEach(o=>o.resize())}onMouseMove(t,e){}destroy(){var t,e;(t=this.hero)==null||t.destroy(),(e=this.footerMeshs)==null||e.forEach(o=>o.destroy())}getTextureAttributes(t){return t.getAttributeNames().filter(e=>e.startsWith("data-texture-")).map(e=>({name:e,value:t.getAttribute(e),number:parseInt(e.split("-")[2])})).sort((e,o)=>e.number-o.number)}}export{z as default};
