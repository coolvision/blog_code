
import * as THREE from '../lib/three.module.js';
import { expressions, functions } from './parse.js';
import { format_message, show_result, show_stream } from './display.js';
import { streams, add_to_log } from './runtime.js';

function clone(v) {
	v = _.cloneDeep(v);
}

export function processArrow(el, prev_el, next_el, nnext_el, state, state_stack, intervals = null, running = false) {

	// console.log("processArrow check", JSON.stringify(el), JSON.stringify(state));

	if (el.type == "function") {
		state.fn_element = true;
	} else {
		state.fn_element = false;
	}

	if (!running || el.breakpoint) {
		// $('#' + state.program_id + ' .el').removeClass('bg-washed-red');
		// $('#' + state.program_id + ' #' + el.id).addClass('bg-washed-red');
	}

	if (el.type == 'stream') {

		// console.log("stream", JSON.stringify(next_el), JSON.stringify(streams));

		if (next_el) {
			if (streams.hasOwnProperty(el.name)) {
				next_el.store = streams[el.name].value;
			} else if (state.args.hasOwnProperty(el.name)) {
				next_el.store = streams[state.args[el.name]].value;
			}
		}

	} else if (el.type == "literal") {

		if (next_el) {
			if (next_el.type == 'stream') {
				setStream(next_el.name, next_el.stream_type, el.args_string);
			} else {
				next_el.store = el.args_string;
			}
		}

	} if (el.type == "trigger" && el.name == "repeat") {

		if (el.args.length > 0 && el.args[0].match(/hz/)) {

		} else {
			// console.log("trigger:", el);
			if (el.hasOwnProperty('n')) {
				el.n--;
			} else {
				el.n = el.args[0];
				el.n--;
			}
		}

	} else if (el.type == "iterator") {

		// make a new stream with the current element of the enumerated stream
		// new stream name
		let new_strem = el.name;
		// find an array stream
		let stream = el.name2;

		if (streams.hasOwnProperty(stream)) {
			let s = streams[stream];
			if (!streams.hasOwnProperty(new_strem)) {
				streams[new_strem] = {};
				streams[new_strem].name = new_strem;
				streams[new_strem].current_i = 0;
				streams[new_strem].parent_stream = stream;
				streams[new_strem].type = 'iterator';
			}
			let ns = streams[new_strem];
			if (ns.parent_stream != stream) {
				ns.parent_stream = stream;
				ns.current_i = 0;
			}
			if (ns.current_i < s.value.length) {
				ns.value = s.value[ns.current_i];
				ns.current_i++;
			}

			if (s.value.length - ns.current_i > 0) {
				state.iterator.push(state.el_i);
			} else {
				ns.current_i = 0;
			}

			// console.log("iterator", s, ns, state)
		}

	} if (el.type == "js_code" || el.type == "js_function_body") {

		let args = [];
		let values = [];

		for (let s in streams) {
			args.push(s);
			values.push(streams[s].value);
		}

		for (let s in state.args) {
			args.push(s);
			let v = state.args[s];
			if (streams.hasOwnProperty(v)) {
				values.push(streams[v].value);
			} else {
				values.push(v)
			}
		}

		let args_string = args.join();
		let fn_code = '"use strict";(function(' + args_string + '){return(' + el.code + ')})'
		// console.log("js_code", el, el.type != 'js_function_body', "el.code", el.code, el.code.match(/;/),  el.code.split(';'));

		if (el.code.match(/;/)) {
			let code_array = el.code.split(';');
			let code_last = _.last(code_array);
			let code_initial = _.initial(code_array).join(';');
			fn_code = '"use strict";(function(' + args_string + '){' + code_initial + '; return(' + code_last + ')})'
		}
		if (el.type == 'js_function_body') {
			fn_code = '"use strict";(function(' + args_string + '){' + el.code + '})'
		}

		// console.log("js_code", args_string, values, fn_code);
		// console.log("next_el", next_el);

		// try {
			let fn = eval(fn_code);
			let result = fn(...values);
			// console.log("js_code result", result);

			if (next_el) {
				if (next_el.type == 'stream') {
					setStream(next_el.name, next_el.stream_type, result);
				} else {
					next_el.store = result;
					show_result(next_el, result, "");
				}
			} else if (state.hasOwnProperty('output_stream')) {
				setStream(state.output_stream.name, state.output_stream.stream_type, result);
			} else if (el.type == "js_function_body") {
				state.fn_result = result;
				// console.log("state.fn_result", result);
			}

			show_result(el, result, "");

		// } catch (err) {
		// 	console.log(err);
		// }

		// console.log("done", state, streams);

	} else if (el.type == "function_builtin" && el.name == "log") {

		// console.log("log", el.args_string, state.log_stack)

		// evaluate
		let args = [];
		let values = [];

		for (let s in streams) {
			args.push(s);
			values.push(streams[s].value);
		}

		for (let s in state.args) {
			args.push(s);
			let v = state.args[s];
			if (streams.hasOwnProperty(v)) {
				values.push(streams[v].value);
			} else {
				values.push(v)
			}
		}

		let args_string = args.join();
		let fn_code = '"use strict";(function(' + args_string + '){return(' + el.args_string + ')})'

		// console.log("log fn_code", fn_code)

		try {
			let fn = eval(fn_code);
			let result = fn(...values);

			// log.stack.push([result + "; " + state.select_expression, log.n]);
			// add_to_log(result, state.program_id);
			add_to_log(format_message(result), state.program_id);

			// console.log("log result", result, format_message(result));

		} catch (err) {
			console.log(err);
		}

	} else if (el.type == "function_builtin" && el.name == "push") {

		if (el.hasOwnProperty('store')) {
			if (next_el && next_el.type == 'stream') {
				addMessage(next_el, el.store);
			} else if (state.hasOwnProperty('output_stream')) {
				addMessage(state.output_stream, el.store);
			}
		}

		let cond = state.hasOwnProperty('fn_result') && state.fn_result != null && next_el && next_el.type == 'stream';

		if (cond) {
			console.log("push addMessage", next_el, state.fn_result);
			addMessage(next_el, state.fn_result);
		}

		// for (let s in streams) {
		// 	show_stream(streams[s].name, streams[s]);
		// }

	} else if (el.type == "function_builtin" && el.name == "clone") {

		// console.log("clone", JSON.stringify(el), JSON.stringify(state));

		if (el.args.length == 0 && el.hasOwnProperty('store')) {

			if (next_el) {
				if (next_el.type == 'stream') {
					setStream(next_el.name, next_el.stream_type, _.cloneDeep(el.store));
				} else {
					next_el.store = _.cloneDeep(el.store);
					show_result(next_el, next_el.store, "");
				}
			} else if (state.hasOwnProperty('output_stream')) {
				setStream(state.output_stream.name,
					state.output_stream.stream_type, _.cloneDeep(el.store));
			}

			// console.log("clone1", JSON.stringify(el), streams);

			// for (let s in streams) {
			// 	show_stream(streams[s].name, streams[s]);
			// }

		} else {

			for (let arg of el.args) {
				if (streams.hasOwnProperty(arg)) {
					// console.log("clone value", streams[arg]);
					streams[arg].value = _.cloneDeep(streams[arg].value);
				}
			}
		}


	} else if (el.type == "function_builtin" && el.name == "filter") {

		// console.log("filter", el.args_string, streams);

		let args = [];
		let values = [];
		for (let s in streams) {
			args.push(streams[s].name);
			values.push(streams[s].value);
		}

		// console.log("filter streams", JSON.stringify(streams));
		//
		// console.log("filter args", JSON.stringify(args));
		//
		// console.log("filter values", JSON.stringify(values));

		let args_string = args.join();
		let fn_code = '"use strict";(function(' + args_string + '){return(' + el.args_string + ')})'

		let fn = eval(fn_code);
		let result = fn(...values);

		show_result(el, result, "eval result");

		if (!result) {
			// delete the message from the stream
			streams[prev_el.name].value = undefined;
		} else {
			let result = streams[prev_el.name].value;
			if (next_el && next_el.name == 'clone' && nnext_el && nnext_el.type == 'stream') {
				setStream(nnext_el.name, "local", _.cloneDeep(result));
			} else if (next_el && next_el.name == 'push' && nnext_el && nnext_el.type == 'stream') {
				addMessage(nnext_el, result);
			} else if (next_el && next_el.type == 'stream') {
				setStream(next_el.name, next_el.stream_type, result);
			} else {
				if (state.hasOwnProperty('output_stream')) {
					addMessage(state.output_stream, result);
				}
			}
		}

	} else if (el.type == "function") {
		state.switch_fn = true;
		state.switch_fn_name = el.name;
		// console.log("next switch to function", JSON.stringify(el));
	}
}

export function setStream(name, type, value) {
	streams[name] = {};
	streams[name].value = value;
	streams[name].name = name;
	streams[name].current_i = 0;
	streams[name].type = type;
}

function addMessage(el, value, clone = false) {
	if (el.type != "stream") return;
	if (streams.hasOwnProperty(el.name)) {
		streams[el.name].value.push(value);
	} else {
		setStream(el.name, el.stream_type, [value])
	}
	// console.log("addMessage", el, el.name, value, streams);
}
