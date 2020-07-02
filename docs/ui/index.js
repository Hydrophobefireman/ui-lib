const t={},n=[],e=/^aria[\-A-Z]/,o={};function r(t,n){return function t(n,e,o){if(!n)return e;for(let r=0;r<n.length;r++){const s=n[r];Array.isArray(s)?t(s,e,o):e.push(o?o(s):s)}return e}(t,[],n)}const s=t.hasOwnProperty,i=t.constructor.assign||function(t){for(let n=1;n<arguments.length;n++){const e=arguments[n];for(const n in e)s.call(e,n)&&(t[n]=e[n])}return t},c=function(){};function u(e,o){if(null==e||"boolean"==typeof e)return null;let s;null==o&&(o=t);const i=o.ref,c=o.key;let u;return null!=(o=a(o)).children?u=r([o.children]):(s=n.slice.call(arguments,2)).length&&(u=r(s)),o.children=u,f(e,o,c,i)}const l={key:1,ref:1};function a(t){const n={};for(const e in t)l[e]||(n[e]=t[e]);return n}function p(t){return null==t||"boolean"==typeof t?u(o):"string"==typeof t||"number"==typeof t?f(null,String(t)):Array.isArray(t)?u(c,null,t):null!=t._dom?f(t.type,t.props,t.key):t}function f(t,n,e,o){return{type:t,props:n,key:e,ref:o,_dom:null,_children:null,_component:null,_renders:null,_renderedBy:null,_parentDom:null,_depth:0,constructor:void 0}}const d="undefined"!=typeof Promise,h=d?Promise.prototype.then.bind(Promise.resolve()):t=>setTimeout(t),m="function"==typeof requestAnimationFrame,_={hookSetup:c,diffed:c};function y(t,n){let e=_[t];e===c&&(e=null),_[t]=function(){e&&e.apply(0,arguments),n.apply(0,arguments)}}const g={scheduleRender:m?t=>requestAnimationFrame(t):h,eagerlyHydrate:!0,RAF_TIMEOUT:100,debounceEffect:null},b={value:1,checked:1},v={key:1,ref:1,children:1};function S(t,n,e){e=e||"";const o=t.style;if("string"==typeof(n=n||""))return void(o.cssText=n);const r="string"==typeof e;if(r)o.cssText="";else for(const t in e)null==n[t]&&(o[t]="");for(const t in n){const s=n[t];(r||s!==e[t])&&(o[t]=s)}}const x=t=>t.trim();function k(t,n,e,o){const r=Array.isArray;r(n)&&(n=x(n.join(" "))),r(e)&&(e=x(e.join(" "))),n!==e&&o.batch.push({node:t,action:1,attr:"className",value:n})}function C(t,n,e,o){for(const r in n)v[r]||null!=e[r]||null==n[r]||o.batch.push({node:t,action:1,attr:r})}function D(t,n,o){if("o"===n[0]&&"n"===n[1])return function(t,n,e){n=n.substr(2).toLowerCase(),null==e?(t.removeEventListener(n,U),delete t._events[n]):(t.addEventListener(n,U),t._events[n]=e)}(t,n,o);const r=null==o||!1===o&&!e.test(n);return n in t?t[n]=r?"":o:r?t.removeAttribute(n):t.setAttribute(n,o)}function U(t){return this._events[t.type].call(this,t)}function P(t){if(null==t)return;const n=t.parentNode;n&&n.removeChild(t)}const w={_VNode:1,_events:1};function N(t){E(w,t)}const V={_children:1,_component:1,_depth:1,_dom:1,_renderedBy:1,_renders:1,_parentDom:1,key:1,ref:1};function A(t){null!=t&&E(V,t)}function E(t,n){if(null!=n)for(const e in t)n[e]=null}const T=[],L=[];function R(t){let n;for(;n=t.pop();)M(n)}function F(t){const n=t.name;return"componentDidMount"===n?T.push(t):"componentDidUpdate"===n?L.push(t):void M(t)}function M(t){const n=t.name,e=t.bind,o=e[n];if(e._lastLifeCycleMethod=n,!o)return;const r=t.args,s="function"==typeof e.componentDidCatch,i=()=>o.apply(e,r);if(d)h(i).catch(t=>{if(!s)throw t;e.componentDidCatch(t)});else try{i()}catch(t){if(s)return e.componentDidCatch(t);throw t}}function q(t){!function(t){const n=t.length;for(let e=0;e<n;e++){const n=t[e],o=n.node,r=n.refDom,s=n.value,i=n.VNode;switch(n.action){case 4:r.appendChild(o);break;case 5:s.insertBefore(o,r);break;case 1:D(o,n.attr,s);break;case 3:S(o,s.newValue,s.oldValue);break;case 2:P(o),N(o),A(i)}}}(t),_.diffed(),R(T),R(L)}const H=[];class O{constructor(t){this.state={},this.props=t}render(t,n){return null}setState(t){if(this._oldState=i({},this.state),this._nextState=i({},this._nextState||this.state),"function"==typeof t){const n=t(this._nextState,this.props);if(null==n)return;i(this._nextState,n)}else i(this._nextState,t);var n;(n=this)._dirty=!0,1===H.push(n)&&g.scheduleRender(B)}forceUpdate(t){if(null==this._VNode)return;const n=[],e=!1!==t;J(this._VNode,i({},this._VNode),this._VNode._parentDom,e,{depth:this._depth,batch:n}),"function"==typeof t&&t(),q(n)}}function B(){let t;for(H.sort((t,n)=>t._depth-n._depth);t=H.pop();)t._dirty&&(t._dirty=!1,t.forceUpdate(!1))}function I(t,n){t&&("function"==typeof t?t(n):t.current=n)}function W(n,e,o){const r=n.ref,s=(e||t).ref;r&&r!==s&&(I(r,o),s&&I(e.ref,null))}function $(){return{current:null}}const K=t=>"function"==typeof t&&t!==c;function j(t){return this.constructor(t)}function Z(e,r,s,l){if(e.type===o)return;const a=e._children||n,p=(r||t)._children||n;return a!==p?function(n,e,r,s,l){const a=n.type===c,p=e.length,f=r.length,d=Math.max(p,f),h=a?l.next||(z(r[f-1])||t).nextSibling:null;for(let n=0;n<d;n++){const c=e[n]||(n<p?u(o):null);let a=r[n]||t,f=(z(a)||t).nextSibling||h;J(c,a,s,!1,i({},l,{next:f}))}}(e,a,p,s,l):void 0}function z(e){if(e&&e!==t){for(;K(e.type);)e=e._renders;if(e.type===c){const t=e._children||n;return z(t[t.length-1])}return e._dom}}function G(n,e){if(null==n||n===t)return;I(n.ref,null),G(n._renders,e);const r=n._component;let s;null!=r&&(r.setState=c,r.forceUpdate=c,r._VNode=null,F({name:"componentWillUnmount",bind:r}));const i=n._children;if(i)for(;i.length;)s=i.pop(),G(s,e);!function(n,e){const r=n.type;if("function"!=typeof r){const s=n._dom;null!=s&&(r!==o&&null!=r&&C(s,n.props,t,e),e.batch.push({node:s,action:2,VNode:n}))}}(n,e)}function J(n,e,s,u,l){if(null==n||"boolean"==typeof n)return void G(e,l);if(!((a=n)&&void 0===a.constructor||(console.warn("component not of expected type =>",a),0)))return null;var a;if(e===n)return n._dom;let f=(e=e||t).type,d=n.type,h=K(d);if(d===f&&h&&(n._component=e._component),n._parentDom=s,d!==f){if(!l.next){const n=z(e);l.next=(n||t).nextSibling}G(e,l),e=t}const m=n;if("string"!=typeof n.props&&d!==o&&(n=function(n,e,o,r){let s;if(null!=n&&K(s=n.type)){let c;return e=e||t,c=function(t){const n=t.prototype;return!(!n||!n.render)}(s)?function(n,e,o,r){let s;const c=n.type;let u=n._component;const l=null!=u;if(l){if(s="componentDidUpdate",null!=u.shouldComponentUpdate&&!o&&!1===u.shouldComponentUpdate(n.props,u._nextState||u.state))return t}else s="componentDidMount",u=new c(n.props),n._component=u,u._depth=++r.depth;u._VNode=n;const a=u._oldState,f=e.props;F({bind:u,name:l?"componentWillUpdate":"componentWillMount",args:l?[n.props,u._nextState]:null}),u.state=function(n,e,o){const r=i({},n.state||t,n._nextState||t),s=function(t,n,e){const o=t.getDerivedStateFromProps;return null!=o?i({},o(n,e)):null}(e,o.props,r);return s&&i(r,s),r}(u,c,n),u._oldState=null,u._nextState=null,u.props=n.props;const d=p(u.render(u.props,u.state));return F({bind:u,name:s,args:"componentDidUpdate"===s?[f,a]:[]}),W(n,e,u),d}(n,e,o,r):function(t,n){let e;const o=t.type;let r;return t._component?r=t._component:(r=new O(t.props),t._component=r,r.render=j,r.constructor=o,r.props=t.props,r._depth=++n.depth),r._VNode=t,_.hookSetup(r),e=p(r.render(t.props)),_.hookSetup(null),e}(n,r),n._renders=c,c._renderedBy=n,c}return n}(n,e,u,l)),K(e.type)&&(e=e._renders),n!==m){if(n===t)return;return J(n,e,s,u,l)}let y;return n._children=function(t){let n=t.props.children;if(t.type!==c){if(null==n)return[]}else n&&!n.length&&(n=null);return r([n],p)}(n),f=e.type,d=n.type,d===c?Z(n,e,s,l):(f!==d&&(e=null),function(n,e,r,s){const i=(e=e||t)===t;let c;const u=e._dom;c=n.type!==e.type||null==u?function(t){if("string"==typeof t.props)return document.createTextNode("");{const n=t.type;if(n===o)return document.createComment("$");const e=document.createElement(n);return e._events={},e}}(n):u,c._VNode=n,n._dom=c,function(n,e,r,s){if(e.type===o)return;if(r=r||t,"string"==typeof e.props)return function(t,n,e){return n===e||(t.nodeValue=n)}(n,e.props,r.props);const i=r.props,c=e.props;null!=i&&C(n,i,c,s),function(t,n,e,o){for(let r in e){if(r in v)continue;let s=e[r],i=b[r]?t[r]:n[r];s!==i&&(r="class"===r?"className":r,"className"!==r?o.batch.push("style"!==r?{node:t,action:1,attr:r,value:s}:{node:t,action:3,value:{newValue:s,oldValue:i}}):k(t,s,i,o))}}(n,i||t,c,s)}(c,n,i?null:e,s),function t(n,e){n&&(null!=n._component?n._component.base=e:t(n._renderedBy,e))}(n,c),i&&function(t,n,e){const o=t._dom;if(!o)return;const r=e.next;let s,i=!0;r&&r!==o&&(i=!1,s=r),e.batch.push(!i&&s?{node:o,action:5,refDom:s,value:n,VNode:t}:{node:o,action:4,refDom:n,VNode:t})}(n,r,s)}(n,e,s,l),y=n._dom,Z(n,e,y,l),W(n,e,y)),y}function Q(t,n){const e=u(c,void 0,[t]);n.hasChildNodes()&&function(t){let n;for(;n=t.firstChild;)t.removeChild(n)}(n);const o=[];J(e,void 0,n,!1,{depth:0,batch:o}),q(o)}const X=["boolean","string","number"];function Y(t,n){return null==t||X.indexOf(typeof t)>-1||void 0===t.constructor?t:u(t,n)}class tt extends O{componentDidMount(){this._init()}componentDidUpdate(t){(t&&(t.promise||t.componentPromise))!==(this.props.promise||this.props.componentPromise)&&this._init()}_init(){this.setState({inProgress:!0}),(this.props.promise||this.props.componentPromise)().then(t=>{this.setState({render:t,inProgress:!1})}).catch(t=>this.setState({error:!0,inProgress:!1}))}render(t,n){return n.inProgress?Y(t.fallback||t.fallbackComponent)||"Loading":n.error?Y(t.errorComponent)||"An Error Occured":Y(n.render,function(t,n){n=r([n]);const e={};for(const o in t)-1===n.indexOf(o)&&(e[o]=t[o]);return e}(t,["fallback","fallbackComponent","promise","componentPromise"]))}}const nt=/\/+$/;function et(t){return 1===t.length?t:t.replace(nt,"")}const ot=[],rt={subscribe(t){ot.includes(t)||ot.push(t)},unsubscribe(t){for(let n=0;n<ot.length;n++)if(ot[n]===t)return ot.splice(n,1)},emit(t,n){for(const e of ot)e(t,n)},unsubscribeAll(){ot.length=0}};function st(t){window.history.pushState(null,"",t),rt.emit(t,{type:"load",native:!1})}function it(t){window.history.replaceState(null,"",t),rt.emit(t,{type:"redirect",native:!1})}class ct extends O{constructor(t){super(t),this.state={},this._routeChangeHandler=this._routeChangeHandler.bind(this)}static __emitter(){rt.emit(ct.path+ct.qs,{type:"popstate",native:!0})}static get path(){return location.pathname}static get qs(){return location.search}static get searchParams(){return new URLSearchParams(ct.qs)}static _getParams(t,n){const e={};for(const o in t)e[t[o]]=decodeURIComponent(n[o]);return e}static getCurrentParams(t){const n=(t=ut(t)).params,e=t.regex.exec(ct.path);return e?ct._getParams(n,e):{}}componentDidMount(){rt.subscribe(this._routeChangeHandler),window.addEventListener("popstate",ct.__emitter),this._routeChangeHandler(null)}componentWillUnmount(){window.removeEventListener("popstate",ct.__emitter),rt.unsubscribe(this._routeChangeHandler)}_notFoundComponent(){return u("div",null,`The Requested URL "${ct.path}" was not found`)}_routeChangeHandler(t){const n=et(ct.path);let e=[];this.props.children.forEach(t=>{const o=ut(t.props.match),r=o.regex.exec(n);if(r){const n=t.props,s=ct._getParams(o.params,r);e.push(Y(n.component,i({},t.props,{params:s})))}}),e.length||(e=u(this.props.fallbackComponent||this._notFoundComponent)),this.setState({child:e})}render(t,n){return u(c,null,n.child)}}function ut(t){if(null!=t.regex)return t;t=et(t);const n={};let e=0;return{regex:(o=t.split("/").map(t=>":"===t[0]?(n[++e]=t.substr(1),"([^?\\/]+)"):t).join("/"),RegExp(`^${o}(/?)$`)),params:n};var o}function lt(t){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;t.stopImmediatePropagation&&t.stopImmediatePropagation(),t.stopPropagation&&t.stopPropagation(),t.preventDefault();const n=new URL(this.href,location.href);st(n.pathname+n.search+n.hash)}function at(t){return null!=t.href&&(t.onClick=lt),u("a",t)}const pt={};function ft(t,n){return!t||n.some((n,e)=>n!==t[e])}function dt(t,n,e){return t[n]||(t[n]=ht(0,e))}function ht(t,n){return"function"==typeof n?n(t):n}let mt=0,_t=null;const yt=[];function gt(t){const n=t.cleanUp;"function"==typeof n&&(n(),t.cleanUp=null)}function bt(t){let n=t.cb;n&&"function"==typeof(n=n())&&(t.cleanUp=n),t.cb=null}function vt(){yt.forEach(t=>{for(const e in t)(n=t[e]).resolved||gt(n),bt(n);var n}),yt.length=0}const St=g.debounceEffect||(m?function(t){const n=()=>{cancelAnimationFrame(e),clearTimeout(o),t()};let e,o;o=setTimeout(n,g.RAF_TIMEOUT),e=requestAnimationFrame(n)}:h);function xt(){return[_t,mt++]}function kt(t,n){const e=xt(),o=e[1],r=e[0]._hooksData;let s=r[o]||{};return ft(s.args,n)?(r[o]=null,s=dt(r,o,()=>({hookState:t()})),s.args=n,s.hookState):s.hookState}function Ct(t,n){return kt(()=>t,n)}function Dt(t){return kt(()=>({current:t}),[])}function Ut(){const n=this._pendingEffects;for(const e in n||t)gt(n[e]);this._pendingEffects=null}function Pt(t,n){const e=xt(),o=e[0],r=e[1],s=o._hooksData,i={};let c=s[r]||i;const u=o._pendingEffects=o._pendingEffects||i,l=u[r];if(!ft(c.args,n))return void(l&&(l.resolved=!0));c=dt(s,r,i),c.args=n;const a=l?bt(l)||l.cleanUp:null;var p;u[r]={cb:t,cleanUp:a},-1===yt.indexOf(p=u)&&yt.push(p),o.componentWillUnmount=Ut}function wt(t,n,e){const o=xt(),r=o[0],s=dt(r._hooksData,o[1],()=>({hookState:e?e(n):ht(void 0,n)}));return s.args=t,[s.hookState,t=>{const n=s.args(s.hookState,t);s.hookState=n,r.setState({})}]}function Nt(t){return wt(ht,t)}y("hookSetup",function(t){_t=t,mt=0,t&&(t._hooksData||(t._hooksData=[]))}),y("diffed",function(){St(vt)});export default O;export{at as A,tt as AsyncComponent,O as Component,c as Fragment,pt as Path,ct as Router,rt as RouterSubscription,g as config,u as createElement,$ as createRef,ut as createRoutePath,u as h,st as loadURL,it as redirect,Q as render,Ct as useCallback,Pt as useEffect,kt as useMemo,wt as useReducer,Dt as useRef,Nt as useState};
//# sourceMappingURL=ui-lib.modern.js.map
