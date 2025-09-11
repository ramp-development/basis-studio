import{R as y}from"./Resources-DqIBCYYJ.js";import R from"./VideoLoader-DDzJuXJh.js";import{S as C,U as n,C as b,V as h,P as p,M as U,b as P,a as v}from"./GL-Dvc-z8VT.js";import"./GSAP-km8nWVCW.js";import{g as S}from"./index-Cn1KrK_M.js";import"./app.js";import"./ScrollTrigger-BWsqEc1I.js";import"./SplitText-n_eiQhs4.js";import"./CSSPlugin-YLlZY2Jb.js";var A=`uniform float uOffset;

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
uniform float uLoading;

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
    coverUv *= 0.9;
    coverUv += 0.5;

    coverUv.x += uParallax;

    vec4 color = texture2D(uTexture, coverUv);
    float alpha = getAlpha(uSize, uBorder, uv);
    float cursor = texture2D(uFluid, screenUv).r;
    float oldCursor = cursor;
    cursor = smoothstep(0.2, 1.0, cursor);
    cursor = clamp(cursor, 0.0, 1.0);
    cursor = pow(cursor, 2.5); 

    color.a *= alpha * uLoading;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    color.rgb = applyOverlayTint(color.rgb, uColor, tintAmount);
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor * 5.).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor * 0.5);

    
    float fadeArea = smoothstep(0.0, 0.3, uv.y);
    vec3 gradientColor = mix(color.rgb * 0.2, color.rgb, fadeArea);
    color.rgb = gradientColor;

    gl_FragColor = color;
}`;class z{constructor(e,t,i,o,s,r,l){this.app=e,this.gl=t,this.scene=i,this.main=o,this.resources=s,this.videoTextures=r,this.items=l,this.sizes=this.app.sizes,this.time=this.app.time,this.velocity={value:0},this.quick=S.quickTo(this.velocity,"value",{duration:.5,ease:"power2"}),this.init()}init(){this.setMaterial(),this.setMesh(),this.debug()}debug(){if(!this.app.debug.active)return;const t=this.app.debug.gui.addFolder("Home/Video");t.add(this.material.uniforms.uReveal,"value",0,1,.01).name("uReveal").onChange(i=>{this.meshs.forEach(({material:o})=>o.uniforms.uReveal.value=i)}),t.add(this.material.uniforms.uRotate,"value",0,2,.01).name("uRotate").onChange(i=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotate.value=i)}),t.add(this.material.uniforms.uRadius,"value",0,1,.01).name("uRadius").onChange(i=>{this.meshs.forEach(({material:o})=>o.uniforms.uRadius.value=i)}),t.add(this.material.uniforms.uRotateX,"value",-1,1,.01).name("uRotateX").onChange(i=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotateX.value=i)}),t.add(this.material.uniforms.uRotateY,"value",-1,1,.01).name("uRotateY").onChange(i=>{this.meshs.forEach(({material:o})=>o.uniforms.uRotateY.value=i)}),t.add(this.material.uniforms.uZoom,"value",-1,1,.01).name("uZoom").onChange(i=>{this.meshs.forEach(({material:o})=>o.uniforms.uZoom.value=i)})}setMaterial(){this.material=new C({vertexShader:A,fragmentShader:T,transparent:!0,depthTest:!1,uniforms:{uTexture:new n(null),uRes:new n(new h(this.sizes.width,this.sizes.height)),uAspect:new n(new h(16,9)),uSize:new n(new h(0,0)),uBorder:new n(0),uReveal:new n(0),uRotate:new n(0),uRotateX:new n(0),uRotateY:new n(0),uRadius:new n(.02),uZoom:new n(.55),uLoading:new n(0),uTime:new n(0),uFluid:new n(null),uOffset:new n(null),uParallax:new n(0),uColor:new n(new b(255/255,118/255,162/255))}})}setMesh(){this.meshs=[...this.items].map((e,t)=>{const i=window.getComputedStyle(e).getPropertyValue("border-radius").split("px"),o=e.querySelector(".f-28"),s=o?o.textContent.trim()||`case-${t}`:`case-${t}`,r=e.querySelector(".cases_video_wrapper");let l=null,d=0,m=0;if(r.classList.contains("w-condition-invisible")){l=this.resources[s];const a=new Image;a.src=e.querySelector("img").getAttribute("src"),a.onload=()=>{u.uniforms.uAspect.value.set(a.width,a.height)}}else{const a=this.videoTextures.find(w=>w.name===s);l=a.texture,d=a.width,m=a.height}const c=e.getBoundingClientRect(),x=new p(c.width,c.height,200,200),u=this.material.clone();u.uniforms.uSize.value.set(c.width,c.height),u.uniforms.uTexture.value=l,u.uniforms.uBorder.value=parseFloat(i[0]),u.uniforms.uAspect.value.set(d,m);const f=new U(x,u);return this.scene.add(f),{mesh:f,item:e,material:u}}),this.setPosition(null)}setPosition(e){this.meshs.forEach(({mesh:t,item:i})=>{if(i.dataset.visible=="false"){t.visible=!1;return}t.visible=!0;const o=i.getBoundingClientRect();t.position.x=o.left+o.width/2-this.sizes.width/2,t.position.y=-o.top-o.height/2+this.sizes.height/2}),e&&(this.quick(-e.velocity*1.5),this.meshs.forEach(({material:t})=>t.uniforms.uOffset.value=this.velocity.value))}resize(){this.meshs.forEach(({mesh:e,item:t})=>{const i=t.getBoundingClientRect();P(e,new p(i.width,i.height,200,200)),e.material.uniforms.uSize.value.set(i.width,i.height);const o=window.getComputedStyle(t).getPropertyValue("border-radius").split("px");e.material.uniforms.uBorder.value=parseFloat(o[0])})}update(){this.destroyed||this.meshs.forEach(({mesh:e,material:t})=>{t.uniforms.uFluid.value=this.gl.fluidTexture})}destroy(){this.meshs.forEach(({mesh:e,material:t})=>{t.dispose(),e.geometry.dispose(),this.scene.remove(e),this.destroyed=!0})}}class I{constructor(e,t,i,o){this.gl=e,this.app=t,this.scene=i,this.main=o,this.sizes=this.app.sizes,this.renderer=this.gl.renderer.instance,this.camera=this.gl.camera.instance,this.scene=i,this.load()}load(){this.videosLength=this.main.querySelectorAll(".cases_video_wrapper:not(.w-condition-invisible)").length,this.videoTexetures=[],this.count=0,this.videoLoaded=!1,this.itemElements=this.main.querySelectorAll(".cases_item"),this.sources=[...this.itemElements].map(e=>{const t=e.querySelector(".f-28").textContent.trim(),i=e.querySelector("img");return i.classList.contains("w-condition-invisible")?null:{type:"textureLoader",url:i.getAttribute("src"),name:t}}).filter(Boolean),this.resources=new y(this.sources),this.itemElements.forEach(e=>{const t=e.querySelector(".f-28").textContent.trim(),i=e.querySelector(".cases_video_wrapper");if(i.classList.contains("w-condition-invisible"))return;const o=i.querySelector("video");if(o._videoLoaderInstance){const s=o._videoLoaderInstance;if(s.isLoaded){const r=new v(o);this.videoTexetures.push({name:t,texture:r,width:s.width||o.videoWidth,height:s.height||o.videoHeight}),this.checkLoaded()}else s.on("loaded",()=>{const r=new v(o);this.videoTexetures.push({name:t,texture:r,width:s.width,height:s.height}),this.checkLoaded()})}else{const s=new R(o,{lazyLoad:!1});s.on("loaded",()=>{const r=new v(o);this.videoTexetures.push({name:t,texture:r,width:s.width,height:s.height}),this.checkLoaded()})}}),this.resources.on("ready",()=>this.checkLoaded())}checkLoaded(){this.count++,this.count>=this.videosLength+1&&this.init()}init(){this.gl.loaded=!0,this.items=new z(this.app,this.gl,this.scene,this.main,this.resources.items,this.videoTexetures,this.itemElements),this.app.trigger("loadedWorld"),this.app.onceLoaded||(this.app.globalLoader.tl.play(),this.app.page.triggerLoad())}setScroll(e){var t;(t=this.items)==null||t.setPosition(e)}update(){var e;(e=this.items)==null||e.update()}createTexture(e){return this.renderer.setRenderTarget(e),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null),e.texture}resize(){var e;(e=this.items)==null||e.resize()}onMouseMove(e,t){}destroy(){var e;(e=this.items)==null||e.destroy()}}export{I as default};
