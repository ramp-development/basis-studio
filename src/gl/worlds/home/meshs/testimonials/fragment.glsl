uniform vec3 uColor;
uniform vec3 uHoverColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform float uBorder;
uniform float uHovered;
// OLD UNIFORM - commented for easy rollback
// uniform vec2 uOffset;

// NEW UNIFORM - single float like cases for distortion
uniform float uOffset;

varying vec2 vUv;
varying vec2 screenUv;

#include ../../../../math/getAlpha.glsl

void main()
{
    vec2 uv = vUv;
    float border = getAlpha(uSize, uBorder, uv);

    vec4 color = vec4(mix(uColor, uHoverColor, uHovered), border);

    // gl_FragColor = color;
    gl_FragColor = vec4(uv, 0.0, 1.0); // For debugging purposes, replace with actual color logic
}