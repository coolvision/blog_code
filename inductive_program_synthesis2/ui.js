
// console.log("list_data", list_data);

var problems_data = JSON.parse(list_data);
let names = "";
for (d in problems_data) {

	let div = $("<div>");
	div.attr("id", d);
	div.addClass("pointer hover-blue problem_name");
	div.text(problems_data[d].name);

	div.click(function() {
		let id = $(this).attr("id");

		$(".problem_name").removeClass("blue");
		$(this).addClass("blue");

		reset();

		for (let t in tasks) {
			if (tasks[t].i == id) {
				task = tasks[t];
				break;
			}
		}
		$(".task").text(stringify(task.task));
	});

	$("#problems").append(div);

	console.log("data", problems_data[d]);
	// names += problems_data[d].name + '\n';
}
$("#0").click();

var tasks = [];

for (id in problems_data) {

	selected_demo = "reversal";

	let task = JSON.parse(dsl_config[selected_demo]);

	task["io_examples"] = [];
	task["input-type"] = problems_data[id].type.input;
	task["output-type"] = problems_data[id].type.output;
	for (let e in problems_data[id].examples) {
		task["io_examples"].push({"input": problems_data[id].examples[e]["i"],
								"output": problems_data[id].examples[e]["o"]});
	}

	task["variables"] = {"number": [], "array": [], "boolean": []};

	if (task["output-type"] == "int") {
		task["variables"].number.push("output");
		task["functions"][1] = ["=", "output", "number??", ""];
	} else if (task["output-type"] == "bool") {
		task["variables"].boolean.push("output");
		task["functions"][1] = ["=", "output", "boolean??", ""];
	} else if (task["output-type"] == "list-of-bool") {
		task["variables"].array.push("output");
		task["functions"][1] = ["output.push", "boolean??", ""];
	} else if (task["output-type"] == "list-of-int") {
		task["variables"].array.push("output");
	}

	if (task["input-type"] == "int") {
		task["variables"].number.push("input");
	} else if (task["input-type"] == "bool") {
		task["variables"].boolean.push("input");s
	} else if (task["input-type"] == "list-of-bool") {
		task["variables"].array.push("input");
	} else if (task["input-type"] == "list-of-int") {
		task["variables"].array.push("input");
	}

	tasks.push({"i": id, "id": problems_data[id].name,
		"task": task, "time": 0, "solved": false});
}

console.log("tasks", tasks);

$(".generate_all").click(function() {
	console.log("generate_all", "generating", generating);

	for (let t in tasks) {
		tasks[t].task.variables_n++;
	}

	if (!generating) {
		reset();
		task = tasks[0];
		generate_tasks(tasks, 0);
	}
});

$(".generate").click(function() {
	// select_demo($(this).parent().attr("id"));
	console.log("generate", "generating", generating);
	if (!generating) {
		console.log("generate();");
		generate();
	}
});

$(".step").click(function() {
	next(true);
});

$(".stop").click(function() {
	stop_processing = true;
	console.log("stop", "stop_processing", stop_processing);
});
