// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function(mod){if("object"==("undefined"===typeof exports?"undefined":babelHelpers.typeof(exports))&&"object"==("undefined"===typeof module?"undefined":babelHelpers.typeof(module)))// CommonJS
mod(require("../../lib/codemirror"),require("../htmlmixed/htmlmixed"));else if("function"==typeof define&&define.amd)// AMD
define(["../../lib/codemirror","../htmlmixed/htmlmixed"],mod);else// Plain browser env
mod(CodeMirror)})(function(CodeMirror){"use strict";var paramData={noEndTag:!0/* ignoreName */ /* skipSlots */,soyState:"param-def"},tags={alias:{noEndTag:!0},delpackage:{noEndTag:!0},namespace:{noEndTag:!0,soyState:"namespace-def"},"@param":paramData,"@param?":paramData,"@inject":paramData,"@inject?":paramData,"@state":paramData,"@state?":paramData,template:{soyState:"templ-def",variableScope:!0},literal:{},msg:{},fallbackmsg:{noEndTag:!0,reduceIndent:!0},select:{},plural:{},let:{soyState:"var-def"},if:{},elseif:{noEndTag:!0,reduceIndent:!0},else:{noEndTag:!0,reduceIndent:!0},switch:{},case:{noEndTag:!0,reduceIndent:!0},default:{noEndTag:!0,reduceIndent:!0},foreach:{variableScope:!0,soyState:"var-def"},ifempty:{noEndTag:!0,reduceIndent:!0},for:{variableScope:!0,soyState:"var-def"},call:{soyState:"templ-ref"},param:{soyState:"param-ref"},print:{noEndTag:!0},deltemplate:{soyState:"templ-def",variableScope:!0},delcall:{soyState:"templ-ref"},log:{},element:{variableScope:!0}},indentingTags=Object.keys(tags).filter(function(tag){return!tags[tag].noEndTag||tags[tag].reduceIndent});CodeMirror.defineMode("soy",function(config){var textMode=CodeMirror.getMode(config,"text/plain"),modes={html:CodeMirror.getMode(config,{name:"text/html",multilineTagIndentFactor:2,multilineTagIndentPastTag:/* ignoreName */ /* eat */!1/* skipSlots */ /* skipSlots */}),attributes:textMode,text:textMode,uri:textMode,trusted_resource_uri:textMode,css:CodeMirror.getMode(config,"text/css"),js:CodeMirror.getMode(config,{name:"text/javascript",statementIndent:2*config.indentUnit})};function last(array){return array[array.length-1]}function tokenUntil(stream,state,untilRegExp){if(stream.sol()){for(var indent=0;indent<state.indent;indent++){if(!stream.eat(/\s/))break}if(indent)return null}var oldString=stream.string,match=untilRegExp.exec(oldString.substr(stream.pos));if(match){// We don't use backUp because it backs up just the position, not the state.
// This uses an undocumented API.
stream.string=oldString.substr(0,stream.pos+match.index)}var result=stream.hideFirstChars(state.indent,function(){var localState=last(state.localStates);return localState.mode.token(stream,localState.state)});stream.string=oldString;return result}function contains(list,element){while(list){if(list.element===element)return!0;list=list.next}return!1}function prepend(list,element){return{element:element,next:list}}function popcontext(state){if(!state.context)return;if(state.context.scope){state.variables=state.context.scope}state.context=state.context.previousContext}// Reference a variable `name` in `list`.
// Let `loose` be truthy to ignore missing identifiers.
function ref(list,name,loose){return contains(list,name)?"variable-2":loose?"variable":"variable-2 error"}// Data for an open soy tag.
function Context(previousContext,tag,scope){this.previousContext=previousContext;this.tag=tag;this.kind=null;this.scope=scope}return{startState:function startState(){return{soyState:[],templates:null,variables:prepend(null,"ij"),scopes:null,indent:0,quoteKind:null,context:null,localStates:[{mode:modes.html,state:CodeMirror.startState(modes.html)}]}},copyState:function copyState(state){return{tag:state.tag,// Last seen Soy tag.
soyState:state.soyState.concat([]),templates:state.templates,variables:state.variables,context:state.context,indent:state.indent,// Indentation of the following line.
quoteKind:state.quoteKind,localStates:state.localStates.map(function(localState){return{mode:localState.mode,state:CodeMirror.copyState(localState.mode,localState.state)}})}},token:function token(stream,state){var match;switch(last(state.soyState)){case"comment":if(stream.match(/^.*?\*\//)){state.soyState.pop()}else{stream.skipToEnd()}if(!state.context||!state.context.scope){for(var paramRe=/@param\??\s+(\S+)/g,current=stream.current(),match;match=paramRe.exec(current);){state.variables=prepend(state.variables,match[1])}}return"comment";case"string":var match=stream.match(/^.*?(["']|\\[\s\S])/);if(!match){stream.skipToEnd()}else if(match[1]==state.quoteKind){state.quoteKind=null;state.soyState.pop()}return"string";}if(!state.soyState.length||"literal"!=last(state.soyState)){if(stream.match(/^\/\*/)){state.soyState.push("comment");return"comment"}else if(stream.match(stream.sol()?/^\s*\/\/.*/:/^\s+\/\/.*/)){return"comment"}}switch(last(state.soyState)){case"templ-def":if(match=stream.match(/^\.?([\w]+(?!\.[\w]+)*)/)){state.templates=prepend(state.templates,match[1]);state.soyState.pop();return"def"}stream.next();return null;case"templ-ref":if(match=stream.match(/(\.?[a-zA-Z_][a-zA-Z_0-9]+)+/)){state.soyState.pop();// If the first character is '.', it can only be a local template.
if("."==match[0][0]){return"variable-2"}// Otherwise
return"variable"}stream.next();return null;case"namespace-def":if(match=stream.match(/^\.?([\w\.]+)/)){state.soyState.pop();return"variable"}stream.next();return null;case"param-def":if(match=stream.match(/^\w+/)){state.variables=prepend(state.variables,match[0]);state.soyState.pop();state.soyState.push("param-type");return"def"}stream.next();return null;case"param-ref":if(match=stream.match(/^\w+/)){state.soyState.pop();return"property"}stream.next();return null;case"param-type":if("}"==stream.peek()){state.soyState.pop();return null}if(stream.eatWhile(/^([\w]+|[?])/)){return"type"}stream.next();return null;case"var-def":if(match=stream.match(/^\$([\w]+)/)){state.variables=prepend(state.variables,match[1]);state.soyState.pop();return"def"}stream.next();return null;case"tag":var endTag="/"==state.tag[0],tagName=endTag?state.tag.substring(1):state.tag,tag=tags[tagName];if(stream.match(/^\/?}/)){var selfClosed="/}"==stream.current();if(selfClosed&&!endTag){popcontext(state)}if("/template"==state.tag||"/deltemplate"==state.tag){state.variables=prepend(null,"ij");state.indent=0}else{state.indent-=config.indentUnit*(selfClosed||-1==indentingTags.indexOf(state.tag)?2:1)}state.soyState.pop();return"keyword"}else if(stream.match(/^([\w?]+)(?==)/)){if(state.context&&state.context.tag==tagName&&"kind"==stream.current()&&(match=stream.match(/^="([^"]+)/,!1))){var kind=match[1];state.context.kind=kind;var mode=modes[kind]||modes.html,localState=last(state.localStates);if(localState.mode.indent){state.indent+=localState.mode.indent(localState.state,"","")}state.localStates.push({mode:mode,state:CodeMirror.startState(mode)})}return"attribute"}else if(match=stream.match(/([\w]+)(?=\()/)){return"variable callee"}else if(match=stream.match(/^["']/)){state.soyState.push("string");state.quoteKind=match;return"string"}if(stream.match(/(null|true|false)(?!\w)/)||stream.match(/0x([0-9a-fA-F]{2,})/)||stream.match(/-?([0-9]*[.])?[0-9]+(e[0-9]*)?/)){return"atom"}if(stream.match(/(\||[+\-*\/%]|[=!]=|\?:|[<>]=?)/)){// Tokenize filter, binary, null propagator, and equality operators.
return"operator"}if(match=stream.match(/^\$([\w]+)/)){return ref(state.variables,match[1])}if(match=stream.match(/^\w+/)){return /^(?:as|and|or|not|in)$/.test(match[0])?"keyword":null}stream.next();return null;case"literal":if(stream.match(/^(?=\{\/literal})/)){state.indent-=config.indentUnit;state.soyState.pop();return this.token(stream,state)}return tokenUntil(stream,state,/\{\/literal}/);}if(stream.match(/^\{literal}/)){state.indent+=config.indentUnit;state.soyState.push("literal");state.context=new Context(state.context,"literal",state.variables);return"keyword";// A tag-keyword must be followed by whitespace, comment or a closing tag.
}else if(match=stream.match(/^\{([/@\\]?\w+\??)(?=$|[\s}]|\/[/*])/)){var prevTag=state.tag;state.tag=match[1];var endTag="/"==state.tag[0],indentingTag=!!tags[state.tag],tagName=endTag?state.tag.substring(1):state.tag,tag=tags[tagName];if("/switch"!=state.tag)state.indent+=((endTag||tag&&tag.reduceIndent)&&"switch"!=prevTag?1:2)*config.indentUnit;state.soyState.push("tag");var tagError=!1;if(tag){if(!endTag){if(tag.soyState)state.soyState.push(tag.soyState)}// If a new tag, open a new context.
if(!tag.noEndTag&&(indentingTag||!endTag)){state.context=new Context(state.context,state.tag,tag.variableScope?state.variables:null);// Otherwise close the current context.
}else if(endTag){if(!state.context||state.context.tag!=tagName){tagError=!0}else if(state.context){if(state.context.kind){state.localStates.pop();var localState=last(state.localStates);if(localState.mode.indent){state.indent-=localState.mode.indent(localState.state,"","")}}popcontext(state)}}}else if(endTag){// Assume all tags with a closing tag are defined in the config.
tagError=!0}return(tagError?"error ":"")+"keyword";// Not a tag-keyword; it's an implicit print tag.
}else if(stream.eat("{")){state.tag="print";state.indent+=2*config.indentUnit;state.soyState.push("tag");return"keyword"}return tokenUntil(stream,state,/\{|\s+\/\/|\/\*/)},indent:function indent(state,textAfter,line){var indent=state.indent,top=last(state.soyState);if("comment"==top)return CodeMirror.Pass;if("literal"==top){if(/^\{\/literal}/.test(textAfter))indent-=config.indentUnit}else{if(/^\s*\{\/(template|deltemplate)\b/.test(textAfter))return 0;if(/^\{(\/|(fallbackmsg|elseif|else|ifempty)\b)/.test(textAfter))indent-=config.indentUnit;if("switch"!=state.tag&&/^\{(case|default)\b/.test(textAfter))indent-=config.indentUnit;if(/^\{\/switch\b/.test(textAfter))indent-=config.indentUnit}var localState=last(state.localStates);if(indent&&localState.mode.indent){indent+=localState.mode.indent(localState.state,textAfter,line)}return indent},innerMode:function innerMode(state){if(state.soyState.length&&"literal"!=last(state.soyState))return null;else return last(state.localStates)},electricInput:/^\s*\{(\/|\/template|\/deltemplate|\/switch|fallbackmsg|elseif|else|case|default|ifempty|\/literal\})$/,lineComment:"//",blockCommentStart:"/*",blockCommentEnd:"*/",blockCommentContinue:" * ",useInnerComments:!1,fold:"indent"}},"htmlmixed");CodeMirror.registerHelper("wordChars","soy",/[\w$]/);CodeMirror.registerHelper("hintWords","soy",Object.keys(tags).concat(["css","debugger"]));CodeMirror.defineMIME("text/x-soy","soy")});