
dsl_config.sum_simple =
`{
	"types": {"number": "n", "boolean": "b", "array": "a"},
	"literals": {"number": [0, 1]},
	"variables": {"array": ["input", "output"]},
	"functions": [

		["-", "number??", "number??", "number"],
		["+", "number??", "number??", "number"],

		["get_index", "array??", "number??", "number"],
		["set_index", "output", "number??", "number??", ""]
	],
	"variables_n": 4,
	"template": [["for", "i", ["block", "??"], "0", "input.length", "1"]],
	"io_examples": [
		{"input": [2, 7, 2, 1], "output": [12]},
		{"input": [1, 2, 3, 4, 5, 6, 7, 100], "output": [128]}
	]
}`;

dsl_config.sum =
`{
	"types": {"number": "n", "boolean": "b", "array": "a"},
	"literals": {"number": [0, 1]},
	"variables": {"array": ["input", "output"]},
	"functions": [

		[".length_", "array??", "number"],

		["-", "number??", "number??", "number"],
		["+", "number??", "number??", "number"],

		["for", "i", ["block", "??"], "in", "array??", ""],

		["if", [">", "number??", "number??"], ["block", "??"], ""],
		["if", ["<", "number??", "number??"], ["block", "??"], ""],

		["get_index", "array??", "number??", "number"],
		["set_index", "output", "number??", "number??", ""]
	],
	"variables_n": 3,
	"template": ["??"],
	"io_examples": [
		{"input": [2, 7, 2, 1], "output": [12]},
		{"input": [1, 2, 3, 4, 5, 6, 7, 100], "output": [128]}
	]
}`;
