
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

		let examples = "";
		for (let e in problems_data[id].examples) {
			examples += "input: " + JSON.stringify(problems_data[id].examples[e]["i"]) + '\n';
			examples += "output: " + JSON.stringify(problems_data[id].examples[e]["o"]) + '\n';
		}
		$("#problem").text(examples);
		$(".problem_name").removeClass("blue");
		$(this).addClass("blue");

		// set up the generation task: init the problem, DSL, etc...
		selected_demo = "reversal";
		// init_generation = false;
		reset();

		task["io_examples"] = [];
		task["input-type"] = problems_data[id].type.input;
		task["output-type"] = problems_data[id].type.output;
		for (let e in problems_data[id].examples) {
			task["io_examples"].push({"input": problems_data[id].examples[e]["i"],
									"output": problems_data[id].examples[e]["o"]});
		}

		if (task["output-type"] == "int") {
			task["variables"] = {"number": ["output"], "array": ["input"]};
			task["functions"][1] = ["=", "output", "number??", ""];
		}
		if (task["output-type"] == "bool") {
			task["variables"] = {"bool": ["output"], "array": ["input"]};
			task["functions"][1] = ["=", "output", "boolean??", ""];
		}
		if (task["output-type"] == "list-of-bool") {
			task["functions"][1] = ["output.push", "boolean??", ""];
		}


		$(".task").text(stringify(task));

	});

	$("#problems").append(div);

	console.log("data", problems_data[d]);
	// names += problems_data[d].name + '\n';
}
$("#0").click();

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
// $(".reset").click(function() {
// 	init_generation = false;
// 	next(true);
// });
