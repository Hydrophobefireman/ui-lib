function n(n,t,o){if(!(null==n||n instanceof Text||t===o)){null==n._listeners&&(n._listeners={}),null==t&&(t=d),null==o&&(o=d);for(const r in o)null==t[r]&&(delete n._listeners[r],n.removeEventListener(r,e));for(const r in t){const i=t[r],s=o[r];null!=i&&s!==i&&(null==s&&n.addEventListener(r,e),n._listeners[r]=i)}}}function e(n){return this._listeners[n.type].call(this,n)}const t={key:1,ref:1,children:1},o={value:1,checked:1};function r(n,e,t){t=t||"";const o=n.style;if("string"==typeof(e=e||""))return void(o.cssText=e);const r="string"==typeof t;if(r)o.cssText="";else for(const n in t)null==e[n]&&(o[n]="");for(const n in e){const i=e[n];(r||i!==t[n])&&(o[n]=i)}}const i=n=>n.trim();function s(n,e,t){const o=Array.isArray;o(e)&&(e=i(e.join(" "))),o(t)&&(t=i(t.join(" "))),e!==t&&p(n,"className",e)}function l(n,e,t){u(n,e,t,"_renders"),u(n,e,t,"_renderedBy")}const c={_dom:"_FragmentDomNodeChildren",_FragmentDomNodeChildren:"_dom"};function u(n,e,t,o){let r=n;const i=c[e];for(;r;)i&&(r[i]=null),r[e]=t,r=r[o]}function p(n,e,t){return e in n?n[e]=null==t?"":t:null==t?n.removeAttribute(e):n.setAttribute(e,t)}function a(n,e){null!=e&&u(n,"_parentDom",e,"_renderedBy")}const d={},f=[];function m(n,e,t){return function n(e,t,o,r){if(!e)return t;for(let i=0;i<e.length;i++){const s=e[i];Array.isArray(s)?n(s,t,o,r):r&&null==s||t.push(o?o(s):s)}return t}(n,[],e,t)}function h(n){return"o"===n[0]&&"n"===n[1]}const _=d.hasOwnProperty,y="assign"in Object?d.constructor.assign:function(n){for(let e=1;e<arguments.length;e++){const t=arguments[e];for(const e in t)_.call(t,e)&&(n[e]=t[e])}return n};function g(n,e){n&&("function"==typeof n?n(e):n.current=e)}function b(n,e,t){const o=n.ref,r=(e||d).ref;o&&o!==r&&(g(o,t),r&&g(e.ref,null))}const S={};function D(n,e,...t){if(null==n||"boolean"==typeof n)return null;null==e&&(e=d);const o=e.ref,r=e.key,i="string"==typeof n?{}:null;let s;return e=function(n,e){const t={},o=null!=e;for(const r in n)null==x[r]&&(t[r]=n[r],o&&h(r)&&(e[r.substr(2).toLowerCase()]=n[r]));return t}(e,i),t.length&&null==e.children&&(s=m(t)),null!=e.children&&(s=m([e.children])),e.children=s,N(n,e,i,r,o)}function N(n,e,t,o,r){const i={type:"string"==typeof n?n.toLowerCase():n,props:e,events:t,key:o,ref:r,_dom:null,_children:null,_component:null,_nextSibDomVNode:null,_renders:null,_renderedBy:null,_prevSibDomVNode:null,_FragmentDomNodeChildren:null,_parentDom:null,_depth:0,__self:null};return i.__self=i,i}const v=function(){},x={key:1,ref:1};function V(n){return null==n||"boolean"==typeof n?D(S):"string"==typeof n||"number"==typeof n?N(null,String(n)):Array.isArray(n)?D(v,null,n):null!=n._dom?N(n.type,n.props,n.events,n.key,null):n}function C(){return{current:null}}const k="undefined"!=typeof Promise,P="undefined"!=typeof requestAnimationFrame,U=setTimeout,w=k?Promise.prototype.then.bind(Promise.resolve()):U,A={deferImplementation:w,scheduleRender:P?function(n){return requestAnimationFrame(n)}:w,eagerlyHydrate:!0},E={hookSetup:v,diffed:v};function F(n,e){let t=E[n];t===v&&(t=null),E[n]=function(){t&&t.apply(0,arguments),e.apply(0,arguments)}}const B=[],L=[];function R(){q(B)}function O(){q(L)}function q(n){let e;for(;e=n.pop();)M(e)}function H(n){const e=n.name;return"componentDidMount"===e?B.push(n):"componentDidUpdate"===e?L.push(n):void M(n)}function M(n){const e=n.args,t=n.bind,o=n.name;t._lastLifeCycleMethod=o;const r=t[o],i=!!t.componentDidCatch;if(!r)return;const s=()=>r.apply(t,e);if(k)Promise.resolve().then(s).catch(n=>{if(i)return t.componentDidCatch(n);throw n});else try{s()}catch(n){if(i)return t.componentDidCatch(n);throw n}}function j(e,t){if(null==e||e===d)return;g(e.ref,null),j(e._renders,t);const o=e._component;let r;t||null==o||(o.setState=v,o.forceUpdate=v,o._VNode=null,H({name:"componentWillUnmount",bind:o}));const i=e._children;if(i)for(;i.length;)r=i.pop(),j(r,t);!function(e,t){if(!t&&"function"!=typeof e.type){const t=e._dom;null!=t&&(!(e.type===S)&&n(t,null,e.events),function(n){$(T,n)}(t),function(n){if(null==n)return;const e=n.parentNode;e&&e.removeChild(n)}(t))}!function(n,e){if(null!=n){if(!e){var t=n._nextSibDomVNode;if(null!=t){const n=t._dom,e=n&&n.previousSibling;l(t,"_prevSibDomVNode",e&&e._VNode)}const e=n._prevSibDomVNode;if(null!=e){const n=e._dom,t=n&&n.nextSibling;l(e,"_nextSibDomVNode",t&&t._VNode)}}$(W,n)}}(e,t)}(e,t)}const T={_VNode:1,_listeners:1,onclick:1},W={events:1,_FragmentDomNodeChildren:1,_children:1,_component:1,_depth:1,_dom:1,_nextSibDomVNode:1,_prevSibDomVNode:1,_renderedBy:1,_renders:1,_parentDom:1};function $(n,e){if(null!=e)for(const t in n)e[t]=null}function I(n,e,t,o){if(n.type!==S)return function(n,e,t,o,r){const i=n.type===v,s=e.length,l=Math.max(s,t.length);for(let c=0;c<l;c++){const l=e[c]||(c<s?D(S):null),p=t[c]||d;if(null==p._nextSibDomVNode){const e=i?n._nextSibDomVNode:null;null!=e&&u(l,"_nextSibDomVNode",e,"_renderedBy")}en(l,p,o,null,r),i&&null!=l&&K(n,l,c)}if(i&&s){const e=n._children;u(n,"_nextSibDomVNode",e[s-1]._nextSibDomVNode,"_renderedBy"),u(n,"_prevSibDomVNode",e[0]._prevSibDomVNode,"_renderedBy")}}(n,n._children||f,(e||d)._children||f,t,o)}function K(n,e,t){const o=e&&(e._dom||e._FragmentDomNodeChildren);let r=n._FragmentDomNodeChildren;null==r&&(r=[],u(n,"_FragmentDomNodeChildren",r,"_renderedBy")),r[t]=o}const Q=[];class z{constructor(n){this.state={},this.props=n}render(n,e){return null}setState(n){if(this._oldState=y({},this.state),this._nextState=y({},this.state),"function"==typeof n){const e=n(this._nextState,this.props);if(null==e)return;y(this._nextState,e)}else y(this._nextState,n);var e;(e=this)._dirty=!0,1===Q.push(e)&&A.scheduleRender(G)}forceUpdate(n){if(null==this._VNode)return;const e=!1!==n;this.base=en(this._VNode,y({},this._VNode),this._VNode._parentDom,e,{depth:this._depth}),"function"==typeof n&&n(),R(),O()}}function G(){let n;for(Q.sort((n,e)=>n._depth-e._depth);n=Q.pop();)n._dirty&&(n._dirty=!1,n.forceUpdate(!1))}const J=n=>"function"==typeof n&&n!==v,X={_nextSibDomVNode:1,_prevSibDomVNode:1};function Y(n,e){if(e._renders=n,n){n._renderedBy=e;for(const t in X)n[t]=e[t]}}function Z(n){return this.constructor(n)}function nn(n,e,t){const o=y({},n.state||d,n._nextState||d),r=function(n,e,t){const o=n.getDerivedStateFromProps;return null!=o?y({},o(e,t)):null}(e,t.props,o);r&&y(o,r),n._nextState=o}function en(e,i,c,u,f){if("boolean"==typeof e&&(e=null),null==i&&(i=d),null==e)return void j(i);if(e===d)return null;if(!((_=e)&&_.__self===_||(console.warn("component not of expected type =>",_),0)))return null;var _;if(i===e)return e._dom;!function(n,e){if(e===d||null==n||null==e)return;const t=e._prevSibDomVNode;null==n._prevSibDomVNode&&null!=t&&(l(n,"_prevSibDomVNode",t),l(t,"_nextSibDomVNode",n));const o=e._nextSibDomVNode;null==n._nextSibDomVNode&&null!=o&&(l(n,"_nextSibDomVNode",o),l(o,"_prevSibDomVNode",n))}(e,i);let y=i.type,g=e.type,D=J(g);g===y&&D&&(e._component=i._component),g!==y&&(j(i),i=d);const N=e;if("string"!=typeof e.props&&g!==S&&(e=function(n,e,t,o){let r;return null!=n&&J(r=n.type)?(e=e||d,function(n){const e=n.prototype;return!(!e||!e.render)}(r)?function(n,e,t,o){let r;const i=n.type;let s=n._component;if(null!=s){if(null!=s.shouldComponentUpdate&&!t&&!1===s.shouldComponentUpdate(n.props,s._nextState||s.state))return d;nn(s,i,n),H({bind:s,name:"componentWillUpdate",args:[n.props,s._nextState]}),r="componentDidUpdate"}else r="componentDidMount",s=new i(n.props),n._component=s,nn(s,i,n),H({bind:s,name:"componentWillMount"}),s._depth=++o.depth;s._VNode=n;const l=s._oldState,c=e.props;s.state=s._nextState,s._oldState=null,s._nextState=null,s.props=n.props;const u=V(s.render(s.props,s.state));return Y(u,n),H({bind:s,name:r,args:"componentDidUpdate"===r?[c,l]:[]}),b(n,e,s),u}(n,e,t,o):function(n,e){let t;const o=n.type;let r;return n._component?r=n._component:(r=new z(n.props),n._component=r,r.render=Z,r.constructor=o,r.props=n.props,r._depth=++e.depth),r._VNode=n,E.hookSetup(r),t=V(r.render(n.props)),E.hookSetup(null),Y(t,n),t}(n,o)):n}(e,i,u,f)),J(i.type)&&(i=i._renders),e!==N)return en(e,i,c,u,f);let x;return e._children=function(n){const e=n.props.children;return null==e&&n.type!==v?[]:m([e],V)}(e),y=i.type,g=e.type,a(e,c),g===v?I(e,i,c,f):(y!==g&&(i=null),function(e,i,c){const u=(i=i||d)===d;let f;const m=i._dom;f=e.type!==i.type||null==m?function(n){if("string"==typeof n.props)return document.createTextNode("");{const e=n.type;return e===S?document.createComment("$"):document.createElement(e)}}(e):m,f._VNode=e,function(e,i,l){if(i.type===S)return;if(l=l||d,"string"==typeof i.props)return function(n,e,t){return e===t||(n.nodeValue=e)}(e,i.props,l.props);const c=l.props||d,u=i.props;null!=c&&function(n,e,o){for(const r in e)h(r)||r in t||null==o[r]&&p(n,r,null)}(e,c,u),function(n,e,i){for(let l in i){if(h(l)||l in t)continue;let c=i[l],u=o[l]?n[l]:e[l];c!==u&&(l="class"===l?"className":l,"className"!==l?"style"!==l?p(n,l,c):r(n,c,u):s(n,c,u))}}(e,c,u),n(e,i.events,l.events)}(f,e,u?null:i),l(e,"_dom",f),function n(e,t){e&&(null!=e._component?e._component.base=t:n(e._renderedBy,t))}(e,f),u&&function(n,e,t){const o=function(n){if(!n)return;const e=n._dom;if(e)return e;const t=n._FragmentDomNodeChildren;return t?function n(e){for(let t=0;t<e.length;t++){const o=e[t];if(Array.isArray(o)){const e=n(o);if(e)return e}else if(o)return o}}(t):void 0}(n._nextSibDomVNode),r=n._dom;r&&(function(n,e,t){let o,r=!0;e&&e!==n&&(r=!1,o=e),!r&&o?t.insertBefore(n,o):t.appendChild(n)}(r,o,e),function(n){const e=n._dom;null==n._parentDom&&a(n,e.parentNode);let t=n._nextSibDomVNode;if(null==t){const n=e.nextSibling;null!=n&&(t=n._VNode)}l(t,"_prevSibDomVNode",n),l(n,"_nextSibDomVNode",t);let o=n._prevSibDomVNode;if(null==o){const n=e.previousSibling;null!=n&&(o=n._VNode)}l(o,"_nextSibDomVNode",n),l(n,"_prevSibDomVNode",o)}(n))}(e,c)}(e,i,c),x=e._dom,I(e,i,x,f)),E.diffed(e),b(e,i,x),x}function tn(n,e){const t=D(v,null,n);e.hasChildNodes()&&function(n){let e;for(;e=n.firstChild;)n.removeChild(e)}(e),en(t,null,e,!1,{depth:0}),R(),O()}const on=["boolean","string","number"];function rn(n,e){return null==n||on.indexOf(typeof n)>-1||n.__self?n:D(n,e)}class sn extends z{componentDidMount(){this._init()}componentDidUpdate(n){(n&&(n.promise||n.componentPromise))!==(this.props.promise||this.props.componentPromise)&&this._init()}_init(){this.setState({inProgress:!0}),(this.props.promise||this.props.componentPromise)().then(n=>{this.setState({render:n,inProgress:!1})}).catch(n=>this.setState({error:!0,inProgress:!1}))}render(n,e){return e.inProgress?rn(n.fallback||n.fallbackComponent)||"Loading":e.error?rn(n.errorComponent)||"An Error Occured":rn(e.render,function(n,e){e=m([e]);const t={};for(const o in n)-1===e.indexOf(o)&&(t[o]=n[o]);return t}(n,["fallback","fallbackComponent","promise","componentPromise"]))}}function ln(n,e,t,o){return function(){return un(e,"()' has been deprecated"+(t?" Use '"+t+"()' instead":"")),n.apply(o,f.slice.call(arguments))}}function cn(n,e,t){const o=Object.getOwnPropertyDescriptor(n,t).get.bind(n);Object.defineProperty(n,e,{get:ln(o,e,t)})}function un(){const n=["[DeprecationWarning]"].concat(f.slice.call(arguments));console.warn.apply(console,n)}const pn=/\/+$/;function an(n){return 1===n.length?n:n.replace(pn,"")}const dn=[],fn={subscribe(n){dn.includes(n)||dn.push(n)},unsubscribe(n){for(let e=0;e<dn.length;e++)if(dn[e]===n)return dn.splice(e,1)},emit(n,e){for(const t of dn)t(n,e)},unsubscribeAll(){dn.length=0}};function mn(n){window.history.pushState(null,"",n),fn.emit(n,{type:"load",native:!1})}function hn(n){window.history.replaceState(null,"",n),fn.emit(n,{type:"redirect",native:!1})}class _n extends z{constructor(n){super(n),this.state={},this._routeChangeHandler=this._routeChangeHandler.bind(this)}static __emitter(){fn.emit(_n.path+_n.qs,{type:"popstate",native:!0})}static get path(){return location.pathname}static get qs(){return location.search}static get searchParams(){return new URLSearchParams(_n.qs)}static _getParams(n,e){const t={};for(const o in n)t[n[o]]=decodeURIComponent(e[o]);return t}static getCurrentParams(n){const e=(n=yn(n)).params,t=n.regex.exec(_n.path);return t?_n._getParams(e,t):{}}componentDidMount(){fn.subscribe(this._routeChangeHandler),window.addEventListener("popstate",_n.__emitter),this._routeChangeHandler(null)}componentWillUnmount(){window.removeEventListener("popstate",_n.__emitter),fn.unsubscribe(this._routeChangeHandler)}_notFoundComponent(){return D("div",null,`The Requested URL "${_n.path}" was not found`)}_routeChangeHandler(n){const e=an(_n.path);let t=[];this.props.children.forEach(n=>{const o=yn(n.props.match),r=o.regex.exec(e);if(r){const e=n.props,i=_n._getParams(o.params,r);t.push(rn(e.component,y({},n.props,{params:i})))}}),t.length||(t=D(this.props.fallbackComponent||this._notFoundComponent)),this.setState({child:t})}render(n,e){return D(v,null,e.child)}}function yn(n){if(null!=n.regex)return n;n=an(n);const e={};let t=0;return{regex:(o=n.split("/").map(n=>":"===n[0]?(e[++t]=n.substr(1),"([^?\\/]+)"):n).join("/"),RegExp(`^${o}(/?)$`)),params:e};var o}cn(_n,"getPath","path"),cn(_n,"getQs","qs");const gn=ln(yn,"absolutePath","createRoutePath");function bn(n){if(n.altKey||n.ctrlKey||n.metaKey||n.shiftKey)return;n.stopImmediatePropagation&&n.stopImmediatePropagation(),n.stopPropagation&&n.stopPropagation(),n.preventDefault();const e=new URL(this.href,location.href);mn(e.pathname+e.search+e.hash)}function Sn(n){return null!=n.href&&(n.onClick=bn),D("a",n)}const Dn={};function Nn(n,e){return!n||e.some((e,t)=>e!==n[t])}function vn(n,e,t){return n[e]||(n[e]=t())}function xn(n,e){return"function"==typeof e?e(n):e}let Vn=0,Cn=null;const kn=[];function Pn(n){const e=n.cleanUp;"function"==typeof e&&(e(),n.cleanUp=null)}function Un(n){let e=n.cb;e&&"function"==typeof(e=e())&&(n.cleanUp=e),n.cb=null}function wn(){kn.forEach(n=>{for(const t in n)(e=n[t]).resolved||Pn(e),Un(e);var e}),kn.length=0}function An(){return[Cn,Vn++]}function En(n,e){const t=An(),o=t[1],r=t[0]._hooksData;let i=r[o]||{};return Nn(i.args,e)?(r[o]=null,i=vn(r,o,()=>({hookState:n()})),i.args=e,i.hookState):i.hookState}function Fn(n,e){return En(()=>n,e)}function Bn(n){return En(()=>({current:n}),[])}function Ln(){const n=this._pendingEffects;for(const e in n||d)Pn(n[e]);this._pendingEffects=null}function Rn(n,e){const t=An(),o=t[0],r=t[1],i=o._hooksData;let s=i[r]||{};const l=o._pendingEffects=o._pendingEffects||{},c=l[r];if(!Nn(s.args,e))return void(c&&(c.resolved=!0));s=vn(i,r,()=>({hookState:n})),s.args=e;const u=c?Un(c)||c.cleanUp:null;var p;l[r]={cb:n,cleanUp:u},-1===kn.indexOf(p=l)&&kn.push(p),o.componentWillUnmount=Ln}function On(n,e,t){const o=An(),r=o[0],i=vn(r._hooksData,o[1],()=>({hookState:t?t(e):xn(void 0,e)}));return i.args=n,[i.hookState,n=>{const e=i.args(i.hookState,n);i.hookState=e,r.setState({})}]}function qn(n){return On(xn,n)}F("hookSetup",function(n){Cn=n,Vn=0,n&&(n._hooksData||(n._hooksData=[]))}),F("diffed",function(){A.scheduleRender(wn)});export default z;export{Sn as A,sn as AsyncComponent,z as Component,v as Fragment,Dn as Path,_n as Router,fn as RouterSubscription,gn as absolutePath,A as config,D as createElement,C as createRef,yn as createRoutePath,D as h,mn as loadURL,hn as redirect,tn as render,Fn as useCallback,Rn as useEffect,En as useMemo,On as useReducer,Bn as useRef,qn as useState};
//# sourceMappingURL=ui-lib.modern.js.map
