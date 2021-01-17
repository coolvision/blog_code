
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
		console.log("filter.placeholder_i < 0", filter);
		return {"program": state.program, "filter": filter, "reason": "filter.placeholder_i < 0"};
	}
	if (filter.alt.length <= 0) {
		console.log("filter.alt.length <= 0", filter);
		return {"program": state.program, "filter": filter, "reason": "filter.alt.length <= 0"};
	}

	filter.counter = 0;

	if (random) {
		filter.alt_i = getRandomInt(0, filter.alt.length-1);
	}

	let new_program = alt_dfs(state.program, filter);
	new_variables = [];

	// console.log("new_program 1", JSON.stringify(new_program));

	let new_program_expanded = add_variables(task, new_program, -1, 0, filter.variables, new_variables, filter);

	// console.log("add_variables", JSON.stringify(new_program_expanded));

	// check_infinite(new_program, filter);

	state.programs[i] = new_program_expanded;
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
