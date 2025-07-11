uniform sampler2D uTexture;
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

    // uv -= 0.5;
    // uv *= 1.1 - uLoading * 0.1;
    // uv += 0.5;

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
    cursor = pow(cursor, 2.5); // Adjust cursor sensitivity

    color.rgb = mix(color.rgb, uColor, cursor);
    color.a *= mask; // Apply mask to alpha

    gl_FragColor = color;
}