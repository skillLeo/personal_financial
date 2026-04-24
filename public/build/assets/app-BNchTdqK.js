const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Index-D39srMN-.js","assets/jsx-runtime-C11HiuYV.js","assets/CartesianChart-B94JpHuh.js","assets/AppLayout-CLYsq5xb.js","assets/Index-D5Lt8X9e.js","assets/ExportButton-DaCHVj_F.js","assets/Statement-TRKRybvK.js","assets/Index-BmjVw3_I.js","assets/ForgotPassword-Qqj7Mp0P.js","assets/Login-C3g6LoBa.js","assets/Register-BLMeYqsq.js","assets/ResetPassword-i5636uiw.js","assets/VerifyEmail-DExMgukg.js","assets/VerifyResetOtp-CR4Mnyxm.js","assets/Index-MmWB8sKb.js","assets/Dashboard-DWqL9fJP.js","assets/BarChart-B0aD08Tn.js","assets/History-DNZ45ggA.js","assets/Index-CuCk43eG.js","assets/Index-ka0t8a1s.js","assets/Index-C7gaXeCj.js","assets/Index-Dqi27G77.js","assets/Show-B_5Zqerz.js","assets/Index-CjD2d4aq.js","assets/Index-CzjFiz5a.js","assets/Index-CHhoOKoh.js","assets/Form-Dvhk9QVd.js","assets/Index-ZDREleoG.js"])))=>i.map(i=>d[i]);
import{d as e,g as t,i as n,l as r,s as i,t as a}from"./jsx-runtime-C11HiuYV.js";async function o(e,t){for(let n of Array.isArray(e)?e:[e]){let e=t[n];if(e!==void 0)return typeof e==`function`?e():e}throw Error(`Page not found: ${e}`)}var s=t(r(),1),c=i(),l={data:``},u=e=>{if(typeof window==`object`){let t=(e?e.querySelector(`#_goober`):window._goober)||Object.assign(document.createElement(`style`),{innerHTML:` `,id:`_goober`});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||l},d=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,f=/\/\*[^]*?\*\/|  +/g,p=/\n+/g,m=(e,t)=>{let n=``,r=``,i=``;for(let a in e){let o=e[a];a[0]==`@`?a[1]==`i`?n=a+` `+o+`;`:r+=a[1]==`f`?m(o,a):a+`{`+m(o,a[1]==`k`?``:t)+`}`:typeof o==`object`?r+=m(o,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+` `+t:t)):a):o!=null&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,`-$&`).toLowerCase(),i+=m.p?m.p(a,o):a+`:`+o+`;`)}return n+(t&&i?t+`{`+i+`}`:i)+r},h={},g=e=>{if(typeof e==`object`){let t=``;for(let n in e)t+=n+g(e[n]);return t}return e},_=(e,t,n,r,i)=>{let a=g(e),o=h[a]||(h[a]=(e=>{let t=0,n=11;for(;t<e.length;)n=101*n+e.charCodeAt(t++)>>>0;return`go`+n})(a));if(!h[o]){let t=a===e?(e=>{let t,n,r=[{}];for(;t=d.exec(e.replace(f,``));)t[4]?r.shift():t[3]?(n=t[3].replace(p,` `).trim(),r.unshift(r[0][n]=r[0][n]||{})):r[0][t[1]]=t[2].replace(p,` `).trim();return r[0]})(e):e;h[o]=m(i?{[`@keyframes `+o]:t}:t,n?``:`.`+o)}let s=n&&h.g?h.g:null;return n&&(h.g=h[o]),((e,t,n,r)=>{r?t.data=t.data.replace(r,e):t.data.indexOf(e)===-1&&(t.data=n?e+t.data:t.data+e)})(h[o],t,r,s),o},ee=(e,t,n)=>e.reduce((e,r,i)=>{let a=t[i];if(a&&a.call){let e=a(n),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?`.`+t:e&&typeof e==`object`?e.props?``:m(e,``):!1===e?``:e}return e+r+(a??``)},``);function v(e){let t=this||{},n=e.call?e(t.p):e;return _(n.unshift?n.raw?ee(n,[].slice.call(arguments,1),t.p):n.reduce((e,n)=>Object.assign(e,n&&n.call?n(t.p):n),{}):n,u(t.target),t.g,t.o,t.k)}var y,b,x;v.bind({g:1});var S=v.bind({k:1});function C(e,t,n,r){m.p=t,y=e,b=n,x=r}function w(e,t){let n=this||{};return function(){let r=arguments;function i(a,o){let s=Object.assign({},a),c=s.className||i.className;n.p=Object.assign({theme:b&&b()},s),n.o=/ *go\d+/.test(c),s.className=v.apply(n,r)+(c?` `+c:``),t&&(s.ref=o);let l=e;return e[0]&&(l=s.as||e,delete s.as),x&&l[0]&&x(s),y(l,s)}return t?t(i):i}}var te=e=>typeof e==`function`,T=(e,t)=>te(e)?e(t):e,E=(()=>{let e=0;return()=>(++e).toString()})(),D=(()=>{let e;return()=>{if(e===void 0&&typeof window<`u`){let t=matchMedia(`(prefers-reduced-motion: reduce)`);e=!t||t.matches}return e}})(),ne=20,O=`default`,k=(e,t)=>{let{toastLimit:n}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,n)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return k(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||i===void 0?{...e,dismissed:!0,visible:!1}:e)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},A=[],j={toasts:[],pausedAt:void 0,settings:{toastLimit:ne}},M={},N=(e,t=O)=>{M[t]=k(M[t]||j,e),A.forEach(([e,n])=>{e===t&&n(M[t])})},P=e=>Object.keys(M).forEach(t=>N(e,t)),F=e=>Object.keys(M).find(t=>M[t].toasts.some(t=>t.id===e)),I=(e=O)=>t=>{N(t,e)},L={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},R=(e={},t=O)=>{let[n,r]=(0,s.useState)(M[t]||j),i=(0,s.useRef)(M[t]);(0,s.useEffect)(()=>(i.current!==M[t]&&r(M[t]),A.push([t,r]),()=>{let e=A.findIndex(([e])=>e===t);e>-1&&A.splice(e,1)}),[t]);let a=n.toasts.map(t=>({...e,...e[t.type],...t,removeDelay:t.removeDelay||e[t.type]?.removeDelay||e?.removeDelay,duration:t.duration||e[t.type]?.duration||e?.duration||L[t.type],style:{...e.style,...e[t.type]?.style,...t.style}}));return{...n,toasts:a}},z=(e,t=`blank`,n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:`status`,"aria-live":`polite`},message:e,pauseDuration:0,...n,id:n?.id||E()}),B=e=>(t,n)=>{let r=z(t,e,n);return I(r.toasterId||F(r.id))({type:2,toast:r}),r.id},V=(e,t)=>B(`blank`)(e,t);V.error=B(`error`),V.success=B(`success`),V.loading=B(`loading`),V.custom=B(`custom`),V.dismiss=(e,t)=>{let n={type:3,toastId:e};t?I(t)(n):P(n)},V.dismissAll=e=>V.dismiss(void 0,e),V.remove=(e,t)=>{let n={type:4,toastId:e};t?I(t)(n):P(n)},V.removeAll=e=>V.remove(void 0,e),V.promise=(e,t,n)=>{let r=V.loading(t.loading,{...n,...n?.loading});return typeof e==`function`&&(e=e()),e.then(e=>{let i=t.success?T(t.success,e):void 0;return i?V.success(i,{id:r,...n,...n?.success}):V.dismiss(r),e}).catch(e=>{let i=t.error?T(t.error,e):void 0;i?V.error(i,{id:r,...n,...n?.error}):V.dismiss(r)}),e};var H=1e3,U=(e,t=`default`)=>{let{toasts:n,pausedAt:r}=R(e,t),i=(0,s.useRef)(new Map).current,a=(0,s.useCallback)((e,t=H)=>{if(i.has(e))return;let n=setTimeout(()=>{i.delete(e),o({type:4,toastId:e})},t);i.set(e,n)},[]);(0,s.useEffect)(()=>{if(r)return;let e=Date.now(),i=n.map(n=>{if(n.duration===1/0)return;let r=(n.duration||0)+n.pauseDuration-(e-n.createdAt);if(r<0){n.visible&&V.dismiss(n.id);return}return setTimeout(()=>V.dismiss(n.id,t),r)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[n,r,t]);let o=(0,s.useCallback)(I(t),[t]),c=(0,s.useCallback)(()=>{o({type:5,time:Date.now()})},[o]),l=(0,s.useCallback)((e,t)=>{o({type:1,toast:{id:e,height:t}})},[o]),u=(0,s.useCallback)(()=>{r&&o({type:6,time:Date.now()})},[r,o]),d=(0,s.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:i=8,defaultPosition:a}=t||{},o=n.filter(t=>(t.position||a)===(e.position||a)&&t.height),s=o.findIndex(t=>t.id===e.id),c=o.filter((e,t)=>t<s&&e.visible).length;return o.filter(e=>e.visible).slice(...r?[c+1]:[0,c]).reduce((e,t)=>e+(t.height||0)+i,0)},[n]);return(0,s.useEffect)(()=>{n.forEach(e=>{if(e.dismissed)a(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[n,a]),{toasts:n,handlers:{updateHeight:l,startPause:c,endPause:u,calculateOffset:d}}},W=S`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,G=S`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,K=S`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,q=w(`div`)`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||`#ff4b4b`};
  position: relative;
  transform: rotate(45deg);

  animation: ${W} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${G} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||`#fff`};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,J=S`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Y=w(`div`)`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||`#e0e0e0`};
  border-right-color: ${e=>e.primary||`#616161`};
  animation: ${J} 1s linear infinite;
`,X=S`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Z=S`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,re=w(`div`)`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||`#61d345`};
  position: relative;
  transform: rotate(45deg);

  animation: ${X} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Z} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||`#fff`};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ie=w(`div`)`
  position: absolute;
`,ae=w(`div`)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,oe=S`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,se=w(`div`)`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${oe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ce=({toast:e})=>{let{icon:t,type:n,iconTheme:r}=e;return t===void 0?n===`blank`?null:s.createElement(ae,null,s.createElement(Y,{...r}),n!==`loading`&&s.createElement(ie,null,n===`error`?s.createElement(q,{...r}):s.createElement(re,{...r}))):typeof t==`string`?s.createElement(se,null,t):t},le=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ue=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,de=`0%{opacity:0;} 100%{opacity:1;}`,fe=`0%{opacity:1;} 100%{opacity:0;}`,pe=w(`div`)`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,me=w(`div`)`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,he=(e,t)=>{let n=e.includes(`top`)?1:-1,[r,i]=D()?[de,fe]:[le(n),ue(n)];return{animation:t?`${S(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${S(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ge=s.memo(({toast:e,position:t,style:n,children:r})=>{let i=e.height?he(e.position||t||`top-center`,e.visible):{opacity:0},a=s.createElement(ce,{toast:e}),o=s.createElement(me,{...e.ariaProps},T(e.message,e));return s.createElement(pe,{className:e.className,style:{...i,...n,...e.style}},typeof r==`function`?r({icon:a,message:o}):s.createElement(s.Fragment,null,a,o))});C(s.createElement);var _e=({id:e,className:t,style:n,onHeightUpdate:r,children:i})=>{let a=s.useCallback(t=>{if(t){let n=()=>{let n=t.getBoundingClientRect().height;r(e,n)};n(),new MutationObserver(n).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return s.createElement(`div`,{ref:a,className:t,style:n},i)},ve=(e,t)=>{let n=e.includes(`top`),r=n?{top:0}:{bottom:0},i=e.includes(`center`)?{justifyContent:`center`}:e.includes(`right`)?{justifyContent:`flex-end`}:{};return{left:0,right:0,display:`flex`,position:`absolute`,transition:D()?void 0:`all 230ms cubic-bezier(.21,1.02,.73,1)`,transform:`translateY(${t*(n?1:-1)}px)`,...r,...i}},ye=v`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Q=16,be=({reverseOrder:e,position:t=`top-center`,toastOptions:n,gutter:r,children:i,toasterId:a,containerStyle:o,containerClassName:c})=>{let{toasts:l,handlers:u}=U(n,a);return s.createElement(`div`,{"data-rht-toaster":a||``,style:{position:`fixed`,zIndex:9999,top:Q,left:Q,right:Q,bottom:Q,pointerEvents:`none`,...o},className:c,onMouseEnter:u.startPause,onMouseLeave:u.endPause},l.map(n=>{let a=n.position||t,o=ve(a,u.calculateOffset(n,{reverseOrder:e,gutter:r,defaultPosition:t}));return s.createElement(_e,{id:n.id,key:n.id,onHeightUpdate:u.updateHeight,className:n.visible?ye:``,style:o},n.type===`custom`?T(n.message,n):i?i(n):s.createElement(ge,{toast:n,position:a}))}))},xe=V,$=a(),Se=`SkillLeo`;n({title:e=>`${e} — ${Se}`,resolve:t=>o(`./Pages/${t}.jsx`,Object.assign({"./Pages/AIInsights/Index.jsx":()=>e(()=>import(`./Index-D39srMN-.js`),__vite__mapDeps([0,1,2,3])),"./Pages/Accounts/Index.jsx":()=>e(()=>import(`./Index-D5Lt8X9e.js`),__vite__mapDeps([4,1,3,5])),"./Pages/Accounts/Statement.jsx":()=>e(()=>import(`./Statement-TRKRybvK.js`),__vite__mapDeps([6,1,3])),"./Pages/Admin/Index.jsx":()=>e(()=>import(`./Index-BmjVw3_I.js`),__vite__mapDeps([7,1])),"./Pages/Auth/ForgotPassword.jsx":()=>e(()=>import(`./ForgotPassword-Qqj7Mp0P.js`),__vite__mapDeps([8,1])),"./Pages/Auth/Login.jsx":()=>e(()=>import(`./Login-C3g6LoBa.js`),__vite__mapDeps([9,1])),"./Pages/Auth/Register.jsx":()=>e(()=>import(`./Register-BLMeYqsq.js`),__vite__mapDeps([10,1])),"./Pages/Auth/ResetPassword.jsx":()=>e(()=>import(`./ResetPassword-i5636uiw.js`),__vite__mapDeps([11,1])),"./Pages/Auth/VerifyEmail.jsx":()=>e(()=>import(`./VerifyEmail-DExMgukg.js`),__vite__mapDeps([12,1])),"./Pages/Auth/VerifyResetOtp.jsx":()=>e(()=>import(`./VerifyResetOtp-CR4Mnyxm.js`),__vite__mapDeps([13,1])),"./Pages/Budgets/Index.jsx":()=>e(()=>import(`./Index-MmWB8sKb.js`),__vite__mapDeps([14,1,3,5])),"./Pages/Dashboard.jsx":()=>e(()=>import(`./Dashboard-DWqL9fJP.js`),__vite__mapDeps([15,1,2,3,16])),"./Pages/Employees/History.jsx":()=>e(()=>import(`./History-DNZ45ggA.js`),__vite__mapDeps([17,1,3])),"./Pages/Employees/Index.jsx":()=>e(()=>import(`./Index-CuCk43eG.js`),__vite__mapDeps([18,1,3,5])),"./Pages/Loans/Index.jsx":()=>e(()=>import(`./Index-ka0t8a1s.js`),__vite__mapDeps([19,1,3,5])),"./Pages/Notifications/Index.jsx":()=>e(()=>import(`./Index-C7gaXeCj.js`),__vite__mapDeps([20,1,3])),"./Pages/People/Index.jsx":()=>e(()=>import(`./Index-Dqi27G77.js`),__vite__mapDeps([21,1,3,5])),"./Pages/People/Show.jsx":()=>e(()=>import(`./Show-B_5Zqerz.js`),__vite__mapDeps([22,1,3])),"./Pages/Reports/Index.jsx":()=>e(()=>import(`./Index-CjD2d4aq.js`),__vite__mapDeps([23,1,2,3,16])),"./Pages/Settings/Index.jsx":()=>e(()=>import(`./Index-CzjFiz5a.js`),__vite__mapDeps([24,1,3])),"./Pages/Subscriptions/Index.jsx":()=>e(()=>import(`./Index-CHhoOKoh.js`),__vite__mapDeps([25,1,3,5])),"./Pages/Transactions/Form.jsx":()=>e(()=>import(`./Form-Dvhk9QVd.js`),__vite__mapDeps([26,1,3])),"./Pages/Transactions/Index.jsx":()=>e(()=>import(`./Index-ZDREleoG.js`),__vite__mapDeps([27,1,3,5]))})),setup({el:e,App:t,props:n}){(0,c.createRoot)(e).render((0,$.jsxs)($.Fragment,{children:[(0,$.jsx)(t,{...n}),(0,$.jsx)(be,{position:`top-right`,toastOptions:{duration:4e3,style:{background:`#0F172A`,color:`#F8FAFC`,borderRadius:`10px`,padding:`14px 18px`,fontSize:`14px`,fontFamily:`Inter, sans-serif`},success:{iconTheme:{primary:`#10B981`,secondary:`#F8FAFC`}},error:{iconTheme:{primary:`#EF4444`,secondary:`#F8FAFC`}}}})]}))},progress:{color:`#10B981`}});export{xe as t};