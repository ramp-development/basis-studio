uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;

varying vec2 vUv;
varying vec2 screenUv;

void main()
{
    vec2 uv = vUv;

    vec4 color = texture2D(uTexture, uv);
    float cursor = texture2D(uFluid, screenUv).r;
    float oldCursor = cursor;
    cursor = smoothstep(0.2, 1.0, cursor);
    cursor = clamp(cursor, 0.0, 1.0);
    cursor = pow(cursor, 2.5); // Adjust cursor sensitivity

    color.rgb = mix(color.rgb, uColor, cursor);

    gl_FragColor = color;
}