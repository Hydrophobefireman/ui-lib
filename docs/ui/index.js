const t={},n=[],e=/^aria[\-A-Z]/,o=/^xlink:?/,r={},s=function(){};function i(t,n){return function t(n,e,o){if(!n)return e;for(let r=0;r<n.length;r++){const s=n[r];Array.isArray(s)?t(s,e,o):e.push(o?o(s):s)}return e}(t,[],n)}const c=t.hasOwnProperty,u=t.constructor.assign||function(t){for(let n=1;n<arguments.length;n++){const e=arguments[n];for(const n in e)c.call(e,n)&&(t[n]=e[n])}return t},l=(t,n)=>{let e,o={};for(e in t)-1===n.indexOf(e)&&(o[e]=t[e]);return o};function a(t,n){-1===t.indexOf(n)&&t.push(n)}const p="undefined"!=typeof Promise?Promise.prototype.then.bind(Promise.resolve()):t=>setTimeout(t),f="function"==typeof requestAnimationFrame,d={createElement:s,_hookSetup:s,diffStart:s,diffEnd:s,lifeCycle:s,domNodeCreated:s,componentInstance:s};function h(t){for(const n in t){const e=t[n];if(!e)throw new Error("invalid callback: "+e);let o=d[n];d[n]=function(){o.apply(0,arguments),e.apply(0,arguments)}}}const m={scheduleRender:f?t=>requestAnimationFrame(t):p,warnOnUnmountRender:!1,RAF_TIMEOUT:100,debounceEffect:null,inMemoryRouter:!1,memoryRouteStore:localStorage,unmountOnError:!0},_=["key","ref"];function y(n,e){if(null==n||"boolean"==typeof n)return null;let o;null==e&&(e=t);const r=e.ref,s=e.key;let c;null!=(e=l(e,_)).children?c=i([e.children]):(o=v(arguments)).length&&(c=i(o)),e.children=c;const u=x(n,e,s,r);return d.createElement(u),u}function g(t){return null==t||"boolean"==typeof t?y(r):"string"==typeof t||"number"==typeof t?x(null,String(t)):Array.isArray(t)?y(s,null,t):t._used?x(t.type,t.props,t.key):(t._used=!0,t)}function x(t,n,e,o){return{type:t,props:n,key:e,ref:o,_dom:null,_children:null,_component:null,_renders:null,_parentDom:null,_used:!1,constructor:void 0}}function v(t){return n.slice.call(t,2)}const b={value:1,checked:1},S={key:1,ref:1,children:1};function k(t,n,e){e=e||"";const o=t.style;if("string"==typeof(n=n||""))return void(o.cssText=n);const r="string"==typeof e;if(r)o.cssText="";else for(const t in e)null==n[t]&&(o[t]="");for(const t in n){const s=n[t];(r||s!==e[t])&&(o[t]=s)}}const C=t=>t.trim();function w(t,n,e,o){const r=Array.isArray;r(n)&&(n=C(n.join(" "))),r(e)&&(e=C(e.join(" "))),n!==e&&o.batch.push({node:t,action:1,attr:o.isSvg?"class":"className",value:n})}function U(t,n,o,r){if("o"===n[0]&&"n"===n[1])return function(t,n,e){n=n.substr(2).toLowerCase();const o=t._events;null==e?(t.removeEventListener(n,E),delete o[n]):(o[n]||t.addEventListener(n,E),o[n]=e)}(t,n,o);const s=null==o||!1===o&&!e.test(n);return!r&&n in t?t[n]=s?"":o:s?t.removeAttribute(n):t.setAttribute(n,o)}function E(t){return this._events[t.type].call(this,t)}function V(t){const n=t.length;for(let e=0;e<n;e++){const n=t[e],r=n.node,s=n.refDom,i=n.value,c=n.VNode;let u=n.attr;switch(n.action){case 4:i.insertBefore(r,s);break;case 1:U(r,u,i);break;case 3:k(r,i.newValue,i.oldValue);break;case 2:R(r),N(c,r);break;case 7:N(c,r);break;case 6:r.removeAttributeNS("http://www.w3.org/1999/xlink",u);break;case 5:u!==(u=u.replace(o,""))?r.setAttributeNS("http://www.w3.org/1999/xlink",u.toLowerCase(),i):U(r,u,i,!0)}}}function R(t){if(null==t)return;const n=t.parentNode;n&&n.removeChild(t)}function N(t,n){!function(t){A(D,t)}(n),function(t){A(P,t)}(t)}const D={_VNode:1,_events:1},P={_children:1,_component:1,_dom:1,_renders:1,_parentDom:1,_used:1,key:1,ref:1};function A(t,n){if(null!=n)for(const e in t)n[e]=null}function M(t,n){t&&("function"==typeof t?t(n):t.current=n)}function O(n,e,o){const r=n.ref,s=(e||t).ref;r&&r!==s&&(M(r,o),s&&M(e.ref,null))}function T(){return{current:null}}function I(){m.warnOnUnmountRender&&console.warn("Component state changed after unmount",this)}function L(n,e,o){if(null==n||n===t)return;o=n.type===s||"string"==typeof n.props?-1:o||0,M(n.ref,null),L(n._renders,e,o);const r=n._component;null!=r&&(r.setState=I,r.forceUpdate=I,r._VNode=null,W({name:"componentWillUnmount",bind:r}));const i=n._children;if(function(t,n,e){let o;!function(t){return"function"!=typeof t.type}(t)?n.batch.push({action:7,VNode:t,node:o}):(o=t._dom,null!=o&&(function(t,n,e){const o=t.props;for(const t in o)"o"===t[0]&&"n"===t[1]&&e.batch.push({action:1,node:n,attr:t})}(t,o,n),n.batch.push({node:o,action:e>0?7:2,VNode:t})))}(n,e,o),i){const t=i.length;for(let n=0;n<t;n++)L(i[n],e,o+1);i.length=0}}const F=[],$=[];function q(t){t.splice(0).forEach(H)}function W(t){const n=t.name;return"componentDidMount"===n?F.push(t):"componentDidUpdate"===n?$.push(t):void H(t)}function H(t){const n=t.name,e=t.bind,o=e[n];if(d.lifeCycle(n,e),e._lastLifeCycleMethod=n,!o)return;const r=t.args,s="function"==typeof e.componentDidCatch;try{o.apply(e,r)}catch(t){if(s)return e.componentDidCatch(t);if(m.unmountOnError){const t=[];L(e._VNode,{batch:t}),V(t)}throw t}}function j(t){V(t),d.diffEnd(),q(F),q($)}const K=[];class B{constructor(t,n){this.state={},this.props=t,this.context=n,d.componentInstance(this,t)}render(t,n,e){return null}setState(t){if(this._oldState=u({},this.state),this._nextState=u({},this._nextState||this.state),"function"==typeof t){const n=t(this._nextState,this.props);if(null==n)return;u(this._nextState,n)}else u(this._nextState,t);G(this)}forceUpdate(t,n){if(null==this._VNode)return;const e=null==n,o=n||[],r=!1!==t;d.diffStart(this,r),et(this._VNode,u({},this._VNode),this._VNode._parentDom,r,{depth:this._depth,batch:o,isSvg:!1,context:this._sharedContext||{}}),"function"==typeof t&&t(),e&&j(o)}}function G(t){t._dirty=!0,1===K.push(t)&&m.scheduleRender(Z)}function Z(){let t;K.sort((t,n)=>t._depth-n._depth);const n=[];for(;t=K.pop();)t._dirty&&(t._dirty=!1,t.forceUpdate(!1,n));j(n)}let z=0;function J(t){const n="$"+z++,e=function(t,n){const e=t.children;return"function"==typeof e?e(n):e[0](n)},o={$id:n,Consumer:e,Provider:class extends B{constructor(t,e){super(t,e),this._subs=[],this._o={[n]:this}}getChildContext(){return this._o}shouldComponentUpdate(t){return t.value!==this.props.value&&this._subs.some(t=>G(t))||!0}add(t){const n=this._subs;a(n,t);const e=t.componentWillUnmount;t.componentWillUnmount=()=>{n.splice(n.indexOf(t),1),e&&e.call(t)}}render(){return y(s,null,this.props.children)}},def:t};return e.contextType=o,o}const Q=t=>"function"==typeof t&&t!==s;function X(t){return this.constructor(t,this.context)}function Y(t,n){t._sharedContext=n.context,t.context=n.contextValue;const e=n.provider;e&&e.add(t)}function tt(e,o,i,c){if(e.type===r)return;const l=e._children||n,a=(o||t)._children||n;return l!==a?function(n,e,o,i,c){const l=n.type===s,a=e.length,p=o.length,f=Math.max(a,p),d=l?c.next||(nt(o[p-1])||t).nextSibling:null;for(let n=0;n<f;n++){const s=e[n]||(n<a?y(r):null);let l=o[n]||t,p=(nt(l)||t).nextSibling||d;et(s,l,i,!1,u({},c,{next:p}))}}(e,l,a,i,c):void 0}function nt(e){if(e&&e!==t){for(;Q(e.type);)e=e._renders;if(e.type===s){const t=e._children||n;return nt(t[t.length-1])}return e._dom}}function et(n,e,c,l,a){if(null==n||"boolean"==typeof n)return void L(e,a);if(!((p=n)&&void 0===p.constructor||(console.warn("component not of expected type =>",p),0)))return null;var p;if(e===n)return n._dom;let f=(e=e||t).type,h=n.type,m=Q(h);if(h===f&&m&&(n._component=e._component),n._parentDom=c,n._used=!0,h!==f){if(!a.next){const n=nt(e);a.next=(n||t).nextSibling}L(e,a),e=t}const _=n;if("string"!=typeof n.props&&h!==r&&(n=function(n,e,o,r){let s;if(null!=n&&Q(s=n.type)){let i;e=e||t;const c=s.contextType,l=c&&r.context[c.$id];r.contextValue=l?l.props.value:c&&c.def,r.provider=l,i=function(t){const n=t.prototype;return!(!n||!n.render)}(s)?function(n,e,o,r){let s;const i=n.type;let c=n._component;const l=null!=c;if(l){if(s="componentDidUpdate",null!=c.shouldComponentUpdate&&!o&&!1===c.shouldComponentUpdate(n.props,c._nextState||c.state))return t}else s="componentDidMount",c=new i(n.props,r.contextValue),n._component=c,c._depth=++r.depth;Y(c,r),c._VNode=n;const a=c._oldState,p=e.props;W({bind:c,name:l?"componentWillUpdate":"componentWillMount",args:l?[n.props,c._nextState,r.contextValue]:null}),c.state=function(n,e,o){const r=u({},n.state||t,n._nextState||t),s=function(t,n,e){const o=t.getDerivedStateFromProps;return null!=o?u({},o(n,e)):null}(e,o.props,r);return s&&u(r,s),r}(c,i,n),c._oldState=null,c._nextState=null,c.props=n.props;const f=g(c.render(c.props,c.state,r.contextValue));let d=null;return l&&null!=c.getSnapshotBeforeUpdate&&(d=c.getSnapshotBeforeUpdate(p,a)),W({bind:c,name:s,args:l?[p,a,d]:[]}),O(n,e,c),f}(n,e,o,r):function(t,n){let e;const o=t.type;let r;return t._component?r=t._component:(r=new B(t.props,n.contextValue),t._component=r,r.render=X,r.constructor=o,r.props=t.props,r._depth=++n.depth),Y(r,n),r._VNode=t,d._hookSetup(r),e=g(r.render(t.props,null,n.contextValue)),d._hookSetup(null),e}(n,r),n._renders=i,r.provider=r.contextValue=void 0;const a=n._component;if(a&&"function"==typeof a.getChildContext){const t=a.getChildContext();r.context=u({},r.context,t)}return i}return n}(n,e,l,a),a.isSvg="svg"===n.type||a.isSvg),Q(e.type)&&(e=e._renders),n!==_){if(n===t)return;return et(n,e,c,l,a)}let y;return n._children=function(t){let n=t.props.children;if(t.type!==s){if(null==n)return[]}else n&&!n.length&&(n=null);return i([n],g)}(n),f=e.type,h=n.type,f!==h&&(e=null),h===s?tt(n,e,c,a):(function(n,e,s,i){const c=(e=e||t)===t;let u;const l=e._dom;u=n.type!==e.type||null==l?function(t,n){if("string"==typeof t.props)return document.createTextNode("");{const e=t.type;if(e===r)return document.createComment("$");let o;return o=n.isSvg?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e),o._events={},d.domNodeCreated(o,t),o}}(n,i):l,u._VNode=n,n._dom=u,function(n,e,s,i){if(e.type===r)return;if(s=s||t,"string"==typeof e.props)return function(t,n,e){return n===e||(t.nodeValue=n)}(n,e.props,s.props);const c=s.props,u=e.props;null!=c&&function(t,n,e,r){for(let s in n)if(!S[s]&&null==e[s]&&null!=n[s]){const n=s===(s=s.replace(o,""))?1:6;r.batch.push({node:t,action:n,attr:s})}}(n,c,u,i),function(t,n,e,o){for(let r in e){if(r in S)continue;let s=e[r],i=b[r]?t[r]:n[r];s!==i&&(r="class"===r?"className":r,"className"!==r?o.batch.push("style"!==r?{node:t,action:o.isSvg?5:1,attr:r,value:s}:{node:t,action:3,value:{newValue:s,oldValue:i}}):w(t,s,i,o))}}(n,c||t,u,i)}(u,n,c?null:e,i),c&&i.batch.push({node:u,action:4,refDom:i.next,value:s,VNode:n})}(n,e,c,a),y=n._dom,a.isSvg="foreignObject"!=h&&a.isSvg,tt(n,e,y,a),O(n,e,y)),y}function ot(t,n){const e=y(s,void 0,[t]);n.hasChildNodes()&&function(t){let n;for(;n=t.firstChild;)t.removeChild(n)}(n);const o=[];et(e,void 0,n,!1,{depth:0,batch:o,isSvg:void 0!==n.ownerSVGElement,context:{}}),j(o)}const rt=["boolean","string","number"];function st(t,n){return null==t||rt.indexOf(typeof t)>-1?t:void 0===t.constructor?function(t){let n;return(n=(t=function(t,n){if(!t)return null;n=u({},t.props,n),arguments.length>2&&(n.children=v(arguments));let e=l(n,_);return x(t.type,e,n.key||t.key,n.ref||t.ref)}(t)).props.children)&&(t.props.children=i([n],st)),t}(t):y(t,n)}const it=t=>t.promise||t.componentPromise;class ct extends B{componentDidMount(){this._init()}componentDidUpdate(t){(t&&it(t))!==it(this.props)&&this._init()}_init(){this.setState({inProgress:!0});const t=it(this.props);t().then(n=>{t===it(this.props)&&this.setState({render:n,inProgress:!1,error:!1})}).catch(t=>this.setState({error:!0,inProgress:!1}))}render(t,n){return n.inProgress?st(t.fallback||t.fallbackComponent)||"Loading":n.error?st(t.errorComponent)||"An Error Occured":st(n.render,l(t,["fallback","fallbackComponent","promise","componentPromise"]))}}const ut=/\/+$/;function lt(t){return 1===t.length?t:t.replace(ut,"")}const at=[],pt={subscribe(t){a(at,t)},unsubscribe(t){at.splice(at.indexOf(t),1)},emit(t,n){at.forEach(e=>e(t,n))},unsubscribeAll(){at.length=0}};function ft(t,n){if(!m.inMemoryRouter)return window.history[n](null,"",t);m.memoryRouteStore.setItem("UI--ROUTE",t)}function dt(t){ft(t,"pushState"),pt.emit(t,{type:"load",native:!1})}function ht(t){ft(t,"replaceState"),pt.emit(t,{type:"redirect",native:!1})}class mt extends B{constructor(t){super(t),this.state={},this._routeChangeHandler=this._routeChangeHandler.bind(this),this.componentDidUpdate=this._setRouteMethod}_setRouteMethod(){m.inMemoryRouter=!!this.props.inMemoryRouter}static __emitter(){pt.emit(mt.path+mt.qs,{type:"popstate",native:!0})}static get path(){return location.pathname}static get qs(){return location.search}static get searchParams(){return new URLSearchParams(mt.qs)}static _getParams(t,n){const e={};for(const o in t)e[t[o]]=decodeURIComponent(n[o]);return e}static getCurrentParams(t){const n=(t=_t(t)).params,e=t.regex.exec(mt.path);return e?mt._getParams(n,e):{}}componentDidMount(){this._setRouteMethod(),pt.subscribe(this._routeChangeHandler),window.addEventListener("popstate",mt.__emitter),this._routeChangeHandler(null)}componentWillUnmount(){window.removeEventListener("popstate",mt.__emitter),pt.unsubscribe(this._routeChangeHandler)}_notFoundComponent(){return y("div",null,`The Requested URL "${mt.path}" was not found`)}_routeChangeHandler(t){const n=lt(m.inMemoryRouter?m.memoryRouteStore.getItem("UI--ROUTE")||this.props.defaultRoute||"/":mt.path);let e=[];this.props.children.forEach(t=>{const o=_t(t.props.match),r=o.regex.exec(n);if(r){const n=t.props,s=mt._getParams(o.params,r);e.push(st(n.component,u({},t.props,{params:s})))}}),e.length||(e=y(this.props.fallbackComponent||this._notFoundComponent)),this.setState({child:e})}render(t,n){return y(s,null,n.child)}}function _t(t){if(!t)throw Error("Invalid value for match: "+t);if(null!=t.regex)return t;t=lt(t);const n={};let e=0;return{regex:(o=t.split("/").map(t=>":"===t[0]?(n[++e]=t.substr(1),"([^?\\/]+)"):t).join("/"),RegExp(`^${o}(/?)$`)),params:n};var o}function yt(t){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;t.stopImmediatePropagation&&t.stopImmediatePropagation(),t.stopPropagation&&t.stopPropagation(),t.preventDefault();const n=new URL(this.href,location.href);dt(n.pathname+n.search+n.hash)}function gt(t,n,e){return t.call(e,n)}class xt extends B{constructor(t){super(t),this._onClick=t=>{const n=t.currentTarget;gt(yt,t,n);const e=this.props.onClick;e&&gt(e,t,n)}}render(t){return y("a",u({},t,{onClick:this._onClick}))}}const vt={};function bt(t,n){return!t||n.some((n,e)=>n!==t[e])}function St(t,n,e){return t[n]||(t[n]=kt(0,e))}function kt(t,n){return"function"==typeof n?n(t):n}let Ct=0,wt=null;const Ut=[],Et=[];function Vt(t){const n=t.cleanUp;"function"==typeof n&&(n(),t.cleanUp=null)}function Rt(t){let n=t.cb;n&&"function"==typeof(n=n())&&(t.cleanUp=n),t.cb=null}function Nt(t){t.resolved||Vt(t),Rt(t)}function Dt(t){t.forEach(t=>{for(const n in t)Nt(t[n])})}function Pt(){return Dt(Ut)}const At=m.debounceEffect||(f?function(t){const n=()=>{cancelAnimationFrame(e),clearTimeout(o),t()};let e,o;o=setTimeout(n,m.RAF_TIMEOUT),e=requestAnimationFrame(n)}:p);function Mt(){return[wt,Ct++]}function Ot(t,n){const e=Mt(),o=e[1],r=e[0]._hooksData;let s=r[o]||{};return bt(s.args,n)?(r[o]=null,s=St(r,o,()=>({hookState:t()})),s.args=n,s.hookState):s.hookState}function Tt(t,n){return Ot(()=>t,n)}function It(t){const n=Mt(),e=n[0],o=n[1],r=e._sharedContext&&e._sharedContext[t.$id];if(!r)return t.def;const s=e._hooksData;St(s,o,{args:null,hookState:!1});const i=s[o];return i.hookState||(i.hookState=!0,r.add(e)),r.props.value}function Lt(n,e){for(const e in n||t)Vt(n[e]);e._pendingEffects=null}function Ft(){const n=this._pendingEffects||t,e=n.async;Lt(n.sync,this),Lt(e,this)}function $t(t,n,e){const o=e===Et?"sync":"async",r=Mt(),s=r[0],i=r[1],c=s._hooksData;let u=c[i]||{};const l=(s._pendingEffects=s._pendingEffects||{sync:{},async:{}})[o],p=l[i];if(!bt(u.args,n))return void(p&&(p.resolved=!0));c[i]=u,u.args=n;const f=p?(p.resolved=!1)||Rt(p)||p.cleanUp:null;l[i]={cb:t,cleanUp:f},a(e,l),s.componentWillUnmount=Ft}function qt(t,n){return $t(t,n,Ut)}function Wt(t,n){return $t(t,n,Et)}h({_hookSetup:function(t){wt=t,Ct=0,t&&(t._hooksData||(t._hooksData=[]))},diffEnd:function(){Dt(Et),At(Pt)}});const Ht={};function jt(t,n,e){const o=Mt(),r=o[0],s=St(r._hooksData,o[1],()=>({hookState:e?e(n):kt(null,n)}));return[s.hookState,s.args||(s.args=n=>{const e=t(s.hookState,n);s.hookState=e,r.setState(Ht)})]}function Kt(t){return Ot(()=>({current:t}),[])}function Bt(t){return jt(kt,t)}export default B;export{xt as A,ct as AsyncComponent,B as Component,s as Fragment,vt as Path,mt as Router,pt as RouterSubscription,h as addPluginCallback,m as config,J as createContext,y as createElement,T as createRef,_t as createRoutePath,y as h,dt as loadURL,ht as redirect,ot as render,Tt as useCallback,It as useContext,qt as useEffect,Wt as useLayoutEffect,Ot as useMemo,jt as useReducer,Kt as useRef,Bt as useState};
//# sourceMappingURL=ui-lib.modern.js.map
