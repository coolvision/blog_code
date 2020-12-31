
export function format_message(result, current_i = 0) {
	let result_str = "";

	if (result == undefined) {
		return result_str;
	}

	if (Array.isArray(result)) {
		if (result.length == 0) {
			// result_str += 'empty';
		} else {
			for (let i in result) {
				// if (!result[i].hasOwnProperty('value')) continue;
				// if (i == current_i) {
				// 	result_str += '<span class="green">'
				// } else {
					// result_str += '<span>'
				// }
				result_str += JSON.stringify(result[i], function(key, val) {
				    return val.toFixed ? Number(val.toFixed(2)) : val;
				})
				if (result[i].used) result_str += ' +';
				// result_str += '</span>'
				result_str += '\n';
			}
		}
	} else if (typeof result === 'object') {
		result_str += JSON.stringify(result, function(key, val) {
		    return val.toFixed ? Number(val.toFixed(2)) : val;
		}) + '\n';
	} else {
		if (result == undefined) {
			// result_str += 'empty';
		} else {
			result_str += result;
		}
	}
	return result_str;
}

export function show_result(el, result, title, append = false) {

	// let result_str = format_message(result);
	//
	// let html = "";
	// if (append) html = $('#' + el.id + '_info').html();
	// html += '<div class="f7">'+result_str+'</div>';
	// $('#' + el.id + '_info').html(html);
}

export function show_stream(name, message) {

	// let message_str = format_message(message.current);

	// if (message.value.length <= 0) return;

	let queue_str = format_message(message.value);

	// console.log("show_stream", name, message, Array.isArray(message.value), queue_str)

	let html = "";

	let b1 = $('#streams_render').find('#'+name);
	if (b1.length == 0) {
		b1 = $('#streams_render').append('<div class="stream_render f6 lh-content mr3" id="'+name+'">');
		// console.log("add container", b1)
	}

	let type = message.type;
	if (message.type == 'iterator') {
		type += ', ' + message.current_i;
	}

	// html += '<div class="pv1" id="'+el.name+'">';
	html += '<h3 class="f6 fw5 mb1">' + name + ' ' + type + '</h3>';
	html += '<div class="">';
	html += '<div class="el_info">'+queue_str+'</div>';
	html += '</div>';

	$('#streams_render #' + name).html(html);
}
