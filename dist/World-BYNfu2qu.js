import{A as R}from"./app.js";import{R as D}from"./Resources-DGiz5Izq.js";import{i as Y}from"./index-_L0I9zhC.js";import{V as f,S as C,U as r,C as T,G as L,P as x,a as p,M as S,b as P}from"./GL-D_VvO4-c.js";import M from"./VideoLoader-CTtbx0ai.js";import{i as _}from"./isSafari-DYs6RIMp.js";var V=`uniform vec2 uMouse;
uniform vec2 uRes;
uniform float uTime;

varying vec2 vUv;
varying vec2 screenUv;

#define PI 3.14159265359

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset)
{
    vec3 deformedPos = position;

    deformedPos.x += sin(uv.y * PI) * offset.x;
    deformedPos.y += sin(uv.x * PI) * offset.y;

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
    deformedPosition.x = deformationCurve(position, largeUv, uMouse).x;
    deformedPosition.y = deformationCurve(position, uv, uMouse).y;

    
    modelPosition = modelMatrix * vec4(deformedPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    
    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,I=`uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uBorder;
uniform float uHovered;
uniform float uOpacity;

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
    float cursor = texture2D(uFluid, screenUv).r;
    float border = getAlpha(uSize, uBorder, uv);

    vec4 color = texture2D(uTexture, coverUv);
    color.a *= border - uHovered * 0.5;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    color.rgb = applyOverlayTint(color.rgb, uColor, tintAmount);
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor * 5.).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor);
    vec3 fakeBlurColor = fakeBlur(uTexture, coverUv, uHovered * 10.).rgb;
    color.rgb = mix(color.rgb, fakeBlurColor, uHovered);

    color.a *= uOpacity;

    gl_FragColor = color;
}`;const g=R.getInstance();let E=null,q=class{constructor(e,o,t,s){E=e,this.scene=o,this.main=t,this.resources=s.items,this.sizes=g.sizes,this.time=g.time,this.items=this.main.querySelectorAll(".hero_image, .hero_video"),this.mouse=new f(0,0),this.offset=new f(0,0),this.outputOffset=new f(0,0),this.mouseEnabled=!1,this.offsetQuicks={x:gsap.quickTo(this.outputOffset,"x",{duration:.6,ease:"power2.out",onUpdate:()=>{this.mouseEnabled&&this.meshs.forEach(({material:i})=>i.uniforms.uMouse.value.set(this.outputOffset.x,this.outputOffset.y))}}),y:gsap.quickTo(this.outputOffset,"y",{duration:.6,ease:"power2.out"})},g.on("homeAnimationStatic",()=>{this.mouseEnabled=!0}),this.init()}init(){this.setMaterial(),this.setMesh(),this.debug()}debug(){if(!g.debug.active)return;g.debug.gui.addFolder("Home/Hero")}setMaterial(){this.material=new C({vertexShader:V,fragmentShader:I,transparent:!0,depthTest:!1,uniforms:{uTexture:new r(null),uRes:new r(new f(this.sizes.width,this.sizes.height)),uAspect:new r(new f(16,9)),uSize:new r(new f(0,0)),uBorder:new r(0),uTime:new r(0),uFluid:new r(null),uHovered:new r(0),uColor:new r(new T(255/255,118/255,162/255)),uMouse:new r(this.mouse),uOpacity:new r(0)}})}setMesh(){this.group=new L,this.scene.add(this.group),this.meshs=[...this.items].map((e,o)=>{const s=[...this.items].filter(h=>h.querySelector("img")).indexOf(e),i=window.getComputedStyle(e).getPropertyValue("border-radius"),n=e.getBoundingClientRect(),u=_?15:30,v=new x(n.width,n.height,u,u),a=this.material.clone();a.uniforms.uSize.value.set(n.width,n.height),a.uniforms.uBorder.value=parseFloat(i)||0;const l=e.querySelector("img"),c=e.querySelector("video");if(c)if(c._videoLoaderInstance){const h=c._videoLoaderInstance;if(h.isLoaded){const d=new p(c);a.uniforms.uTexture.value=d,a.uniforms.uAspect.value.set(h.width||c.videoWidth,h.height||c.videoHeight)}else h.on("loaded",()=>{const d=new p(c);a.uniforms.uTexture.value=d,a.uniforms.uAspect.value.set(h.width,h.height)})}else{const h=new M(c,{lazyLoad:!1});h.on("loaded",()=>{const d=new p(c);a.uniforms.uTexture.value=d,a.uniforms.uAspect.value.set(h.width,h.height)})}else if(l){a.uniforms.uTexture.value=this.resources[s];const h=l.getAttribute("src"),d=new Image;d.src=h,d.crossOrigin="anonymous",d.onload=()=>{a.uniforms.uAspect.value.set(d.width,d.height)}}const U=new S(v,a),X=gsap.timeline({paused:!0});return X.to(U.material.uniforms.uHovered,{value:1,duration:.4,ease:"power1.inOut"}),this.group.add(U),e.style.setProperty("opacity","0"),g.observer.instance.observe(e),{mesh:U,item:e,material:a,tl:X}}),this.meshs.forEach(({item:e},o)=>{e.addEventListener("mouseenter",()=>{this.meshs.forEach(({tl:t},s)=>{s!=o&&t.play()})}),e.addEventListener("mouseleave",()=>{this.meshs.forEach(({tl:t},s)=>{t.reverse()})})}),this.setPosition()}setPosition(){this.meshs.forEach(({mesh:e,item:o})=>{if(o.dataset.visible=="false")return;const t=o.getBoundingClientRect();e.position.x=t.left+t.width/2-this.sizes.width/2,e.position.y=-t.top-t.height/2+this.sizes.height/2})}onMouseMove(e){this.mouseEnabled&&(this.mouse.x=e.clientX-window.innerWidth/2,this.mouse.y=e.clientY-window.innerHeight/2,this.offset.x=this.lerp(this.offset.x,this.mouse.x,.1),this.offset.y=this.lerp(this.offset.y,this.mouse.y,.1),this.offsetQuicks.x(-(this.mouse.x-this.offset.x)*.1),this.offsetQuicks.y((this.mouse.y-this.offset.y)*.02))}resize(){this.meshs.forEach(({mesh:e,item:o})=>{const t=o.getBoundingClientRect();P(e,new x(t.width,t.height,50,50)),e.material.uniforms.uSize.value.set(t.width,t.height);const s=window.getComputedStyle(o).getPropertyValue("border-radius");e.material.uniforms.uBorder.value=parseFloat(s)||0})}update(){this.meshs.forEach(({mesh:e,material:o})=>{o.uniforms.uFluid.value=E.fluidTexture}),this.offsetQuicks.x(0),this.offsetQuicks.y(0)}destroy(){this.meshs.forEach(({mesh:e,material:o})=>{o.dispose(),e.geometry.dispose(),this.group.remove(e)}),this.group&&this.scene.remove(this.group)}lerp(e,o,t){return e*(1-t)+o*t}};var F=`varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    
    gl_Position = projectionMatrix * viewMatrix * modelPoisition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,O=`uniform sampler2D uTexture;
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
uniform float uAlpha;

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
    coverUv *= 0.9;
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

    
    color.a *= uAlpha;

    gl_FragColor = color;
}`;const y=R.getInstance();let B=null,k=class{constructor(e,o,t){B=e,this.scene=o,this.main=t,this.sizes=y.sizes,this.time=y.time,this.items=this.main.querySelectorAll(".preview_img, .talk_full"),this.init()}init(){this.setMaterial(),this.setMesh(),this.debug()}debug(){if(!y.debug.active)return;const e=y.debug.gui;this.folder=e.addFolder("Home/Video"),this.folder.add(this.material.uniforms.uReveal,"value",0,1,.01).name("uReveal").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uReveal.value=o)}),this.folder.add(this.material.uniforms.uRotate,"value",0,2,.01).name("uRotate").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uRotate.value=o)}),this.folder.add(this.material.uniforms.uRadius,"value",0,1,.01).name("uRadius").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uRadius.value=o)}),this.folder.add(this.material.uniforms.uRotateX,"value",-1,1,.01).name("uRotateX").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uRotateX.value=o)}),this.folder.add(this.material.uniforms.uRotateY,"value",-1,1,.01).name("uRotateY").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uRotateY.value=o)}),this.folder.add(this.material.uniforms.uZoom,"value",-1,1,.01).name("uZoom").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uZoom.value=o)}),this.folder.add(this.material.uniforms.uAlpha,"value",0,1,.01).name("uAlpha").onChange(o=>{this.meshs.forEach(({material:t})=>t.uniforms.uAlpha.value=o)})}setMaterial(){this.material=new C({vertexShader:F,fragmentShader:O,transparent:!0,depthTest:!1,uniforms:{uTexture:new r(null),uRes:new r(new f(this.sizes.width,this.sizes.height)),uAspect:new r(new f(16,9)),uSize:new r(new f(0,0)),uBorder:new r(0),uReveal:new r(0),uRotate:new r(0),uRotateX:new r(0),uRotateY:new r(0),uRadius:new r(.02),uZoom:new r(.55),uTime:new r(0),uFluid:new r(null),uParallax:new r(0),uColor:new r(new T(255/255,118/255,162/255)),uAlpha:new r(1)}})}setMesh(){this.meshs=[...this.items].map((e,o)=>{const t=window.getComputedStyle(e).getPropertyValue("border-radius").split("px"),s=e.getBoundingClientRect(),i=new x(s.width,s.height,1,1),n=this.material.clone();n.uniforms.uSize.value.set(s.width,s.height),n.uniforms.uBorder.value=parseFloat(t[0]);const u=new S(i,n),v=e.querySelector("video");if(v)if(v._videoLoaderInstance){const l=v._videoLoaderInstance;if(l.isLoaded){const c=new p(v);n.uniforms.uTexture.value=c,n.uniforms.uAspect.value.set(l.width||v.videoWidth,l.height||v.videoHeight)}else l.on("loaded",()=>{const c=new p(v);n.uniforms.uTexture.value=c,n.uniforms.uAspect.value.set(l.width,l.height)})}else{const l=new M(v,{lazyLoad:!1});l.on("loaded",()=>{const c=new p(v);n.uniforms.uTexture.value=c,n.uniforms.uAspect.value.set(l.width,l.height)})}this.scene.add(u),y.observer.instance.observe(e);const a=gsap.timeline({paused:!0,defaults:{duration:1,ease:"power3.out"}});return e.classList.contains("talk_full")?(u.scale.set(.3,.3,.3),a.to(n.uniforms.uReveal,{value:1,duration:.1}).to(u.scale,{x:1,y:1,z:1,duration:1.2,ease:"back.out(1.2)"},"<0.1").fromTo(n.uniforms.uRotate,{value:-.3},{value:0},"<0.1").fromTo(n.uniforms.uRotateY,{value:.8},{value:0},"<0.1").fromTo(n.uniforms.uRotateX,{value:-.8},{value:0},"<0.1").fromTo(n.uniforms.uRadius,{value:0},{value:.02,duration:.2},"<0.8")):a.to(n.uniforms.uReveal,{value:1}).fromTo(n.uniforms.uRotate,{value:-.3},{value:0},"<").fromTo(n.uniforms.uRotateY,{value:.8},{value:0},"<").fromTo(n.uniforms.uRotateX,{value:-.8},{value:0},"<").fromTo(n.uniforms.uRadius,{value:0},{value:.02,duration:.2},"<"),ScrollTrigger.create({trigger:e,start:"top 90%",onEnter:()=>a.play()}),ScrollTrigger.create({trigger:e,start:"top bottom",onLeaveBack:()=>a.pause(0)}),{mesh:u,item:e,material:n}}),this.setPosition()}setPosition(){this.meshs.forEach(({mesh:e,item:o})=>{if(o.dataset.visible=="false"){e.visible=!1;return}e.visible=!0;const t=o.getBoundingClientRect();e.position.x=t.left+t.width/2-this.sizes.width/2,e.position.y=-t.top-t.height/2+this.sizes.height/2})}resize(){this.meshs.forEach(({mesh:e,item:o})=>{const t=o.getBoundingClientRect();P(e,new x(t.width,t.height,1,1)),e.material.uniforms.uSize.value.set(t.width,t.height);const s=window.getComputedStyle(o).getPropertyValue("border-radius").split("px");e.material.uniforms.uBorder.value=parseFloat(s[0])})}update(){this.meshs.forEach(({mesh:e,material:o})=>{o.uniforms.uFluid.value=B.fluidTexture})}destroy(){this.meshs.forEach(({mesh:e,material:o})=>{o.dispose(),e.geometry.dispose(),this.scene.remove(e)})}};var $=`varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    
    gl_Position = projectionMatrix * viewMatrix * modelPoisition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,H=`uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uReveal;
uniform float uRotate;
uniform float uRotateX;
uniform float uRotateY;
uniform float uRadius; 
uniform float uZoom;

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
    vec2 zoomedUv = coverUv - uZoom;
    zoomedUv *= 1.0 - uZoom * (1.0 - smoothstep(0.0, 1.0, uReveal));
    zoomedUv += uZoom;
    vec2 rotatedUv = rotateUV(uv, uRotate);
    rotatedUv = rotateUVX(rotatedUv, uRotateX);
    rotatedUv = rotateUVY(rotatedUv, uRotateY);

    vec4 color = texture2D(uTexture, zoomedUv);
    float cursor = texture2D(uFluid, screenUv).r;

    float maxDistance = 0.5;
    float reveal = maxDistance * uReveal;
    vec2 areaSize = vec2(reveal * 2.0);

    
    float sdf = roundedRect(rotatedUv, areaSize, uRadius);
    float area = 1.0 - smoothstep(-0.001, 0.001, sdf);

    color.a *= area;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    color.rgb = applyOverlayTint(color.rgb, uColor, tintAmount);
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor * 5.).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor * 0.5);

    float fadeArea = smoothstep(0.0, 0.5, uv.y);
    color.rgb = mix(color.rgb * 0.2, color.rgb, fadeArea);

    gl_FragColor = color;
}`;const b=R.getInstance();let z=null;class G{constructor(e,o,t){z=e,this.scene=o,this.main=t,this.sizes=b.sizes,this.time=b.time,this.items=this.main.querySelectorAll(".full_item"),this.init()}init(){this.setMaterial(),this.setMesh()}setMaterial(){this.material=new C({vertexShader:$,fragmentShader:H,transparent:!0,depthTest:!1,uniforms:{uTexture:new r(null),uRes:new r(new f(this.sizes.width,this.sizes.height)),uAspect:new r(new f(16,9)),uSize:new r(new f(0,0)),uReveal:new r(0),uRotate:new r(0),uRotateX:new r(0),uRotateY:new r(0),uRadius:new r(.02),uZoom:new r(.55),uTime:new r(0),uFluid:new r(null),uColor:new r(new T(255/255,118/255,162/255))}})}setMesh(){this.meshs=[...this.items].map((e,o)=>{const t=e.getBoundingClientRect(),s=new x(t.width,t.height,1,1),i=this.material.clone();i.uniforms.uSize.value.set(t.width,t.height),i.uniforms.uTexture.value=z.gradientTexture;const n=new S(s,i),u=e.querySelector("video");if(u)if(u._videoLoaderInstance){const a=u._videoLoaderInstance;if(a.isLoaded){const l=new p(u);i.uniforms.uTexture.value=l,i.uniforms.uAspect.value.set(a.width||u.videoWidth,a.height||u.videoHeight)}else a.on("loaded",()=>{const l=new p(u);i.uniforms.uTexture.value=l,i.uniforms.uAspect.value.set(a.width,a.height)})}else{const a=new M(u,{lazyLoad:!1});a.on("loaded",()=>{const l=new p(u);i.uniforms.uTexture.value=l,i.uniforms.uAspect.value.set(a.width,a.height)})}n.renderOrder=o,this.scene.add(n),b.observer.instance.observe(e);const v=gsap.timeline({paused:!0,defaults:{duration:1,ease:"power3.out"}});return v.to(i.uniforms.uReveal,{value:1}).fromTo(i.uniforms.uRotate,{value:-.3},{value:0},"<").fromTo(i.uniforms.uRotateY,{value:.8},{value:0},"<").fromTo(i.uniforms.uRotateX,{value:-.8},{value:0},"<"),{mesh:n,item:e,material:i,tl:v}}),this.setPosition()}setPosition(){this.meshs.forEach(({mesh:e,item:o})=>{if(o.dataset.visible=="false"){e.visible=!1;return}e.visible=!0;const t=o.getBoundingClientRect();e.position.x=t.left+t.width/2-this.sizes.width/2,e.position.y=-t.top-t.height/2+this.sizes.height/2})}resize(){this.meshs.forEach(({mesh:e,item:o})=>{const t=o.getBoundingClientRect();P(e,new x(t.width,t.height,1,1)),e.material.uniforms.uSize.value.set(t.width,t.height)})}update(){this.meshs.forEach(({mesh:e,material:o})=>{o.uniforms.uFluid.value=z.fluidTexture})}destroy(){this.meshs.forEach(({mesh:e,material:o})=>{o.dispose(),e.geometry.dispose(),this.scene.remove(e)})}}const w=R.getInstance();let m=null;class te{constructor(e,o,t){m=e,this.scene=o,this.main=t,this.sizes=w.sizes,this.renderer=m.renderer.instance,this.camera=m.camera.instance,this.scene=o,this.load()}load(){this.count=0,this.items=this.main.querySelectorAll(".hero_image, .hero_video"),this.footerLogo=this.main.querySelector(".footer_logo"),this.nowText=this.main.querySelector(".now_texture"),this.testimonials=this.main.querySelector(".testimonials"),this.sources=[...this.items].filter(e=>e.querySelector("img")).map((e,o)=>({type:"textureLoader",url:e.querySelector("img").getAttribute("src"),name:o})),this.footerLogo&&(this.getTextureAttributes(this.footerLogo).forEach(({value:o},t)=>{this.sources.push({type:"textureLoader",url:o,name:`footer-${t}`})}),gsap.set(this.footerLogo,{opacity:0})),this.nowText&&this.getTextureAttributes(this.nowText).forEach(({value:o},t)=>{this.sources.push({type:"textureLoader",url:o,name:`nowText-${t}`})}),this.resources=new D(this.sources),this.resources.on("ready",()=>this.init())}init(){if(m.loaded=!0,this.video=new k(m,this.scene,this.main),this.full=new G(m,this.scene,this.main),this.hero=new q(m,this.scene,this.main,this.resources),this.footerLogo){this.footerMeshs=[];const e=this.getTextureAttributes(this.footerLogo);this.footerTextures=e.map((o,t)=>{const s=`footer-${t}`;return this.resources.items[s]}),this.footerTextures.forEach((o,t)=>{this.footerMeshs[t]=new Y(m,this.scene,this.footerLogo,o,t)})}if(this.nowText){this.nowMeshs=[];const e=this.getTextureAttributes(this.nowText);this.nowTextTextures=e.map((o,t)=>{const s=`nowText-${t}`;return this.resources.items[s]}),this.nowTextTextures.forEach((o,t)=>{this.nowMeshs[t]=new Y(m,this.scene,this.nowText,o,t)})}w.trigger("loadedWorld"),w.onceLoaded||(w.globalLoader.tl.play(),w.page.triggerLoad())}setScroll(e){var o,t,s,i,n;(o=this.video)==null||o.setPosition(),(t=this.full)==null||t.setPosition(),(s=this.hero)==null||s.setPosition(),(i=this.footerMeshs)==null||i.forEach(u=>u.setPosition()),(n=this.nowMeshs)==null||n.forEach(u=>u.setPosition())}update(){var e,o,t,s,i;(e=this.video)==null||e.update(),(o=this.full)==null||o.update(),(t=this.hero)==null||t.update(),(s=this.footerMeshs)==null||s.forEach(n=>n.update()),(i=this.nowMeshs)==null||i.forEach(n=>n.update())}createTexture(e){return this.renderer.setRenderTarget(e),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null),e.texture}resize(){var e,o,t,s,i;(e=this.video)==null||e.resize(),(o=this.full)==null||o.resize(),(t=this.hero)==null||t.resize(),(s=this.footerMeshs)==null||s.forEach(n=>n.resize()),(i=this.nowMeshs)==null||i.forEach(n=>n.resize())}onMouseMove(e,o){var t;(t=this.hero)==null||t.onMouseMove(e,o)}destroy(){var e,o,t,s,i;(e=this.video)==null||e.destroy(),(o=this.full)==null||o.destroy(),(t=this.hero)==null||t.destroy(),(s=this.footerMeshs)==null||s.forEach(n=>n.destroy()),(i=this.nowMeshs)==null||i.forEach(n=>n.destroy())}getTextureAttributes(e){return e.getAttributeNames().filter(o=>o.startsWith("data-texture-")).map(o=>({name:o,value:e.getAttribute(o),number:parseInt(o.split("-")[2])})).sort((o,t)=>o.number-t.number)}}export{te as default};
