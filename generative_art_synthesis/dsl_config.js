
var dsl_config =
`{
	"types":
		{"number": "n",
		"boolean": "b",
		"Group": "g",
		"Vector3": "v",
		"Mesh": "m",
		"Geometry": "bg",
		"Color": "r",
		"Material": "mt"},
	"literals": {"number": [0, 1]},
	"variables": {},
	"functions": [
		["new_mesh", "Geometry??", "Material??", "Mesh"],
		["new THREE.BoxBufferGeometry", "number??", "number??", "number??", "Geometry"],
		["new THREE.TetrahedronBufferGeometry", "number??", "Geometry"],

		["new THREE.Color", "number??", "number??", "number??", "Color"],
		["new_MeshStandardMaterial", "Color??", "number??", "number??", "boolean??", "Material"],

		[">=", "number??", "number??", "boolean"],
		["<=", "number??", "number??", "boolean"],

		[".position.set", "Mesh??", "number??", "number??", "number??", ""],
		[".rotation.set", "Mesh??", "number??", "number??", "number??", ""],
		[".scale.set", "Mesh??", "number??", "number??", "number??", ""],

		[".position.set", "Group??", "number??", "number??", "number??", ""],
		[".rotation.set", "Group??", "number??", "number??", "number??", ""],
		[".scale.set", "Group??", "number??", "number??", "number??", ""],

		["+", "number??", "number??", "number"],
		["-", "number??", "number??", "number"],
		["*", "number??", "number??", "number"],
		["/", "number??", "number??", "number"],

		["Math.cos", "number??", "number"],
		["Math.sin", "number??", "number"],
		["Math.tan", "number??", "number"],
		["Math_PI", "number"],

		["if", "boolean??", ["block", "??"], ""],
		["for", "i", ["block", "??", "??", "??"], "number??", "number??", "number??", ""],
		["for", "i", ["block", "??", "??", "??"], "0", "50", "1", ""],

		["new THREE.Group", "Group"],
		[".add", "Group??", "Mesh??", ""],
		["group.add", "Group??", ""],
		["group.add", "Mesh??", ""]
	],
	"variables_n": 20,
	"template": ["??", "??", "??", "??", "??"]
}`;

// var dsl_config =
// `{
// 	"types":
// 		{"number": "n",
// 		"boolean": "b",
// 		"Group": "g",
// 		"Vector3": "v",
// 		"Mesh": "m",
// 		"Geometry": "bg",
// 		"Camera": "c",
// 		"Euler": "e",
// 		"Color": "r",
// 		"Material": "mt"},
// 	"literals": {"number": [0, 1]},
// 	"variables": {},
// 	"functions": [
// 		["new_mesh", "Geometry??", "Material??", "Mesh"],
// 		["new THREE.BoxBufferGeometry", "number??", "number??", "number??", "Geometry"],
// 		["new THREE.TetrahedronBufferGeometry", "number??", "Geometry"],
//
// 		["new THREE.Color", "number??", "number??", "number??", "Color"],
// 		["new_MeshStandardMaterial", "Color??", "number??", "number??", "boolean??", "Material"],
//
// 		[">=", "number??", "number??", "boolean"],
// 		["<=", "number??", "number??", "boolean"],
//
// 		[".position.set", "Mesh??", "number??", "number??", "number??", ""],
// 		[".rotation.set", "Mesh??", "number??", "number??", "number??", ""],
// 		[".scale.set", "Mesh??", "number??", "number??", "number??", ""],
//
// 		[".position.set", "Group??", "number??", "number??", "number??", ""],
// 		[".rotation.set", "Group??", "number??", "number??", "number??", ""],
// 		[".scale.set", "Group??", "number??", "number??", "number??", ""],
//
// 		["+", "number??", "number??", "number"],
// 		["-", "number??", "number??", "number"],
// 		["*", "number??", "number??", "number"],
// 		["/", "number??", "number??", "number"],
//
// 		["Math.cos", "number??", "number"],
// 		["Math.sin", "number??", "number"],
// 		["Math.tan", "number??", "number"],
// 		["Math_PI", "number"],
//
// 		["if", "boolean??", ["block", "??", "??", "??", "??", "??"], ""],
// 		["for", "i", ["block", "??", "??", "??", "??", "??", "??", "??", "??"], "number??", "number??", "number??", ""],
// 		["for", "i", ["block", "??", "??", "??", "??", "??", "??", "??", "??"], "0", "50", "1", ""],
//
// 		["new THREE.Group", "Group"],
// 		[".add", "Group??", "Mesh??", ""],
// 		["group.add", "Group??", ""],
// 		["group.add", "Mesh??", ""]
// 	],
// 	"variables_n": 20,
// 	"template": ["??", "??", "??", "??", "??", "??", "??", "??"]
// }`;
