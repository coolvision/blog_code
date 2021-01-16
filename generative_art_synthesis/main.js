var stop_processing = false;
var init_generation = false;
var generating = false;
var done_loading = false;
var programs_list = [];
var did_click = false;

var task = {};
var state = {};
var show = true;

var iterations = 1000;
var log_iterations = 100;
var time_delay = 5;

function generate() {

	// console.log("generate", stop_processing, demo_id)
	generating = true;

	if (stop_processing) {
		console.log("generate", "stop_processing", stop_processing);
		stop_processing = false;
		generating = false;
		return;
	}

	setTimeout(function(){
		for (let i = 0; i < iterations; i++) {
			if (stop_processing) break;
			next();
		}
		generate();
	}, time_delay);
}

function reset() {

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
}

function next(show = false, init = false) {
	if (init) {
		init_generation = false;
	}
	if (!init_generation) {
		init_generation = true;
 		reset();
	}
	findValidProgram(state, task, show);
}

function findValidProgram(state, task, show) {

	state.iteration++;

	let prev_program = state.program;
	let next_result = next_program_cached(task, state, true);

	let new_program = next_result["program"];

	if (new_program.length > 0 && next_result.filter["placeholders_n"] == 0) {
		let javascript = json2js(JSON.stringify(new_program), [], true);
		console.log("new_program", next_result, javascript)
		program = new_program;

		set_count_objects = true;
		let rendered = render(renderer_B, javascript);
		set_count_objects = false;

		$("#js_code").text(string);
		$("#test_code").text(script_string);
		$("#iter_progress").text(iter);
		$("#iter_progress1").text("");

		let objects_n = 0;
		if (rendered) {
			objects_n = getObjectsNumber(renderer_B);
		}

		if (rendered && objects_n >= 10) {
			let program = addProgram(script_string, string, "");
			addNewCanvas(program);
			stop_processing = true;
		}
	}
}
