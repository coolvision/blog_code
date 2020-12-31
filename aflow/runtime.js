import { processArrow, setStream } from './process_arrow.js';
import { expressions, functions } from './parse.js';
import { running } from './ui.js';

export var streams = {};
export var log = {
	stack: [],
	n: 0
};
reset_runtime("");

export function add_to_log(result, program_id) {
	log.stack.push([result, log.n]);
	log.n++;
	while (log.stack.length > 10) {
		log.stack.shift();
	}
	let log_str = "";
	for (let l in log.stack) {
		log_str += log.stack[l][1] + ": " + log.stack[l][0];
		log_str += '\n';
	}
	$("#" + program_id + " div" + ".log").text(log_str);
}

export function reset_runtime() {
	console.log("reset_runtime", streams);
	streams = {};
	log.stack = [];
	log.n = 0;
}

export function clear_highlight(program_id = "") {
	$('.el').removeClass('bg-washed-red');
}

export function highlight(state) {
	let exp = expressions[state.exp_i].el;
	if (state.fn) {
		let exp = functions[state.fn_name].body;
		if (state.el_i >= 0 && state.el_i < exp.length) {
			let el = exp[state.el_i];
			$('#' + state.program_id + ' #' + el.id).addClass('bg-washed-red');
		}
		//  else if (state.el_i < 1) {
		// 	let el = exp[0];
		// 	$('#' + state.program_id + ' #' + el.id).addClass('bg-washed-red');
		// }
	} else {
		if (state.select_expression_i >= 0) {
			exp = expressions[state.select_expression_i].el;
		}
		if (state.el_i >= 0 && state.el_i < exp.length) {
			let el = exp[state.el_i];
			$('#' + state.program_id + ' #' + el.id).addClass('bg-washed-red');
		}
		//  else if (state.el_i < 1) {
		// 	let el = exp[0];
		// 	$('#' + state.program_id + ' #' + el.id).addClass('bg-washed-red');
		// }
	}
	// console.log("highlight", JSON.stringify(state));
}

export var curr_key = "";

document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    // alert(charStr);
	curr_key = charStr;
};

export function step(state, state_stack) {

	// console.log("step", JSON.stringify(state), JSON.stringify(streams), state_stack.length);
	// console.log("step", JSON.stringify(state));

	let change_exp = false;
	let finished = false;
	let triggered_breakpoint = false;
	let breakpoint = "";

	if (state.switch_fn) {
		state.switch_fn = false;

		let exp = expressions[state.exp_i].el;
		if (state.select_expression_i >= 0) {
			state.exp_i = state.select_expression_i;
			exp = expressions[state.select_expression_i].el;
		}

		if (state.fn) {
			exp = functions[state.fn_name].body;
		}

		let el = exp[state.el_i];
		let prev_el = state.el_i > 0? exp[state.el_i-1]: null;
		let next_el = state.el_i < exp.length-1? exp[state.el_i+1]: null;
		let nnext_el = state.el_i < exp.length-2? exp[state.el_i+2]: null;

		let f = functions[el.name];
		// let f = functions[state.switch_fn_name];

		// console.log("start function el", JSON.stringify(el));
		// console.log("start function init state", el.name, JSON.stringify(state), JSON.stringify(f));


		// states.el_i++;

		// console.log("start function init state", JSON.stringify(state), JSON.stringify(f));

		state_stack.push(_.cloneDeep(state));
		for (let i in f.args) {
			if (f.args[i] && !state.args.hasOwnProperty(f.args[i])) {
				state.args[f.args[i]] = el.args[i];
			}
		}
		state.fn = true;
		state.fn_name = state.switch_fn_name;
		state.el_i = 0;
		state.iterator = [];
		state.run_iteration = 0;
		if (next_el && next_el.type == 'stream') {
			state.output_stream = next_el;
		}

		// console.log("start function new state", JSON.stringify(state));
		// console.log("args", JSON.stringify(state.args), state.args);
		// console.log("streams", JSON.stringify(streams));

		// for (let s in state.args) {
		// 	console.log("setStream", s, "local", state.args[s]);
		// 	setStream(s, "local", state.args[s]);
		// }

		// console.log("start function new state", JSON.stringify(state.args), JSON.stringify(streams));


		// console.log("start function new state", JSON.stringify(state));

		exp = functions[state.fn_name].body;
		// exp = functions[state.switch_fn_name].body;
		el = exp[state.el_i];
		prev_el = state.el_i > 0? exp[state.el_i-1]: null;
		next_el = state.el_i < exp.length-1? exp[state.el_i+1]: null;
		nnext_el = state.el_i < exp.length-2? exp[state.el_i+2]: null;

		processArrow(el, prev_el, next_el, nnext_el, state, state_stack, [], running);

	} else if (state.fn) {

		state.el_i++;

		let exp = functions[state.fn_name].body;

		if (state.el_i >= exp.length) {
			// are there any messages left, maybe need to re-run?
			state.run_iteration++;
			if (state.iterator.length > 0) {
				state.el_i = state.iterator.pop();
				// state.curr_el_i = state.el_i;
				// console.log("continue_iterations, fn", state.iterator, state.el_i);
			} else {
				// state = state_stack.pop();

				let new_state = state_stack.pop();
				if (state.hasOwnProperty('fn_result')) {
					new_state.fn_result = state.fn_result;
				}
				for (let k in new_state) {
					state[k] = _.cloneDeep(new_state[k]);
				}
				// state.el_i--;
				// console.log("exit function", JSON.stringify(state));
				return {change_exp: change_exp,
						finished: finished,
						triggered_breakpoint: triggered_breakpoint,
						breakpoint: breakpoint};
				// 2DO
				// if (!state.finished) {
				// 	step(state, state_stack);
				// }
			}
		}

		let el = exp[state.el_i];
		let prev_el = state.el_i > 0? exp[state.el_i-1]: null;
		let next_el = state.el_i < exp.length-1? exp[state.el_i+1]: null;
		let nnext_el = state.el_i < exp.length-2? exp[state.el_i+2]: null;

		// console.log("fn el", JSON.stringify(el), JSON.stringify(state), JSON.stringify(expressions[state.exp_i]));

		// console.log("check bp", JSON.stringify(expressions[state.exp_i]));

		if (expressions[state.exp_i].running && el.breakpoint && !state.triggered_breakpoint) {
			triggered_breakpoint = true;
			breakpoint = el.code;
			highlight(state);
			// state.triggered_breakpoint = true;
			// if (el.type == "function") {
			// 	state.fn_element = true;
			// } else {
			// 	state.fn_element = false;
			// }
			// console.log("triggered_breakpoint1", JSON.stringify(el), JSON.stringify(state));
			// return {change_exp: change_exp,
			// 		finished: finished,
			// 		triggered_breakpoint: triggered_breakpoint,
			// 		breakpoint: breakpoint};
		}
		// state.triggered_breakpoint = false;

		processArrow(el, prev_el, next_el, nnext_el, state, state_stack, [], running);
		// state.curr_el_i = state.el_i;

	} else {

		state.el_i++;

		if (state.el_i == 0) {
			state.args.key = curr_key;
		}

		let exp = expressions[state.exp_i].el;
		if (state.select_expression_i >= 0) {
			state.exp_i = state.select_expression_i;
			exp = expressions[state.select_expression_i].el;
		}

		if (state.el_i >= exp.length) {
			state.run_iteration++;

			// console.log("expression exit check", JSON.stringify(state));

			if (exp[0].type == 'trigger' &&
			 	exp[0].name == 'repeat' && exp[0].n > 0) {
				// should it be run several times?
				state.el_i = 0;
				// state.curr_el_i = state.el_i;
				// state.args.n++;
			} else {

				for (let i in streams) {
					if (streams[i].type == 'local') {
						delete streams[i];
					}
				}

				// exit the expression?
				// check if any iterations are not finished
				if (state.iterator.length > 0) {
					state.el_i = state.iterator.pop();
					// 2DO
					// step(state, state_stack);
					// console.log("continue_iterations", state.el_i, state.iterator);
				} else {

					if (state.select_expression_i < 0) {
						state.exp_i++;
						if (state.exp_i >= expressions.length) {
							state.exp_i = 0;
							state.finished = true;
							finished = true;
						}
						exp = expressions[state.exp_i].el;
					}

					state.finished_expression = true;
					change_exp = true;
					// console.log("change_exp", change_exp, finished, JSON.stringify(state));

					// clear_state(state);
					state.el_i = 0;
					// state.args.n = 0;
					state.iterator = [];
					state.run_iteration = 0;
					state.args.key = curr_key;
					curr_key = "";

					// state.curr_el_i = state.el_i;

					for (let i in streams) {
						if (streams[i].type == 'local') {
							delete streams[i];
						} else if (streams[i].type == 'iterator') {
							delete streams[i];
						}
					}
					// console.log("expression exit", state);


					// exit the expression and step to the next statement
					// step(state, state_stack);
				}
			}
		}

		let el = exp[state.el_i];
		let prev_el = state.el_i > 0? exp[state.el_i-1]: null;
		let next_el = state.el_i < exp.length-1? exp[state.el_i+1]: null;
		let nnext_el = state.el_i < exp.length-2? exp[state.el_i+2]: null;

		// console.log("next el", el)

		// console.log("el", JSON.stringify(el));

		// console.log("check bp", JSON.stringify(expressions[state.exp_i]));
		// console.log("el", state.triggered_breakpoint, JSON.stringify(el));

		// if (state.el_i < exp.length) {
		// if (expression.running && el.breakpoint && !state.triggered_breakpoint) {

		// if (el.breakpoint) {
		// 	console.log("breakpoint", state.exp_i, state.el_i, expressions[state.exp_i].running, state.triggered_breakpoint);
		// }

		if (expressions[state.exp_i].running && el.breakpoint && !state.triggered_breakpoint) {

			// console.log("triggered_breakpoint", state.exp_i, state.el_i);

			triggered_breakpoint = true;
			breakpoint = el.code;
			highlight(state);
			// state.triggered_breakpoint = true;
			// if (el.type == "function") {
			// 	state.fn_element = true;
			// } else {
			// 	state.fn_element = false;
			// }
			// return {change_exp: change_exp,
			// 		finished: finished,
			// 		triggered_breakpoint: triggered_breakpoint,
			// 		breakpoint: breakpoint};
		}
		// state.triggered_breakpoint = false;
		processArrow(el, prev_el, next_el, nnext_el, state, state_stack, [], running);
		// state.curr_el_i = state.el_i;
		// }

	}

	return {change_exp: change_exp,
			finished: finished,
			triggered_breakpoint: triggered_breakpoint,
			breakpoint: breakpoint};
}
