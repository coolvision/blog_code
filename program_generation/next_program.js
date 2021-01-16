
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function next_program(config, json_object, i, options_track, alt_n, limit, random) {

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

	// first, choose a template parameter to change
	variables = _.cloneDeep(config.variables);
	process_template_traverse_dfs(config, json_object, filter, -1, 0, variables);

	let variables_n = 0;

	console.log("process_template_traverse_dfs", JSON.stringify(filter));
	// console.log("before limit", filter.variables, filter.alt, limit);

	// limit number of variables
	for (v in filter.variables) {
		if (filter.variables[v].length >= limit) {
			let filtered = filter.alt.filter(function(alt, i) {
				return !(alt[0] == "new_variable" && alt[1] == v);
			});
			filter.alt = filtered;
		}
	}

	// console.log("after limit", filter.alt, filter.placeholder_i);

	alt_n[i] = filter.alt.length;

	if (filter.placeholder_i < 0) {
		return {"program": [], "filter": filter, "reason": "filter.placeholder_i < 0"};
	}

	// console.log("options_track", options_track, options_track.length, i);

	if (i >= options_track.length) {
		return {"program": [], "filter": filter, "reason": "i >= options_track.length"};
	}

	if (filter.alt.length > 0) {
		filter.counter = 0;

		if (random) {
			filter.alt_i = getRandomInt(0, filter.alt.length-1);
		} else {
			if ((options_track[i] < 0 && options_track[i+1] < 0) ||
				(options_track[i] < 0 && i+1 >= options_track.length)) {
				options_track[i] = 0;
			} else if ((options_track[i] >= 0 && options_track[i+1] < 0) ||
					   (options_track[i] >= 0 && i+1 >= options_track.length)) {
				options_track[i]++;
				for (let j = i+1; j < options_track.length; j++) {
					options_track[j] = -1;
				}
				if (options_track[i] >= filter.alt.length) {
					options_track[i] = -1;
					filter.alt_i = options_track[i];
					return {"program": [], "filter": filter, "reason": "options_track[i] = -1"};
				}
			}
			filter.alt_i = options_track[i];
		}

		// console.log("alt_dfs", i, json_object, JSON.stringify(filter));

		let new_program = alt_dfs(json_object, filter);

		new_variables = [];

		// console.log("new_program", new_program, JSON.stringify(alt_n), JSON.stringify(filter));

		let new_program_expanded = add_variables(config, new_program, -1, 0, filter.variables, new_variables, filter);

		check_infinite(new_program, filter);

		// console.log("new_program_expanded", new_program_expanded, new_variables, JSON.stringify(filter));

		return {"program": new_program_expanded, "filter": filter, "reason": "new_program_expanded"};
	}

	return {"program": [], "filter": filter, "reason": "final"};
}
