// OLD UNIFORM - commented for easy rollback
// uniform vec2 uOffset;

// NEW UNIFORM - single float like cases for distortion
uniform float uOffset;
uniform vec2 uRes;
uniform float uTime;

varying vec2 vUv;
varying vec2 screenUv;

#define PI 3.14159265359

// OLD DEFORMATION - commented for easy rollback
// vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset)
// {
//     vec3 deformedPos = position;

//     deformedPos.x += sin(uv.y * PI) * offset.x;
//     deformedPos.y += sin(uv.x * PI) * offset.y;

//     return deformedPos;
// }

// NEW DEFORMATION - cases-inspired single float distortion
vec3 deformationCurve(vec3 position, vec2 uv, float offset)
{
    vec3 deformedPos = position;
    
    // Apply horizontal distortion based on offset (like cases velocity distortion)
    deformedPos.x += sin(uv.y * PI * 2.0) * offset * 10.0;
    deformedPos.y += sin(uv.x * PI * 1.5) * offset * 5.0;

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

    // OLD DEFORMATION APPLICATION - commented for easy rollback
    // vec3 deformedPosition = vec3(position.x, position.y, position.z);
    // deformedPosition.x = deformationCurve(position, uv, uOffset).x;
    // deformedPosition.y = deformationCurve(position, largeUv, uOffset).y;

    // NEW DEFORMATION APPLICATION - single float offset
    vec3 deformedPosition = deformationCurve(position, uv, uOffset);

    // Recalculate final position with deformed geometry
    modelPosition = modelMatrix * vec4(deformedPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Calculate final screen UV for fragment shader
    screenUv = vec2(gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}