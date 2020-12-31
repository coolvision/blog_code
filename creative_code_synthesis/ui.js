
$("#three").append(ctrl_renderer.domElement);
// $("#three").prepend(ctrl_renderer.domElement);
$("#three canvas").attr("id", "ctrl_canvas");
// $("#three canvas").addClass("ba b--gray");
$("#three canvas").addClass("cl fl b--gray ba");
controls = new THREE.TrackballControls(ctrl_camera, ctrl_renderer.domElement);
controls.minDistance = 0.1;
controls.maxDistance = 1000;

var stop_controls = false;
var resizing = false;
var resizeTimer;
$(window).on('resize', function(e) {
	clearTimeout(resizeTimer);
	resizing = true;
	resizeTimer = setTimeout(function() {
		resizing = false;
	}, 250);
});

function animate() {
	requestAnimationFrame(animate);
	if (!resizing && !stop_controls) {
		controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
		ctrl_renderer.render(ctrl_scene, ctrl_camera);
	}
}

$("#canvas_img").hide();
$("#test_code").hide();
// $("#camera_js_code").hide();

$("#json_button").click(function() {
	$("#js_code").hide();
	$("#dsl_code").hide();
	$("#test_code").show();
	$("#json_button").addClass("bg-washed-green");
	$("#js_button").removeClass("bg-washed-green");
	$("#camera_js_code").hide();;
});

$("#js_button").click(function() {
	$("#js_code").show();
	$("#test_code").hide();
	$("#dsl_code").hide();
	$("#js_button").addClass("bg-washed-green");
	$("#json_button").removeClass("bg-washed-green");
	$("#camera_js_code").show();
});
$("#js_button").click();

$("#scroll_on_button").click(function() {
	$("#scroll_on_button").addClass("bg-washed-green");
	$("#scroll_off_button").removeClass("bg-washed-green");
	$(".code_area").css("overflow-y", "scroll");
});

$("#scroll_off_button").click(function() {
	$("#scroll_off_button").addClass("bg-washed-green");
	$("#scroll_on_button").removeClass("bg-washed-green");
	$(".code_area").css("overflow-y", "hidden");
});
$("#scroll_off_button").click();

$("#camera_control_on_button").click(function() {
	$("#camera_control_on_button").addClass("bg-washed-green");
	$("#camera_control_off_button").removeClass("bg-washed-green");
	// stop_controls = false;
	controls.enabled = true;
});

$("#camera_control_off_button").click(function() {
	$("#camera_control_off_button").addClass("bg-washed-green");
	$("#camera_control_on_button").removeClass("bg-washed-green");
	// stop_controls = true;
	controls.enabled = false;
});

let w = window.innerWidth / parseFloat(
  getComputedStyle(
    document.querySelector('body')
  )['font-size']
)

if (w > 48) {
	ctrl_renderer.setSize(500, 500);
	$("#camera_control_on_button").click();
} else {
	$("#camera_control_off_button").click();
}

$("#paste").click(function() {
	let program = addProgram();
	addNewCanvas(program);
	$("#test_code").focus();
});

$("#view_add").click(function() {

	// find seleted canvas
	let canvases = $(".canvas_ui");
	let canvas = "";
	let json_script = "";
	let javascript = "";
	let found = false;
	for (cv of canvases) {
		let jq_cv = $(cv);

		if (jq_cv.attr("active") == "true") {
			console.log("active", jq_cv);
			// update program code
			for (s in programs_list) {
				if (programs_list[s].id == jq_cv.attr("index")) {
					json_script = programs_list[s].json_script;
					javascript = programs_list[s].javascript;
					found = true;
					break;
				}
			}
		}
		if (found) break;
	}

	let x = controls.object.position.x;
	let y = controls.object.position.y;
	let z = controls.object.position.z;
	let tx = controls.target.x;
	let ty = controls.target.y;
	let tz = controls.target.z;
	let ux = controls.object.up.x;
	let uy = controls.object.up.y;
	let uz = controls.object.up.z;

	let code = "camera.position.set("
				+ x + "," + y + "," + z
				+ ");"
				+ "camera.up.set("
				+ ux + "," + uy + "," + uz
				+ ");"
				+ "camera.lookAt("
				+ tx + "," + ty + "," + tz
				+ ");";
	console.log(code);

	let program = addProgram(json_script, javascript, code);
	addNewCanvas(program);
});

$("#toggle_non_shaded").click(function() {

	let img = $(".img_objects_count")[0];

	console.log(img, $(".img_objects_count"))

	if ($(img).is(":visible")) {
		$(".img_objects_count").hide();
	} else {
		$(".img_objects_count").show();
	}
});

$("#update").click(function() {

	if (generating) return;

	// get the program text
	let code_update = $("#test_code").text();
	let camera_code_update = $("#camera_js_code").text();

	// find seleted canvas
	let canvases = $(".canvas_ui");
	let canvas = "";
	for (cv of canvases) {
		let jq_cv = $(cv);
		if (jq_cv.attr("active") == "true") {
			console.log("active", jq_cv);
			// update program code
			for (s in programs_list) {
				if (programs_list[s].id == jq_cv.attr("index")) {

					let expressions = [];
					let javascript = json2js(code_update, expressions);

					// console.log("camera_code_update", camera_code_update);
					render(renderer_A, javascript, camera_code_update);
					let canvas = jq_cv[0];
					ctx = canvas.getContext("2d");
					ctx.drawImage(renderer_A.domElement, 0, 0);

					programs_list[s].json_script = code_update;
					programs_list[s].javascript = javascript;
					programs_list[s].camera_javascript = camera_code_update;
					// programs_list[s].image = canvas.toDataURL();

					if (done_loading) {
						localStorage.setItem("programs_list_v1",
					 		JSON.stringify(programs_list));
					}
					jq_cv.click();
					return;
				}
			}
			return;
		}
	}
});

$("#generate").click(function() {
	// let v = $("#batch_size").val();
	// let n = 1;
	// if (v) {
	// 	n = parseInt(v);
	// }
	// console.log($("#batch_size").val(), v, n, $("#batch_size"));
	generate();
});

// $("#hide_deleted").click(function() {
//
// 	$(".canvas_img_ui").each(function() {
// 		let jq_image_ui = $(this);
// 		// let jq_canvas = jq_image_ui.find("canvas");
// 		let jq_canvas = $(this);
// 		if (jq_canvas.attr("to_delete") == "true") {
// 			jq_canvas.hide();
// 		}
// 	});
// });


$("#delete_non_starred").click(function() {

	console.log("delete_non_starred", $(this));

	$(".canvas_img_ui").each(function() {

		let jq_image_ui = $(this);
		let jq_canvas = jq_image_ui.find("canvas");

		// let jq_canvas = $(this);
		if (jq_canvas.attr("star") == "false" && jq_canvas.attr("to_delete") == "false") {

			let jq_delete = jq_image_ui.find(".delete_button");

			jq_image_ui.hide();
			// jq_canvas.css("opacity", "0.5");
			jq_canvas.attr("to_delete", "true");
			// jq_delete.text("Undo");

			console.log("delete", jq_canvas.attr("index"));

			// save status update
			for (s in programs_list) {
				if (programs_list[s].id == jq_canvas.attr("index")) {
					programs_list[s].to_delete = true;
					break;
				}
			}

			// jq_delete.click();
		}
	});

	if (done_loading) {
		localStorage.setItem("programs_list_v1",
	 		JSON.stringify(programs_list));
	}
});


$("#delete_non_starred_undo").click(function() {

	console.log("delete_non_starred_undo", $(this));

	$(".canvas_img_ui").each(function() {

		let jq_image_ui = $(this);
		let jq_canvas = jq_image_ui.find("canvas");

		// let jq_canvas = $(this);
		if (jq_canvas.attr("to_delete") == "true") {

			let jq_delete = jq_image_ui.find(".delete_button");

			jq_image_ui.show();
			// jq_canvas.css("opacity", "1.0");
			jq_canvas.attr("to_delete", "false");
			// jq_delete.text("Undo");

			console.log("undo delete", jq_canvas.attr("index"));

			// save status update
			for (s in programs_list) {
				if (programs_list[s].id == jq_canvas.attr("index")) {
					programs_list[s].to_delete = false;
					break;
				}
			}

			// jq_delete.click();
		}
	});

	if (done_loading) {
		localStorage.setItem("programs_list_v1",
	 		JSON.stringify(programs_list));
	}
});


// $("#delete_hidden").click(function() {
// 	let deleted_active = false;
// 	$(".canvas_img_ui").each(function() {
// 		let image = $(this);
// 		let canvas = image.find("canvas");
// 		// console.log("checking", image, canvas);
// 		if (canvas.attr("to_delete") == "true") {
// 			$(this).hide();
// 			if (canvas.attr("active") == "true") {
// 				deleted_active = true;
// 			}
// 		}
// 	});
// 	if (deleted_active) {
// 		let canvases = $(".canvas_ui");
// 		// console.log("canvases", canvases);
// 		for (cv of canvases) {
// 			// console.log("cv", cv);
// 			if ($(cv).attr("to_delete") == "false") {
// 				$(cv).click();
// 				break;
// 			}
// 		}
// 	}
// });

$("#stop").click(function() {
	// $("#one").css("overflow-y", "auto");
	// $("#ten").css("height", "");
	generating = false;
	stop_processing = true;
});
