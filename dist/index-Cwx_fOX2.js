import{S as u,U as t,C as l,V as i,P as s,M as m,b as c}from"./GL-BGRjnAmH.js";var d=`varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    
    gl_Position = projectionMatrix * viewMatrix * modelPoisition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,v=`uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uLoading;
uniform float uTranslateY;

varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vec2 uv = vUv;

    
    
    

    float maskY = uTranslateY - (uLoading * uTranslateY);
    float mask = step(maskY, 1.0 - uv.y);
    float translateOffset = uTranslateY * (1.0 - uLoading);

    vec2 translatedUV = uv;
    translatedUV.y += translateOffset;

    mask = smoothstep(maskY - 0.01, maskY + 0.01, 1.0 - uv.y);

    vec4 color = texture2D(uTexture, translatedUV);
    float cursor = texture2D(uFluid, screenUv).r;
    float oldCursor = cursor;
    cursor = smoothstep(0.2, 1.0, cursor);
    cursor = clamp(cursor, 0.0, 1.0);
    cursor = pow(cursor, 2.5); 

    color.rgb = mix(color.rgb, uColor, cursor);
    color.a *= mask; 

    gl_FragColor = color;
}`;class p{constructor(e,n,r,o,a,h){this.app=e,this.gl=n,this.scene=r,this.item=o,this.texture=a,this.index=h,this.sizes=this.app.sizes,this.time=this.app.time,this.init()}init(){this.setMaterial(),this.setMesh()}setMaterial(){this.material=new u({vertexShader:d,fragmentShader:v,transparent:!0,depthTest:!1,uniforms:{uTexture:new t(this.texture),uRes:new t(new i(this.sizes.width,this.sizes.height)),uAspect:new t(new i(16,9)),uSize:new t(new i(0,0)),uFluid:new t(null),uColor:new t(new l(255/255,118/255,162/255)),uLoading:new t(0),uTranslateY:new t(1.2)}})}setMesh(){this.rect=this.item.getBoundingClientRect(),this.geometry=new s(this.rect.width,this.rect.height,1,1),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height),this.material.uniforms.uAspect.value.set(this.rect.width,this.rect.height),this.mesh=new m(this.geometry,this.material),this.mesh.renderOrder=10,this.mesh.rotation.x=-Math.PI/2,this.scene.add(this.mesh),this.setPosition();const e=gsap.timeline({paused:!0,defaults:{duration:1.4,ease:"power2"}});e.to(this.material.uniforms.uLoading,{value:1},this.index*.3),e.to(this.mesh.rotation,{y:0,x:0},this.index*.3),e.to(this.mesh.position,{z:0},this.index*.3),ScrollTrigger.create({trigger:this.item,start:"top 80%",onEnter:()=>e.restart()})}setPosition(){this.rect=this.item.getBoundingClientRect(),this.mesh.position.x=this.rect.left+this.rect.width/2-this.sizes.width/2,this.mesh.position.y=-this.rect.top-this.rect.height/2+this.sizes.height/2}resize(){this.rect=this.item.getBoundingClientRect(),c(this.mesh,new s(this.rect.width,this.rect.height,1,1)),this.mesh.material.uniforms.uSize.value.set(this.rect.width,this.rect.height)}update(){this.material.uniforms.uFluid.value=this.gl.fluidTexture}destroy(){this.material.dispose(),this.geometry.dispose(),this.scene.remove(this.mesh)}}export{p as i};
