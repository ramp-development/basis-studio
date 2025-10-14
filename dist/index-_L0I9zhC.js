import{A as l}from"./app.js";import{S as m,U as t,C as c,V as i,P as s,M as d,b as v}from"./GL-D_VvO4-c.js";var g=`varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    
    gl_Position = projectionMatrix * viewMatrix * modelPoisition;

    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,f=`uniform sampler2D uTexture;
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
}`;const n=l.getInstance();let r=null;class y{constructor(e,o,a,h,u){r=e,this.scene=o,this.item=a,this.texture=h,this.index=u,this.sizes=n.sizes,this.time=n.time,this.init()}init(){this.setMaterial(),this.setMesh()}setMaterial(){this.material=new m({vertexShader:g,fragmentShader:f,transparent:!0,depthTest:!1,uniforms:{uTexture:new t(this.texture),uRes:new t(new i(this.sizes.width,this.sizes.height)),uAspect:new t(new i(16,9)),uSize:new t(new i(0,0)),uFluid:new t(null),uColor:new t(new c(255/255,118/255,162/255)),uLoading:new t(0),uTranslateY:new t(1.2)}})}setMesh(){this.rect=this.item.getBoundingClientRect(),this.geometry=new s(this.rect.width,this.rect.height,1,1),this.material.uniforms.uSize.value.set(this.rect.width,this.rect.height),this.material.uniforms.uAspect.value.set(this.rect.width,this.rect.height),this.mesh=new d(this.geometry,this.material),this.mesh.renderOrder=10,this.mesh.rotation.x=-Math.PI/2,this.scene.add(this.mesh),this.setPosition();const e=gsap.timeline({paused:!0,defaults:{duration:1.4,ease:"power2"}});e.to(this.material.uniforms.uLoading,{value:1},this.index*.3),e.to(this.mesh.rotation,{y:0,x:0},this.index*.3),e.to(this.mesh.position,{z:0},this.index*.3),ScrollTrigger.create({trigger:this.item,start:"top 80%",onEnter:()=>e.restart()})}setPosition(){this.rect=this.item.getBoundingClientRect(),this.mesh.position.x=this.rect.left+this.rect.width/2-this.sizes.width/2,this.mesh.position.y=-this.rect.top-this.rect.height/2+this.sizes.height/2}resize(){this.rect=this.item.getBoundingClientRect(),v(this.mesh,new s(this.rect.width,this.rect.height,1,1)),this.mesh.material.uniforms.uSize.value.set(this.rect.width,this.rect.height)}update(){this.material.uniforms.uFluid.value=r.fluidTexture}destroy(){this.material.dispose(),this.geometry.dispose(),this.scene.remove(this.mesh)}}export{y as i};
