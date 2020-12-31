var camera_fov = 35;
var camera_aspect = 1;
var camera_near = .1;
var camera_far = 1000;

var image_size = 300;

// var config = JSON.parse(arrayscript_config);
// var f = config.functions;
// var types = config.types;
// var f_max = config.functions.length;
// console.log(config, types, f_max);

var renderer_A = new THREE.WebGLRenderer({antialias: true});
renderer_A.setSize(image_size, image_size);

var renderer_B = new THREE.WebGLRenderer({antialias: false});
renderer_B.setSize(image_size, image_size);

var set_count_objects = false;

function getObjectsNumber(renderer) {

	var gl = renderer.getContext();
	var pixels = new Uint8Array(image_size * image_size * 4);
	gl.readPixels(0, 0, image_size, image_size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	let h = new Array(256);
	for (let i = 0; i < 256; i++) {
		h[i] = 0;
	}
	for (let i = 0; i < pixels.length; i += 4) {
		let v = pixels[i];
		h[v]++;
	}
	for (let i = 1; i < pixels.length; i += 4) {
		let v = pixels[i];
		h[v]++;
	}
	for (let i = 2; i < pixels.length; i += 4) {
		let v = pixels[i];
		h[v]++;
	}

	let objects_n = 0;
	for (let i = 0; i < 255; i++) {
		if (h[i] > 0) objects_n++;
	}

	return objects_n;
}

function sceneSetup(scene, camera) {

	// scene.background = new THREE.Color(0xdddddd);
	// const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
	// directionalLight.position.set(-10,10,10);
	// directionalLight.castShadow = true;
	// scene.add(directionalLight);

	scene.background = new THREE.Color(0xffffff);
	const directionalLight = new THREE.DirectionalLight(0xffffff, .5);
	directionalLight.position.set(-10,10,10);
	directionalLight.castShadow = true;
	scene.add(directionalLight);
	const directionalLight2 = new THREE.DirectionalLight(0xffffff, .5);
	directionalLight2.position.set(10,20,10);
	directionalLight2.castShadow = true;
	scene.add(directionalLight2);

	const ambientLight = new THREE.AmbientLight(0x808080, .75);
	scene.add(ambientLight);
}

function render(renderer, javascript, camera_javascript = "") {

	var camera = new THREE.PerspectiveCamera(camera_fov, camera_aspect, camera_near, camera_far);
	var scene = new THREE.Scene();
	var group = new THREE.Group();

	renderer.clear();

	camera.position.set(5,5,5);
	camera.lookAt(0, 0 ,0);

	sceneSetup(scene, camera);

	renderer.info.autoReset = false;
	renderer.setClearColor(0xffffff, 1);

	let rendered = false;

	let now1 = Date.now();

	function get_group() {
		return group;
	}
	function get_camera() {
		return camera;
	}

	var j = 0;
	var l = false;

	try {
		eval(javascript);
		eval(camera_javascript);
	} catch (e) {
		console.log(e.message);
	}

	let now2 = Date.now();
	// console.log("eval:", (now2-now1));

	scene.add(group);

	let obj_number = 0;
	scene.traverse(function(child) {
		if (child.geometry) {
			obj_number++;
		}
	});
	// console.log("obj_number before render", obj_number);

	if (obj_number > 0 && obj_number < 5000) {

		let now1 = Date.now();
		renderer.render(scene, camera);
		let now2 = Date.now();

		// console.log("renderer.render:", (now2-now1), obj_number);

		renderer.renderLists.dispose();
		renderer.properties.dispose();
		rendered = true;
	}

	scene.dispose();
	return rendered;
}

var ctrl_renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
var ctrl_camera = new THREE.PerspectiveCamera(camera_fov, camera_aspect,
		camera_near, camera_far);
var ctrl_scene = new THREE.Scene();
ctrl_camera.position.set( 0, 0, 500 );
ctrl_camera.aspect = 1;
ctrl_camera.updateProjectionMatrix();
ctrl_renderer.setSize(300, 300);
ctrl_renderer.render(ctrl_scene, ctrl_camera);
// ctrl_renderer.shadowMap.enabled = true;
// ctrl_renderer.shadowMap.type = THREE.PCFSoftShadowMap;

function controlRender(javascript, camera_javascript) {

	ctrl_scene.dispose();
	ctrl_scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(camera_fov, camera_aspect, camera_near, camera_far);
	var group = new THREE.Group();
	camera.position.set(5,5,5);
	camera.lookAt(0, 0 ,0);

	sceneSetup(ctrl_scene, camera);

	function get_group() {
		return group;
	}
	function get_camera() {
		return camera;
	}

	var j = 0;
	var l = false;

	try {
		eval(javascript);
		eval(camera_javascript);
		ctrl_scene.add(group);
	} catch (e) {
		console.log(e.message);
	}

	controls.reset();
	ctrl_camera.copy(camera);
	ctrl_renderer.render(ctrl_scene, camera);
}
