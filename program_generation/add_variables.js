
function add_variables(config, obj, depth, fn_depth, variables, new_variables, filter) {

	// console.log("add_variables 1", JSON.stringify(obj), "depth", depth, "fn_depth", fn_depth);

	if (!Array.isArray(obj)) {
		if (config.count_all_placeholders) {
			if (obj.includes("??")) filter.placeholders_n++;
		} else {
			if (obj.includes("??") && (fn_depth > 1 || obj != "??")) filter.placeholders_n++;
		}
		return obj;
	} else {

		let new_expressions = [];

		for (let i = 0; i < obj.length; i++) {
			let new_fn_depth = fn_depth;
			let new_depth = depth;

			if (obj[i][0] == "block") {
				new_fn_depth = 0;
				new_depth += 1;
			} else {
				new_fn_depth += 1;
			}

			if (obj[i][0] == "new_variable") {

				let type = obj[i][1];
				if (!variables.hasOwnProperty(type)) {
					variables[type] = [];
				}
				let n = variables[type].length;
				let new_var = config.types[type] + n;
				variables[type].push(new_var);
				if (obj[i][2] == 'no_demand') {
					obj[i] = '~';
				} else {
					obj[i] = new_var;
				}
				new_variables.push([depth, ["let", new_var, type + "??"]]);
				filter.placeholders_n++;
			}

			let n = add_variables(config, obj[i], new_depth, new_fn_depth, variables, new_variables, filter);

			if (fn_depth == 0) {
				for (let i in new_variables) {
					if (new_variables[i][0] == depth) {
						new_expressions.push(new_variables[i][1]);
						new_variables.splice(0, new_variables.length);
					}
				}
			}

			new_expressions.push(n)
		}

		return new_expressions;
	}
}
