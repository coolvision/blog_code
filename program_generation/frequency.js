
function count_args(obj, filter) {

	if (!Array.isArray(obj)) {

		// filter.counter++;

	} else {

		// if (obj.length == 1) {
		// 	count_args(obj[0], filter);
		// } else {

			// console.log("check", obj);

			// filter.counter++;

			let expr = obj[0];

			if (!filter.expr.hasOwnProperty(obj[0])) {
				filter.expr[expr] = {};
			}

			for (let i = 0; i < obj.length; i++) {
				let arg = _.cloneDeep(obj[i]);
				if (Array.isArray(arg)) {
					arg = JSON.stringify(arg);
				}
				if (!filter.expr[expr].hasOwnProperty(i)) {
					filter.expr[expr][i] = {};
				}
				if (!filter.expr[expr][i].hasOwnProperty(arg)) {
					filter.expr[expr][i][arg] = 0;
				}
				// console.log("add", expr, i, arg);

				filter.expr[expr][i][arg]++;
				count_args(obj[i], filter);
			}
		// }
	}
}
