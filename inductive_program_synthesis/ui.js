
function select_demo(demo_id_) {
	if (demo_id_ == "demo3") {
		selected_demo = "sum_simple";
		// selected_demo = "sum";
	} else if (demo_id_ == "demo4") {
		// selected_demo = "max_simple";
		selected_demo = "max";
	}  else {
		selected_demo = "reversal";
	}
	if (demo_id_ != demo_id) {
		init_generation = false;
	}
	console.log("select_demo", demo_id, demo_id_, selected_demo, init_generation);
	demo_id = demo_id_;
}

select_demo("demo1");
next(true, true);
select_demo("demo2");
next(true, true);
select_demo("demo3");
next(true, true);
select_demo("demo4");
next(true, true);
select_demo("demo5");
next(true, true);

$(".step").click(function() {
	if (generating) {
		stop_processing = true;
	}
	let demo_id = $(this).parent().attr("id");
 	select_demo(demo_id);
	console.log(demo_id, selected_demo, stop_processing);
	if (!init_generation) {
		next(true);
		next(true);
	} else {
		next(true);
	}
});
$(".generate").click(function() {
	select_demo($(this).parent().attr("id"));
	console.log("generate", "generating", generating);
	if (!generating) {
		console.log("generate();");
		generate();
	}
});
$(".stop").click(function() {
	stop_processing = true;
	console.log("stop", "stop_processing", stop_processing);
});
$(".reset").click(function() {
	init_generation = false;
	next(true);
});
