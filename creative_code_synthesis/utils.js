
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

var limit = Number.EPSILON;

function new_MeshStandardMaterial(color,
	metalness, roughness, wireframe) {
	return new THREE.MeshStandardMaterial({color: color,
		metalness: metalness,
		roughness: roughness, wireframe: wireframe});
}

function new_MeshBasicMaterial(color) {
	return new THREE.MeshBasicMaterial({color: color, wireframe: true});
}

function new_MeshNormalMaterial() {
	return new THREE.MeshNormalMaterial();
}

function new_DiretionalLight(color, intensity) {
	let light = new THREE.DirectionalLight(color, intensity);
	light.castShadow = true;
	return light;
}

function safeDiv(n1, n2) {
	if (Math.abs(n2) < limit) {
		n2 = limit * Math.sign(n2);
	}
	return n1 / n2;
}

function safeScaleSet(obj, n1, n2, n3) {
	if (n1 < limit) n1 = limit;
	if (n2 < limit) n2 = limit;
	if (n3 < limit) n3 = limit;
	obj.scale.set(n1, n2. n3);
}

function safeScaleSetScalar(obj, n1) {
	if (n1 < limit) n1 = limit;
	obj.scale.setScalar(n1);
}

function Math_PI() {
	return Math.PI;
}

function get_material() {
	return new THREE.MeshNormalMaterial()
}

function get_group() {
	return group;
}

function get_camera() {
	return camera;
}

function new_mesh(geometry, material) {

	if (set_count_objects) {
		let v = Math.random();
		var color = new THREE.Color(v, v, v);
		let material = new THREE.MeshBasicMaterial({color: color});
		let mesh = new THREE.Mesh(geometry, material);
		mesh.material.depthWrite = false;
		return mesh;
	}

	let mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = mesh.receiveShadow = true;
	return mesh;
}

function parabola( x, k ) {
	if (k < 0) {
		if (Math.abs(x) < limit) x = limit;
	}
	return Math.pow( 4 * x * ( 1 - x ), k );
}

function parabola( x, k ) {
	if (k < 0) {
		if (Math.abs(x) < limit) x = limit;
	}
	return Math.pow( 4 * x * ( 1 - x ), k );
}
