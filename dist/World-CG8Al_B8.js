import{A as R}from"./app.js";import{R as A}from"./Resources-DGiz5Izq.js";import L from"./VideoLoader-CTtbx0ai.js";import{S as P,U as s,C as S,V as f,P as w,M as T,b as z,a as v}from"./GL-D_VvO4-c.js";import"./isSafari-DYs6RIMp.js";var E=`uniform float uOffset;

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
}`,q=`uniform sampler2D uTexture;
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
}`;const m=R.getInstance();let y=null;class M{constructor(t,o,i,e,l,n){y=t,this.scene=o,this.main=i,this.resources=e,this.videoTextures=l,this.items=n,this.sizes=m.sizes,this.time=m.time,this.velocity={value:0},this.quick=gsap.quickTo(this.velocity,"value",{duration:.5,ease:"power2"}),this.init()}init(){this.setMaterial(),this.setMesh(),this.debug()}debug(){if(!m.debug.active)return;const o=m.debug.gui.addFolder("Home/Video");o.add(this.material.uniforms.uReveal,"value",0,1,.01).name("uReveal").onChange(i=>{this.meshs.forEach(({material:e})=>e.uniforms.uReveal.value=i)}),o.add(this.material.uniforms.uRotate,"value",0,2,.01).name("uRotate").onChange(i=>{this.meshs.forEach(({material:e})=>e.uniforms.uRotate.value=i)}),o.add(this.material.uniforms.uRadius,"value",0,1,.01).name("uRadius").onChange(i=>{this.meshs.forEach(({material:e})=>e.uniforms.uRadius.value=i)}),o.add(this.material.uniforms.uRotateX,"value",-1,1,.01).name("uRotateX").onChange(i=>{this.meshs.forEach(({material:e})=>e.uniforms.uRotateX.value=i)}),o.add(this.material.uniforms.uRotateY,"value",-1,1,.01).name("uRotateY").onChange(i=>{this.meshs.forEach(({material:e})=>e.uniforms.uRotateY.value=i)}),o.add(this.material.uniforms.uZoom,"value",-1,1,.01).name("uZoom").onChange(i=>{this.meshs.forEach(({material:e})=>e.uniforms.uZoom.value=i)})}setMaterial(){this.material=new P({vertexShader:E,fragmentShader:q,transparent:!0,depthTest:!1,uniforms:{uTexture:new s(null),uRes:new s(new f(this.sizes.width,this.sizes.height)),uAspect:new s(new f(16,9)),uSize:new s(new f(0,0)),uBorder:new s(0),uReveal:new s(0),uRotate:new s(0),uRotateX:new s(0),uRotateY:new s(0),uRadius:new s(.02),uZoom:new s(.55),uLoading:new s(0),uTime:new s(0),uFluid:new s(null),uOffset:new s(null),uParallax:new s(0),uColor:new s(new S(255/255,118/255,162/255))}})}setMesh(){this.meshs=[...this.items].map((t,o)=>{const i=window.getComputedStyle(t).getPropertyValue("border-radius").split("px"),e=t.querySelector(".f-28"),l=e?e.textContent.trim()||`case-${o}`:`case-${o}`,n=t.querySelector(".cases_video_wrapper");let r=null,p=0,g=0;if(n.classList.contains("w-condition-invisible")){r=this.resources[l];const a=new Image;a.src=t.querySelector("img").getAttribute("src"),a.onload=()=>{u.uniforms.uAspect.value.set(a.width,a.height)}}else{const a=this.videoTextures.find(U=>U.name===l);r=a.texture,p=a.width,g=a.height}const h=t.getBoundingClientRect(),b=new w(h.width,h.height,200,200),u=this.material.clone();u.uniforms.uSize.value.set(h.width,h.height),u.uniforms.uTexture.value=r,u.uniforms.uBorder.value=parseFloat(i[0]),u.uniforms.uAspect.value.set(p,g);const x=new T(b,u);return this.scene.add(x),{mesh:x,item:t,material:u}}),this.setPosition(null)}setPosition(t){this.meshs.forEach(({mesh:o,item:i})=>{if(i.dataset.visible=="false"){o.visible=!1;return}o.visible=!0;const e=i.getBoundingClientRect();o.position.x=e.left+e.width/2-this.sizes.width/2,o.position.y=-e.top-e.height/2+this.sizes.height/2}),t&&(this.quick(-t.velocity*1.5),this.meshs.forEach(({material:o})=>o.uniforms.uOffset.value=this.velocity.value))}resize(){this.meshs.forEach(({mesh:t,item:o})=>{const i=o.getBoundingClientRect();z(t,new w(i.width,i.height,200,200)),t.material.uniforms.uSize.value.set(i.width,i.height);const e=window.getComputedStyle(o).getPropertyValue("border-radius").split("px");t.material.uniforms.uBorder.value=parseFloat(e[0])})}update(){this.destroyed||this.meshs.forEach(({mesh:t,material:o})=>{o.uniforms.uFluid.value=y.fluidTexture})}destroy(){this.meshs.forEach(({mesh:t,material:o})=>{o.dispose(),t.geometry.dispose(),this.scene.remove(t),this.destroyed=!0})}}const c=R.getInstance();let d=null;class k{constructor(t,o,i){d=t,this.scene=o,this.main=i,this.sizes=c.sizes,this.renderer=d.renderer.instance,this.camera=d.camera.instance,this.scene=o,this.load()}load(){this.videosLength=this.main.querySelectorAll(".cases_video_wrapper:not(.w-condition-invisible)").length,this.videoTexetures=[],this.count=0,this.videoLoaded=!1,this.itemElements=this.main.querySelectorAll(".cases_item"),this.sources=[...this.itemElements].map(t=>{const o=t.querySelector(".f-28").textContent.trim(),i=t.querySelector("img");return i.classList.contains("w-condition-invisible")?null:{type:"textureLoader",url:i.getAttribute("src"),name:o}}).filter(Boolean),this.resources=new A(this.sources),this.videosToLoadCount=0,this.itemElements.forEach(t=>{const o=t.querySelector(".f-28").textContent.trim(),i=t.querySelector(".cases_video_wrapper");if(!i||i.classList.contains("w-condition-invisible"))return;const e=i.querySelector("video");if(!e)return;this.videosToLoadCount+=1;const l=e.readyState>=2&&e.videoWidth>0&&e.videoHeight>0;if(e._videoLoaderInstance){const n=e._videoLoaderInstance;if(l||n.isLoaded){const r=new v(e);this.videoTexetures.push({name:o,texture:r,width:n.width||e.videoWidth,height:n.height||e.videoHeight}),this.checkLoaded()}else n.startLoading&&n.startLoading(),n.once("loaded",()=>{const r=new v(e);this.videoTexetures.push({name:o,texture:r,width:n.width||e.videoWidth,height:n.height||e.videoHeight}),this.checkLoaded()}),setTimeout(()=>{if(!n.isLoaded&&e.readyState>=2&&e.videoWidth>0){const r=new v(e);this.videoTexetures.push({name:o,texture:r,width:e.videoWidth,height:e.videoHeight}),this.checkLoaded()}else n.isLoaded||(console.error(`[Cases World] Video "${o}" failed to load, counting anyway`),this.checkLoaded())},5e3)}else{const n=new L(e,{lazyLoad:!1});n.on("loaded",()=>{const r=new v(e);this.videoTexetures.push({name:o,texture:r,width:n.width,height:n.height}),this.checkLoaded()})}}),this.resources.on("ready",()=>this.checkLoaded())}checkLoaded(){this.count+=1,this.count>=this.videosToLoadCount+1&&this.init()}init(){d.loaded=!0,this.items=new M(d,this.scene,this.main,this.resources.items,this.videoTexetures,this.itemElements),c.trigger("loadedWorld"),c.onceLoaded||(c.globalLoader.tl.play(),c.page.triggerLoad())}setScroll(t){var o;(o=this.items)==null||o.setPosition(t)}update(){var t;(t=this.items)==null||t.update()}createTexture(t){return this.renderer.setRenderTarget(t),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null),t.texture}resize(){var t;(t=this.items)==null||t.resize()}onMouseMove(t,o){}destroy(){var t;(t=this.items)==null||t.destroy()}}export{k as default};
