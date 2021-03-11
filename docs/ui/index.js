const t={},n=[],e=/^aria[\-A-Z]/,o=/^xlink:?/,r={},s=function(){};function i(t,n,e){if(!t)return n;for(let o=0;o<t.length;o++){const r=t[o];Array.isArray(r)?i(r,n,e):n.push(e?e(r):r)}return n}function c(t,n){return i(t,[],n)}const u=t.hasOwnProperty,l=t.constructor,a=l.assign||function(t){for(let n=1;n<arguments.length;n++){const e=arguments[n];for(const n in e)u.call(e,n)&&(t[n]=e[n])}return t},p=(t,n)=>{let e,o={};for(e in t)-1===n.indexOf(e)&&(o[e]=t[e]);return o};function f(t,n){-1===t.indexOf(n)&&t.push(n)}function d(t){return n.slice.call(t,2)}const h=l.create||function(){return{}},m="undefined"!=typeof Promise?Promise.prototype.then.bind(Promise.resolve()):t=>setTimeout(t),_="function"==typeof requestAnimationFrame,y={createElement:s,_hookSetup:s,diffStart:s,diffEnd:s,lifeCycle:s,domNodeCreated:s,componentInstance:s};function g(t){for(const n in t){const e=t[n];if(!e)throw new Error("invalid callback: "+e);let o=y[n];y[n]=function(){o.apply(0,arguments),e.apply(0,arguments)}}}const x={scheduleRender:_?t=>requestAnimationFrame(t):m,warnOnUnmountRender:!1,RAF_TIMEOUT:100,debounceEffect:null,inMemoryRouter:!1,memoryRouteStore:localStorage,unmountOnError:!0},v=["key","ref"];function S(n,e){if(null==n||"boolean"==typeof n)return null;let o;null==e&&(e=t);const r=e.ref,s=e.key;let i;null!=(e=p(e,v)).children?i=c([e.children]):(o=d(arguments)).length&&(i=c(o)),e.children=i;const u=k(n,e,s,r);return y.createElement(u),u}function b(t){return null==t||"boolean"==typeof t?S(r):"string"==typeof t||"number"==typeof t?k(null,String(t)):Array.isArray(t)?S(s,null,t):t._used?k(t.type,t.props,t.key):(t._used=!0,t)}function k(t,n,e,o){return a(h(null),{type:t,props:n,key:e,ref:o,_dom:null,_children:null,_component:null,_renders:null,_parentDom:null,_used:!1,constructor:void 0})}const C={value:1,checked:1},w={key:1,ref:1,children:1};function U(t,n,e){e=e||"";const o=t.style;if("string"==typeof(n=n||""))return void(o.cssText=n);const r="string"==typeof e;if(r)o.cssText="";else for(const t in e)null==n[t]&&(o[t]="");for(const t in n){const s=n[t];(r||s!==e[t])&&(o[t]=s)}}const E=t=>t.trim();function V(t,n,e,o){const r=Array.isArray;r(n)&&(n=E(n.join(" "))),r(e)&&(e=E(e.join(" "))),n!==e&&o.batch.push({node:t,action:1,attr:o.isSvg?"class":"className",value:n})}function N(t,n,o,r){if("o"===n[0]&&"n"===n[1])return function(t,n,e){n=n.substr(2).toLowerCase();const o=t._events;null==e?(t.removeEventListener(n,R),delete o[n]):(o[n]||t.addEventListener(n,R),o[n]=e)}(t,n,o);const s=null==o||!1===o&&!e.test(n);return!r&&n in t?t[n]=s?"":o:s?t.removeAttribute(n):t.setAttribute(n,o)}function R(t){return this._events[t.type].call(this,t)}function D(t){const n=[];for(let e=0;e<t.length;e++){const r=t[e],s=r.node,i=r.action;if(2===i){n.push(r);continue}const c=r.refDom,u=r.value,l=r.VNode;let a=r.attr;switch(i){case 4:u.insertBefore(s,c);break;case 1:N(s,a,u);break;case 3:U(s,u.newValue,u.oldValue);break;case 7:A(l,s);break;case 6:s.removeAttributeNS("http://www.w3.org/1999/xlink",a);break;case 5:a!==(a=a.replace(o,""))?s.setAttributeNS("http://www.w3.org/1999/xlink",a.toLowerCase(),u):N(s,a,u,!0)}}for(let t=0;t<n.length;t++){const e=n[t],o=e.node,r=e.VNode;P(o),A(r,o)}}function P(t){if(null==t)return;const n=t.parentNode;n&&n.removeChild(t)}function A(t,n){!function(t){T(M,t)}(n),function(t){T(O,t)}(t)}const M={_VNode:1,_events:1},O={_children:1,_component:1,_dom:1,_renders:1,_parentDom:1,_used:1,key:1,ref:1};function T(t,n){if(null!=n)for(const e in t)n[e]=null}function I(t,n){t&&("function"==typeof t?t(n):t.current=n)}function L(n,e,o){const r=n.ref,s=(e||t).ref;r&&r!==s&&(I(r,o),s&&I(e.ref,null))}function F(){return{current:null}}function $(){x.warnOnUnmountRender&&console.warn("Component state changed after unmount",this)}function W(n,e,o){if(null==n||n===t)return;o=n.type===s||"string"==typeof n.props?-1:o||0,I(n.ref,null),W(n._renders,e,o);const r=n._component;null!=r&&(r.setState=$,r.forceUpdate=$,r._VNode=null,K({name:"componentWillUnmount",bind:r}));const i=n._children;if(function(t,n,e){let o;!function(t){return"function"!=typeof t.type}(t)?n.batch.push({action:7,VNode:t,node:o}):(o=t._dom,null!=o&&(function(t,n,e){const o=t.props;for(const t in o)"o"===t[0]&&"n"===t[1]&&e.batch.push({action:1,node:n,attr:t})}(t,o,n),n.batch.push({node:o,action:e>0?7:2,VNode:t})))}(n,e,o),i){const t=i.length;for(let n=0;n<t;n++)W(i[n],e,o+1);i.length=0}}const q=[],H=[];function j(t){t.splice(0).forEach(B)}function K(t){const n=t.name;return"componentDidMount"===n?q.push(t):"componentDidUpdate"===n?H.push(t):void B(t)}function B(t){const n=t.name,e=t.bind,o=e[n];if(y.lifeCycle(n,e),e._lastLifeCycleMethod=n,!o)return;const r=t.args,s="function"==typeof e.componentDidCatch;try{o.apply(e,r)}catch(t){if(s)return e.componentDidCatch(t);if(x.unmountOnError){const t=[];W(e._VNode,{batch:t}),D(t)}throw t}}function G(t){D(t),y.diffEnd(),j(q),j(H)}const Z=[];class z{constructor(t,n){this.state={},this.props=t,this.context=n,y.componentInstance(this,t)}render(t,n,e){return null}setState(t){if(this._oldState=a({},this.state),this._nextState=a({},this._nextState||this.state),"function"==typeof t){const n=t(this._nextState,this.props);if(null==n)return;a(this._nextState,n)}else a(this._nextState,t);J(this)}forceUpdate(t,n){if(null==this._VNode)return;const e=null==n,o=n||[],r=!1!==t;y.diffStart(this,r),st(this._VNode,a({},this._VNode),this._VNode._parentDom,r,{depth:this._depth,batch:o,isSvg:!1,context:this._sharedContext||{}}),"function"==typeof t&&t(),e&&G(o)}}function J(t){t._dirty=!0,1===Z.push(t)&&x.scheduleRender(Q)}function Q(){let t;Z.sort((t,n)=>t._depth-n._depth);const n=[];for(;t=Z.pop();)t._dirty&&(t._dirty=!1,t.forceUpdate(!1,n));G(n)}let X=0;function Y(t){const n="$"+X++,e=function(t,n){const e=t.children;return"function"==typeof e?e(n):e[0](n)},o={$id:n,Consumer:e,Provider:class extends z{constructor(t,e){super(t,e),this._subs=[],this._o={[n]:this}}getChildContext(){return this._o}shouldComponentUpdate(t){return t.value!==this.props.value&&this._subs.some(t=>J(t))||!0}add(t){const n=this._subs;f(n,t);const e=t.componentWillUnmount;t.componentWillUnmount=()=>{n.splice(n.indexOf(t),1),e&&e.call(t)}}render(){return S(s,null,this.props.children)}},def:t};return e.contextType=o,o}const tt=t=>"function"==typeof t&&t!==s;function nt(t){return this.constructor(t,this.context)}function et(t,n){t._sharedContext=n.context,t.context=n.contextValue;const e=n.provider;e&&e.add(t)}function ot(e,o,i,c){if(e.type===r)return;const u=e._children||n,l=(o||t)._children||n;return u!==l?function(n,e,o,i,c){const u=n.type===s,l=e.length,p=o.length,f=Math.max(l,p),d=u?c.next||(rt(o[p-1])||t).nextSibling:null;for(let n=0;n<f;n++){const s=e[n]||(n<l?S(r):null);let u=o[n]||t,p=(rt(u)||t).nextSibling||d;st(s,u,i,!1,a({},c,{next:p}))}}(e,u,l,i,c):void 0}function rt(e){if(e&&e!==t){for(;tt(e.type);)e=e._renders;if(e.type===s){const t=e._children||n;return rt(t[t.length-1])}return e._dom}}function st(n,e,i,u,l){if(null==n||"boolean"==typeof n)return void W(e,l);if(!((p=n)&&void 0===p.constructor||(console.warn("component not of expected type =>",p),0)))return null;var p;if(e===n)return n._dom;let f=(e=e||t).type,d=n.type,h=tt(d);if(d===f&&h&&(n._component=e._component),n._parentDom=i,n._used=!0,d!==f){if(!l.next){const n=rt(e);l.next=(n||t).nextSibling}W(e,l),e=t}const m=n;if("string"!=typeof n.props&&d!==r&&(n=function(n,e,o,r){let s;if(null!=n&&tt(s=n.type)){let i;e=e||t;const c=s.contextType,u=c&&r.context[c.$id];r.contextValue=u?u.props.value:c&&c.def,r.provider=u,i=function(t){const n=t.prototype;return!(!n||!n.render)}(s)?function(n,e,o,r){let s;const i=n.type;let c=n._component;const u=null!=c;if(u){if(s="componentDidUpdate",null!=c.shouldComponentUpdate&&!o&&!1===c.shouldComponentUpdate(n.props,c._nextState||c.state))return t}else s="componentDidMount",c=new i(n.props,r.contextValue),n._component=c,c._depth=++r.depth;et(c,r),c._VNode=n;const l=c._oldState,p=e.props;K({bind:c,name:u?"componentWillUpdate":"componentWillMount",args:u?[n.props,c._nextState,r.contextValue]:null}),c.state=function(n,e,o){const r=a({},n.state||t,n._nextState||t),s=function(t,n,e){const o=t.getDerivedStateFromProps;return null!=o?a({},o(n,e)):null}(e,o.props,r);return s&&a(r,s),r}(c,i,n),c._oldState=null,c._nextState=null,c.props=n.props;const f=b(c.render(c.props,c.state,r.contextValue));let d=null;return u&&null!=c.getSnapshotBeforeUpdate&&(d=c.getSnapshotBeforeUpdate(p,l)),K({bind:c,name:s,args:u?[p,l,d]:[]}),L(n,e,c),f}(n,e,o,r):function(t,n){let e;const o=t.type;let r;return t._component?r=t._component:(r=new z(t.props,n.contextValue),t._component=r,r.render=nt,r.constructor=o,r.props=t.props,r._depth=++n.depth),et(r,n),r._VNode=t,y._hookSetup(r),e=b(r.render(t.props,null,n.contextValue)),y._hookSetup(null),e}(n,r),n._renders=i,r.provider=r.contextValue=void 0;const l=n._component;if(l&&"function"==typeof l.getChildContext){const t=l.getChildContext();r.context=a({},r.context,t)}return i}return n}(n,e,u,l),l.isSvg="svg"===n.type||l.isSvg),tt(e.type)&&(e=e._renders),n!==m){if(n===t)return;return st(n,e,i,u,l)}let _;return n._children=function(t){let n=t.props.children;if(t.type!==s){if(null==n)return[]}else n&&!n.length&&(n=null);return c([n],b)}(n),f=e.type,d=n.type,f!==d&&(e=null),d===s?ot(n,e,i,l):(function(n,e,s,i){const c=(e=e||t)===t;let u;const l=e._dom;u=n.type!==e.type||null==l?function(t,n){if("string"==typeof t.props)return document.createTextNode("");{const e=t.type;if(e===r)return document.createComment("$");let o;return o=n.isSvg?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e),o._events={},y.domNodeCreated(o,t),o}}(n,i):l,u._VNode=n,n._dom=u,function(n,e,s,i){if(e.type===r)return;if(s=s||t,"string"==typeof e.props)return function(t,n,e){return n===e||(t.nodeValue=n)}(n,e.props,s.props);const c=s.props,u=e.props;null!=c&&function(t,n,e,r){for(let s in n)if(!w[s]&&null==e[s]&&null!=n[s]){const n=s===(s=s.replace(o,""))?1:6;r.batch.push({node:t,action:n,attr:s})}}(n,c,u,i),function(t,n,e,o){for(let r in e){if(r in w)continue;let s=e[r],i=C[r]?t[r]:n[r];s!==i&&(r="class"===r?"className":r,"className"!==r?o.batch.push("style"!==r?{node:t,action:o.isSvg?5:1,attr:r,value:s}:{node:t,action:3,value:{newValue:s,oldValue:i}}):V(t,s,i,o))}}(n,c||t,u,i)}(u,n,c?null:e,i),c&&i.batch.push({node:u,action:4,refDom:i.next,value:s,VNode:n})}(n,e,i,l),_=n._dom,l.isSvg="foreignObject"!=d&&l.isSvg,ot(n,e,_,l),L(n,e,_)),_}function it(t,n){let e;const o=S(s,e,[t]);n.hasChildNodes()&&function(t){let n;for(;n=t.firstChild;)t.removeChild(n)}(n);const r=[];st(o,e,n,!1,{depth:0,batch:r,isSvg:void 0!==n.ownerSVGElement,context:{}}),G(r)}const ct=["boolean","string","number"];function ut(t,n){return null==t||ct.indexOf(typeof t)>-1?t:void 0===t.constructor?function(t){let n;return(n=(t=function(t,n){if(!t)return null;n=a({},t.props,n),arguments.length>2&&(n.children=d(arguments));let e=p(n,v);return k(t.type,e,n.key||t.key,n.ref||t.ref)}(t)).props.children)&&(t.props.children=c([n],ut)),t}(t):S(t,n)}const lt=t=>t.promise||t.componentPromise;class at extends z{componentDidMount(){this._init()}componentDidUpdate(t){(t&&lt(t))!==lt(this.props)&&this._init()}_init(){this.setState({inProgress:!0});const t=lt(this.props);t().then(n=>{t===lt(this.props)&&this.setState({render:n,inProgress:!1,error:!1})}).catch(t=>this.setState({error:!0,inProgress:!1}))}render(t,n){return n.inProgress?ut(t.fallback||t.fallbackComponent)||"Loading":n.error?ut(t.errorComponent)||"An Error Occured":ut(n.render,p(t,["fallback","fallbackComponent","promise","componentPromise"]))}}const pt=/\/+$/;function ft(t){return 1===t.length?t:t.replace(pt,"")}const dt=[],ht={subscribe(t){f(dt,t)},unsubscribe(t){dt.splice(dt.indexOf(t),1)},emit(t,n){dt.forEach(e=>e(t,n))},unsubscribeAll(){dt.length=0}};function mt(t,n){if(!x.inMemoryRouter)return window.history[n](null,"",t);x.memoryRouteStore.setItem("UI--ROUTE",t)}function _t(t){mt(t,"pushState"),ht.emit(t,{type:"load",native:!1})}function yt(t){mt(t,"replaceState"),ht.emit(t,{type:"redirect",native:!1})}class gt extends z{constructor(t){super(t),this.state={},this._routeChangeHandler=this._routeChangeHandler.bind(this),this.componentDidUpdate=this._setRouteMethod}_setRouteMethod(){x.inMemoryRouter=!!this.props.inMemoryRouter}static __emitter(){ht.emit(gt.path+gt.qs,{type:"popstate",native:!0})}static get path(){return location.pathname}static get qs(){return location.search}static get searchParams(){return new URLSearchParams(gt.qs)}static _getParams(t,n){const e={};for(const o in t)e[t[o]]=decodeURIComponent(n[o]);return e}static getCurrentParams(t){const n=(t=xt(t)).params,e=t.regex.exec(gt.path);return e?gt._getParams(n,e):{}}componentDidMount(){this._setRouteMethod(),ht.subscribe(this._routeChangeHandler),window.addEventListener("popstate",gt.__emitter),this._routeChangeHandler(null)}componentWillUnmount(){window.removeEventListener("popstate",gt.__emitter),ht.unsubscribe(this._routeChangeHandler)}_notFoundComponent(){return S("div",null,`The Requested URL "${gt.path}" was not found`)}_routeChangeHandler(t){const n=this._previous,e=gt.path;if(this._previous=e,n===e)return;const o=ft(x.inMemoryRouter?x.memoryRouteStore.getItem("UI--ROUTE")||this.props.defaultRoute||"/":gt.path);let r=[];this.props.children.forEach(t=>{const n=xt(t.props.match),e=n.regex.exec(o);if(e){const o=t.props,s=gt._getParams(n.params,e);r.push(ut(o.component,a({},t.props,{params:s})))}}),r.length||(r=S(this.props.fallbackComponent||this._notFoundComponent)),this.setState({child:r})}render(t,n){return S(s,null,n.child)}}function xt(t){if(!t)throw Error("Invalid value for match: "+t);if(null!=t.regex)return t;t=ft(t);const n={};let e=0;return{regex:(o=t.split("/").map(t=>":"===t[0]?(n[++e]=t.substr(1),"([^?\\/]+)"):t).join("/"),RegExp(`^${o}(/?)$`)),params:n};var o}function vt(t){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;t.stopImmediatePropagation&&t.stopImmediatePropagation(),t.stopPropagation&&t.stopPropagation(),t.preventDefault();const n=new URL(this.href,location.href);_t(n.pathname+n.search+n.hash)}function St(t,n,e){return t.call(e,n)}class bt extends z{constructor(t){super(t),this._onClick=t=>{const n=t.currentTarget;St(vt,t,n);const e=this.props.onClick;e&&St(e,t,n)}}render(t){return S("a",a({},t,{onClick:this._onClick}))}}const kt={};function Ct(t,n){return!t||n.some((n,e)=>n!==t[e])}function wt(t,n,e){return t[n]||(t[n]=Ut(0,e))}function Ut(t,n){return"function"==typeof n?n(t):n}let Et=0,Vt=null;const Nt=[],Rt=[];function Dt(t){const n=t.cleanUp;"function"==typeof n&&(n(),t.cleanUp=null)}function Pt(t){let n=t.cb;n&&"function"==typeof(n=n())&&(t.cleanUp=n),t.resolved=!0,t.cb=null}function At(t){t.resolved||Dt(t),Pt(t)}function Mt(t){t.forEach(t=>{for(const n in t)At(t[n])})}function Ot(){return Mt(Nt)}const Tt=x.debounceEffect||(_?function(t){const n=()=>{cancelAnimationFrame(e),clearTimeout(o),t()};let e,o;o=setTimeout(n,x.RAF_TIMEOUT),e=requestAnimationFrame(n)}:m);function It(){if(null==Vt)throw new Error("Hook candidate not found, make sure you're running cooks inside a component");return[Vt,Et++]}function Lt(t,n){const e=It(),o=e[1],r=e[0]._hooksData;let s=r[o]||{};return Ct(s.args,n)?(r[o]=null,s=wt(r,o,()=>({hookState:t()})),s.args=n,s.hookState):s.hookState}function Ft(t,n){return Lt(()=>t,n)}function $t(t){const n=It(),e=n[0],o=n[1],r=e._sharedContext&&e._sharedContext[t.$id];if(!r)return t.def;const s=e._hooksData;wt(s,o,{args:null,hookState:!1});const i=s[o];return i.hookState||(i.hookState=!0,r.add(e)),r.props.value}function Wt(n,e){for(const e in n||t)Dt(n[e]);e._pendingEffects=null}function qt(){const n=this._pendingEffects||t,e=n.async;Wt(n.sync,this),Wt(e,this)}function Ht(t,n,e){const o=e===Rt?"sync":"async",r=It(),s=r[0],i=r[1],c=s._hooksData;let u=c[i]||{};const l=(s._pendingEffects=s._pendingEffects||{sync:{},async:{}})[o],a=l[i];if(!Ct(u.args,n))return void(a&&(a.resolved=!0));c[i]=u,u.args=n;const p=a?(a.resolved=!1)||Pt(a)||a.cleanUp:null;if(l[i]={cb:t,cleanUp:p},f(e,l),!s.__attachedUnmount){s.__attachedUnmount=!0;const t=s.componentWillUnmount;s.componentWillUnmount=t?function(){t.call(s),qt.call(s)}:qt}}function jt(t,n){return Ht(t,n,Nt)}function Kt(t,n){return Ht(t,n,Rt)}g({_hookSetup:function(t){Vt=t,Et=0,t&&(t._hooksData||(t._hooksData=[]))},diffEnd:function(){Mt(Rt),Tt(Ot)}});const Bt={};function Gt(t,n,e){const o=It(),r=o[0],s=wt(r._hooksData,o[1],()=>({hookState:e?e(n):Ut(null,n)}));return[s.hookState,s.args||(s.args=n=>{const e=t(s.hookState,n);s.hookState=e,r.setState(Bt)})]}function Zt(t){return Lt(()=>({current:t}),[])}function zt(t){return Gt(Ut,t)}export default z;export{bt as A,at as AsyncComponent,z as Component,s as Fragment,kt as Path,gt as Router,ht as RouterSubscription,g as addPluginCallback,x as config,Y as createContext,S as createElement,F as createRef,xt as createRoutePath,S as h,_t as loadURL,yt as redirect,it as render,Ft as useCallback,$t as useContext,jt as useEffect,Kt as useLayoutEffect,Lt as useMemo,Gt as useReducer,Zt as useRef,zt as useState};
//# sourceMappingURL=ui-lib.modern.js.map
