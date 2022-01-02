const t={},e=[],n=/^aria[\-A-Z]/,o=/^xlink:?/,r={},s=function(){},i="undefined"!=typeof Promise?Promise.prototype.then.bind(Promise.resolve()):t=>setTimeout(t),c="function"==typeof requestAnimationFrame,u={createElement:s,_hookSetup:s,diffStart:s,diffEnd:s,lifeCycle:s,domNodeCreated:s,componentInstance:s};function l(t){for(const e in t){const n=t[e];if(!n)throw new Error("invalid callback: "+n);let o=u[e];u[e]=function(){o.apply(0,arguments),n.apply(0,arguments)}}}function a(t){const e=e=>{cancelAnimationFrame(n),clearTimeout(o),t()};let n,o=setTimeout(e,p.RAF_TIMEOUT);n=window.requestAnimationFrame(e)}const p={scheduleRender:c?a:i,warnOnUnmountRender:!1,RAF_TIMEOUT:100,debounceEffect:null,inMemoryRouter:!1,memoryRouteStore:"undefined"!=typeof window&&window.localStorage,unmountOnError:!0,isSSR:!1};function d(t,e,n){if(!t)return e;for(let o=0;o<t.length;o++){const r=t[o];Array.isArray(r)?d(r,e,n):e.push(n?n(r):r)}return e}function f(t,e){return d(t,[],e)}const h=t.hasOwnProperty,m=t.constructor,_=m.assign||function(t){for(let e=1;e<arguments.length;e++){const n=arguments[e];for(const e in n)h.call(n,e)&&(t[e]=n[e])}return t},y=(t,e)=>{let n,o={};for(n in t)-1===e.indexOf(n)&&(o[n]=t[n]);return o};function g(t,e){-1===t.indexOf(e)&&t.push(e)}function v(t){return e.slice.call(t,2)}const S=m.create||function(){return{}},x=["key","ref"];function k(e,n){if(null==e||"boolean"==typeof e)return null;let o;null==n&&(n=t);const r=n.ref,s=n.key;let i;null!=(n=y(n,x)).children?i=f([n.children]):(o=v(arguments)).length&&(i=f(o)),n.children=i;const c=b(e,n,s,r);return u.createElement(c,r,s),c}function w(t){return null==t||"boolean"==typeof t?k(r):"string"==typeof t||"number"==typeof t?b(null,String(t)):Array.isArray(t)?k(s,null,t):t._used?b(t.type,t.props,t.key):(t._used=!0,t)}function b(t,e,n,o){return _(S(null),{type:t,props:e,key:n,ref:o,_dom:null,_children:null,_component:null,_renders:null,_parentDom:null,_used:!1,constructor:void 0})}function C(t,e){t&&("function"==typeof t?t(e):t.current=e)}function U(e,n,o){const r=e.ref,s=(n||t).ref;r&&r!==s&&(C(r,o),s&&C(n.ref,null))}function R(){return{current:null}}const E={value:1,checked:1},D={key:1,ref:1,children:1},N=t=>t.trim();function V(t,e,n,o){const r=Array.isArray;r(e)&&(e=N(e.join(" "))),r(n)&&(n=N(n.join(" "))),e!==n&&A({node:t,action:1,attr:o.isSvg?"class":"className",value:e,isSSR:1===o.mode})}function P(t,e,o,r,s){if("o"===e[0]&&"n"===e[1])return function(t,e,n){e=e.substr(2).toLowerCase();const o=t._events;null==n?(t.removeEventListener(e,O),delete o[e]):(o[e]||t.addEventListener(e,O),o[e]=n)}(t,e,o);const i=null==o||!1===o&&!n.test(e);return r||s||!(e in t)?i?t.removeAttribute(e):t.setAttribute(e,o):t[e]=i?"":o}function O(t){return this._events[t.type].call(this,t)}function A(t){const e=t.node,n=t.refDom,r=t.value,s=t.VNode;let i=t.attr;switch(t.action){case 4:r.insertBefore(e,n);break;case 1:P(e,i,r,!1,t.isSSR);break;case 3:!function(t,e,n){n=n||"";const o=t.style;if("string"==typeof(e=e||""))return void(o.cssText=e);const r="string"==typeof n;if(r)o.cssText="";else for(const t in n)null==e[t]&&(o[t]="");for(const t in e){const s=e[t];(r||s!==n[t])&&("-"==t[0]?o.setProperty(t,s):o[t]=s)}}(e,r.newValue,r.oldValue);break;case 2:!function(t){if(null==t)return;const e=t.parentNode;e&&e.removeChild(t)}(e),M(s,e);break;case 7:M(s,e);break;case 6:e.removeAttributeNS("http://www.w3.org/1999/xlink",i);break;case 5:i!==(i=i.replace(o,""))?e.setAttributeNS("http://www.w3.org/1999/xlink",i.toLowerCase(),r):P(e,i,r,!0,t.isSSR)}}function M(t,e){!function(t){L(T,t)}(e),function(t){L(I,t)}(t)}const T={_VNode:1,_events:1},I={_children:1,_component:1,_dom:1,_renders:1,_parentDom:1,_used:1,key:1,ref:1};function L(t,e){if(null!=e)for(const n in t)e[n]=null}function F(){p.warnOnUnmountRender&&console.warn("Component state changed after unmount",this)}function W(e,n){if(null==e||e===t)return;n=e.type===s||"string"==typeof e.props?-1:n||0,C(e.ref,null),W(e._renders,n);const o=e._component;null!=o&&(o.setState=F,o.forceUpdate=F,o._VNode=null,j({name:"componentWillUnmount",bind:o}));const r=e._children;if(function(t,e){let n;!function(t){return"function"!=typeof t.type}(t)?A({action:7,VNode:t,node:n}):(n=t._dom,null!=n&&(function(t,e){const n=t.props;for(const t in n)"o"===t[0]&&"n"===t[1]&&A({action:1,node:e,attr:t})}(t,n),A({node:n,action:e>0?7:2,VNode:t})))}(e,n),r){const t=r.length;for(let e=0;e<t;e++)W(r[e],n+1);r.length=0}/*#__NOINLINE__*/}const $=[],q=[];function H(t){t.splice(0).forEach(K)}function j(t){const e=t.name;return"componentDidMount"===e?$.push(t):"componentDidUpdate"===e?q.push(t):void K(t)}function K(t){const e=t.name,n=t.bind,o=n[e];if(u.lifeCycle(e,n),n._lastLifeCycleMethod=e,!o)return;const r=t.args,s="function"==typeof n.componentDidCatch;try{o.apply(n,r)}catch(t){if(s)return n.componentDidCatch(t);throw p.unmountOnError&&W(n._VNode),t}}function B(){u.diffEnd(),H($),H(q)}const J=[];class G{constructor(t,e){this._pendingEffects=void 0,this._hooksData=void 0,this._depth=void 0,this.props=void 0,this.state=void 0,this._oldState=void 0,this._nextState=void 0,this._sharedContext=void 0,this.context=void 0,this._VNode=void 0,this._dirty=void 0,this._lastLifeCycleMethod=void 0,this.state={},this.props=t,this.context=e,u.componentInstance(this,t)}render(t,e,n){return null}setState(t){if(this._oldState=_({},this.state),this._nextState=_({},this._nextState||this.state),"function"==typeof t){const e=t(this._nextState,this.props);if(null==e)return;_(this._nextState,e)}else _(this._nextState,t);Z(this)}forceUpdate(t,e){if(null==this._VNode)return;const n=!1!==t,o=!0!==e;u.diffStart(this,n),rt(this._VNode,_({},this._VNode),this._VNode._parentDom,n,{depth:this._depth,isSvg:!1,context:this._sharedContext||{},mode:0}),"function"==typeof t&&t(),o&&B()}}function Z(t){t._dirty=!0,1===J.push(t)&&p.scheduleRender(z)}function z(){let t;for(J.sort((t,e)=>t._depth-e._depth);t=J.pop();)t._dirty&&(t._dirty=!1,t.forceUpdate(!1,!0));B()}let Q=0;function X(t){const e="$"+Q++,n=function(t,e){const n=t.children;return"function"==typeof n?n(e):n[0](e)},o={$id:e,Consumer:n,Provider:class extends G{constructor(t,n){super(t,n),this._subs=void 0,this._o=void 0,this._subs=[],this._o={[e]:this}}getChildContext(){return this._o}shouldComponentUpdate(t){return this.props.deopt&&t.value!==this.props.value&&this._subs.some(t=>Z(t)),!0}add(t){const e=this._subs;g(e,t);const n=t.componentWillUnmount;t.componentWillUnmount=()=>{e.splice(e.indexOf(t),1),n&&n.call(t)}}render(){return k(s,null,this.props.children)}},def:t};return n.contextType=o,o}const Y=t=>"function"==typeof t&&t!==s;function tt(t){return this.constructor(t,this.context)}function et(t,e){t._sharedContext=e.context,t.context=e.contextValue;const n=e.provider;n&&n.add(t)}function nt(n,o,i,c){if(n.type===r)return;const u=n._children||e,l=(o||t)._children||e;return u!==l?function(e,n,o,i,c){const u=e.type===s,l=n.length,a=o.length,p=Math.max(l,a),d=u?c.next||(ot(o[a-1])||t).nextSibling:null;for(let e=0;e<p;e++){const s=n[e]||(e<l?k(r):null);let u=o[e]||t,a=(ot(u)||t).nextSibling||d;rt(s,u,i,!1,_({},c,{next:a}))}}(n,u,l,i,c):void 0}function ot(n){if(n&&n!==t){for(;Y(n.type);)n=n._renders;if(n.type===s){const t=n._children||e;return ot(t[t.length-1])}return n._dom}}function rt(e,n,i,c,l){if(null==e||"boolean"==typeof e)return void W(n);if(!((a=e)&&void 0===a.constructor||(console.warn("component not of expected type =>",a),0)))return null;var a;if(n===e)return e._dom;let p=(n=n||t).type,d=e.type,h=Y(d);if(d===p&&h&&(e._component=n._component),e._parentDom=i,e._used=!0,d!==p){if(!l.next){const e=ot(n);l.next=(e||t).nextSibling}W(n),n=t}const m=e;if("string"!=typeof e.props&&d!==r&&(e=function(e,n,o,r){let i;if(null!=e&&Y(i=e.type)){let c;n=n||t;const l=i.contextType,a=l&&r.context[l.$id];r.contextValue=a?a.props.value:l&&l.def,r.provider=a,c=function(t){const e=t.prototype;return!(!e||!e.render)}(i)?function(e,n,o,r){let i;const c=e.type;let u=e._component;const l=null!=u;if(l){if(i="componentDidUpdate",null!=u.shouldComponentUpdate&&!o&&!1===u.shouldComponentUpdate(e.props,u._nextState||u.state))return t}else i="componentDidMount",u=new c(e.props,r.contextValue),1===r.mode&&(u.setState=u.forceUpdate=s),e._component=u,u._depth=++r.depth;et(u,r),u._VNode=e;const a=u._oldState,p=n.props;j({bind:u,name:l?"componentWillUpdate":"componentWillMount",args:l?[e.props,u._nextState,r.contextValue]:null}),u.state=function(e,n,o){const r=_({},e.state||t,e._nextState||t),s=function(t,e,n){const o=t.getDerivedStateFromProps;return null!=o?_({},o(e,n)):null}(n,o.props,r);return s&&_(r,s),r}(u,c,e),u._oldState=null,u._nextState=null,u.props=e.props;const d=w(u.render(u.props,u.state,r.contextValue));let f=null;return l&&null!=u.getSnapshotBeforeUpdate&&(f=u.getSnapshotBeforeUpdate(p,a)),1!==r.mode&&j({bind:u,name:i,args:l?[p,a,f]:[]}),U(e,n,u),d}(e,n,o,r):function(t,e){let n;const o=t.type;let r;return t._component?r=t._component:(r=new G(t.props,e.contextValue),1===e.mode&&(r.setState=r.forceUpdate=s),t._component=r,r.render=tt,r.constructor=o,r.props=t.props,r._depth=++e.depth),et(r,e),r._VNode=t,u._hookSetup(r),n=w(r.render(t.props,null,e.contextValue)),u._hookSetup(null),n}(e,r),e._renders=c,r.provider=r.contextValue=void 0;const p=e._component;if(p&&"function"==typeof p.getChildContext){const t=p.getChildContext();r.context=_({},r.context,t)}return c}return e}(e,n,c,l),l.isSvg="svg"===e.type||l.isSvg),Y(n.type)&&(n=n._renders),e!==m){if(e===t)return;return rt(e,n,i,c,l)}let y;return e._children=function(t){let e=t.props.children;if(t.type!==s){if(null==e)return[]}else e&&!e.length&&(e=null);return f([e],w)}(e),p=n.type,d=e.type,p!==d&&(n=null),d===s?nt(e,n,i,l):(function(e,n,s,i){const c=(n=n||t)===t;let l;const a=n._dom;l=e.type!==n.type||null==a?function(t,e){const n=e._document||window.document;if("string"==typeof t.props)return n.createTextNode("");{const o=t.type;if(o===r)return n.createComment("$");let s;return s=e.isSvg?n.createElementNS("http://www.w3.org/2000/svg",o):n.createElement(o),s._events={},u.domNodeCreated(s,t),s}}(e,i):a,l._VNode=e,e._dom=l,function(e,n,s,i){if(n.type===r)return;if(s=s||t,"string"==typeof n.props)return function(t,e,n){return e===n||(t.nodeValue=e)}(e,n.props,s.props);const c=s.props,u=n.props;null!=c&&function(t,e,n){for(let r in e)D[r]||null!=n[r]||null==e[r]||A({node:t,action:r===(r=r.replace(o,""))?1:6,attr:r})}(e,c,u),function(t,e,n,o){for(let r in n){if(r in D)continue;let s=n[r],i=E[r]?t[r]:e[r];s!==i&&(r="class"===r?"className":r,"className"!==r?"style"!==r?1===o.mode&&"o"===r[0]&&"n"===r[1]||A({node:t,action:o.isSvg?5:1,attr:r,value:s}):A({node:t,action:3,value:{newValue:s,oldValue:i}}):V(t,s,i,o))}}(e,c||t,u,i)}(l,e,c?null:n,i),c&&A({node:l,action:4,refDom:i.next,value:s,VNode:e})}(e,n,i,l),y=e._dom,l.isSvg="foreignObject"!=d&&l.isSvg,nt(e,n,y,l),U(e,n,y)),y}function st(t,e){let n;const o=k(s,n,[t]);e.hasChildNodes()&&function(t){let e;for(;e=t.firstChild;)t.removeChild(e)}(e),rt(o,n,e,!1,{depth:0,isSvg:void 0!==e.ownerSVGElement,context:{},mode:0}),B()}const it=["boolean","string","number"];function ct(t,e){return null==t||it.indexOf(typeof t)>-1?t:void 0===t.constructor?function(t){let e;return(e=(t=function(t,e){if(!t)return null;e=_({},t.props,e),arguments.length>2&&(e.children=v(arguments));let n=y(e,x);return b(t.type,n,e.key||t.key,e.ref||t.ref)}(t)).props.children)&&(t.props.children=f([e],ct)),t}(t):k(t,e)}const ut=t=>t.promise||t.componentPromise;class lt extends G{componentDidMount(){this._init()}componentDidUpdate(t){(t&&ut(t))!==ut(this.props)&&this._init()}_init(){this.setState({inProgress:!0});const t=ut(this.props);t().then(e=>{t===ut(this.props)&&this.setState({render:e,inProgress:!1,error:!1})}).catch(t=>{console.error("AsyncComponent:",t),this.setState({error:!0,inProgress:!1,stack:t})})}render(t,e){return e.inProgress?ct(t.fallback||t.fallbackComponent)||"Loading":e.error?ct(t.errorComponent,{stack:this.state.stack})||"An Error Occured":ct(e.render,y(t,["fallback","fallbackComponent","promise","componentPromise"]))}}const at=[],pt={_routerSubscriptions:at,subscribe(t){g(at,t)},unsubscribe(t){at.splice(at.indexOf(t),1)},emit(t,e){at.forEach(n=>n(t,e))},unsubscribeAll(){at.length=0}};function dt(t,e){if(!p.inMemoryRouter)return window.history[e](null,"",t);{const e=new URL(t,window.location.href);p.memoryRouteStore.setItem("UI--ROUTE",JSON.stringify({path:e.pathname,qs:e.search}))}}function ft(t){dt(t,"pushState"),pt.emit(t,{type:"load",native:!1})}function ht(t){dt(t,"replaceState"),pt.emit(t,{type:"redirect",native:!1})}const mt=/\/+$/;function _t(t){return 1===t.length?t:t.replace(mt,"")}function yt(t){if(!t)throw Error("Invalid value for match: "+t);if(null!=t.regex)return t;t=_t(t);const e={};let n=0;return{regex:(o=t.split("/").map(t=>":"===t[0]?(e[++n]=t.substr(1),"([^?\\/]+)"):t).join("/"),RegExp(`^${o}(/?)$`)),params:e};var o}const gt=X(null);class vt extends G{constructor(t){super(t),this._previous=void 0,this.state={},this._routeChangeHandler=this._routeChangeHandler.bind(this),this.componentDidUpdate=this._setRouteMethod}_setRouteMethod(){p.inMemoryRouter=!!this.props.inMemoryRouter}static __emitter(){pt.emit(vt.path+vt.qs,{type:"popstate",native:!0})}static get path(){if(p.inMemoryRouter){const t=p.memoryRouteStore.getItem("UI--ROUTE");return t&&JSON.parse(t).path||"/"}return window.location.pathname}static get qs(){if(p.inMemoryRouter){const t=p.memoryRouteStore.getItem("UI--ROUTE");return t&&JSON.parse(t).qs||"?"}return window.location.search}static get searchParams(){return new URLSearchParams(vt.qs)}static _getParams(t,e){const n={};for(const o in t)n[t[o]]=decodeURIComponent(e[o]);return n}static getCurrentParams(t){const e=(t=yt(t)).params,n=t.regex.exec(vt.path);return n?vt._getParams(e,n):{}}componentDidMount(){this._setRouteMethod(),pt.subscribe(this._routeChangeHandler),window.addEventListener("popstate",vt.__emitter),this._routeChangeHandler(null)}componentWillUnmount(){window.removeEventListener("popstate",vt.__emitter),pt.unsubscribe(this._routeChangeHandler)}_notFoundComponent(){return k("div",null,`The Requested URL "${vt.path}" was not found`)}_routeChangeHandler(t){const e=this._previous,n=vt.path;if(this._previous=n,e===n)return;const o=_t(vt.path),r=this.props.children;let s,i;for(let t=0;t<r.length;t++){const e=r[t],n=yt(e.props.match),c=n.regex.exec(o);if(c){const t=e.props;i=vt._getParams(n.params,c),s=ct(t.component,_({},e.props,{params:i}));break}}s||(s=k(this.props.fallbackComponent||this._notFoundComponent)),this.setState({child:s,params:i})}render(t,e){return k(gt.Provider,{value:{params:e.params,path:vt.path,search:vt.searchParams}},e.child)}}const St={};function xt(t,e){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;e||window.scroll(0,0),t.stopImmediatePropagation&&t.stopImmediatePropagation(),t.stopPropagation&&t.stopPropagation(),t.preventDefault();const n=new URL(this.href,location.href);ft(n.pathname+n.search+n.hash)}function kt(t,e,n,o){return t.call(o,e,n)}class wt extends G{constructor(t){super(t),this._onClick=void 0,this._onClick=t=>{const e=this.props.preserveScroll,n=t.currentTarget;kt(xt,t,e,n);const o=this.props.onClick;o&&kt(o,t,e,n)}}render(t){return k("a",_({},t,{onClick:!t.native&&this._onClick}))}}function bt(t,e){return!t||e.some((e,n)=>e!==t[n])}function Ct(t,e,n){return t[e]||(t[e]=Ut(0,n))}function Ut(t,e){return"function"==typeof e?e(t):e}let Rt=0,Et=null;const Dt=[],Nt=[];function Vt(t){const e=t.cleanUp;"function"==typeof e&&(e(),t.cleanUp=null)}function Pt(t){let e=t.cb;e&&"function"==typeof(e=e())&&(t.cleanUp=e),t.resolved=!0,t.cb=null}function Ot(t){t.resolved||Vt(t),Pt(t)}function At(t){t.forEach(t=>{for(const e in t)Ot(t[e])})}function Mt(){return At(Dt)}const Tt=c?a:i;function It(){if(null==Et)throw new Error("Hook candidate not found, make sure you're running hooks inside a component");return[Et,Rt++]}function Lt(t,e){const n=It(),o=n[1],r=n[0]._hooksData;let s=r[o]||{};return bt(s.args,e)?(r[o]=null,s=Ct(r,o,()=>({hookState:t()})),s.args=e,s.hookState):s.hookState}function Ft(t,e){return Lt(()=>t,e)}function Wt(t){const e=It(),n=e[0],o=e[1],r=n._sharedContext&&n._sharedContext[t.$id];if(!r)return t.def;const s=n._hooksData;Ct(s,o,{args:null,hookState:!1});const i=s[o];return i.hookState||(i.hookState=!0,r.add(n)),r.props.value}function $t(e,n){for(const n in e||t)Vt(e[n]);n._pendingEffects=null}function qt(){const e=this._pendingEffects||t,n=e.async;$t(e.sync,this),$t(n,this)}function Ht(t,e,n){if(p.isSSR)return;const o=n===Nt?"sync":"async",r=It(),s=r[0],i=r[1],c=s._hooksData;let u=c[i]||{};const l=(s._pendingEffects=s._pendingEffects||{sync:{},async:{}})[o],a=l[i];if(!bt(u.args,e))return void(a&&(a.resolved=!0));c[i]=u,u.args=e;const d=a?(a.resolved=!1)||Pt(a)||a.cleanUp:null;if(l[i]={cb:t,cleanUp:d},g(n,l),!s.__attachedUnmount){s.__attachedUnmount=!0;const t=s.componentWillUnmount;s.componentWillUnmount=t?function(){t.call(s),qt.call(s)}:qt}}function jt(t,e){return Ht(t,e,Dt)}function Kt(t,e){return Ht(t,e,Nt)}l({_hookSetup:function(t){Et=t,Rt=0,t&&(t._hooksData||(t._hooksData=[]))},diffEnd:function(){const t=p.debounceEffect||Tt;At(Nt),t(Mt)}});const Bt={};function Jt(t,e,n){const o=It(),r=o[0],s=Ct(r._hooksData,o[1],()=>({hookState:n?n(e):Ut(null,e)}));return[s.hookState,s.args||(s.args=e=>{const n=t(s.hookState,e);s.hookState=n,r.setState(Bt)})]}function Gt(t){return Lt(()=>({current:t}),[])}function Zt(t){return Jt(Ut,t)}function zt(){return Wt(gt)}function Qt(t){function e(e){const n=y(e,["ref"]);return t(n,e.ref)||null}return e.__REF_FORWARDED=!0,e}l({createElement(t,e){t&&t.type&&t.type.__REF_FORWARDED&&(t.props.ref=e,t.ref=null)}});export{wt as A,lt as AsyncComponent,G as Component,s as Fragment,St as Path,vt as Router,pt as RouterSubscription,l as addPluginCallback,p as config,X as createContext,k as createElement,R as createRef,yt as createRoutePath,G as default,rt as diff,Qt as forwardRef,k as h,ft as loadURL,ht as redirect,st as render,Ft as useCallback,Wt as useContext,jt as useEffect,Kt as useLayoutEffect,Lt as useMemo,Jt as useReducer,Gt as useRef,zt as useRoute,Zt as useState};
//# sourceMappingURL=ui-lib.modern.js.map
