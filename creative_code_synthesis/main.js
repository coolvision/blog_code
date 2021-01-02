var stop_processing = false;
var generating = false;
var done_loading = false;
var programs_list = [];
var did_click = false;

function generate() {

	$("#one").css("overflow-y", "hidden");
	$("#ten").css("height", "1000px");

	$("#iter_progress").text("0");
	// $("#found_progress").text("0/" + n);

	$("#progress").css("width", "0");

	if (generating) return;

	generating = true;

	findValidProgram(0);
}

var dsl_config =
`{
	"types":
		{"number": "n",
		"boolean": "b",
		"Group": "g",
		"Vector3": "v",
		"Mesh": "m",
		"Geometry": "bg",
		"Camera": "c",
		"Euler": "e",
		"Color": "r",
		"Material": "mt"},
	"literals": {"number": [0, 1]},
	"variables": {},
	"functions": [
		["new_mesh", "Geometry??", "Material??", "Mesh"],
		["new THREE.BoxBufferGeometry", "number??", "number??", "number??", "Geometry"],
		["new THREE.TetrahedronBufferGeometry", "number??", "Geometry"],

		["new THREE.Color", "number??", "number??", "number??", "Color"],
		["new_MeshStandardMaterial", "Color??", "number??", "number??", "boolean??", "Material"],

		[">=", "number??", "number??", "boolean"],
		["<=", "number??", "number??", "boolean"],

		[".position.set", "Mesh??", "number??", "number??", "number??", ""],
		[".rotation.set", "Mesh??", "number??", "number??", "number??", ""],
		[".scale.set", "Mesh??", "number??", "number??", "number??", ""],

		[".position.set", "Group??", "number??", "number??", "number??", ""],
		[".rotation.set", "Group??", "number??", "number??", "number??", ""],
		[".scale.set", "Group??", "number??", "number??", "number??", ""],

		["+", "number??", "number??", "number"],
		["-", "number??", "number??", "number"],
		["*", "number??", "number??", "number"],
		["/", "number??", "number??", "number"],

		["Math.cos", "number??", "number"],
		["Math.sin", "number??", "number"],
		["Math.tan", "number??", "number"],
		["Math_PI", "number"],

		["if", "boolean??", ["block", "??", "??", "??", "??", "??"], ""],
		["for", "i", ["block", "??", "??", "??", "??", "??", "??", "??", "??"], "number??", "number??", "number??", ""],
		["for", "i", ["block", "??", "??", "??", "??", "??", "??", "??", "??"], "0", "50", "1", ""],

		["new THREE.Group", "Group"],
		[".add", "Group??", "Mesh??", ""],
		["group.add", "Group??", ""],
		["group.add", "Mesh??", ""]
	],
	"variables_n": 20,
	"template": ["??", "??", "??", "??", "??", "??", "??", "??"]
}`;



// 	"template": [["for", "i", ["block", "??", "??"], "0", "50", "1"]]

		//
		// ["for", "i", ["block", "??", "??", "??", "??", "??",
		// 		"??", "??", "??", "??", "??"], "0", "50", "1", ""],

// ["group.add", "Mesh??", ""],

		// [".scale.setScalar", "Mesh??", "number??", ""],
		//
		// [".position.x_", "Mesh??", "number"],
		// [".position.y_", "Mesh??", "number"],
		// [".position.z_", "Mesh??", "number"],
		// [".rotation.x_", "Mesh??", "number"],
		// [".rotation.y_", "Mesh??", "number"],
		// [".rotation.z_", "Mesh??", "number"],


// "template": ["??", "??", "??", "??"]
// 	"template": [["for", "i", ["block", "??", "??"], "0", "50", "1"]]

		// ["new THREE.Mesh", "Geometry??", "Material??", "Mesh"],

// var dsl_config =
// `{
// 	"types":
// 		{"number": "n",
// 		"boolean": "b",
// 		"Group": "g",
// 		"Vector3": "v",
// 		"Mesh": "m",
// 		"Geometry": "bg",
// 		"Camera": "c",
// 		"Euler": "e",
// 		"Color": "r",
// 		"Material": "mt"},
// 	"literals": {"number": [0, 1]},
// 	"variables": {},
// 	"functions": [
// 		["new THREE.Mesh", "Geometry??", "Material??", "Mesh"],
// 		["new THREE.BoxBufferGeometry", "number??", "number??", "number??", "Geometry"],
// 		["new THREE.TetrahedronBufferGeometry", "number??", "Geometry"],
//
// 		["new THREE.Color", "number??", "number??", "number??", "Color"],
// 		["new_MeshStandardMaterial", "Color??", "number??", "number??", "boolean??", "Material"],
//
// 		[">=", "number??", "number??", "boolean"],
// 		["<=", "number??", "number??", "boolean"],
//
// 		[".position.set", "Mesh??", "number??", "number??", "number??", ""],
// 		[".rotation.set", "Mesh??", "number??", "number??", "number??", ""],
// 		[".scale.set", "Mesh??", "number??", "number??", "number??", ""],
//
// 		["+", "number??", "number??", "number"],
// 		["-", "number??", "number??", "number"],
// 		["*", "number??", "number??", "number"],
// 		["/", "number??", "number??", "number"],
//
// 		["Math.cos", "number??", "number"],
// 		["Math.sin", "number??", "number"],
// 		["Math.tan", "number??", "number"],
// 		["Math_PI", "number"],
//
// 		[["for", "i", ["block", "??", "??"], "number??", "number??", "number??"]],
// 		["group.add", "Mesh??", ""]
// 	],
// 	"variables_n": 20,
// 	"template": [["for", "i", ["block", "??", "??"], "0", "50", "1"]]
// 	"template": [["for", "i", ["block", "??", "??"], "0", "50", "1"]]
// }`;

function findValidProgram(iter) {

	if (stop_processing) {
		stop_processing = false;
		generating = false;
		return;
	}

	let task = JSON.parse(dsl_config);
	task.add_random = true;
	task.count_all_placeholders = true;

	let N = 500;

	let state = {};
	state.options_track = new Array(N).fill(-1, 0, N);
	state.alt_n = new Array(N).fill(-1, 0, N);
	state.filter = new Array(N).fill([], 0, N);
	state.programs = new Array(N).fill([], 0, N);
	state.js_programs = new Array(N).fill("", 0, N);
	task.depth_limit = 0;

	state.program = task.template;
	state.step = 0;
	state.programs_n = 0;
	state.iteration = 0;
	state.total = -1;

	// console.log("findValidProgram", iter, stop_processing, generating);

	let next_result = {};
	let program = [];
	// let variables = {};
	for (let i = 0; i < N; i++) {

		next_result = next_program_cached(task, state, true);

		let new_program = next_result["program"];

		if (new_program.length > 0 && next_result.filter["placeholders_n"] == 0) {
			let javascript = json2js(JSON.stringify(new_program), [], true);
			console.log("new_program", next_result, javascript)
			program = new_program;
			break;
		}
	}

	let script_string = JSON.stringify(program);

	if (iter > 1000000) {
		generating = false;
		return;
	}

	let expressions = [];
	let string = json2js(script_string, expressions, true);

	// console.log("infinite?", next_result.filter["infinite_loop"]);

	// console.log("generated", string);

	let now1 = Date.now();

	set_count_objects = true;
	let rendered = render(renderer_B, string);
	set_count_objects = false;

	let now2 = Date.now();
	let time = (now2-now1);
	// console.log("render time:", (now2-now1));

	// if (iter % 2 == 0) {
		$("#js_code").text(string);
		$("#test_code").text(script_string);
		$("#iter_progress").text(iter);
		$("#iter_progress1").text("");
	// }

	let objects_n = 0;
	if (rendered) {
		objects_n = getObjectsNumber(renderer_B);
		// console.log("objects_n", objects_n);
	}

	// return;

	// if (0) {
	if (rendered && objects_n >= 10) {
	// if (rendered) {

		// console.log("addProgram:", script_string);

		// n_chosen++;
		let program = addProgram(script_string, string, "");
		addNewCanvas(program);
		// $("#found_progress").text(n_chosen + "/" + n);

		// if (n_chosen < n) {
		// 	setTimeout(function(){
		// 		findValidProgram(iter+1, n_chosen, n);
		// 	}, 50);
		// } else {
		$("#one").css("overflow-y", "auto");
		$("#ten").css("height", "");
		generating = false;
		// }

	} else {
		$("#progress").css("width", "0");
		setTimeout(function(){
			findValidProgram(iter+1);
		}, 0);
	}
}
