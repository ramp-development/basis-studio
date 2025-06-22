uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uReveal;
uniform float uRotate;
uniform float uRotateX;
uniform float uRotateY;
uniform float uRadius; // Add this uniform for border radius control
uniform float uZoom;

varying vec2 vUv;
varying vec2 screenUv;

#include ../../../../math/getCoverUv.glsl
#include ../../../../math/getAlpha.glsl
#include ../../../../math/rotateUv.glsl
#include ../../../../math/fakeBlur.glsl
#include ../../../../math/tint.glsl


// Function to create rounded rectangle
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

    // Replace the old area calculation with rounded rectangle
    float sdf = roundedRect(rotatedUv, areaSize, uRadius);
    float area = 1.0 - smoothstep(-0.001, 0.001, sdf);

    color.a *= area;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    color.rgb = applyOverlayTint(color.rgb, uColor, tintAmount);
    vec3 blurColor = fastGaussianBlur(uTexture, coverUv, cursor).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor * 0.5);

    float fadeArea = smoothstep(0.0, 0.5, uv.y);
    color.rgb = mix(color.rgb * 0.2, color.rgb, fadeArea);

    gl_FragColor = color;
}