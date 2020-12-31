import { parse, expressions, functions, new_state } from './parse.js';
import { step, reset_runtime, streams, add_to_log, clear_highlight, highlight, curr_key } from './runtime.js';
import { intervals } from './parse.js';

// export var stop_running = false;
export var running = false;
export var paused = false;
export var was_paused = false;
export var was_running = false;

var programs = {};
var _program_id = "";

// programs["demo1"] =
// `"hello" -> h -> log(h)
// "world" -> w -> log(w)
// 0 -> [v] -> log(v)
// repeat(5) -> ++v -> [v] -> log(v)`;

programs["demo1"] =
`log("hello world")
0 -> [x] -> log(x)
repeat(10hz) -> ++x -> [x] -> log(x)`;

programs["demo2"] =
`"hello" -> h -> log(h)
"world" -> w -> log(w)`;

programs["demo3"] =
`0 -> [v] -> log(v)
repeat(5) -> ++v -> [v] -> log(v)
repeat(5hz) -> 1 -> [v] -> log(v)
repeat(10hz) -> 2 -> [x] -> log(x + "," + v)`;

programs["demo4"] =
`clear()

repeat(50) →
	{x: new THREE.Vector2().random(), v: new THREE.Vector2(0.01, 0.01)} → push → [boids]

repeat(100hz) → clear() -> draw() → for boid in boids → find_flockmates → separation →
 	align_v -> align_x -> boid.x.add(boid.v) → limit(x) → limit(y) -> limitSpeed()

fn find_flockmates →
	for boid2 in boids → filter(boid.x.clone().sub(boid2.x).length() < 0.25) → push → flockmates

fn separation →
	for boid2 in flockmates → boid.v.add(boid.x.clone().sub(boid2.x).multiplyScalar(0.01))

fn align_v →
	mean(flockmates, v) -> boid.v.add(mean.sub(boid.v).multiplyScalar(0.1))

fn align_x →
	mean(flockmates, x) -> boid.v.add(mean.sub(boid.x).multiplyScalar(0.1))

fn mean(array, property) →
	array -> clone → array2 -> array2.map(a => a[property]) → values →
		values.reduce((a, b) => a.add(b)).divideScalar(array.length) → mean

fn limit(axis) →
	boid.x[axis] < 0.1 && (boid.v[axis] += 0.01) →
	boid.x[axis] > 0.9 && (boid.v[axis] -= 0.01)

function limitSpeed() {
	const speedLimit = 0.5;
	const speed = Math.sqrt(boid.v.x * boid.v.x + boid.v.y * boid.v.y);
	if (speed > speedLimit) {
		boid.v.x = (boid.v.x / speed) * speedLimit;
		boid.v.y = (boid.v.y / speed) * speedLimit;
	}
}

function clear() {
	var canvas = document.querySelector("#demo4 canvas");
	var canvas_ctx = canvas.getContext("2d");
	canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
	var canvas = document.querySelector("#demo4 canvas");
	var canvas_ctx = canvas.getContext("2d");
	for (let boid of boids) {
		canvas_ctx.beginPath();
		canvas_ctx.arc(boid.x.x*280+10, boid.x.y*280+10, 3, 0, 2 * Math.PI);
		canvas_ctx.fill();
	}
}`;

programs["demo5"] =
`
chaosGame()

function chaosGame() {
	var canvas = document.querySelector("#demo5 canvas");
	var canv = canvas.getContext("2d");
	var w = 300;
	var h = 300;
	var x = Math.random() * w;
	var y = Math.random() * h;
	for (var i=0; i<30000; i++) {
		var vertex = Math.floor(Math.random() * 3);
		switch(vertex) {
			case 0:
				x = x / 2;
				y = y / 2;
				canv.fillStyle = 'green';
				break;
			case 1:
				x = w/2 + (w/2 - x) / 2
				y = h - (h - y) / 2
				canv.fillStyle = 'red';
				break;
			case 2:
				x = w - (w - x) / 2
				y = y / 2;
				canv.fillStyle = 'blue';
		}
		canv.fillRect(x, y, 1,1);
	}
}`;


programs["demo6"] =
`

20 → [size] -> log(size)
{t: 'i', l: 'j', d: 'k', r: 'l', shoot: 'n', x: size-1, y: size-1, g: 'left', color: 'green'} → push -> [players]
log(players)
{x: 0, y: 0, direction: 'right'} -> push -> [shot]

repeat(10hz) -> for p in players -> update_player() -> push -> [shot] -> draw()

repeat(10hz) -> for s in shot -> move_projectile(s) -> log(shot)

function update_player() {
  key === p.d
    ? ((p.x += p.x < size - 1 ? 1 : 0), (p.g = 'down'))
    : key === p.t
    ? ((p.x += p.x > 0 ? -1 : 0), (p.g = 'up'))
    : (p.g = p.g),
  key === p.r
    ? ((p.y += p.y < size - 1 ? 1 : 0), (p.g = 'right'))
    : key === p.l
    ? ((p.y += p.y > 0 ? -1 : 0), (p.g = 'left'))
    : (p.g = p.g)
	if (key == p.shoot) {
		console.log("process_keys shoot", key, p);
		return {x: p.x, y: p.y, direction: p.g};
	} else {
		return null;
	}
}

function move_projectile() {
	let move = {
		'down': shot => (shot.x += 1),
		'up': shot => (shot.x += -1),
		'right': shot => (shot.y += 1),
		'left': shot => (shot.y += -1)
	}
	move[s.direction](s);
}

function draw() {
	var canvas = document.querySelector("#demo6 canvas");
	var canvas_ctx = canvas.getContext("2d");
	canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
	let v = 300/20;

	for (let p of players) {
		canvas_ctx.fillStyle = p.color;
		canvas_ctx.fillRect(p.y*v, p.x*v, 15, 15);
	}
	canvas_ctx.fillStyle = 'black';
	for (let s of shot) {
		canvas_ctx.fillRect(s.y*v, s.x*v, 5, 5);
	}
}`;

let program_containers = $('.program_demo');
console.log("program_containers", program_containers, program_containers.length);

for (let p in program_containers) {
	if (!program_containers[p].id) continue;

	let program_id = program_containers[p].id;
	console.log("check", p, program_containers[p], program_id);

	let saved_program = localStorage.getItem(program_id);
	if (programs.hasOwnProperty(program_id)) {
		$("#" + program_id + " div" + ".code_area").text(programs[program_id]);
		let code_render = parse(programs[program_id], program_id);
		$("#" + program_id + " div" + ".code_render").html(code_render);
		add_el_events(program_id);
	} else if (saved_program) {
		programs[program_id] = saved_program;
		$("#" + program_id + " div" + ".code_area").text(programs[program_id]);
		let code_render = parse(programs[program_id], program_id);
		$("#" + program_id + " div" + ".code_render").html(code_render);
		add_el_events(program_id);
	}

	let editoresque = new Misbehave(document.querySelector("#" + program_id + " div" + ".code_area"));

	$("#" + program_id + " div" + ".code_area").on('keydown',
	_.debounce(function() {
		let code = $(this).text();

		stop_running();
		reset_runtime();
		stepping_state_stack = [];
		stepping_state = new_state(program_id);

		let code_render = parse(code, program_id);
		$("#" + program_id + " div" + ".code_render").html(code_render);

		add_el_events(program_id);

		localStorage.setItem(program_id, code);
		programs[program_id] = code;
		console.log("debounce", program_id);

	}, 500));
}

function add_el_events(program_id) {

	console.log("add_el_events", expressions)

	for (let i in expressions) {
		for (let j in expressions[i].el) {
			// console.log("add handler", program_id, i, j, expressions[i].el[j].id)
			$('#' + program_id + ' #' + expressions[i].el[j].id).click(function() {
				select_program(program_id);
				if (!$(this).hasClass("breakpoint")) {
					$(this).addClass('br b--red bw2 breakpoint');
				} else {
					$(this).removeClass('br b--red bw2 breakpoint');
				}
				update_breakpoints();
			});
		}
		$('#' + program_id + ' #step_' + expressions[i].exp_i).click(function() {

			select_program(program_id);
			console.log("step button", JSON.stringify(expressions[i].state));

			clear_highlight();
			step(expressions[i].state, expressions[i].state_stack);
			highlight(expressions[i].state);

		});
		$('#' + program_id + ' #step_over_' + expressions[i].exp_i).click(function() {

			select_program(program_id);

			clear_highlight();
			do_step_over(expressions[i].state, expressions[i].state_stack, "over");
			highlight(expressions[i].state);

			console.log("step over button");
		});
	}
	for (let i in functions) {
		for (let j in functions[i].body) {
			// console.log("add handler", program_id, i, j, functions[i].body[j].id)
			$('#' + program_id + ' #' + functions[i].body[j].id).click(function() {
				select_program(program_id);
				if (!$(this).hasClass("breakpoint")) {
					$(this).addClass('br b--red bw2 breakpoint');
				} else {
					$(this).removeClass('br b--red bw2 breakpoint');
				}
				update_breakpoints();
			});
		}
	}
}

function update_breakpoints() {
	for (let i in expressions) {
		for (let j in expressions[i].el) {
			if ($('#' + _program_id + ' #' + expressions[i].el[j].id).hasClass("breakpoint")) {
				console.log("breakpoint", i, j);
				expressions[i].el[j].breakpoint = true;
			} else {
				expressions[i].el[j].breakpoint = false;
			}
		}
	}
	for (let i in functions) {
		for (let j in functions[i].body) {
			if ($('#' + _program_id + ' #' + functions[i].body[j].id).hasClass("breakpoint")) {
				console.log("breakpoint", i, j);
				functions[i].body[j].breakpoint = true;
			} else {
				functions[i].body[j].breakpoint = false;
			}
		}
	}
}

var stepping_state_stack = [];
var stepping_state = new_state("");

function select_program(program_id) {
	// console.log("select_program new", program_id, _program_id);
	if (program_id != _program_id) {
		console.log("switch to", program_id);
		if (programs.hasOwnProperty(program_id)) {
			parse(programs[program_id], program_id);
		}
		reset_runtime();
		stepping_state_stack = [];
		stepping_state = new_state(program_id);
		clear_highlight();
		highlight(stepping_state);
		_program_id = program_id;
		return true;
	}
	_program_id = program_id;
	return false;
}

$(".step").click(function() {
	do_step($(this).parent().attr("id"));
});

$(".step_over").click(function() {
	let program_id = $(this).parent().attr("id");
	do_step(program_id, "over");
});

$(".step_out").click(function() {
	let program_id = $(this).parent().attr("id");
	do_step(program_id, "out");
});

function do_step(program_id, type = "") {
	clear_highlight(program_id);
	if (select_program(program_id)) return;

	if (was_paused || running) {
		// step all
		for (let i in expressions) {
			console.log("expression", i, type, JSON.stringify(expressions[i].state));
			expressions[i].state.select_expression_i = i;
			if (expressions[i].hasOwnProperty("interval")) {
				if ((type == "") || (type == "over" && !expressions[i].state.fn_element) ||
					(type == "out" && !expressions[i].state.fn)) {
					console.log("just step1", type, expressions[i].state_stack.length);
					step(expressions[i].state, expressions[i].state_stack);
				} else {
					do_step_over(expressions[i].state, expressions[i].state_stack, type);
				}
				highlight(expressions[i].state);
			} else {
				if (!expressions[i].state.finished_expression) {
					if ((type == "") || (type == "over" && !expressions[i].state.fn_element) ||
						(type == "out" && !expressions[i].state.fn)) {
						console.log("just step2", type, expressions[i].state_stack.length);
						step(expressions[i].state, expressions[i].state_stack);
					} else {
						do_step_over(expressions[i].state, expressions[i].state_stack, type);
					}
					highlight(expressions[i].state);
				}
			}
		}
	} else {
		if ((type == "") || (type == "over" && !stepping_state.fn_element) ||
			(type == "out" && !expressions[i].state.fn)) {
			console.log("just step3", type, stepping_state_stack.length);
			let r = step(stepping_state, stepping_state_stack);
			console.log("step result", r);
		} else {
			do_step_over(stepping_state, stepping_state_stack, type);
		}
		highlight(stepping_state);
	}
}

function do_step_over(state, state_stack, type) {
	let init_depth = state_stack.length;
	console.log("do_step1", init_depth)
	for (let i = 0; i < 100000; i++) {
		let r = step(state, state_stack);
		console.log("next step", i, state_stack.length, r)
		if (r.finished) break;
		if (type == "over") {
			if (state_stack.length <= init_depth || state_stack.length == 0) {
				step(state, state_stack);
				return;
			}
		} else if (type == "out") {
			if (state_stack.length < init_depth || state_stack.length == 0) {
				// step(state, state_stack);
				return;
			}
		} else {
			return;
		}
	}
}

$(".stop").click(function() {
	stop_running();
	paused = true;
	was_paused = true;
	$('#' + _program_id + ' .stop').addClass('bg-washed-red');
});

function stop_running() {
	$('#' + _program_id + ' .el').removeClass('bg-washed-red');
	for (let i in expressions) {
		if (expressions[i].hasOwnProperty("timer")) {
			clearTimeout(expressions[i].timer);
			// let el = expressions[i].el[expressions[i].state.el_i];
			highlight(expressions[i].state);
			expressions[i].running = false;
		}
	}
	running = false;
}

function run(exp) {
	exp.timer = setTimeout(function(){
		for (let i = 0; i < 100000; i++) {
			let r = step(exp.state, exp.state_stack);
			if (r.triggered_breakpoint) {
				// console.log("triggered_breakpoint", JSON.stringify(exp.state), exp.state_stack.length);
				exp.running = false;
				return;
			}
			if (r.change_exp) break;
		}
		run(exp);
	}, exp.interval);
}

$(".run").click(function() {
	select_program($(this).parent().attr("id"));
	running = true;
	paused = false;
	was_running = true;
	$('#' + _program_id + ' .stop').removeClass('bg-washed-red');
	clear_highlight(_program_id);

	update_breakpoints();

	for (let i in expressions) {
		expressions[i].state.select_expression_i = i;
		if (expressions[i].hasOwnProperty("interval")) {
			if (!expressions[i].running) {
				expressions[i].running = true;
				run(expressions[i]);
			}
		} else {
			expressions[i].running = true;
			for (let j = 0; j < 100000; j++) {
				if (expressions[i].state.finished_expression) break;
				let r = step(expressions[i].state, expressions[i].state_stack);
				if (r.triggered_breakpoint) {
					console.log("triggered_breakpoint", JSON.stringify(expressions[i].state));
					return;
				}
				if (r.change_exp) break;
			}
			expressions[i].running = false;
		}
	}
});

$(".restart").click(function() {
	paused = false;
	was_paused = false;
	was_running = false;
	select_program($(this).parent().attr("id"));
	stop_running();
	reset_runtime();
	stepping_state_stack = [];
	stepping_state = new_state(_program_id);
	if (programs.hasOwnProperty(_program_id)) {
		parse(programs[_program_id], _program_id);
	}
	$("#" + _program_id + " div" + ".log").text("");
	clear_highlight(_program_id);
	$('#' + _program_id + ' .stop').removeClass('bg-washed-red');
	highlight(stepping_state);
});
