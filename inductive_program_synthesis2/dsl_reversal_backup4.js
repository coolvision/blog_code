var dsl_config = {};

dsl_config.reversal_simple =
`{
	"types": {"number": "n", "boolean": "b", "array": "a"},
	"literals": {"number": [0, 1]},
	"variables": {"array": ["input", "output"]},
	"functions": [

		["input.length_", "number"],

		["-", "number??", "number??", "number"],
		["+", "number??", "number??", "number"],
		["for", "i", ["block", "??"], "in", "array??", ""],

		["get_index", "input", "number??", "number"],
		["set_index", "output", "number??", "number??", ""]
	],
	"variables_n": 4,
	"template": ["for", "i", ["block", "??"], "in", "input"],
	"io_examples": [
		{"input": [1, 2, 3, 4, 5, 6, 7, 8, 9], "output": [9, 8, 7, 6, 5, 4, 3, 2, 1]},
		{"input": [5, 2, 7, 6], "output": [6, 7, 2, 5]}
	]
}`;

dsl_config.reversal =
`{
	"types": {"number": "n", "boolean": "b", "array": "a"},
	"literals": {"number": [0, 1, 2]},
	"variables": {"array": ["input"]},
	"functions": [
		["output.push", "number??", ""],
		["+", "number??", "number??", "number"],
		["-", "number??", "number??", "number"],
		["%", "number??", "number??", "number"],
		[">=", "number??", "number??", "boolean"],
		["==", "number??", "number??", "boolean"],
		["Boolean", "number??", "boolean"],
		["!", "boolean??", "boolean"],
		["get_index", "array??", "number??", "number"],
		["if", "boolean??", ["block", "??"], ""]
	],
	"variables_n": 2,
	"template": ["for", "i", ["block", "??"], "in", "input"],
	"io_examples": [
		{"input": [1, 2, 3, 4, 5, 6, 7, 8, 9], "output": [9, 8, 7, 6, 5, 4, 3, 2, 1]},
		{"input": [5, 2, 7, 6], "output": [6, 7, 2, 5]}
	]
}`;

		// ["set_index", "output", "number??", "number??", ""],
		// ["<", "number??", "number??", "boolean"],
		// [">", "number??", "number??", "boolean"],
		// ["==", "number??", "number??", "boolean"],
		// ["if", "boolean??", ["block", "??"], ""]



dsl_config.reversal_full =
`{
	"types": {"number": "n", "boolean": "b", "array": "a"},
	"literals": {"number": [0, 1]},
	"variables": {"array": ["input", "output"]},
	"functions": [

		["-", "number??", "number??", "number"],
		["+", "number??", "number??", "number"],
		["*", "number??", "number??", "number"],
		["/", "number??", "number??", "number"],
		[">", "number??", "number??", "boolean"],
		["<", "number??", "number??", "boolean"],
		["==", "number??", "number??", "boolean"],

		["for", "i", ["block", "??"], "in", "array??", ""],
		["if", "boolean??", ["block", "??"], ""],

		[".length_", "array??", "number"],
		["get_index", "array??", "number??", "number"],
		["set_index", "output", "number??", "number??", ""]
	],
	"variables_n": 4,
	"template": ["??"],
	"io_examples": [
		{"input": [1, 2, 3, 4, 5, 6], "output": [6, 5, 4, 3, 2, 1]},
		{"input": [5, 2, 7, 6], "output": [6, 7, 2, 5]}
	]
}`;
