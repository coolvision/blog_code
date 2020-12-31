// Generated automatically by nearley, version 2.19.9
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


let lexer = moo.compile({
    js_expression_inline: /\{\%.*?\%\}/,
    js_expression: /\{\%[^]*?\%\}/,
    js_object: /\{.*?\}/,
    keyword: ['var', 'agent', 'Array'],
    comma: ',',
    lparen: '(',
    rparen: ')',
    receive: '+>',
    send: '->',
    le: '<',
    ge: '>',
    ws: /[ \t]+/,
    label: /.*?:/,
    comment: /\/\/.*?$/,
    number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
    identifier: /[A-Za-z_][A-Za-z0-9_]*/,
    string: /'.*?'/,
    nl: { match: /\n/, lineBreaks: true },
})

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "program$ebnf$1", "symbols": []},
    {"name": "program$ebnf$1", "symbols": ["program$ebnf$1", "empty"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "program$ebnf$2", "symbols": []},
    {"name": "program$ebnf$2", "symbols": ["program$ebnf$2", "expression"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "program", "symbols": ["program$ebnf$1", "program$ebnf$2"], "postprocess": function(d) { return d[1]; }},
    {"name": "empty", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "empty", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "expression", "symbols": ["var"]},
    {"name": "expression", "symbols": ["agent"]},
    {"name": "var$ebnf$1", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "var$ebnf$1", "symbols": ["var$ebnf$1", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "var", "symbols": [{"literal":"var"}, (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("label") ? {type: "label"} : label), (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("number") ? {type: "number"} : number), "var$ebnf$1"], "postprocess": function(d) { return [d[0].value, d[2].value, d[4].value] ; }},
    {"name": "agent$ebnf$1", "symbols": []},
    {"name": "agent$ebnf$1", "symbols": ["agent$ebnf$1", "property"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "agent$ebnf$2", "symbols": []},
    {"name": "agent$ebnf$2", "symbols": ["agent$ebnf$2", "receiver"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "agent$ebnf$3", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "agent$ebnf$3", "symbols": ["agent$ebnf$3", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "agent", "symbols": [{"literal":"agent"}, (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("label") ? {type: "label"} : label), (lexer.has("nl") ? {type: "nl"} : nl), "agent$ebnf$1", "agent$ebnf$2", "agent$ebnf$3"], "postprocess": function(d) { return [d[0].value, d[2].value, d[4], d[5]] ; }},
    {"name": "property", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("label") ? {type: "label"} : label), (lexer.has("ws") ? {type: "ws"} : ws), "property_value", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function(d) { return [d[1].value, d[3]] ; }},
    {"name": "property_value", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": function(d) { return d[0].value; }},
    {"name": "property_value", "symbols": ["array_of_agents"]},
    {"name": "property_value", "symbols": [(lexer.has("js_object") ? {type: "js_object"} : js_object)], "postprocess": function(d) { return d[0].value; }},
    {"name": "array_of_agents", "symbols": [{"literal":"Array"}, (lexer.has("le") ? {type: "le"} : le), (lexer.has("identifier") ? {type: "identifier"} : identifier), (lexer.has("ge") ? {type: "ge"} : ge), (lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("number") ? {type: "number"} : number), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(d) { return [d[0].value,  d[2].value, d[5].value] }},
    {"name": "receiver$ebnf$1", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": id},
    {"name": "receiver$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "receiver$ebnf$2", "symbols": []},
    {"name": "receiver$ebnf$2", "symbols": ["receiver$ebnf$2", "statement"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "receiver", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("receive") ? {type: "receive"} : receive), (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("label") ? {type: "label"} : label), "receiver$ebnf$1", "receiver$ebnf$2"], "postprocess": function(d) { return ["receive", d[3].value, d[5]]; }},
    {"name": "statement$ebnf$1", "symbols": ["args"], "postprocess": id},
    {"name": "statement$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "statement$ebnf$2", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "statement$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "statement$ebnf$3", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": id},
    {"name": "statement$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "statement", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("identifier") ? {type: "identifier"} : identifier), "statement$ebnf$1", "statement$ebnf$2", "statement$ebnf$3"], "postprocess":  function(d) { return d[3]?["id", d[1].value, d[2],
        d[3].value]:["id", d[1].value, d[2]]; } },
    {"name": "statement", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("send") ? {type: "send"} : send)], "postprocess": function(d) { return "send"; }},
    {"name": "statement", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("receive") ? {type: "receive"} : receive)], "postprocess": function(d) { return "receive"; }},
    {"name": "statement$ebnf$4", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "statement$ebnf$4", "symbols": ["statement$ebnf$4", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "statement", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("ge") ? {type: "ge"} : ge), "statement$ebnf$4"], "postprocess": function(d) { return "return_to_sender"; }},
    {"name": "statement$ebnf$5", "symbols": []},
    {"name": "statement$ebnf$5", "symbols": ["statement$ebnf$5", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "statement", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("js_expression_inline") ? {type: "js_expression_inline"} : js_expression_inline), "statement$ebnf$5"], "postprocess": function(d) { return d[1].value; }},
    {"name": "statement$ebnf$6", "symbols": []},
    {"name": "statement$ebnf$6", "symbols": ["statement$ebnf$6", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "statement", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), "args", "statement$ebnf$6"], "postprocess": function(d) { return d[1]; }},
    {"name": "args$ebnf$1", "symbols": []},
    {"name": "args$ebnf$1", "symbols": ["args$ebnf$1", "arg"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "args", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "args$ebnf$1", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(d) { return ["arg", d[1]]; }},
    {"name": "arg$ebnf$1", "symbols": []},
    {"name": "arg$ebnf$1", "symbols": ["arg$ebnf$1", (lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arg$ebnf$2", "symbols": []},
    {"name": "arg$ebnf$2", "symbols": ["arg$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arg", "symbols": ["arg_value", "arg$ebnf$1", "arg$ebnf$2"], "postprocess": function(d) { return d[0]; }},
    {"name": "arg_value", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": function(d) { return d[0].value; }},
    {"name": "arg_value", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": function(d) { return d[0].value; }},
    {"name": "arg_value", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": function(d) { return d[0].value; }}
]
  , ParserStart: "program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
