function addProgram(json_script = "", javascript = "",
		camera_javascript = "") {

	let id = programs_list.length;
	let today = new Date();
	let time = today.toLocaleDateString();
	programs_list.push({
		json_script: json_script,
		// javascript: javascript,
		// camera_javascript: camera_javascript,
		id: id,
		time: time,
		star: false
	});
	if (done_loading) {
		localStorage.setItem("programs_list_v1",
	 		JSON.stringify(programs_list));
	}

	return programs_list[programs_list.length - 1];
}
