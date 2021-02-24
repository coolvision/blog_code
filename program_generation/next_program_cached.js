
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function next_program_cached(task, state, random = false) {

	let i = state.step;

	let filter = {
		counter: 0,
		placeholder_i: -1,
		alt: [],
		alt_i: -1,
		for_n: 0,
		alt_done: false,
		variables: {},
		placeholders_n: 0,
		infinite_loop: false
	};

	// use predefined variables
	variables = _.cloneDeep(task.variables);
	// first, choose a template parameter to change
	process_template_traverse_dfs(task, state.program, filter, -1, 0, variables);

	// console.log("state 1", JSON.stringify(state.program), JSON.stringify(filter));

	// limit number of variables
	for (v in filter.variables) {
		if (filter.variables[v].length >= task.variables_n) {
			let filtered = filter.alt.filter(function(alt, i) {
				return !(alt[0] == "new_variable" && alt[1] == v);
			});
			filter.alt = filtered;
		}
	}

	state.alt_n[i] = filter.alt.length;

	if (filter.placeholder_i < 0) {
		// backtrack to previous option
		if (state.step-1 < 0) {
			state.program = state.programs[0];
		} else {
			state.program = state.programs[state.step-1];
		}
		state.step -= 1;
		// if (state.step < 0) state.step = 0;
		// console.log("move back to", state.step, state.program);
		// if (state.step < 0) state.step = 0;
		return {"program": [], "filter": filter, "reason": "filter.placeholder_i < 0"};
	}
	if (filter.alt.length <= 0) {
		// not sure if it's supposed to happen
		if (state.step-1 < 0) {
			state.program = state.programs[0];
		} else {
			state.program = state.programs[state.step-1];
		}
		state.step -= 1;
		// if (state.step < 0) state.step = 0;
		// console.log("filter.alt.length <= 0, move back to", state.step, JSON.stringify(state.program));
		return {"program": [], "filter": filter, "reason": "filter.alt.length <= 0"};
	}

	filter.counter = 0;

	if (random) {
		filter.alt_i = getRandomInt(0, filter.alt.length-1);
	} else {
		if ((state.options_track[i] < 0 && state.options_track[i+1] < 0) ||
			(state.options_track[i] < 0 && i+1 >= state.options_track.length)) {
			state.options_track[i] = 0;
		} else if ((state.options_track[i] >= 0 && state.options_track[i+1] < 0) ||
				   (state.options_track[i] >= 0 && i+1 >= state.options_track.length)) {
			state.options_track[i]++;
			for (let j = i+1; j < state.options_track.length; j++) {
				state.options_track[j] = -1;
			}
			if (state.options_track[i] >= filter.alt.length) {
				state.options_track[i] = -1;
				filter.alt_i = state.options_track[i];

				// backtrack to previous option
				if (state.step-1 < 0) {
					state.program = state.programs[0];
				} else {
					state.program = state.programs[state.step-1];
				}
				state.step -= 1;
				// if (state.step < 0) state.step = 0;
				// console.log("backtrack", state.step, JSON.stringify(state.program));
				// if (state.step < 0) state.step = 0;
				return {"program": [], "filter": filter, "reason": "options_track[i] = -1"};
			}
		}
		filter.alt_i = state.options_track[i];
	}

	// console.log("state 2", JSON.stringify(filter));

	let new_program = alt_dfs(state.program, filter);
	new_variables = [];

	// console.log("new_program 1", JSON.stringify(new_program));

	let new_program_expanded = add_variables(task, new_program, -1, 0, filter.variables, new_variables, filter);

	// console.log("state 3", JSON.stringify(filter));

	// console.log("add_variables", JSON.stringify(new_program_expanded));
	// check_infinite(new_program, filter);

	state.programs[i] = state.program;
	state.program = new_program_expanded;
	state.step++;

	return {"program": new_program_expanded, "filter": filter, "reason": "new_program_expanded"};
}

function alt_dfs(obj, filter) {

	if (filter.alt_done) return obj;

	if (!Array.isArray(obj)) {

		if (filter.placeholder_i == filter.counter) {
			filter.counter++;
			filter.alt_done = true;
			return filter.alt[filter.alt_i];
		}

		filter.counter++;
		return obj;

	} else {

		let new_expressions = [];
		filter.counter++;

		for (let i = 0; i < obj.length; i++) {
			new_expressions.push(alt_dfs(obj[i], filter))
		}

		return new_expressions;
	}
}

function check_infinite(obj, filter) {

	if (filter.infinite_loop) return;

	if (Array.isArray(obj)) {

		if (obj[0] == "for") {
			// if (obj[5] == 0) {
			// 	filter.infinite_loop = true;
			// }
			// console.log("for", obj[3], obj[4], obj[5]);
			if (obj[3] < obj[4]) {
				if (obj[5] <= 0) filter.infinite_loop = true;
			} else {
				if (obj[5] >= 0) filter.infinite_loop = true;
			}
		}

		for (let i = 0; i < obj.length; i++) {
			check_infinite(obj[i], filter);
		}
	}
}
