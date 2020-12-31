
dsl_config.max_simple =
`{
	"types": {"number": "n", "boolean": "b", "array": "a"},
	"literals": {"number": [0, 1]},
	"variables": {"array": ["input", "output"]},
	"functions": [

		[">", "number??", "number??", "boolean"],
		["if", "boolean??", ["block", "??"], ""],

		["get_index", "array??", "number??", "number"],
		["set_index", "output", "number??", "number??", ""]
	],
	"variables_n": 3,
	"template": [["for", "i", ["block", "??"], "0", "input.length", "1"]],
	"io_examples": [
		{"input": [4, 3, 8, 2, 5, 1], "output": [8]},
		{"input": [1, 1, 1, 1, 1, 20, 0, 0], "output": [20]}
	]
}`;


dsl_config.max =
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
		{"input": [4, 3, 8, 2, 5, 1], "output": [8]},
		{"input": [1, 1, 1, 1, 1, 20, 0, 0], "output": [20]}
	]
}`;
