uniform vec2 uOffset;
uniform vec2 uRes;
uniform float uTime;

varying vec2 vUv;
varying vec2 screenUv;

#define PI 3.14159265359

// Your deformation curve function adapted for vertex shader
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

    // First, transform to get screen-space coordinates for deformation
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Calculate screen UV from the projected position
    vec2 largeUv = vec2(projectedPosition.xy / projectedPosition.w) * 0.5 + 0.5;

    // Apply deformation using the screen UV
    vec3 deformedPosition = vec3(position.x, position.y, position.z);
    deformedPosition.x = deformationCurve(position, uv, uOffset).x;
    deformedPosition.y = deformationCurve(position, largeUv, uOffset).y;

    // Recalculate final position with deformed geometry
    modelPosition = modelMatrix * vec4(deformedPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Calculate final screen UV for fragment shader
    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}