function n(n){if(null==n)return;const t=n.parentNode;t&&t.removeChild(n)}function t(n){const t=n._dom;null==n._parentDom&&i(n,t.parentNode);let o=n._nextSibDomVNode;if(null==o){const n=t.nextSibling;null!=n&&(o=n._VNode)}e(o,"_prevSibDomVNode",n),e(n,"_nextSibDomVNode",o);let r=n._prevSibDomVNode;if(null==r){const n=t.previousSibling;null!=n&&(r=n._VNode)}e(r,"_nextSibDomVNode",n),e(n,"_prevSibDomVNode",r)}function e(n,t,e){r(n,t,e,"_renders"),r(n,t,e,"_renderedBy")}const o={_dom:"_FragmentDomNodeChildren",_FragmentDomNodeChildren:"_dom"};function r(n,t,e,r){let i=n;const s=o[t];for(;i;)s&&(i[s]=null),i[t]=e,i=i[r]}function i(n,t){null!=t&&r(n,"_parentDom",t,"_renderedBy")}const s={value:1,checked:1},c={key:1,ref:1,children:1};function l(n,t,e){e=e||"";const o=n.style;if("string"==typeof(t=t||""))return void(o.cssText=t);const r="string"==typeof e;if(r)o.cssText="";else for(const n in e)null==t[n]&&(o[n]="");for(const n in t){const i=t[n];(r||i!==e[n])&&(o[n]=i)}}const u=n=>n.trim();function a(n,t,e,o){const r=Array.isArray;r(t)&&(t=u(t.join(" "))),r(e)&&(e=u(e.join(" "))),t!==e&&o.batch.push({node:n,action:3,attr:"className",value:t})}const p=/^aria[\-A-Z]/;function d(n,t,e){if("o"===t[0]&&"n"===t[1])return function(n,t,e){t=t.substr(2).toLowerCase(),null==e&&(n.removeEventListener(t,f),delete n._events[t]),n.addEventListener(t,f),n._events[t]=e}(n,t,e);const o=null==e||!1===e&&!p.test(t);return t in n?n[t]=o?"":e:o?n.removeAttribute(t):n.setAttribute(t,e)}function f(n){return this._events[n.type].call(this,n)}const m={},h=[];function _(n,t){return function n(t,e,o){if(!t)return e;for(let r=0;r<t.length;r++){const i=t[r];Array.isArray(i)?n(i,e,o):e.push(o?o(i):i)}return e}(n,[],t)}const y=m.hasOwnProperty,b="assign"in Object?m.constructor.assign:function(n){for(let t=1;t<arguments.length;t++){const e=arguments[t];for(const t in e)y.call(e,t)&&(n[t]=e[t])}return n};function g(n,t){if(t===m||null==n||null==t)return;const o=t._prevSibDomVNode;null==n._prevSibDomVNode&&null!=o&&(e(n,"_prevSibDomVNode",o),e(o,"_nextSibDomVNode",n));const r=t._nextSibDomVNode;null==n._nextSibDomVNode&&null!=r&&(e(n,"_nextSibDomVNode",r),e(r,"_prevSibDomVNode",n))}const S=function(){};function D(n,t){if(null==n||"boolean"==typeof n)return null;let e;null==t&&(t=m);const o=t.ref,r=t.key;let i;return null!=(t=v(t)).children?i=_([t.children]):(e=h.slice.call(arguments,2)).length&&(i=_(e)),t.children=i,x(n,t,r,o)}const N={key:1,ref:1};function v(n){const t={};for(const e in n)N[e]||(t[e]=n[e]);return t}function V(n){return null==n||"boolean"==typeof n?D(C):"string"==typeof n||"number"==typeof n?x(null,String(n)):Array.isArray(n)?D(S,null,n):null!=n._dom?x(n.type,n.props,n.key):n}function x(n,t,e,o){return{type:n,props:t,key:e,ref:o,_dom:null,_children:null,_component:null,_renders:null,_renderedBy:null,_parentDom:null,_depth:0,constructor:void 0}}const C={},k="undefined"!=typeof Promise,U=k?Promise.prototype.then.bind(Promise.resolve()):n=>setTimeout(n),P="function"==typeof requestAnimationFrame,w={scheduleRender:P?n=>requestAnimationFrame(n):U,eagerlyHydrate:!0,RAF_TIMEOUT:100},A={hookSetup:S,diffed:S};function F(n,t){let e=A[n];e===S&&(e=null),A[n]=function(){e&&e.apply(0,arguments),t.apply(0,arguments)}}const E=[],B=[];function R(n){let t;for(;t=n.pop();)L(t)}function T(n){const t=n.name;return"componentDidMount"===t?E.push(n):"componentDidUpdate"===t?B.push(n):void L(n)}function L(n){const t=n.args,e=n.bind,o=n.name;e._lastLifeCycleMethod=o;const r=e[o],i=!!e.componentDidCatch;if(!r)return;const s=()=>r.apply(e,t);if(k)U(s).catch(n=>{if(i)return e.componentDidCatch(n);throw n});else try{s()}catch(n){if(i)return e.componentDidCatch(n);throw n}}function M(e){!function(e){const o=e.length;for(let r=0;r<o;r++){const o=e[r],i=o.node,s=o.refDom,c=o.value,u=o.VNode;switch(o.action){case 0:s.appendChild(i),t(u);break;case 2:c.insertBefore(i,s),t(u);break;case 4:case 3:d(i,o.attr,c);break;case 5:l(i,c.newValue,c.oldValue);break;case 1:n(i)}}e.length=0}(e),A.diffed(),R(E),R(B)}function O(n,t){n&&("function"==typeof n?n(t):n.current=t)}function q(n,t,e){const o=n.ref,r=(t||m).ref;o&&o!==r&&(O(o,e),r&&O(t.ref,null))}function H(){return{current:null}}function I(n,t){if(null==n||n===m)return;O(n.ref,null),I(n._renders,t);const o=n._component;let r;null!=o&&(o.setState=S,o.forceUpdate=S,o._VNode=null,T({name:"componentWillUnmount",bind:o}));const i=n._children;if(i)for(;i.length;)r=i.pop(),I(r,t);!function(n,t){if("function"!=typeof n.type){const e=n._dom;null!=e&&(function(n){j(W,n)}(e),t.batch.push({node:e,action:1}))}!function(n){if(null==n)return;let t=n._nextSibDomVNode;if(null!=t){const n=t._dom,o=n&&n.previousSibling;e(t,"_prevSibDomVNode",o&&o._VNode)}const o=n._prevSibDomVNode;if(null!=o){const n=o._dom,t=n&&n.nextSibling;e(o,"_nextSibDomVNode",t&&t._VNode)}j($,n)}(n)}(n,t)}const W={_VNode:1,_listeners:1,onclick:1},$={events:1,_FragmentDomNodeChildren:1,_children:1,_component:1,_depth:1,_dom:1,_nextSibDomVNode:1,_prevSibDomVNode:1,_renderedBy:1,_renders:1,_parentDom:1};function j(n,t){if(null!=t)for(const e in n)t[e]=null}function K(n,t,e,o){if(n.type!==C)return function(n,t,e,o,i){const s=n.type===S,c=t.length,l=Math.max(c,e.length);for(let u=0;u<l;u++){const l=t[u]||(u<c?D(C):null);let a=e[u]||m;if(g(l,a),a===h&&(a=e[u+1]),l&&null==l._nextSibDomVNode){const t=s?n._nextSibDomVNode:null;null!=t&&r(l,"_nextSibDomVNode",t,"_renderedBy")}en(l,a,o,null,i),s&&null!=l&&Z(n,l,u)}if(s&&c){const t=n._children;r(n,"_nextSibDomVNode",t[c-1]._nextSibDomVNode,"_renderedBy"),r(n,"_prevSibDomVNode",t[0]._prevSibDomVNode,"_renderedBy")}}(n,n._children||h,(t||m)._children||h,e,o)}function Z(n,t,e){const o=t&&(t._dom||t._FragmentDomNodeChildren);let i=n._FragmentDomNodeChildren;null==i&&(i=[],r(n,"_FragmentDomNodeChildren",i,"_renderedBy")),i[e]=o}const z=[];class G{constructor(n){this.state={},this.props=n}render(n,t){return null}setState(n){if(this._oldState=b({},this.state),this._nextState=b({},this._nextState||this.state),"function"==typeof n){const t=n(this._nextState,this.props);if(null==t)return;b(this._nextState,t)}else b(this._nextState,n);var t;(t=this)._dirty=!0,1===z.push(t)&&w.scheduleRender(J)}forceUpdate(n){if(null==this._VNode)return;const t=[],e=!1!==n;en(this._VNode,b({},this._VNode),this._VNode._parentDom,e,{depth:this._depth,batch:t}),"function"==typeof n&&n(),M(t)}}function J(){let n;for(z.sort((n,t)=>n._depth-t._depth);n=z.pop();)n._dirty&&(n._dirty=!1,n.forceUpdate(!1))}const Q=n=>"function"==typeof n&&n!==S,X={_nextSibDomVNode:1,_prevSibDomVNode:1};function Y(n,t){if(t._renders=n,n){n._renderedBy=t;for(const e in X)n[e]=t[e]}}function nn(n){return this.constructor(n)}function tn(n,t,e){const o=b({},n.state||m,n._nextState||m),r=function(n,t,e){const o=n.getDerivedStateFromProps;return null!=o?b({},o(t,e)):null}(t,e.props,o);r&&b(o,r),n._nextState=o}function en(n,t,e,o,l){if("boolean"==typeof n&&(n=null),null==n)return void I(t,l);if(n===m)return null;if(!((u=n)&&void 0===u.constructor||(console.warn("component not of expected type =>",u),0)))return null;var u;if(t===n)return n._dom;let p=(t=t||m).type,d=n.type,f=Q(d);d===p&&f&&(n._component=t._component),d!==p&&(I(t,l),t=m);const h=n;if("string"!=typeof n.props&&d!==C&&(n=function(n,t,e,o){let r;return null!=n&&Q(r=n.type)?(t=t||m,function(n){const t=n.prototype;return!(!t||!t.render)}(r)?function(n,t,e,o){let r;const i=n.type;let s=n._component;if(null!=s){if(null!=s.shouldComponentUpdate&&!e&&!1===s.shouldComponentUpdate(n.props,s._nextState||s.state))return m;tn(s,i,n),T({bind:s,name:"componentWillUpdate",args:[n.props,s._nextState]}),r="componentDidUpdate"}else r="componentDidMount",s=new i(n.props),n._component=s,tn(s,i,n),T({bind:s,name:"componentWillMount"}),s._depth=++o.depth;s._VNode=n;const c=s._oldState,l=t.props;s.state=s._nextState,s._oldState=null,s._nextState=null,s.props=n.props;const u=V(s.render(s.props,s.state));return Y(u,n),T({bind:s,name:r,args:"componentDidUpdate"===r?[l,c]:[]}),q(n,t,s),u}(n,t,e,o):function(n,t){let e;const o=n.type;let r;return n._component?r=n._component:(r=new G(n.props),n._component=r,r.render=nn,r.constructor=o,r.props=n.props,r._depth=++t.depth),r._VNode=n,A.hookSetup(r),e=V(r.render(n.props)),A.hookSetup(null),Y(e,n),e}(n,o)):n}(n,t,o,l)),Q(t.type)&&(t=t._renders),n!==h)return en(n,t,e,o,l);let y;return n._children=function(n){let t=n.props.children;if(n.type!==S){if(null==t)return[]}else t&&!t.length&&(t=null);return _([t],V)}(n),p=t.type,d=n.type,i(n,e),d===S?K(n,t,e,l):(p!==d&&(t=m),function(n,t,e,o){const i=t===m;let l;const u=t._dom;l=n.type!==t.type||null==u?function(n){if("string"==typeof n.props)return document.createTextNode("");{const t=n.type;if(t===C)return document.createComment("$");const e=document.createElement(t);return e._events={},e}}(n):u,l._VNode=n,r(n,"_dom",l,"_renderedBy"),function(n,t,e,o){if(t.type===C)return;if(e=e||m,"string"==typeof t.props)return function(n,t,e){return t===e||(n.nodeValue=t)}(n,t.props,e.props);const r=e.props,i=t.props;null!=r&&function(n,t,e,o){for(const r in t)null==e[r]&&null!=t[r]&&o.batch.push({node:n,action:4,attr:r})}(n,r,i,o),function(n,t,e,o){for(let r in e){if(r in c)continue;let i=e[r],l=s[r]?n[r]:t[r];i!==l&&(r="class"===r?"className":r,"className"!==r?o.batch.push("style"!==r?{node:n,action:3,attr:r,value:i}:{node:n,action:5,value:{newValue:i,oldValue:l}}):a(n,i,l,o))}}(n,r||m,i,o)}(l,n,i?null:t,o),function n(t,e){t&&(null!=t._component?t._component.base=e:n(t._renderedBy,e))}(n,l),i&&function(n,t,e){const o=n._dom;if(!o)return;const r=function(n){if(!n)return;const t=n._dom;if(t)return t;const e=n._FragmentDomNodeChildren;return e?function n(t){for(let e=0;e<t.length;e++){const o=t[e];if(Array.isArray(o)){const t=n(o);if(t)return t}else if(o)return o}}(e):void 0}(n._nextSibDomVNode);let i,s=!0;r&&r!==o&&(s=!1,i=r),e.batch.push(!s&&i?{node:o,action:2,refDom:i,value:t,VNode:n}:{node:o,action:0,refDom:t,VNode:n})}(n,e,o)}(n,t,e,l),y=n._dom,K(n,t,y,l),q(n,t,y)),y}function on(n,t){const e=D(S,null,[n]);t.hasChildNodes()&&function(n){let t;for(;t=n.firstChild;)n.removeChild(t)}(t);const o=[];en(e,null,t,!1,{depth:0,batch:o}),M(o)}const rn=["boolean","string","number"];function sn(n,t){return null==n||rn.indexOf(typeof n)>-1||void 0===n.constructor?n:D(n,t)}class cn extends G{componentDidMount(){this._init()}componentDidUpdate(n){(n&&(n.promise||n.componentPromise))!==(this.props.promise||this.props.componentPromise)&&this._init()}_init(){this.setState({inProgress:!0}),(this.props.promise||this.props.componentPromise)().then(n=>{this.setState({render:n,inProgress:!1})}).catch(n=>this.setState({error:!0,inProgress:!1}))}render(n,t){return t.inProgress?sn(n.fallback||n.fallbackComponent)||"Loading":t.error?sn(n.errorComponent)||"An Error Occured":sn(t.render,function(n,t){t=_([t]);const e={};for(const o in n)-1===t.indexOf(o)&&(e[o]=n[o]);return e}(n,["fallback","fallbackComponent","promise","componentPromise"]))}}const ln=/\/+$/;function un(n){return 1===n.length?n:n.replace(ln,"")}const an=[],pn={subscribe(n){an.includes(n)||an.push(n)},unsubscribe(n){for(let t=0;t<an.length;t++)if(an[t]===n)return an.splice(t,1)},emit(n,t){for(const e of an)e(n,t)},unsubscribeAll(){an.length=0}};function dn(n){window.history.pushState(null,"",n),pn.emit(n,{type:"load",native:!1})}function fn(n){window.history.replaceState(null,"",n),pn.emit(n,{type:"redirect",native:!1})}class mn extends G{constructor(n){super(n),this.state={},this._routeChangeHandler=this._routeChangeHandler.bind(this)}static __emitter(){pn.emit(mn.path+mn.qs,{type:"popstate",native:!0})}static get path(){return location.pathname}static get qs(){return location.search}static get searchParams(){return new URLSearchParams(mn.qs)}static _getParams(n,t){const e={};for(const o in n)e[n[o]]=decodeURIComponent(t[o]);return e}static getCurrentParams(n){const t=(n=hn(n)).params,e=n.regex.exec(mn.path);return e?mn._getParams(t,e):{}}componentDidMount(){pn.subscribe(this._routeChangeHandler),window.addEventListener("popstate",mn.__emitter),this._routeChangeHandler(null)}componentWillUnmount(){window.removeEventListener("popstate",mn.__emitter),pn.unsubscribe(this._routeChangeHandler)}_notFoundComponent(){return D("div",null,`The Requested URL "${mn.path}" was not found`)}_routeChangeHandler(n){const t=un(mn.path);let e=[];this.props.children.forEach(n=>{const o=hn(n.props.match),r=o.regex.exec(t);if(r){const t=n.props,i=mn._getParams(o.params,r);e.push(sn(t.component,b({},n.props,{params:i})))}}),e.length||(e=D(this.props.fallbackComponent||this._notFoundComponent)),this.setState({child:e})}render(n,t){return D(S,null,t.child)}}function hn(n){if(null!=n.regex)return n;n=un(n);const t={};let e=0;return{regex:(o=n.split("/").map(n=>":"===n[0]?(t[++e]=n.substr(1),"([^?\\/]+)"):n).join("/"),RegExp(`^${o}(/?)$`)),params:t};var o}function _n(n){if(n.altKey||n.ctrlKey||n.metaKey||n.shiftKey)return;n.stopImmediatePropagation&&n.stopImmediatePropagation(),n.stopPropagation&&n.stopPropagation(),n.preventDefault();const t=new URL(this.href,location.href);dn(t.pathname+t.search+t.hash)}function yn(n){return null!=n.href&&(n.onClick=_n),D("a",n)}const bn={};function gn(n,t){return!n||t.some((t,e)=>t!==n[e])}function Sn(n,t,e){return n[t]||(n[t]=Dn(0,e))}function Dn(n,t){return"function"==typeof t?t(n):t}let Nn=0,vn=null;const Vn=P?function(n){let t,e;const o=()=>{clearTimeout(e),cancelAnimationFrame(t),n()};e=setTimeout(o,w.RAF_TIMEOUT),t=requestAnimationFrame(o)}:w.scheduleRender,xn=[];function Cn(n){const t=n.cleanUp;"function"==typeof t&&(t(),n.cleanUp=null)}function kn(n){let t=n.cb;t&&"function"==typeof(t=t())&&(n.cleanUp=t),n.cb=null}function Un(){xn.forEach(n=>{for(const e in n)(t=n[e]).resolved||Cn(t),kn(t);var t}),xn.length=0}function Pn(){return[vn,Nn++]}function wn(n,t){const e=Pn(),o=e[1],r=e[0]._hooksData;let i=r[o]||{};return gn(i.args,t)?(r[o]=null,i=Sn(r,o,()=>({hookState:n()})),i.args=t,i.hookState):i.hookState}function An(n,t){return wn(()=>n,t)}function Fn(n){return wn(()=>({current:n}),[])}function En(){const n=this._pendingEffects;for(const t in n||m)Cn(n[t]);this._pendingEffects=null}function Bn(n,t){const e=Pn(),o=e[0],r=e[1],i=o._hooksData,s={};let c=i[r]||s;const l=o._pendingEffects=o._pendingEffects||s,u=l[r];if(!gn(c.args,t))return void(u&&(u.resolved=!0));c=Sn(i,r,s),c.args=t;const a=u?kn(u)||u.cleanUp:null;var p;l[r]={cb:n,cleanUp:a},-1===xn.indexOf(p=l)&&xn.push(p),o.componentWillUnmount=En}function Rn(n,t,e){const o=Pn(),r=o[0],i=Sn(r._hooksData,o[1],()=>({hookState:e?e(t):Dn(void 0,t)}));return i.args=n,[i.hookState,n=>{const t=i.args(i.hookState,n);i.hookState=t,r.setState({})}]}function Tn(n){return Rn(Dn,n)}F("hookSetup",function(n){vn=n,Nn=0,n&&(n._hooksData||(n._hooksData=[]))}),F("diffed",function(){Vn(Un)});export default G;export{yn as A,cn as AsyncComponent,G as Component,S as Fragment,bn as Path,mn as Router,pn as RouterSubscription,w as config,D as createElement,H as createRef,hn as createRoutePath,D as h,dn as loadURL,fn as redirect,on as render,An as useCallback,Bn as useEffect,wn as useMemo,Rn as useReducer,Fn as useRef,Tn as useState};
//# sourceMappingURL=ui-lib.modern.js.map
