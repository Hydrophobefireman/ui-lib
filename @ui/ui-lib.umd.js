!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((e=e||self).uiLib={})}(this,(function(e){var n="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,t={},o=[],r=t.constructor,i=t.hasOwnProperty,a="assign"in r?r.assign:function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var o in t)i.call(t,o)&&(e[o]=t[o])}return e};function l(e,n,t,o){void 0===o&&(o=!1);var r=[];return function e(n,i){var a=n,l=Array.isArray(a),u=0;for(a=l?a:a[Symbol.iterator]();;){var s;if(l){if(u>=a.length)break;s=a[u++]}else{if((u=a.next()).done)break;s=u.value}var p=s;Array.isArray(p)&&i>0?e(p,i-1):o&&null==p||r.push(t?t(p):p)}}(e,~~n||1),r}var u=function(e,n,t){return n in e?e[n]=null==t?"":t:null==t?e.removeAttribute(n):e.setAttribute(n,t)},s=function(e){return"o"===e[0]&&"n"===e[1]};function p(e,n){if(null!=n){var t,o,r;(o=null!=(t=n._vNode))&&(r=n._vNode._nextDomNode),(n.parentNode!==e||t._reorder)&&(null!=r?e.insertBefore(n,r):t._reorder||e.appendChild(n));var i=n.previousSibling,a=n.nextSibling;if(i!=a){if(null!=i){var l=i._vNode;null!=l&&l._nextDomNode!==n&&c(l,n,"_nextDomNode")}if(null!=a){var u=a._vNode;null!=u&&u._nextDomNode!==n&&c(u,n,"_prevDomNode")}o&&(t._prevDomNode=i,t._nextDomNode=a)}}}function c(e,n,t){null!=e&&(e[t]=n,c(e._prevVnode,n,t))}function f(e,n){for(var t=arguments.length,o=new Array(t>2?t-2:0),r=2;r<t;r++)o[r-2]=arguments[r];if(null==e||"boolean"==typeof e)return null;n=null==n?{}:a({},n),o.length&&(o=l(o,Infinity),n.children=o);var i=n.ref;i&&delete n.ref;var u=n.key;u&&delete n.key;var p={};for(var c in n)s(c)&&(p[c.substr(2).toLowerCase()]=n[c]);return m(e,n,p,u,i)}function d(){}function m(e,n,t,o,r){var i={type:"string"==typeof e?e.toLowerCase():e,props:n,events:t,key:o,_reorder:!1,ref:r,_children:null,_dom:null,_component:null,__uAttr:null,_nextDomNode:null,_prevDomNode:null,_prevVnode:null};return i.__uAttr=i}function v(e){if(null==e||"boolean"==typeof e)return null;if("string"==typeof e||"number"==typeof e)return m(null,String(e));if(Array.isArray(e))return f(d,null,e);if(null!=e._dom){var n=m(e.type,e.props,e.events,e.key,null);return n._dom=e._dom,n}return e}function _(e,n){for(var t=arguments.length,o=new Array(t>2?t-2:0),r=2;r<t;r++)o[r-2]=arguments[r];if(e&&(e.__currentLifeCycle=n,null!=e[n])){var i=function(){e[n].apply(e,o)};if("undefined"!=typeof Promise)return Promise.resolve(i()).catch((function(n){return e.componentDidCatch&&e.componentDidCatch(n)}));try{i()}catch(n){e.componentDidCatch&&e.componentDidCatch(n)}}}function h(e){if(e!==t&&null!=e){e._prevVnode&&h(e._prevVnode);var n=e._dom,r=e._component;if(_(r,"componentWillUnmount",!0),null!=r&&(r.base=r._vnode=null),n){null!=e._nextDomNode&&c(e._nextDomNode._vNode,null,"_prevDomNode"),null!=e._prevDomNode&&c(e._prevDomNode._vNode,null,"_nextDomNode");var i=e._children||o,a=Array.isArray(i),l=0;for(i=a?i:i[Symbol.iterator]();;){var u;if(a){if(l>=i.length)break;u=i[l++]}else{if((l=i.next()).done)break;u=l.value}h(u)}if(e._prevVnode=e._component=e._dom=e._prevDomNode=e._nextDomNode=null,Array.isArray(n))for(var s;s=o.pop.call(n||o);)y(s);else y(n);n.onclick=n._component=n._listeners=n._prevVnode=n._vNode=n._currentProps=null}}}function y(e){var n=e.parentNode;n&&n.removeChild(e)}function b(e){for(var n;n=e.pop();)_(n,"componentDidMount"),n._didMount=!0}function g(e,n,o,r){var i,a=e.type;if(r)"string"==typeof e.props?i=document.createTextNode(e.props):x(i=document.createElement(a),e,t);else{if(a!==n.type)return g(e,null,null,!0);if(i=o,o instanceof Text){var l=e.props;o.nodeValue!==l&&(o.nodeValue=l)}else x(i,e,n)}return null!=e._prevVnode&&(e._prevVnode._dom=i),i}var C=function(e){return"key"!==e&&"children"!==e};function x(e,n,o){if(!(e instanceof Text)){var r=n.props,i=e._currentProps||t;e._currentProps=r;var a=n.events,l=null!=o?o.events:t;for(var p in i)p in r||u(e,p,null);for(var c in r)if(!s(c)&&C(c)){var f=r[c],m=i[c];f!==m&&("className"!==(c="class"===c?"className":c)?"style"!==c?u(e,c,f):A(e,f,m):N(e,f,m))}!function(e,n,o){if(e!=n){for(var r in null==n&&(n=t),null==e?e=t:(o.onclick=d,o._listeners={}),e){var i=e[r];n[r]!==i&&null!=i&&(o.addEventListener(r,S),o._listeners[r]=i)}for(var a in n)null==e[a]&&(delete o._listeners[a],o.removeEventListener(a,S))}}(a,l,e)}}function N(e,n,t){var o=Array.isArray;o(n)&&(n=n.join(" ").trim()),o(t)&&(t=t.join(" ").trim()),n!==t&&u(e,"className",n)}function A(e,n,t){t=t||"";var o=e.style;if("string"!=typeof n){var r="string"==typeof t;if(r)o.cssText="";else for(var i in t)i in n||(o[i]="");for(var a in n){var l=n[a];(r||l!==t[a])&&(o[a]=l)}}else o.cssText=n}function S(e){return this._listeners[e.type].call(this,e)}function P(e,n,o,r,i,a,l){for(var u=e._children,s=u.length,c=n.length,f=[],d=0;d<Math.max(s,c);d++){var m=u[d],v=n[d]||t,_=void 0;if(null!=m){var y=m._nextDomNode||v._nextDomNode;if(v===t&&null!=(_=k(n,c,d))){var b=_._dom;y=Array.isArray(b)?b[0]:b,m._reorder=!0}m._nextDomNode=y;var g=L(o,m,v,r,i,a,l);Array.isArray(g)||(p(o,g),f.push(g))}else null!=v&&h(v)}return f}function k(e,n,t){for(var o;t<n&&!(o=e[t]);t++);return o}var D=[],w=function(){function e(e,n){this.props=e,this.context=n,this.state={}}var o=e.prototype;return o.render=function(e,n){},o.setState=function(e){this._nextState=a({},this.state||t),this._oldState=a({},this._nextState);var o,r="function"==typeof e?e=e(this._nextState,this.props):e;null!=r&&(a(this._nextState,r),a(this.state,this._nextState),(o=this)._dirty=!0,1===D.push(o)&&(null!=window.requestAnimationFrame?window.requestAnimationFrame(U):n(U)))},o.forceUpdate=function(e){var n=this.parentDom,t=[];if(n){var o=this._vnode;this.base=L(n,o,o,this.context,t,this,!1!==e),this.base instanceof Node&&!this.base.parentNode&&p(n,this.base)}e&&e(),b(t)},e}();function U(){var e;for(D.sort((function(e,n){return e._depth-n._depth}));e=D.pop();)e._dirty&&(e._nextState=null,e._dirty=!1,e.forceUpdate(!1))}function V(e,n,t){return this.constructor(e,t)}function L(e,n,r,i,l,u,s){if("boolean"==typeof n&&(n=null),null==r||null==n||r.type!==n.type){if(null!=r&&r!==t&&h(r),null==n)return null;r=t}var p=r===t;if(n.__uAttr!==n)return console.warn("component not of expected type =>",n),null;n._children=O(n);var c=n.type;if(c===d||r.type===d)return P(n,p?o:r._children||o,e,i,l,u,s);if("function"==typeof c){var f,m=function(e,n,o,r,i,l,u){var s,p,c,f=e.type;if(n._component){if((s=e._component=n._component).base=e._dom=n._dom,s.props=e.props,s.context=i,c=!1,!l)if(null!=s.shouldComponentUpdate&&!1!==s.shouldComponentUpdate(e.props,s.state));else if(null!=s.shouldComponentUpdate)return{node:t,shouldUpdate:!1}}else c=!0,f.prototype&&f.prototype.render?(s=e._component=new f(e.props,i),r.push(s)):(s=new w(e.props,i),e._component=null,s.constructor=f,s.render=V);return s.parentDom=o,null==s.state&&(s.state={}),s._nextState=a({},s.state),null!=f.getDerivedStateFromProps&&(a(s._nextState,f.getDerivedStateFromProps(e.props,s._nextState)||t),a(s._oldState||(s._oldState={}),s._nextState)),c?_(s,"componentWillMount"):_(s,"componentWillUpdate",e.props,s._nextState,i),s.state=s._nextState,(p=s._prevVnode=v(s.render(e.props,s.state)))&&(p._dom=e._dom,p._reorder=e._reorder),s._depth=u?1+~~u._depth:0,{node:p,shouldUpdate:!c}}(n,r,e,l,i,s,u);f=m.node;var y=m.shouldUpdate;if(null!=n._component&&(n._component._vnode=n),f===t)return null;var b=n._dom=L(e,f,"_prevVnode"in r?r._prevVnode:r,i,l,n._component,s);if(null==f)return;return f._dom=b,null!=n._component&&(n._component.base=b),y&&_(n._component,"componentDidUpdate",r.props,(r._component||t)._oldState),null!=r._component&&delete r._component._oldState,f!==n._prevVnode&&(n._prevVnode=f),null==b||Array.isArray(b)||(b._vNode=n),b}n._dom=p?g(n,null,null,!0):g(n,r,r._dom,!1),null!=u&&(u.base=n._dom);var C=n._dom;return C._vNode=n,P(n,p?o:r._children||o,C,i,l,n._component,s),C}function O(e){return l(e.props&&e.props.children||o,Infinity,v)}function j(e){if("#comment"!==e.nodeName){if(e instanceof Text)return e.nodeValue;var n=f(e.tagName,null,Array.from(e.childNodes).map(j));return n._children=O(n),n._dom=e,e._vNode=n,n}}function E(e,n){var t=Array.from(e.childNodes),o=f(d,null,t.map(j));o._dom=t,o._children=O(o);var r=[];L(e,n,o,{},r,null,!1),b(r)}function F(){return(F=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e}).apply(this,arguments)}function R(e,n){e.prototype=Object.create(n.prototype),e.prototype.constructor=e,e.__proto__=n}function T(e,n){if(null==e)return{};var t,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n.indexOf(t=i[o])>=0||(r[t]=e[t]);return r}function M(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var W=function(e){function n(n,t){var o,r=n.componentPromise,i=n.fallbackComponent,a=T(n,["componentPromise","fallbackComponent"]);return(o=e.call(this,a,t)||this).state={ready:!1,componentPromise:r,finalComponent:null,fallbackComponent:i},o}R(n,e),n.getDerivedStateFromProps=function(e,n){var t=n||{};return t.componentPromise===e.componentPromise||null!=e.componentPromise&&(t.componentPromise=e.componentPromise,t.ready=!1,t.finalComponent=null),t};var t=n.prototype;return t.render=function(e,n){var t=e.eager,o=void 0===t||t,r=e.loadComponent,i=void 0!==r&&r,a=T(e,["eager","loadComponent"]),l=n.ready,u=n.finalComponent;if(!o&&!i||l||this.loadComponent(),l)return f(u,a);var s=T(a,["children"]);return null!=this.state.fallbackComponent?f(this.state.fallbackComponent,s):H},t.loadComponent=function(){var e=this;return this.state.componentPromise().then((function(n){e.setState({ready:!0,finalComponent:n})}))},n}(w),H=f("div",null,"Loading.."),I=[],K={subscribe:function(e){I.includes(e)||I.push(e)},unsubscribe:function(e){for(var n=0;n<I.length;n++)if(I[n]===e)return I.splice(n,1)},emit:function(e,n){var t=I,o=Array.isArray(t),r=0;for(t=o?t:t[Symbol.iterator]();;){var i;if(o){if(r>=t.length)break;i=t[r++]}else{if((r=t.next()).done)break;i=r.value}i(e,n)}},unsubscribeAll:function(){I.length=0}};function q(e){window.history.pushState(t,document.title,e),K.emit(e,{type:"load",native:!1})}var Q=function(e){R(o,e),o.__emitter=function(){K.emit(o.getPath+o.getQs,{type:"popstate",native:!0})};var n,t=o.prototype;function o(n,t){var o,r=n.children,i=n.fallbackComponent,a=T(n,["children","fallbackComponent"]);o=e.call(this,a,t)||this,i=i||o._notFoundComponent.bind(M(o)),o.state={routes:o.initComponents(r),fallbackComponent:i};var l=o.getCurrentComponent(),u=l[1];return o.state.component=l[0],o.state.match=u,o._routeChangeHandler=o._routeChangeHandler.bind(M(o)),o}return t.componentWillMount=function(){K.subscribe(this._routeChangeHandler),window.addEventListener("popstate",o.__emitter)},t.componentWillUnmount=function(){window.removeEventListener("popstate",o.__emitter),this.props.destroySubscriptionOnUnmount&&K.unsubscribeAll()},t.absolute=function(e){return new URL(e||"",location.protocol+"//"+location.host).toString()},t.getCurrentComponent=function(){return this.getPathComponent(o.getPath)||[]},t._routeChangeHandler=function(){var e=this.getCurrentComponent();this.setState({component:e[0],match:e[1]})},t._notFoundComponent=function(){return f("div",null,'The Requested URL "'+this.absolute(o.getPath)+'" was not found')},t.getPathComponent=function(e){var n=this.state.routes,t=Array.isArray(n),o=0;for(n=t?n:n[Symbol.iterator]();;){var r;if(t){if(o>=n.length)break;r=n[o++]}else{if((o=n.next()).done)break;r=o.value}var i=r.component,a=r.regex.exec(e);if(a)return[i,a]}return[]},t.initComponents=function(e){var n=[],t=e,o=Array.isArray(t),r=0;for(t=o?t:t[Symbol.iterator]();;){var i;if(o){if(r>=t.length)break;i=t[r++]}else{if((r=t.next()).done)break;i=r.value}null!=i.props&&null!=i.props.path&&n.push({regex:i.props.path,component:i})}return n},(n=[{key:"getPath",get:function(){return location.pathname}},{key:"getQs",get:function(){return location.search}}])&&function(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}(o,n),t.componentDidMount=function(){},t.render=function(){var e,n=T(this.props,["children"]),t=F({match:this.state.match},n);return null!=this.state.component&&null!=this.state.match?a((e=this.state.component).props,t):e=f(this.state.fallbackComponent,t),e.__uAttr||(e=f(e,t)),f(d,null,e)},o}(w);e.A=function(e){var n=e.native,t=e.href,o=e.onClick,r=T(e,["native","href","onClick"]);return r.href=t,n||null==t||(r.onClick=function(n){return function(e,n,t){e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||(e.stopImmediatePropagation&&e.stopImmediatePropagation(),e.stopPropagation&&e.stopPropagation(),e.preventDefault(),q(n),null!=t&&t(e,n))}(n,e.href,o)}),f("a",r)},e.AsyncComponent=W,e.Component=w,e.Fragment=d,e.Router=Q,e.RouterSubscription=K,e.absolutePath=function(e){return RegExp("^"+e+"(/?)$")},e.createElement=f,e.default=w,e.h=f,e.hydrate=E,e.loadURL=q,e.redirect=function(e){window.history.replaceState(t,document.title,e),K.emit(e,{type:"redirect",native:!1})},e.render=function(e,n){var t=f(d,null,e);if(n.hasChildNodes())return E(n,t);var o=[];L(n,t,null,{},o,null,!1),b(o)}}));
//# sourceMappingURL=ui-lib.umd.js.map