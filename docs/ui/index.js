function e(e,t,r){if(!(null==e||e instanceof Text||t===r)){for(var o in null==e._listeners&&(e._listeners={}),null!=t?null==e._listeners&&(e.onclick=H):t=w,null==r&&(r=w),r)o in t||(delete e._listeners[o],e.removeEventListener(o,n));for(var i in t){var l=t[i],a=r[i];a!==l&&(null==a&&e.addEventListener(i,n),e._listeners[i]=l)}}}function n(e){return this._listeners[e.type].call(this,e)}var t="undefined"!=typeof Promise,r="undefined"!=typeof requestAnimationFrame,o=setTimeout,i=t?Promise.prototype.then.bind(Promise.resolve()):o,l={deferImplementation:i,scheduleRender:r?function(e){return requestAnimationFrame(e)}:i,eagerlyHydrate:!0,beforeHookRender:null},a=[],u=[];function s(){d(a)}function p(){d(u)}function d(e){for(var n;n=e.pop();)f(n)}function c(e){var n=e.name;return"componentDidMount"===n?a.push(e):"componentDidUpdate"===n?u.push(e):void f(e)}function f(e){var n=e.args,r=e.bind,o=e.name;r._lastLifeCycleMethod=o;var i=r[o],l=!!r.componentDidCatch;if(t)Promise.resolve().then(()=>i&&i.apply(r,n)).catch(e=>{if(l)return r.componentDidCatch(e);throw e});else try{i.apply(r,n)}catch(e){if(l)return r.componentDidCatch(e);throw e}}function m(n,t){var r,o=(t=t||w)._dom;(r=n.type!==t.type||null==o?function(e){return"string"==typeof e.props?document.createTextNode(""):document.createElement(e.type)}(n):o)._VNode=n,function(n,t,r){if(r=r||w,"string"==typeof t.props)return function(e,n,t){return n===t||(e.nodeValue=n)}(n,t.props,r.props);var o=r.props||w,i=t.props;null!=o&&function(e,n,t){for(var r in n)r in t||S(e,r,null)}(n,o,i),function(e,n,t){for(var r in t)if(!U(r)&&!h(r)){var o=t[r],i=n[r];o!==i&&("className"!==(r="class"===r?"className":r)?"style"!==r?S(e,r,o):v(e,o,i):y(e,o,i))}}(n,o,i),e(n,t.events,r.events)}(r,n,t===w?null:t),b(n,"_dom",r),function e(n,t){n&&(null!=n._component?n._component.base=t:e(n._renderedBy,t))}(n,r)}var _={key:1,ref:1,children:1};function h(e){return e in _}function v(e,n,t){t=t||"";var r=e.style;if("string"!=typeof n){var o="string"==typeof t;if(o)r.cssText="";else for(var i in t)i in n||(r[i]="");for(var l in n){var a=n[l];(o||a!==t[l])&&(r[l]=a)}}else r.cssText=n}function y(e,n,t){var r=Array.isArray;r(n)&&(n=n.join(" ").trim()),r(t)&&(t=t.join(" ").trim()),n!==t&&S(e,"className",n)}function g(e,n,t){if(n){var r=n._VNode;r&&b(r,t,e)}}function b(e,n,t){N(e,n,t,"_renders"),N(e,n,t,"_renderedBy")}var C={_dom:"_FragmentDomNodeChildren",_FragmentDomNodeChildren:"_dom"};function N(e,n,t,r){var o=e,i=C[n];if(o){var l=e._fragmentParent;return function(e,n,t){return null!=e&&("_nextSibDomVNode"===n||"_prevSibDomVNode"===n)&&(null==t||function(e,n){for(var t=e;t;){if(t===n)return!1;t=t._fragmentParent}return!0}(t,e))}(l,n,t)&&N(l,n,t,"_renderedBy"),i&&(o[i]=null),o[n]=t,N(o[r],n,t,r)}}function S(e,n,t){return n in e?e[n]=null==t?"":t:null==t?e.removeAttribute(n):e.setAttribute(n,t)}function D(e,n){null!=n&&N(e,"_parentDom",n,"_renderedBy")}function x(n,t){if(null!=n&&n!==w){x(n._renders,t);var r=n._component;!t&&r&&(r.setState=H,r._VNode=null,c({name:"componentWillUnmount",bind:r}));var o=n._children;if(o)for(;o.length;)x(o.pop(),t);!function(n,t,r){r||(e(n,null,t.events),function(e){k(V,e)}(n),function(e){if(null!=e){var n=e.parentNode;n&&n.removeChild(e)}}(n)),function(e,n){n||null==e||(b(e._nextSibDomVNode,"_prevSibDomVNode",null),b(e._prevSibDomVNode,"_nextSibDomVNode",null)),k(P,e)}(t,r)}(n._dom,n,t)}}var V={_VNode:1,_listeners:1,onclick:1},P={events:1,_FragmentDomNodeChildren:1,_children:1,_component:1,_depth:1,_dom:1,_nextSibDomVNode:1,_prevSibDomVNode:1,_renderedBy:1,_renders:1,_fragmentParent:1,_parentDom:1};function k(e,n){if(null!=n)for(var t in e)n[t]=null}var w={},A=[];function F(e,n,t){return function e(n,t,r,o){if(!n)return t;for(var i=0;i<n.length;i++){var l=n[i];Array.isArray(l)?e(l,t,r,o):o&&null==l||t.push(r?r(l):l)}return t}(e,[],n,t)}function U(e){return"o"===e[0]&&"n"===e[1]}var B=w.hasOwnProperty,L="assign"in Object?w.constructor.assign:function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)B.call(t,r)&&(e[r]=t[r])}return e};function O(e){if(e){var n=e._dom;if(n)return n;var t=e._FragmentDomNodeChildren;return t?function e(n){for(var t=0;t<n.length;t++){var r=n[t];if(Array.isArray(r)){var o=e(r);if(o)return o}else if(r)return r}}(t):void 0}}function M(e){if(null!=e)for(var n=e.length;n;){var t=e[n--];if(t){if(t._dom)return t._nextSibDomVNode;if(t._FragmentDomNodeChildren)return M((R(t)||w)._children)}}}function R(e){var n=e;return n?n._renders?R(n._renders):n:null}function j(e,n){for(var t=arguments.length,r=new Array(t>2?t-2:0),o=2;o<t;o++)r[o-2]=arguments[o];if(null==e||"boolean"==typeof e)return null;null==n&&(n=w);var i=n.ref,l=n.key,a="string"==typeof e?{}:null;return n=W(n,a),(r.length||(r=[n.children]))&&(n.children=F(r)),E(e,n,a,l,i)}function E(e,n,t,r,o){var i={type:"string"==typeof e?e.toLowerCase():e,props:n,events:t,key:r,ref:o,_dom:null,_children:null,_component:null,_nextSibDomVNode:null,_renders:null,_renderedBy:null,_prevSibDomVNode:null,_FragmentDomNodeChildren:null,_parentDom:null,_fragmentParent:null,_depth:0,__self:null};return i.__self=i,i}var H=function(){},T={key:1,ref:1};function W(e,n){var t={},r=null!=n;for(var o in e)null==T[o]&&(t[o]=e[o],r&&U(o)&&(n[o.substr(2).toLowerCase()]=e[o]));return t}function K(e){return null==e||"boolean"==typeof e?null:"string"==typeof e||"number"==typeof e?E(null,String(e)):Array.isArray(e)?j(H,null,e):null!=e._dom?E(e.type,e.props,e.events,e.key,null):e}function q(e,n,t,r){return function(e,n,t,r,o){for(var i=e.type===H,l=t.length,a=Math.max(n.length,l),u=0;u<a;u++){var s=n[u],p=t[u]||w,d=i&&null!=s;if(null==O(p)&&null!=s){var c=I(t,u+u,l),f=(c?c._VNode:e.type===H&&M(e._children))||void 0;void 0!==f&&N(s,"_nextSibDomVNode",f,"_renderedBy")}d&&(s._fragmentParent=e),ne(s,p,r,null,o),i&&Q(e,s,u)}}(e,e._children||A,(n||w)._children||A,t,r)}function I(e,n,t){return n>=t?null:O(e[n]||w)||I(e,n+1,t)}function Q(e,n,t){var r=n&&(n._dom||n._FragmentDomNodeChildren),o=e._FragmentDomNodeChildren;null==o&&N(e,"_FragmentDomNodeChildren",o=[],"_renderedBy"),o[t]=r}var $=[];class z{constructor(e){this.state={},this.props=e}render(e,n){return null}setState(e){if(this._oldState=L({},this.state),this._nextState=L({},this.state),"function"==typeof e){var n=e(this._nextState,this.props);if(null==n)return;L(this._nextState,n)}else L(this._nextState,e);var t;this.state=this._nextState,(t=this)._dirty=!0,1===$.push(t)&&l.scheduleRender(G)}forceUpdate(e){var n=!1!==e;this.base=ne(this._VNode,L({},this._VNode),this._VNode._parentDom,n,{depth:this._depth}),"function"==typeof e&&e(),s(),p()}}function G(){var e;for($.sort((e,n)=>e._depth-n._depth);e=$.pop();)e._dirty&&(e._dirty=!1,e.forceUpdate(!1))}var J=e=>"function"==typeof e&&e!==H,X={_nextSibDomVNode:1,_prevSibDomVNode:1,_fragmentParent:1};function Y(e,n){if(n._renders=e,e)for(var t in e._renderedBy=n,X)e[t]=n[t]}function Z(e){return this.constructor(e)}function ee(e,n,t){var r,o=L({},e.state||w,e._nextState||w),i=null!=(r=n.getDerivedStateFromProps)?L({},r(t.props,o)):null;i&&L(o,i),e._nextState=o}function ne(e,n,t,r,o){"boolean"==typeof e&&(e=null);var i,l,a,u=null==e,s=null==n;if(e!==w){if(function(e,n){if(n!==w&&null!=e&&null!=n){b(e,"_fragmentParent",n._fragmentParent);var t=n._prevSibDomVNode;null==e._prevSibDomVNode&&null!=t&&(b(e,"_prevSibDomVNode",t),b(t,"_nextSibDomVNode",e));var r=n.type!==H?n._nextSibDomVNode:M(n._children);null==e._nextSibDomVNode&&null!=r&&(b(e,"_nextSibDomVNode",r),b(r,"_prevSibDomVNode",e))}}(e,n),(u||s||e.type!==n.type)&&(x(n),n=w,u))return null;if(!(u||(a=J(l=e.type),(p=e)&&p.__self===p||(console.warn("component not of expected type =>",p),0))))return null;var p;if(s||(i=n.type),e===n)return u?null:e._dom;l===i&&a&&(e._component=n._component);var d=e;if(e._children=F(e.props.children,K),e=function(e,n,t,r){var o;return null!=e&&J(o=e.type)?(n=n||w,function(e){var n=e.prototype;return!(!n||!n.render)}(o)?function(e,n,t,r){var o,i=e.type,l=e._component;if(null!=l){if(null!=l.shouldComponentUpdate&&!t&&!1===l.shouldComponentUpdate(e.props,l._nextState||l.state))return w;ee(l,i,e),c({bind:l,name:"componentWillUpdate",args:[e.props,l._nextState]}),o="componentDidUpdate"}else o="componentDidMount",l=new i(e.props),e._component=l,ee(l,i,e),c({bind:l,name:"componentWillMount"}),l._depth=++r.depth;l._VNode=e;var a=l._oldState,u=n.props;l.state=l._nextState,l._oldState=null,l._nextState=null,l.props=e.props;var s=K(l.render(l.props,l.state));return c({bind:l,name:o,args:"componentDidUpdate"===o?[u,a]:[]}),Y(s,e),s}(e,n,t,r):function(e,n){var t,r,o=e.type;return e._component?r=e._component:(r=new z(e.props),e._component=r,r.render=Z,r.constructor=o,r.props=e.props),t=K(r.render(e.props)),r._depth=++n.depth,Y(t,e),t}(e,r)):e}(e,n,r,o),J(n.type)&&(n=n._renders),null==e||e!==d)return ne(e,n,t,r,o);if(i=n.type,l=e.type,D(e,t),l!==H){var f=!0;return i===l?(m(e,n),q(e,n,e._dom,o),f=!1):(m(e,null),q(e,null,e._dom,o)),function(e,n,t){var r,o=O(e._nextSibDomVNode||(r=e._fragmentParent)&&r._nextSibDomVNode),i=e._dom;i&&t&&(function(e,n,t){var r,o=!0;n&&(o=!1,r=n),!o&&r?t.insertBefore(e,r):t.appendChild(e)}(i,o,n),function(e){var n=e._dom;null==e._parentDom&&D(e,n.parentNode);var t=n.nextSibling,r=n.previousSibling;null!=t&&(g(t._VNode,n,"_nextSibDomVNode"),g(e,t,"_prevSibDomVNode")),null!=r&&(g(e,r,"_nextSibDomVNode"),g(r._VNode,n,"_prevSibDomVNode"))}(e))}(e,t,f),x(n,!0),e._dom}q(e,n,t,o)}}function te(e,n){var t=j(H,null,e);n.hasChildNodes()&&!n._hosts&&function(e,n){for(var t;t=e.firstChild;)e.removeChild(t)}(n),ne(t,n._hosts,n,!1,{depth:0}),s(),p(),n._hosts=e}function re(){return(re=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}function oe(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n.indexOf(t=i[r])>=0||(o[t]=e[t]);return o}class ie extends z{constructor(e,n){var{componentPromise:t,fallbackComponent:r}=e;super(e,n),this.state={ready:!1,componentPromise:t,finalComponent:null,fallbackComponent:r}}static getDerivedStateFromProps(e,n){var t=n||{};return t.componentPromise===e.componentPromise||null!=e.componentPromise&&(t.componentPromise=e.componentPromise,t.ready=!1,t.finalComponent=null),t}render(e,n){var{eager:t=!0,loadComponent:r=!1}=e,o=oe(e,["eager","loadComponent","componentPromise","fallbackComponent"]),{ready:i,finalComponent:l}=n;if(!t&&!r||i||this.loadComponent(),i)return j(l,o);var a=oe(o,["children"]);return null!=this.state.fallbackComponent?j(this.state.fallbackComponent,a):le}loadComponent(){return this.state.componentPromise().then(e=>{this.setState({ready:!0,finalComponent:e})})}}var le=j("div",null,"Loading.."),ae=[],ue={subscribe(e){ae.includes(e)||ae.push(e)},unsubscribe(e){for(var n=0;n<ae.length;n++)if(ae[n]===e)return ae.splice(n,1)},emit(e,n){for(var t of ae)t(e,n)},unsubscribeAll(){ae.length=0}};function se(e){window.history.pushState(w,document.title,e),ue.emit(e,{type:"load",native:!1})}function pe(e){window.history.replaceState(w,document.title,e),ue.emit(e,{type:"redirect",native:!1})}class de extends z{static __emitter(){ue.emit(de.getPath+de.getQs,{type:"popstate",native:!0})}componentWillMount(){ue.subscribe(this._routeChangeHandler),window.addEventListener("popstate",de.__emitter)}componentWillUnmount(){window.removeEventListener("popstate",de.__emitter),this.props.destroySubscriptionOnUnmount&&ue.unsubscribeAll()}absolute(e){return new URL(e||"",location.protocol+"//"+location.host).toString()}getCurrentComponent(){return this.getPathComponent(de.getPath)||[]}_routeChangeHandler(){var[e,n]=this.getCurrentComponent();this.setState({component:e,match:n})}_notFoundComponent(){return j("div",null,'The Requested URL "'+this.absolute(de.getPath)+'" was not found')}static get getPath(){return location.pathname}static get getQs(){return location.search}getPathComponent(e){for(var n of this.state.routes){var{regex:t,component:r}=n,o=t.exec(e);if(o)return[r,o]}return[]}initComponents(e){var n=[];for(var t of e)null!=t.props&&null!=t.props.path&&n.push({regex:t.props.path,component:t});return n}constructor(e,n){var{children:t,fallbackComponent:r}=e;super(oe(e,["children","fallbackComponent"]),n),r=r||this._notFoundComponent.bind(this),this.state={routes:this.initComponents(t),fallbackComponent:r};var[o,i]=this.getCurrentComponent();this.state.component=o,this.state.match=i,this._routeChangeHandler=this._routeChangeHandler.bind(this)}componentDidMount(){}render(){var e,n=oe(this.props,["children"]),t=re({match:this.state.match},n);return null!=this.state.component&&null!=this.state.match?L((e=this.state.component).props,t):e=j(this.state.fallbackComponent,t),e.__self||(e=j(e,t)),j(H,null,e)}}function ce(e){var{native:n,href:t,onClick:r}=e,o=oe(e,["native","href","onClick"]);return o.href=t,n||null==t||(o.onClick=n=>function(e,n,t){e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||(e.stopImmediatePropagation&&e.stopImmediatePropagation(),e.stopPropagation&&e.stopPropagation(),e.preventDefault(),se(n),null!=t&&t(e,n))}(n,e.href,r)),j("a",o)}function fe(e){return RegExp("^"+e+"(/?)$")}export default z;export{ce as A,ie as AsyncComponent,z as Component,H as Fragment,de as Router,ue as RouterSubscription,fe as absolutePath,l as config,j as createElement,j as h,se as loadURL,pe as redirect,te as render};
//# sourceMappingURL=ui-lib.modern.js.map
