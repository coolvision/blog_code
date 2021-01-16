var stop_processing = false;
var init_generation = false;
var generating = false;
var done_loading = false;
var programs_list = [];
var did_click = false;

var task = {};
var state = {};

var iterations = 1000;
var time_delay = 5;

function generate() {

	if (!generating) {
		state.iter = 0;
	}

	// console.log("generate", stop_processing, demo_id)
	generating = true;

	if (stop_processing) {
		// console.log("generate", "stop_processing", stop_processing);
		stop_processing = false;
		generating = false;
		return;
	}

	setTimeout(function(){
		// for (let i = 0; i < iterations; i++) {
			// if (stop_processing) break;
			next();
		// }
		generate();
	}, time_delay);
}

function reset() {

	task = JSON.parse(dsl_config);
	task.add_random = true;
	task.count_all_placeholders = true;

	let N = 500;

	// let state = {};
	state.N = N;
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
	// console.log("reset", state);
}

function next(step = false) {
	// console.log("next", init_generation);
	if (!init_generation) {
		init_generation = true;
 		reset();
	}
	findValidProgram(state, task, step);
}

function findValidProgram(state, task, step = false) {

	let prev_program = [];
	let next_result = {};
	let program = [];
	let new_program = [];

	if (step) {
		next_result = next_program_cached(task, state, true);

		new_program = next_result["program"];

		let javascript = json2js(JSON.stringify(new_program), [], true);
		$("#js_code").text(javascript);
		$("#test_code").text(JSON.stringify(new_program));

	} else {
		for (let i = 0; i < state.N; i++) {

			next_result = next_program_cached(task, state, true);

			new_program = next_result["program"];

			if (new_program.length > 0 && next_result.filter["placeholders_n"] == 0) {
				let javascript = json2js(JSON.stringify(new_program), [], true);
				console.log("new_program", next_result, javascript)
				program = new_program;
				break;
			} else if (new_program.length == 0) {
				console.log("new_program.length == 0", next_result)
				new_program = program;
				break;
			}
		}
	}

	console.log("got new_program", new_program, next_result)

	if (new_program.length > 0 && next_result.filter["placeholders_n"] == 0) {

		let script_string = JSON.stringify(new_program);

		let javascript = json2js(script_string, [], true);
		// console.log("2 new_program", next_result, javascript)
		program = new_program;

		set_count_objects = true;
		let rendered = render(renderer_B, javascript);
		set_count_objects = false;

		$("#js_code").text(javascript);
		$("#test_code").text(script_string);
		state.iter++;
		$("#iter_progress").text(state.iter);
		$("#iter_progress1").text("");

		let objects_n = 0;
		if (rendered) {
			objects_n = getObjectsNumber(renderer_B);
		}

		// console.log("rendered", rendered, objects_n, state.iter)

		if (rendered && objects_n >= 10) {
		// if (rendered) {
			let program = addProgram(script_string, javascript, "");
			addNewCanvas(program);
			stop_processing = true;
			reset();
		} else {
			reset();
		}
	} else {



		let script_string = JSON.stringify(program);
		let javascript = json2js(script_string, [], true);
		$("#js_code").text(javascript);
		$("#test_code").text(script_string);
		reset();
	}
}
