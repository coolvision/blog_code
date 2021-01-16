
const fn_depth_limit = 2;

function last(array) {
	return array[array.length-1];
}

function initial(array) {
	let a = [];
	for (let i = 0; i < array.length-1; i++) {
		a.push(array[i]);
	}
	return a;
}

function process_template_traverse_dfs(config, obj, filter, depth, fn_depth, variables, parent_obj = "") {

	let f_max = config.functions.length;
	let f = config.functions;

	// console.log("process_template_traverse_dfs", JSON.stringify(obj), JSON.stringify(filter), JSON.stringify(variables), JSON.stringify(parent_obj));

	if (!Array.isArray(obj)) {

		if (obj.includes('??') && filter.placeholder_i < 0) {

			filter.placeholder_i = filter.counter;
			filter.placeholder_v = obj;

			let type = obj.slice(0, -2);

			// let type = "";
			// if (obj[0] == '??') {
			// 	type = obj.substring(1);
			// }
			let fn = [];

			// case for adding expressions without return value
			if (fn_depth <= 1 && type == "") {
				for (let i = 0; i < f_max; i++) {
					if (f[i][0] == "for") {
						if (depth >= config.depth_limit) continue;
					}
					// allow conditionals inside of loops
					if (f[i][0] == "if") {
						if (depth < 0) continue;
						if (depth >= config.depth_limit+1) continue;
					}
					if (last(f[i]) == "") {
						fn.push(initial(f[i]));
					}
				}
				// and add random variables here
				// for (t in config.types) {
				// 	fn.push(["new_variable", t]);
				// 	console.log("add variable option", config.types[t])
				// }
			}

			// case for filling in typed functions arguments
			if (type == "number_v") {
				fn.push(["new_variable", "number"]);
				if (variables.hasOwnProperty("number")) {
					for (let i = 0; i < variables["number"].length; i++) {
						fn.push(variables["number"][i]);
					}
				}
			} else if (type != "" && fn_depth > 1) {

				if (fn_depth <= fn_depth_limit && parent_obj == "let") {
				// if (fn_depth <= fn_depth_limit) {
					for (let i = 0; i < f_max; i++) {
						if (last(f[i]) == type) {
							fn.push(initial(f[i]));
						}
					}
				}

				if (parent_obj != "for" && parent_obj != "let" && type != "array") {
					fn.push(["new_variable", type]);
				}

				if (parent_obj != "let") {
					if (variables.hasOwnProperty(type)) {
						for (let i = 0; i < variables[type].length; i++) {
							fn.push(variables[type][i]);
						}
					}
				}

				if (type == "number") {
					if (config.add_random) {
						let r = Math.random();
						fn.push(r.toFixed(2))
						// fn.push(Math.random().toFixed(2));
					} else {
						for (l of config.literals.number) {
							fn.push(""+l);
						}
					}
					if (fn_depth > fn_depth_limit) {
						for (let i = 0; i < f_max; i++) {
							if (last(f[i]) == "number" && f[i].length <= 3) {
								fn.push(initial(f[i]));
							}
						}
					}
				}
			}

			for (let i = 0; i < fn.length; i++) {
				if (fn[i][0] == "for") {
					fn[i][1] = "i" + filter.for_n;
				}
			}

			if (fn.length == 0) filter.placeholder_i = -1;
			filter.alt = fn;
		}

		filter.counter++;

	} else {
		filter.counter++;

		for (let i = 0; i < obj.length; i++) {
			let new_fn_depth = fn_depth;
			let new_depth = depth;

			if (obj[i][0] == "block") {
				new_fn_depth = 0;
				new_depth += 1;

				let new_variables = {};
				for (let v in variables) {
					new_variables[v] = [];
					for (let j = 0; j < variables[v].length; j++) {
						new_variables[v].push(variables[v][j])
					}
				}

				// add "for" index variable to the new state
				if (obj[0] === "for") {
					filter.for_n++;
					add(new_variables, "number", obj[1]);
					add(filter.variables, "number", obj[1]);
				}
				process_template_traverse_dfs(config, obj[i], filter, new_depth, new_fn_depth, new_variables, obj[0]);

			} else {
				new_fn_depth += 1;
				process_template_traverse_dfs(config, obj[i], filter, new_depth, new_fn_depth, variables, obj[0]);
				if (obj[i][0] == "let") {
					let type = get_type(obj[i], f);
					add(variables, type, obj[i][1]);
					add(filter.variables, type, obj[i][1]);
				}

			}
		}
	}
}

function add(variables, type, obj) {
	if (!variables.hasOwnProperty(type)) {
		variables[type] = [];
	}
	variables[type].push(obj);
}

function get_type(obj, f) {
	let f_max = f.length;
	let type = "number";
	if (typeof obj[2] == "object") {
		for (let j = 0; j < f_max; j++) {
			if (f[j][0] == obj[2][0]) {
				type = last(f[j]);
				break;
			}
		}
	}
	return type;
}
