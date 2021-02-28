
var stop_processing = false;
var stop_batch_processing = false;
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
var iterations = 5000;
// var iterations = 1;
var log_iterations = 100;
// var log_iterations = 1;
var time_delay = 5;

var now1, now2;

var log_string = "";

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

var found_n = 0;
var total = 0;

function generate_tasks(tasks, task_i) {

	// console.log("generate", stop_processing, demo_id)
	generating = true;

	if (stop_processing) {
		// console.log("generate", "stop_processing", stop_processing, task_i);
		stop_processing = false;
		// generating = false;

		if (stop_batch_processing) {
			stop_batch_processing = false;
			generating = false;
			return;
		}

		for (let t in tasks) {
			$("#"+tasks[t].i).text(tasks[t].id +
				" t:" + tasks[t].time/1000 + " " + tasks[t].task.best_total_correct);
		}

		task_i++;

		while (task_i < tasks.length && tasks[task_i].solved) {
			console.log(tasks[task_i].id, "already solved");
			task_i++;
		}

		if (task_i >= tasks.length) {
			console.log("tasks", task_i, tasks.length, found_n, tasks);

			for (let t in tasks) {
				tasks[t].task.variables_n++;
			}
			task_i = 0;

			if (tasks[0].task.variables_n >= 5) {
				generating = false;
				return;
			}
		}

		reset();
		task = tasks[task_i];
		$(".task").text(stringify(task.task));

		console.log("generating for", tasks[task_i].id, task_i)

		generate_tasks(tasks, task_i);
		return;
	}

	setTimeout(function(){
		for (let i = 0; i < iterations; i++) {
			if (stop_processing) break;
			next();
		}
		generate_tasks(tasks, task_i);
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

	// console.log("demo_id", demo_id, selected_demo, task);

	state.options_track = new Array(N).fill(-1, 0, N);
	state.alt_n = new Array(N).fill(-1, 0, N);
	state.filter = new Array(N).fill([], 0, N);
	state.programs = new Array(N).fill([], 0, N);
	// state.js_programs = new Array(N).fill("", 0, N);

	state.program = task.template;
	state.step = 0;

	state.programs_n = 0;
	// state.programs[0] = task.template;
	state.iteration = 0;
	state.total = -1;
}

function next(show = false, init = false) {

	findValidProgramCached(state, task, show);
}

function findValidProgramCached(state, config, show) {

	let task = config.task;

	// console.log("state", state, config, task);
	if (state.step < 0) {
		// console.log("state.step < 0", state);
		stop_processing = true;
		config.time += (Date.now()-now1);
		return;
	}
	if (state.programs_n > 500000) {
		stop_processing = true;
		config.time += (Date.now()-now1);
		return;
	}

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
				state.total = state.total * 0.9 + total_estimate * 0.1;
			}
		}
	}

	// console.log("next_result", next_result)

	let new_program = next_result["program"];
	let total = (state.programs_n/state.total_max)*100;

	// if (new_program && (show || state.programs_n % log_iterations == 0)) {
	if (show || state.programs_n % log_iterations == 0) {

		let javascript = json2js(JSON.stringify(state.program), [], false);
		$("#" + demo_id + " div" + ".program").text(
			config.id
			+ '\n\n'
			+ "#" + state.programs_n
			+ '\n\n'
			+ state.step
			+ '\n\n'
			+ javascript
			+ '\n\n'
			+ JSON.stringify(state.program)
			+ '\n\n'
			+ "Search space size (estimate): " + Number((state.total/1000000).toPrecision(1))
		);
		let io = "";
		for (let i in task.io_examples) {
			if (i > 0) io += "\n";
			io += "input: " + JSON.stringify(task.io_examples[i].input) + "\n";
			io += "output: " + JSON.stringify(task.io_examples[i].output) + "\n";
		}
		$("#" + demo_id + " div " + ".io").text(io);

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
			alt = "<b>backtrack</b> " + next_result.reason;
		}
		alt += '\n\nDFS tracking:\n'
			+ JSON.stringify(state.options_track)
			+ '\n'
			+ JSON.stringify(state.alt_n)
			+ '\n\n'
			+ state.step;

		// for (let i in state.programs) {
		// 	alt += '\n' + JSON.stringify(state.programs[i]);
		// }
		// $("#" + demo_id + " div " + ".current_program").html(current_program);
		$("#" + demo_id + " div " + ".update_info").html(alt);
	}

	if (new_program.length > 0 && next_result.filter["placeholders_n"] == 0) {

		let javascript = json2js(JSON.stringify(new_program), [], false);

		const set_handler = {
			set: function (target, key, receiver) {
				if (key === parseInt(key).toString()) {
					if (key < 0 || key >= target.length+1) {
						return true;
					}
				}
				return Reflect.set(...arguments);
			},
			get: function (target, key, receiver) {
				return Reflect.get(...arguments);
			},
		};
		// var input1 = [];
		// var output1 = [];
		// var input = new Proxy(input1, set_handler);
		// var output = new Proxy(output1, set_handler);

		var input = [];
		var output = [];

		if (task["output-type"] == "int") {
			var output = 0;
		}
		if (task["output-type"] == "bool") {
			var output = false;
		}
		if (task["input-type"] == "int") {
			var input = 0;
		}

		// console.log("run,",state.programs_n, input, output, '\n'+javascript);
		let stop_generation = true;
		let info = "";
		task.total_correct = 0;
		for (let i in task.io_examples) {

			if (task["input-type"] == "int") {
				input = task.io_examples[i].input;
			} else {
				input.length = 0;
				for (let v of task.io_examples[i].input) input.push(v);
			}

			if (task["output-type"] == "int") {
				output = 0;
			} else if (task["output-type"] == "bool") {
				output = false;
			} else {
				output.length = 0;
			}

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

			if (task["output-type"] == "list-of-bool") {
				for (let i in output) {
					output[i] = Boolean(output[i]);
				}
			}

			// console.log("input", input, output)

			if (i > 0) info += "\n\n";
			info += "input: " + JSON.stringify(input) + "\n"
					+ "output: " + JSON.stringify(output);

			if (!check_example(output, task.io_examples[i].output, task)) {
				// console.log("does not work", JSON.stringify(input), JSON.stringify(output), JSON.stringify(task.io_examples[i].output));
				stop_generation = false;
				info += "\nincorrect";
				break;
			} else {
				// console.log("works for example", JSON.stringify(input), JSON.stringify(output), JSON.stringify(task.io_examples[i].output));
				info += "\ncorrect result";
			}
		}

		if (task.total_correct > task.best_total_correct) {
			task.best_total_correct = task.total_correct;
			task.best_total_correct_program = new_program;
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

			$("#" + config.i).addClass("b");

			if (!config.solved) {
				found_n++;
				config.time = (now2-now1);
				$("#log_solved_n").html("total solved: " + found_n);
				log_string = '<b>' + config.id + '</b> ' + config.time / 1000
					+ '\n' + javascript + '\n' + log_string;
				$("#log").html(log_string);
				config.solved = true;
				config.task.solved = true;
				config.task.program = new_program;
				config.task.js = javascript;
			}

			console.log("Found program #" + state.programs_n, state);

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

function check_example(output1, output2, task) {

	if (task["output-type"] == "int") {
		if (output1 != output2) {
			return false;
		} else {
			task.total_correct++;
		}
	} else if (task["output-type"] == "bool") {
		if (output1 != output2) {
			return false;
		} else {
			task.total_correct++;
		}
	} else {
		if (output1.length == output2.length) {
			for (let i in output1) {
				if (output1[i] != output2[i]) {
					return false;
				} else {
					task.total_correct++;
				}
			}
		} else {
			for (let i = 0; i < Math.min(output1.length, output2.length); i++) {
				if (output1[i] != output2[i]) {
					return false;
				} else {
					task.total_correct++;
				}
			}
			return false;
		}
	}
	return true;
}
