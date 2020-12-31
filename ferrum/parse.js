

$("#code").text(demo_code);
let code = demo_code;



console.log("LEXER OUTPUT");
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
    nl: { match: /\n/, lineBreaks: true }
})

lexer.reset(code);
let l = lexer.next();
while (l) {
    console.log("lexer", l);
    l = lexer.next()
}


const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

parser.feed(demo_code);
console.log(parser.results.length);
console.log("first", parser.results[0]);
console.log("all results", parser.results);

if (parser.results.length > 0) {
    $("#parse_results").text(stringify(parser.results[0]));
}
