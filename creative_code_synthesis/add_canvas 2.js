
var render_all = false;

function addNewCanvas(program, do_render = true) {

	// console.log("addNewCanvas", program)

	let id = program.id;
	let time = program.time;

	$("#progress").css("width", "0");

	let jq_canvas_img = $("#canvas_img").clone().prop('id', "canvas_img" + id);
	$("#images_container").prepend(jq_canvas_img);
	jq_canvas_img.show();
	let jq_canvas = jq_canvas_img.find("canvas");
	jq_canvas.attr("id", "canvas" + id);
	jq_canvas.attr("index", id);
	jq_canvas.attr("width", image_size);
	jq_canvas.attr("height", image_size);
	let jq_objects_n = jq_canvas_img.find(".objects_n");
	jq_objects_n.text(program.objects_n);

	// let jq_canvas_edges = jq_canvas_img.find("img.vis_image");
	// jq_canvas_edges.attr("src", edges_img_src);

	jq_canvas.attr("star", program.star);
	let jq_star = jq_canvas_img.find(".star_button");
	if (program.star) {
		jq_star.css("color", "#ff0000");
		jq_star.text("★ saved");
	} else {
		jq_star.css("color", "");
		jq_star.text("★ save")
	}

	let found = false;
	if (!program.image || do_render || render_all) {

		let javascript = json2js(program.json_script, [], true);

		// console.log("program.javascript", program.javascript)

		set_count_objects = true;
		render(renderer_B, javascript, "");
		let img1 = renderer_B.domElement.toDataURL('image/png');
		let jq_img_objects_count = jq_canvas_img.find("img.img_objects_count");
		jq_img_objects_count.attr("src", img1);

		let objects_n = getObjectsNumber(renderer_B);
		program.objects_n = objects_n;
		jq_objects_n.text(objects_n);

		set_count_objects = false;
		render(renderer_A, javascript, "");
		let imgData = renderer_A.domElement.toDataURL('image/png');

		// console.log("imgData", imgData);


		var img = new Image;
		let canvas = jq_canvas[0];
		ctx = canvas.getContext("2d");
		img.onload = function(){
		  ctx.drawImage(img, 0, 0);
		};
		img.src = imgData;

		// program.image = imgData;
		// program.objects_count_image = img1;
		// program.image = "";
		// program.objects_count_image = "";

		for (s in programs_list) {
			if (programs_list[s].id == id) {
				// programs_list[s].image = imgData;
				// programs_list[s].objects_count_image = img1;
				// programs_list[s].image = "";
				// programs_list[s].objects_count_image = "";
				found = true;
				break;
			}
		}

		// if (done_loading && found) {
		// 	localStorage.setItem("programs_list_v1",
		//  		JSON.stringify(programs_list));
		// }

	}
	//  else {
	//
	// 	let image = program.image;
	//
	// 	var img = new Image;
	// 	let canvas = jq_canvas[0];
	// 	ctx = canvas.getContext("2d");
	// 	img.onload = function(){
	// 	  ctx.drawImage(img,0,0);
	// 	};
	// 	img.src = image;
	//
	// 	let img1 = program.objects_count_image;
	// 	let jq_img_objects_count = jq_canvas_img.find("img.img_objects_count");
	// 	jq_img_objects_count.attr("src", img1);
	// }

	// programs_list.push(program);

	// console.log("finally", JSON.parse(JSON.stringify(programs_list)));


	jq_canvas.click(function() {

		did_click = true;

		let json_script = "";
		let javascript = "";
		let camera_javascript = "";
		for (s in programs_list) {
			if (programs_list[s].id == $(this).attr("index")) {
				json_script = programs_list[s].json_script;
				// javascript = programs_list[s].javascript;
				// camera_javascript = programs_list[s].camera_javascript;
				javascript = json2js(json_script, [], true);
				break;
			}
		}

		// if (typeof camera_javascript == 'undefined')
		camera_javascript = "";

		$("#test_code").text(json_script);
		$("#js_code").text(javascript);
		$("#camera_js_code").text(camera_javascript);

		$(".canvas_ui").css("border-color", "rgba(100,100,100,.2)");
		$(this).css("border-color", "#e7040f");
		$(".canvas_ui").attr("active", "false");
		$(this).attr("active", "true");

		controlRender(javascript, camera_javascript);
	});

	jq_canvas.click();

	if (!found) {
		programs_list.push(program);
	}
	if (done_loading || render_all) {
		localStorage.setItem("programs_list_v1",
	 		JSON.stringify(programs_list));
	}


	// let jq_button = jq_canvas_img.find(".delete_button");
	// jq_button.attr("id", "delete" + id);
	// jq_button.click(function() {
	// 	let canvas = $(this).parent().find("canvas");
	// 	if (canvas.attr("to_delete") == "false") {
	// 		canvas.css("opacity", "0.5");
	// 		canvas.attr("to_delete", "true");
	// 		$(this).text("Undo");
	// 		// save status update
	// 		for (s in programs_list) {
	// 			if (programs_list[s].id == canvas.attr("index")) {
	// 				programs_list[s].to_delete = true;
	// 				break;
	// 			}
	// 		}
	// 		if (done_loading) {
	// 			localStorage.setItem("programs_list_v1",
	// 		 		JSON.stringify(programs_list));
	// 		}
	// 	} else {
	// 		canvas.css("opacity", "1.0");
	// 		canvas.attr("to_delete", "false");
	// 		$(this).text("Delete");
	// 		// save status update
	// 		for (s in programs_list) {
	// 			if (programs_list[s].id == canvas.attr("index")) {
	// 				programs_list[s].to_delete = false;
	// 				break;
	// 			}
	// 		}
	// 		if (done_loading) {
	// 			localStorage.setItem("programs_list_v1",
	// 		 		JSON.stringify(programs_list));
	// 		}
	// 	}
	// });

	jq_button = jq_canvas_img.find(".star_button");
	jq_button.attr("id", "star" + id);
	jq_button.click(function() {
		let canvas = $(this).parent().find(".canvas_ui");

		if (canvas.attr("star") == "false") {
			canvas.attr("star", "true");
			// $(this).css("color", "#ff6300");
			$(this).css("color", "#ff0000");
			$(this).text("★ saved");
			// save status update
			for (s in programs_list) {
				if (programs_list[s].id == canvas.attr("index")) {
					programs_list[s].star = true;
					break;
				}
			}
			if (done_loading) {
				localStorage.setItem("programs_list_v1",
			 		JSON.stringify(programs_list));
			}
		} else {
			canvas.attr("star", "false");
			// $(this).css("color", "");
			$(this).css("color", "");
			$(this).text("★ save")

			// save status update
			for (s in programs_list) {
				if (programs_list[s].id == canvas.attr("index")) {
					programs_list[s].star = false;
					break;
				}
			}
			if (done_loading) {
				localStorage.setItem("programs_list_v1",
			 		JSON.stringify(programs_list));
			}
		}
	});
}

function random_rgb() {
	var o = Math.round, r = Math.random, s = 255;
	return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
}
