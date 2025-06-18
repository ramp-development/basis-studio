uniform vec3 uMain;
uniform vec3 uBg;
uniform vec3 uMidColor;
uniform float uTime;

varying vec2 vUv;
varying vec3 vColor;

void main()
{
    vec2 uv = vUv;

    gl_FragColor = vec4(vColor, 1.0);
}