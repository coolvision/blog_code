
var stop_processing = false;
var init_generation = false;
var generating = false;
var task = {};
var state = {};
var show = true;
var selected_demo = "reversal";
var demo_id = "demo1";
var selected_problem = 0;

// var iterations = 100;
// var log_iterations = 100;
var iterations = 1000;
// var log_iterations = 100;
var log_iterations = 1;
var time_delay = 5;

var now1, now2;

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

	console.time('generate')
	now1 = Date.now();

	$("#" + demo_id + " div " + ".dsl").html(dsl_config[selected_demo]);
	$(".program").removeClass("bg-washed-green");
	$(".result").removeClass("bg-washed-green");

	task = JSON.parse(dsl_config[selected_demo]);
	var N = 30;

	console.log("demo_id", demo_id, selected_demo, task);

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

	// if (init) {
	// 	init_generation = false;
	// }
	// if (!init_generation) {
	// 	init_generation = true;
 	// 	reset();
	// }

	findValidProgramCached(state, task, show);
}

function findValidProgramCached(state, task, show) {

	// console.log("state", state, task);

	state.iteration++;

	let prev_program = state.program;
	let next_result = next_program_cached(task, state);

	if (state.programs_n % iterations == 0) {
		let total_estimate = 1;
		for (let i = 0; i < state.alt_n.length; i++) {
			if (state.alt_n[i] <= 0) break;
			total_estimate *= state.alt_n[i];
		}
		if (total_estimate > 0) {
			if (state.total < 0) {
				state.total = total_estimate;
			} else {
				state.total = state.total * 0.99 + total_estimate * 0.01;
			}
		}
	}

	let new_program = next_result["program"];
	let total = (state.programs_n/state.total_max)*100;

	if (show || state.programs_n % log_iterations == 0) {

		let javascript = json2js(JSON.stringify(state.program), [], false);
		$("#" + demo_id + " div" + ".program").text(
			"#" + state.programs_n
			+ '\n\n'
			+ javascript
			+ '\n\n'
			+ JSON.stringify(state.program)
		);
		let io = "";
		for (let i in task.io_examples) {
			if (i > 0) io += "\n";
			io += "input: " + JSON.stringify(task.io_examples[i].input) + "\n";
			io += "output: " + JSON.stringify(task.io_examples[i].output) + "\n";
		}
		$("#" + demo_id + " div " + ".io").text(io);

		let current_program = "<b>current program:</b>\n\n"
						+ stringify(prev_program)
						// + '\n\n<b>new program:</b>\n'
						// + stringify(state.program);
						+ '\n\n'
						+ javascript

		let alt = "";
		if (next_result.filter.alt_i >= 0) {
			alt = "<b>options to replace \"" + next_result.filter.placeholder_v + "\"</b>";
			for (let i in next_result.filter.alt) {
				// if (i > 0)
				alt += "\n";
				alt += i + " " + JSON.stringify(next_result.filter.alt[i]);
			}
			alt += '\n\n<b>use option ' + next_result.filter.alt_i + "</b>\n" + JSON.stringify(next_result.filter.alt[next_result.filter.alt_i])
		} else {
			alt = "<b>backtrack</b>";
		}
		// alt += '\n\nDFS tracking:\n'
		// 	+ JSON.stringify(state.options_track)
		// 	+ '\n'
		// 	+ JSON.stringify(state.alt_n)
		// 	+ '\n\n'
		// 	+ "Search space size (estimate): " + Number((state.total/1000000).toPrecision(1));

		$("#" + demo_id + " div " + ".current_program").html(current_program);
		$("#" + demo_id + " div " + ".update_info").html(alt);
	}

	if (new_program.length > 0 && next_result.filter["placeholders_n"] == 0) {

		let javascript = json2js(JSON.stringify(new_program), [], false);

		const set_handler = {
			set: function (target, key, receiver) {
				//
				// console.log("proxy set", target, key, receiver)
				//
				// if (target == "push") {
				// 	return Reflect.set(...arguments);
				// }
				// if (key === parseInt(key).toString()) {
				// 	if (key < 0 || key >= target.length) {
				// 		return true;
				// 	}
				// }
				return Reflect.set(...arguments);
			},
			get: function (target, key, receiver) {
				return Reflect.get(...arguments);
			},
		};
		var input1 = [];
		var output1 = [];
		var input = new Proxy(input1, set_handler);
		var output = new Proxy(output1, set_handler);

		// console.log("run,",state.programs_n, input, output, '\n'+javascript);
		let stop_generation = true;
		let info = "";
		for (let i in task.io_examples) {

			input1.length = 0;
			for (let v of task.io_examples[i].input) input1.push(v);
			output1.length = task.io_examples[i].output.length;
			output1.fill(0);

			// var input = input1;
			// var output = output1;

			// console.log("eval1", JSON.stringify(input), JSON.stringify(output), task.io_examples[i].output.length);

			if (!next_result.filter.infinite_loop) {
				try {
					eval(javascript);
				} catch (e) {
					console.log(e);
					throw(e);
				}
			}
			// console.log("eval2", JSON.stringify(input), JSON.stringify(output));

			if (i > 0) info += "\n\n";
			info += "input: " + JSON.stringify(input) + "\n"
					+ "output: " + JSON.stringify(output);

			if (!check_example(output, task.io_examples[i].output)) {
				// console.log("does not work", JSON.stringify(input), JSON.stringify(output), JSON.stringify(task.io_examples[i].output));
				stop_generation = false;
				info += "\nincorrect";
				break;
			} else {
				console.log("works for example", JSON.stringify(input), JSON.stringify(output), JSON.stringify(task.io_examples[i].output));
				info += "\ncorrect result";
			}
		}

		if (show || state.programs_n % log_iterations == 0 || stop_generation) {
			$("#" + demo_id + " div " + ".result").text(info);
		}

		if (stop_generation) {

			console.timeEnd('generate');
			now2 = Date.now();

			$("#" + demo_id + " div " + ".program").text(
				"Found program #" + state.programs_n + " " + "(" + (now2-now1) + "ms)"
				+ '\n\n'
				+ javascript
			);
			$("#" + demo_id + " div " + ".program").addClass("bg-washed-green");
			$("#" + demo_id + " div " + ".result").addClass("bg-washed-green");

			stop_processing = true;
			return;
		}
		state.programs_n++;
	}


	let stop = true;
	for (let j = 0; j < state.options_track.length; j++) {
		if (state.options_track[j] >= 0) {
			stop = false;
			break;
		}
	}
	if (stop) {
		// console.log("checked all programs, stop");
		return;
	}
}

function check_example(output1, output2) {
	if (output1.length == output2.length) {
		for (let i in output1) {
			if (output1[i] != output2[i]) {
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}
