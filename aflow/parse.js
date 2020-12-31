
export var expressions = [];
export var functions = {};
export var intervals = [];

let rxp_builtin = /^filter|^push|^clone|^log/g;
let whitespace_rxp = /\n\t|\n\s{2,}/g;
let rxp = /[;:\.{}\+\-=<>→]/g;
let rxp_fn = /[()]/g;
let rxp_trigger = /^once$|\d+hz$|^repeat\(/g;
let rxp_global_stream = /[\[\]]/g;

export function new_state(program_id) {
	return {
		fn: false,
		exp_i: 0,
		fn_name: "",
		el_i: -1,
		run_iteration: 0,
		iterator: [],
		args: {n: 0},
		program_id: program_id,
		finished: false,
		select_expression_i: -1,
		fn_element: false,
		finished_expression: false,
		triggered_breakpoint: false,
		switch_fn: false,
		switch_fn_name: "",
		key: ""
	};
}

export function parse(code, program_id) {

	expressions = [];
	functions = {};
	intervals = [];

	let new_code = code.replace(whitespace_rxp, ' ');

	var init_lines = code.split('\n');
	console.log("init_lines", init_lines);

	let track_block = false;
	let n_left = 0;
	let block_string = "";

	var fn_lines = [];
	let curr_line = "";

	for (let l in init_lines) {
		if (init_lines[l].length > 0) init_lines[l] += '\n';
		if (init_lines[l].length == 0) continue;
		// if there is whitespace
		if (init_lines[l].match(/function/)) {
			// start tracking braces
			console.log("function", init_lines[l]);
			track_block = true;
			block_string = "";
			n_left = 0;
		}
		if (track_block) {
			console.log("track_block", init_lines[l], "n_left", n_left);
			for (let i in init_lines[l]) {
				if (init_lines[l][i] == '{') {
					n_left++
					// console.log("check", init_lines[l][i], n_left);
				} else if (init_lines[l][i] == '}') {
					n_left--;
					// console.log("check", init_lines[l][i], n_left);
				}
			}
			block_string += init_lines[l];
			if (n_left == 0) {
				track_block = false;
				// js_blocks.push(block_string);
				fn_lines.push(block_string);
				console.log("add js block", block_string);
			}
		} else {
			if (init_lines[l].match(/^\s+/)) {
				console.log("whitespace", init_lines[l]);
				curr_line += init_lines[l];
			} else {
				console.log("no whitespace", init_lines[l]);
				if (curr_line.length > 0) {
				   // fn_lines.push(curr_line.replace(whitespace_rxp, ' '));
				   fn_lines.push(curr_line);
				}
				curr_line = init_lines[l];
			}
		}
	}

	if (curr_line.length > 0) fn_lines.push(curr_line);
	console.log("fn_lines", fn_lines);

	let expr_index = 0;
	let element_index = 0;

	let streams = [];

	// first get functions names
	let fn_id = 0;
	let lines = [];
	for (let l of fn_lines) {
		if (l.length == 0) continue;
		if (l[0] == "#") continue;

		if (l.match(/function/)) {
			// get js functions
			let accum = '';
			let name = '';
			let args = '';
			let body = '';

			for (let i = 0; i < l.length; i++) {
				accum += l[i];
				if (l[i] == '(' && name.length == 0) {
					name = accum;
					accum = '';
				} else if (l[i] == '{' && args.length == 0) {
					args = accum;
					accum = '';
				}
			}
			body = accum;
			// body = body.replace('{', '');
			body = body.replace(/^\n/, '');
			body = body.substring(0, body.lastIndexOf('}'));

			name = name.replace(/function/, '').trim();
			name = name.replace(/\(/, '').trim();
			args = args.replace(/\)|\{/g, '').trim();

			console.log("name", name);
			console.log("args", args);
			console.log("body", body);

			functions[name] = {
				name: name,
				args: args.split(','),
				args_string: args,
				type: 'js_function',
				body: [{
					code: body,
					name: body,
					args_string: args,
					args: args.split(','),
					color: "black",
					type: "js_function_body",
					id: fn_id
				}]
			};
			fn_id++;

		} else {

			l = l.replace(whitespace_rxp, ' ');
			lines.push(l);

			if (l.match(/^fn/)) {

				let arrow_elements = l.split('→');
				let fn_id = arrow_elements[0].substring(2, arrow_elements[0].length).trim();

				let name = fn_id;
				let args = [];
				let args_string = "";
				if (fn_id.match(/[\(\)]/g)) {
					let name_array = /^\w+/.exec(fn_id);

					if (name_array.length > 0) {
						name = name_array[0];
					}
					args_string = /\((.+)\)$/.exec(fn_id)[1];
				}
				if (args_string.length > 0) args = args_string.split(',');
				for (let j in args) args[j] = args[j].trim();

				functions[name] = {
					name: name,
					args: args,
					args_string: args_string,
					type: 'af_function'
				};

				expr_index++;
				element_index = 0;
			}
		}
	}

	console.log("lines", lines);

	// console.log("first pass to get all streams");
	for (let l of lines) {
		if (l.length == 0) continue;
		if (l[0] == "#") continue;
		console.log("streams", l);
		get_elements(l, expr_index, element_index, streams);
	}

	console.log("streams", JSON.stringify(streams))

	// console.log("second pass to get functions");
	for (let l of lines) {
		if (l.length == 0) continue;
		if (l[0] == "#") continue;

		if (l.match(/^fn/)) {

			let arrow_elements = l.split('→');
			let fn_id = arrow_elements[0].substring(2, arrow_elements[0].length).trim();

			let name = fn_id;
			if (fn_id.match(/[\(\)]/g)) {
				name = /^\w+/.exec(fn_id)[0];
			}

			functions[name].body = _.tail(get_elements(l, expr_index, element_index, streams));

			expr_index++;
			element_index = 0;
			// }
		}
	}

	// console.log("lines", lines);
	// console.log("third pass to get expressions");
	intervals = [];
	for (let l of lines) {
		if (l.length == 0) continue;
		if (l[0] == "#") continue;

		if (l.match(/^fn/)) continue;

		expressions.push({el: get_elements(l, expr_index, element_index, streams)});
		expr_index++;
		element_index = 0;
	}

	for (let i in expressions) {
		expressions[i].exp_i = i;
		expressions[i].state = new_state(program_id);
		expressions[i].select_expression_i = i;
		expressions[i].state_stack = [];
		for (let j in expressions[i].el) {
			let el = expressions[i].el[j];
			if (el.type == 'trigger') {
				if (el.args_string.match(/hz/)) {
					let stamp = Date.now();
					let interval = 1/el.args_string.slice(0, -2);
					interval *= 1000;
					expressions[i].interval = interval;
					expressions[i].running = false;
					break;
				}
			}
		}
	}

	console.log("expressions", expressions);
	console.log("functions", functions);

	let render = '';
	for (let exp of expressions) {
		render += render_expressions(exp.el, exp.exp_i, false);
		// render += '<br>';
	}

	for (let i in functions) {
		let f = functions[i];

		if (f.type != 'js_function') {
			render += '<div class="pa1 mt2 ">fn ' + f.name + '';
			if (f.args_string.length > 0) render += '(' + f.args_string + ")";
			render += ' →';
			render += render_expressions(f.body, -1, true);
			render += '</div>'
		}
	}
	for (let i in functions) {
		let f = functions[i];

		if (f.type == 'js_function') {
			render += '<div id="' + f.body[0].id + '" class="mt2 pa1 element el">'
				render += '<div class="dib">function ' + f.name + '(' + f.args_string + ') {</div>';
				render += '<div>'+f.body[0].code+'</div>';
				render += '<div class="db">}</div>';
			render += '</div>'

		}
	}

	console.log("parsed", expressions);
	// $("#code_render").html(render);

	return render;
}

function render_expressions(exp, exp_i, fn = false) {
	let render = "";
	if (fn) {
		render += '<div class="flex flex-wrap items-start">'
	} else {
		render += '<div class="flex flex-wrap items-center"><div class="step_exp f7 button mr2 ba dib pointer hover-blue" style="user-select: none;" id="step_' + exp_i + '">step</div><div class="step_over_exp f7 button ba dib pointer hover-blue" style="user-select: none;" id="step_over_' + exp_i + '">step_over</div>'
	}

	for (let el = 0; el < exp.length; el++) {
		// render += '<span class="'+exp[el].color+'">'+exp[el].code+ '~' + exp[el].id + '</span>'
		render += '<div id="' + exp[el].id + '" class="dib el pa1 pointer">';
		render += '<div class="element '+exp[el].color+'">'+ exp[el].code +'</div>';
		render += '<div id="' + exp[el].id + '_info" class="el_info bg-light-gray"></div></div>';
		if (el < exp.length - 1) render += '<div class="dib pv1">→</div>';
	}
	render += '</div>'
	return render;
}


function is_iterator(arrow_element) {
	let s1 = arrow_element.split(' ');
	if (s1.length == 4 && s1[0] == 'for' && s1[2] == 'in') return true;
	return false;
}

function is_function(arrow_element) {

	for (let i in functions) {
		let f = functions[i];
		if (arrow_element.startsWith(f.name)) {
			if (f.args.length > 0) {
				let name = /^\w+/.exec(arrow_element)[0];
				if (arrow_element[name.length] != '(') return false;
			}
			if (arrow_element.match(rxp_fn) && f.args.length > 0) return true;
			if (!arrow_element.match(rxp_fn) && f.args.length == 0) return true;
			return false;
		}
	}
	return false;
}

function get_elements(l, expr_index, element_index, streams) {

	let elements = [];

	// let arrow_elements = l.split('→');
	let arrow_elements = l.split(/→|->/);
	for (let arrow_element of arrow_elements) {
		arrow_element = arrow_element.trim();

		let color = "black";
		let type = "stream";
		let stream_type = "local";
		let name = "";
		let name2 = "";
		let args_string = ""

		if (arrow_element.match(rxp_builtin)) {
			name = /^\w+/.exec(arrow_element)[0];
			let r =  /\((.+)\)$/.exec(arrow_element);
			if (r) args_string = r[1];
			type = "function_builtin";
			color = "dark-blue";
		} else if (is_iterator(arrow_element)) {
			type = "iterator";
			color = "blue";
			let s1 = arrow_element.split(' ');
			name = s1[1];
			name2 = s1[3];
		} else if (is_function(arrow_element)) {
			name = /^\w+/.exec(arrow_element)[0];
			let r =  /\((.+)\)$/.exec(arrow_element);
			if (r) args_string = r[1];
			type = "function";
			color = "orange";
		} else if (arrow_element.match(rxp)) {
			type = "js_code";
			color = "dark-red";
		} else if (arrow_element.match(rxp_trigger)) {
			type = "trigger";
			color = "black";
			name = /^\w+/.exec(arrow_element)[0];
			let r =  /\((.+)\)$/.exec(arrow_element);
			if (r) args_string = r[1];

		} else if (arrow_element.match(/".*"/)) {

			// literals: quoted strings
			type = "literal";
			color = "violet";
			args_string = arrow_element;
			name = "string";

		} else if (arrow_element.match(/^[0-9.]+$/)) {

			// literals: numbers, can be int or float
			type = "literal";
			color = "violet";
			args_string = arrow_element;
			name = "number";

		} else {
			type = "stream";
			stream_type = "local";
			color = "dark-green";
			name = arrow_element;

			if (arrow_element.match(rxp_global_stream)) {
				// color = "dark-blue";
				stream_type = "global";
				name = /\[(.+)\]$/.exec(arrow_element)[1];
			}

			streams.push(name);
		}

		let args = [];
		if (args_string.length > 0) args = args_string.split(',');
		for (let j in args) args[j] = args[j].trim();

		elements.push({
			code: arrow_element,
			name: name,
			name2: name2,
			stream_type: stream_type,
			args_string: args_string,
			args: args,
			color: color,
			type: type,
			selected: false,
			breakpoint: false,
			id: expr_index + '_' + element_index,
		})
		element_index++;
	}

	return elements;
}
