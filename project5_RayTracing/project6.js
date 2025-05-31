var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	bool shadowhit = false;
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {

		HitInfo shadowinfo;
		vec3 lightdir = normalize(lights[i].position - position);
		Ray shadowray;
		shadowray.pos = position;
		
		shadowray.dir = normalize(lightdir);

		
		shadowhit = IntersectRay(shadowinfo, shadowray);

		if (!shadowhit){

			float cosdiff = max(dot(normal,lightdir),0.0);
			float cosspec = max(dot(normal,normalize(lightdir+view)),0.0);

			color += ((mtl.k_d * cosdiff) + (mtl.k_s * pow(cosspec, mtl.n)) )* lights[i].intensity;
		
		
		}


		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	vec3 dir = ray.dir;
	vec3 pos = ray.pos;
	float a = dot(dir,dir);
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		//sphere info
		vec3 c = spheres[i].center;
		float rad = spheres[i].radius;

		//coefficient sphere
		float b = 2.0*dot(dir,(pos-c));
		float e = dot((pos-c),(pos-c))-rad*rad;
		float delta = b*b - (4.0*a*e);
		if (delta>=0.0){
			float t;
			if (a !=0.0)
				t = (-b-sqrt(delta))/(2.0*a);
			else
				t = -e/b;
			if (t< hit.t && t>0.0){
				hit.t = t;
				hit.mtl = spheres[i].mtl;
				vec3 x = hit.t*dir+pos;
				hit.position = x;
				hit.normal = normalize(x - c);
				foundHit = true;
				
				}
		}
		// TO-DO: Test for ray-sphere intersection
		// TO-DO: If intersection is found, update the given HitInfo
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			r.pos=hit.position;

			r.dir=normalize(reflect(ray.dir, hit.normal));
			// TO-DO: Initialize the reflection ray
			
			if ( IntersectRay( h, r ) ) {
				clr += k_s * Shade( h.mtl, h.position , h.normal, view);
				hit = h;
				view = normalize( -r.dir );
				
				k_s = k_s * h.mtl.k_s;
				ray = r;
				// TO-DO: Hit found, so shade the hit point
				// TO-DO: Update the loop variables for tracing the next reflection ray
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;