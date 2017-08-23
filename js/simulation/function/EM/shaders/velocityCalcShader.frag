precision highp float;

#define M_PI 3.1415926535897932384626433832795

uniform vec2 u_textureDim;
uniform float u_dt;

uniform sampler2D u_acceleration;
uniform sampler2D u_lastVelocity;
uniform sampler2D u_mass;

uniform sampler2D u_wires;
uniform sampler2D u_wiresMeta;
uniform float u_wiresMetaLength;
uniform float u_time;

int convertToInt(float num){
    return int(floor(num+0.001));
}

float getActuatorVoltage(float wireIndex){

    if (wireIndex == -2.0) return 0.0;

    vec2 wireCoord = vec2(0.5, (floor(wireIndex+0.001)+0.5)/u_wiresMetaLength);
    vec4 wireMeta = texture2D(u_wiresMeta, wireCoord);
    int type = convertToInt(wireMeta[0]);
    if (type == -1) {
        //no signal connected
        return 0.0;
    }

    int polarity = type/4;
    type = convertToInt(mod(float(type), 4.0));

    float frequency = wireMeta[1];
    float period = 1.0/frequency;
    float phase = wireMeta[2];
    float currentPhase = mod(u_time+phase*period, period)/period;

    float invert = 1.0;
    if (wireMeta[3] > 0.5) invert = -1.0;
    if (polarity > 0) invert = -invert;

    if (type == 0){
        return invert*0.5*sin(2.0*M_PI*currentPhase);
    }
    if (type == 1){
        float pwm = wireMeta[3];
        if (currentPhase < pwm) return invert*0.5;
        return -0.5*invert;
    }
    if (type == 2){
        if (wireMeta[3]>0.5) return invert*(0.5-currentPhase);
        return invert*(currentPhase-0.5);
    }
    if (type == 3){
        if (currentPhase < 0.5) return invert*(currentPhase*2.0-0.5);
        return invert*(0.5-(currentPhase-0.5)*2.0);
    }
    return 0.0;
}

void main(){
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_mass, scaledFragCoord).y;
    if (isFixed < 0.0 || isFixed == 1.0){//no cell or is fixed
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }

    vec4 wiring = texture2D(u_wires, scaledFragCoord);
    int actuatorType = convertToInt(wiring[0]);
    if (actuatorType == -7){
        //clamp
        float actuation = 0.3*(getActuatorVoltage(wiring[1]) - getActuatorVoltage(wiring[2]));
        if (actuation>=0.0) {
            gl_FragColor = vec4(0, 0, 0, 0);
            return;
        }
    }

    vec4 _lastVelocity = texture2D(u_lastVelocity, scaledFragCoord);
    vec4 _acceleration = texture2D(u_acceleration, scaledFragCoord);

    vec3 lastVelocity = _lastVelocity.xyz;
    vec3 acceleration = _acceleration.xyz;

    float lastAngVelocity = _lastVelocity[3];
    float angAccleration = _acceleration[3];

    vec3 velocity = acceleration*u_dt + lastVelocity;
    float angVelocity = angAccleration*u_dt + lastAngVelocity;

    gl_FragColor = vec4(velocity, angVelocity);
}