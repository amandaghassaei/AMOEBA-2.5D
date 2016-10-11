precision highp float;

uniform vec2 u_textureDim;
uniform float u_dt;

uniform sampler2D u_velocity;
uniform sampler2D u_lastTranslation;
uniform sampler2D u_mass;

void main(){
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_mass, scaledFragCoord).y;
    if (isFixed < 0.0 || isFixed == 1.0){//no cell or is fixed
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }

    vec4 _lastTranslation = texture2D(u_lastTranslation, scaledFragCoord);
    vec4 _velocity = texture2D(u_velocity, scaledFragCoord);

    vec3 lastTranslation = _lastTranslation.xyz;
    vec3 velocity = _velocity.xyz;

    float lastRotation = _lastTranslation[3];
    float angVelocity = _velocity[3];

    vec3 translation = velocity*u_dt + lastTranslation;
    float rotation = angVelocity*u_dt + lastRotation;

    gl_FragColor = vec4(translation, rotation);
}