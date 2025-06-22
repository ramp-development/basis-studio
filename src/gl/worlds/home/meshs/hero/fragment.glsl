uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uBorder;
uniform float uHovered;

varying vec2 vUv;
varying vec2 screenUv;

#include ../../../../math/getCoverUv.glsl
#include ../../../../math/getAlpha.glsl
#include ../../../../math/fakeBlur.glsl
#include ../../../../math/tint.glsl

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
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor);
    vec3 fakeBlurColor = fakeBlur(uTexture, coverUv, uHovered * 10.).rgb;
    color.rgb = mix(color.rgb, fakeBlurColor, uHovered);

    gl_FragColor = color;
}