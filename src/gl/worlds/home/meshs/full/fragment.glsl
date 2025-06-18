uniform sampler2D uTexture;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;

varying vec2 vUv;
varying vec2 screenUv;

#include ../../../../math/getCoverUv.glsl
#include ../../../../math/getAlpha.glsl

void main()
{
    vec2 uv = vUv;
    vec2 coverUv = getCoverUv(uv, uAspect, uSize);

    float area = smoothstep(0.0, 0.5, uv.y);

    vec4 color = texture2D(uTexture, coverUv);
    color.rgb = mix(color.rgb * 0.2, color.rgb, area);

    gl_FragColor = color;
}