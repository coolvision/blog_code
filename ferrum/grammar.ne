@{%

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

%}

@lexer lexer

program -> empty:* expression:*
    {% function(d) { return d[1]; } %}
empty -> %nl | %ws

expression -> var | agent

var -> "var" %ws %label %ws %number %nl:+
    {% function(d) { return [d[0].value, d[2].value, d[4].value] ; } %}

agent -> "agent" %ws %label %nl property:* receiver:* %nl:+
    {% function(d) { return [d[0].value, d[2].value, d[4], d[5]] ; } %}

property -> %ws %label %ws property_value %nl
    {% function(d) { return [d[1].value, d[3]] ; } %}

property_value -> %number {% function(d) { return d[0].value; } %}
                | array_of_agents
                | %js_object {% function(d) { return d[0].value; } %}

array_of_agents -> "Array" %le %identifier %ge %lparen %number %rparen
    {% function(d) { return [d[0].value,  d[2].value, d[5].value] } %}

receiver -> %ws %receive %ws %label %nl:? statement:*
    {% function(d) { return ["receive", d[3].value, d[5]]; } %}

statement -> %ws %identifier args:? %comma:? %nl:?
            {% function(d) { return d[3]?["id", d[1].value, d[2],
                                    d[3].value]:["id", d[1].value, d[2]]; } %}
           | %ws %send {% function(d) { return "send"; } %}
           | %ws %receive {% function(d) { return "receive"; } %}
           | %ws %ge %nl:+ {% function(d) { return "return_to_sender"; } %}
           | %ws %js_expression_inline %nl:* {% function(d) { return d[1].value; } %}
           | %ws args %nl:* {% function(d) { return d[1]; } %}

args -> %lparen arg:* %rparen
    {% function(d) { return ["arg", d[1]]; } %}

arg -> arg_value %comma:* %ws:* {% function(d) { return d[0]; } %}
arg_value -> %identifier {% function(d) { return d[0].value; } %}
           | %number {% function(d) { return d[0].value; } %}
           | %string {% function(d) { return d[0].value; } %}
