!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";const e=e=>!!e,t=["zip","state","country","city","address","street_2","formatted_address","postal_code_availability","postal_code_availability_serving_now"],n=(e,t,n)=>{try{e.querySelector(`input[name="${t}"]`).value=n}catch(e){console.log("cannot set field value",t,n)}},o=(t,o,s)=>{n(t,"zip",o.postalCode),n(t,"state",o.stateShort),n(t,"country",o.countryCode),n(t,"city",o.city),n(t,"street_2",o.street_2),n(t,"address",[o.houseNumber,o.street].filter(e).join(" ")),n(t,"formatted_address",o.formattedAddress),s&&(n(t,"postal_code_availability",s.availability),n(t,"postal_code_availability_serving_now",s.servingNow))},s=e=>{t.forEach((t=>((e,t)=>{try{e.querySelector(`input[name="${t}"]`).parentElement.parentElement.style.display="none"}catch(e){console.log("cannot hide field",t)}})(e,t)))},r=e=>{s(e),e.appendChild((()=>{let e='\n  html, body, input, button, label, select {\n    font-family: PP Neue Montreal Variable, sans-serif !important,\n  }\n  input, button {\n    -webkit-appearance:none;\n  }\n  .form-preview-container {\n    background-color: #ffffff;\n  }\n  /* reset */\n  form[class*="hs-form"] *,\n  form[class*="hs-form"] *::before,\n  form[class*="hs-form"] *::after {\n    box-sizing: border-box;\n  }\n  form[class*="hs-form"] {\n    display: flex;\n    flex-wrap: wrap;\n    flex-direction: column;\n    gap: 1rem;\n    font-family: PP Neue Montreal Variable, sans-serif,\n  }\n  form[class*="hs-form"] fieldset { max-width: none; display: flex; flex-wrap: wrap; }\n  form[class*="hs-form"] fieldset > .field.hs-form-field { width: 1px; flex-grow: 1; min-width: 230px; }\n  form[class*="hs-form"] .field.hs-form-field { flex-grow: 1; min-width: 230px; }\n  form[class*="hs-form"] .field.hs-form-field .input { margin-right: 0; }\n  form[class*="hs-form"] .field.hs-form-field .input input,\n  form[class*="hs-form"] .field.hs-form-field .input select,\n  form[class*="hs-form"] .field.hs-form-field .input textarea\n   {\n    width: 100%;\n    resize: none;\n    background: white;\n    outline: none;\n    border: 1px solid black;\n    transition: .2s all;\n    font-family: PP Neue Montreal Variable, sans-serif,\n  }\n  \n  form[class*="hs-form"] .field.hs-form-field .input textarea {\n    min-height: 150px;\n  }\n  \n  \n  form[class*="hs-form"] fieldset { \n    gap: 1rem 12px; \n  }\n  \n\n  form[class*="hs-form"] .field.hs-form-field .input input,\n  form[class*="hs-form"] .field.hs-form-field .input select {\n    height: 44px;\n    line-height: 44px;\n    padding: 0 24px;\n    border: none;\n  }\n\n  form[class*="hs-form"] .field.hs-form-field .input input,\n  form[class*="hs-form"] .field.hs-form-field .input select,\n  form[class*="hs-form"] .field.hs-form-field .input textarea {\n    font-weight: 400;\n    border-style: solid;\n    font-size: 15px;\n    letter-spacing: 0px;\n    height: 44px;\n    padding: 0 16px !important;\n    border-color: #EFF1F2;\n    color: #090D0FEB;\n    background-color: #EFF1F2;\n    border-width: 0px;\n    border-radius: 12px;\n  }\n  form[class*="hs-form"] .field.hs-form-field .input textarea {\n    height: 150px;\n    padding: 16px !important;\n  }\n\n  form[class*="hs-form"] .field.hs-form-field .input input::placeholder,\n  form[class*="hs-form"] .field.hs-form-field .input select:invalid,\n  form[class*="hs-form"] .field.hs-form-field .input textarea::placeholder {\n    color: #020B0F5C;font-weight: 400;letter-spacing: 0px;\n  }\n\n\n  form[class*="hs-form"] .field.hs-form-field > label {\n    display: block;\n    font-weight: 600;color: #000000;font-size: 15px;margin-bottom: 8px;letter-spacing: 0px;text-transform: capitalize;\n  }\n\n  form[class*="hs-form"] .inputs-list label {\n    display: block;\n    border-style: solid;border-width: 0px;border-radius: 0px;padding: 8px 0px 0px 0px;color: #c95151;border-color: #d02525;font-size: 14px;font-weight: 400;\n  }\n\n\n  form[class*="hs-form"] .actions input[type="submit"] {\n    display: flex;\n    justify-content: center;\n    width: 100%;\n    cursor: pointer;\n    line-height: 44px;\n    outline: none;\n    border: none;\n    transition: .2s all;\n    border-style: solid;\n    color: white;\n    font-weight: 400;font-size: 15px;letter-spacing: 0px;height: 44px;padding: 0 32px;color: white;background-color: #0F9954;border-width: 0px;border-radius: 12px;text-align: center;\n  }\n\n  form[class*="hs-form"] .actions input[type="submit"]:hover {\n    font-size: 15px;\n    background-color: #0F9954;\n  }\n\n  form[class*="hs-form"] .hs_error_rollup {\n    display: none;\n  }\n\n  form[class*="hs-form"] .hs-error-msgs li { list-style: none; margin-left: 0; }\n\n  div[class*="hs-form"].submitted-message {\n    background-color: #6c42e0;border-width: 1px;border-radius: 8px;padding: 16px;text-align: center;color: #ffffff;font-size: 18px;\n  }\n\n  div[class*="hs-form"].submitted-message p {\n    color: #ffffff;\n}';e+='\n.hs-form__virality-link {\n  display: none !important;\n}\n.hs-form .field {\n  margin-bottom: 0 !important;\n}\n\nform[class*="hs-form"] .field.hs-form-field > label {\n  display: none;\n}\n\n.hs_submit.hs-submit .actions {\n  padding: 0 !important;\n  margin: 0 !important;\n}\n\nform[class*="hs-form"] {\n  padding-bottom: 30px;\n}\n\n';const t=document.createElement("style");return t.innerHTML=e.trim(),t})())},i=e=>({update:t=>{try{window[e]=Object.assign(Object.assign({},window[e]),t)}catch(e){}},get:()=>{try{return window[e]}catch(e){return{}}}}),l=i("hsFormStateBooking"),a=i("hsFormStateNewsletter"),c=e=>"0"in e&&"length"in e&&1===e.length?e[0]:e,d=({hsFormSuccess:e,hsFormNewsletter:t})=>{window.hbspt.forms.create(Object.assign(Object.assign({},e),{onFormReady:e=>{const t=c(e);window.hsFormPreorder=t,r(t)},onFormSubmit:t=>{var n;const o=c(t);o.querySelector('input[name="email"]').value,null===(n=e.onFormSubmit)||void 0===n||n.call(e,o)},onFormSubmitted:(t,n)=>{var o;null===(o=e.onFormSubmitted)||void 0===o||o.call(e,t,Object.assign(Object.assign({},n),{submissionValues:Object.assign(Object.assign({},n.submissionValues),l.get())}))}})),window.hbspt.forms.create(Object.assign(Object.assign({},t),{onFormReady:e=>{const t=c(e);window.hsFormNewsletter=t,r(t)},onFormSubmitted:(e,n)=>{var o;null===(o=t.onFormSubmitted)||void 0===o||o.call(t,e,Object.assign(Object.assign({},n),{submissionValues:Object.assign(Object.assign({},n.submissionValues),a.get())}))}}))};function u(){}function f(e,t){for(const n in t)e[n]=t[n];return e}function p(e){return e()}function m(){return Object.create(null)}function h(e){e.forEach(p)}function g(e){return"function"==typeof e}function b(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}let y;function v(e,t){return y||(y=document.createElement("a")),y.href=t,e===y.href}function w(e,t,n){e.$$.on_destroy.push(function(e,...t){if(null==e)return u;const n=e.subscribe(...t);return n.unsubscribe?()=>n.unsubscribe():n}(t,n))}function S(e){const t={};for(const n in e)"$"!==n[0]&&(t[n]=e[n]);return t}const x="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function _(e,t){e.appendChild(t)}function E(e,t,n){e.insertBefore(t,n||null)}function A(e){e.parentNode&&e.parentNode.removeChild(e)}function $(e){return document.createElement(e)}function C(e){return document.createTextNode(e)}function k(){return C(" ")}function z(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function j(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function P(e,t){t=""+t,e.data!==t&&(e.data=t)}function F(e,t,n){e.classList[n?"add":"remove"](t)}let q;function T(e){q=e}function N(){if(!q)throw new Error("Function called outside component initialization");return q}function O(e){N().$$.on_mount.push(e)}function B(){const e=N();return(t,n,{cancelable:o=!1}={})=>{const s=e.$$.callbacks[t];if(s){const r=function(e,t,{bubbles:n=!1,cancelable:o=!1}={}){const s=document.createEvent("CustomEvent");return s.initCustomEvent(e,n,o,t),s}(t,n,{cancelable:o});return s.slice().forEach((t=>{t.call(e,r)})),!r.defaultPrevented}return!0}}const L=[],D=[];let K=[];const I=[],Q=Promise.resolve();let M=!1;function V(e){K.push(e)}const R=new Set;let U=0;function H(){if(0!==U)return;const e=q;do{try{for(;U<L.length;){const e=L[U];U++,T(e),Y(e.$$)}}catch(e){throw L.length=0,U=0,e}for(T(null),L.length=0,U=0;D.length;)D.pop()();for(let e=0;e<K.length;e+=1){const t=K[e];R.has(t)||(R.add(t),t())}K.length=0}while(L.length);for(;I.length;)I.pop()();M=!1,R.clear(),T(e)}function Y(e){if(null!==e.fragment){e.update(),h(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(V)}}const Z=new Set;function G(e,t){e&&e.i&&(Z.delete(e),e.i(t))}function J(e,t,n,o){const{fragment:s,after_update:r}=e.$$;s&&s.m(t,n),o||V((()=>{const t=e.$$.on_mount.map(p).filter(g);e.$$.on_destroy?e.$$.on_destroy.push(...t):h(t),e.$$.on_mount=[]})),r.forEach(V)}function W(e,t){const n=e.$$;null!==n.fragment&&(!function(e){const t=[],n=[];K.forEach((o=>-1===e.indexOf(o)?t.push(o):n.push(o))),n.forEach((e=>e())),K=t}(n.after_update),h(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function X(e,t){-1===e.$$.dirty[0]&&(L.push(e),M||(M=!0,Q.then(H)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function ee(e,t,n,o,s,r,i,l=[-1]){const a=q;T(e);const c=e.$$={fragment:null,ctx:[],props:r,update:u,not_equal:s,bound:m(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(a?a.$$.context:[])),callbacks:m(),dirty:l,skip_bound:!1,root:t.target||a.$$.root};i&&i(c.root);let d=!1;if(c.ctx=n?n(e,t.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return c.ctx&&s(c.ctx[t],c.ctx[t]=r)&&(!c.skip_bound&&c.bound[t]&&c.bound[t](r),d&&X(e,t)),n})):[],c.update(),d=!0,h(c.before_update),c.fragment=!!o&&o(c.ctx),t.target){if(t.hydrate){const e=function(e){return Array.from(e.childNodes)}(t.target);c.fragment&&c.fragment.l(e),e.forEach(A)}else c.fragment&&c.fragment.c();t.intro&&G(e.$$.fragment),J(e,t.target,t.anchor,t.customElement),H()}T(a)}class te{$destroy(){W(this,1),this.$destroy=u}$on(e,t){if(!g(t))return u;const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}let ne=!1;const oe=[];function se(e,t){if(window.google&&window.google.maps&&window.google.maps.places)return void t();if(t&&oe.push(t),ne)return;ne=!0;const n=document.createElement("script");n.async=!0,n.defer=!0,n.onload=re,n.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(e)}&libraries=places`,n.type="text/javascript",document.head.appendChild(n)}function re(){let e;for(ne=!1;e=oe.pop();)e()}function ie(e){let t,n,o,s;return{c(){t=$("input"),j(t,"class",n=e[7].class),j(t,"placeholder",e[0]),t.value=e[1],t.required=e[2],j(t,"pattern",e[3]),F(t,"input",!0)},m(n,r){E(n,t,r),e[11](t),o||(s=[z(t,"change",e[5]),z(t,"keydown",e[6])],o=!0)},p(e,[o]){128&o&&n!==(n=e[7].class)&&j(t,"class",n),1&o&&j(t,"placeholder",e[0]),2&o&&t.value!==e[1]&&(t.value=e[1]),4&o&&(t.required=e[2]),8&o&&j(t,"pattern",e[3]),128&o&&F(t,"input",!0)},i:u,o:u,d(n){n&&A(t),e[11](null),o=!1,h(s)}}}function le(e,t,n){let o,{apiKey:s}=t,{options:r}=t,{placeholder:i}=t,{value:l=""}=t,{required:a=!1}=t,{pattern:c=""}=t,{onSelect:d}=t;const u=B();let p;function m(){n(4,p.value="",p),h()}function h(){""===p.value&&g(null)}function g(e){o=e&&e.text||"",u("place_changed",e)}return O((()=>{se(s,(()=>{n(8,r.types=["street_address","premise","subpremise","point_of_interest"],r);const e=new google.maps.places.Autocomplete(p,Object.assign({},r));e.addListener("place_changed",(()=>{const t=e.getPlace();(function(e){const t=r&&r.fields||["geometry"];return e.hasOwnProperty(t[0])})(t)&&(d(t),g({place:t,text:p.value}))})),u("ready"),setTimeout((()=>{p.setAttribute("autocomplete","one-time-code")}),2e3)}))})),e.$$set=e=>{n(7,t=f(f({},t),S(e))),"apiKey"in e&&n(9,s=e.apiKey),"options"in e&&n(8,r=e.options),"placeholder"in e&&n(0,i=e.placeholder),"value"in e&&n(1,l=e.value),"required"in e&&n(2,a=e.required),"pattern"in e&&n(3,c=e.pattern),"onSelect"in e&&n(10,d=e.onSelect)},e.$$.update=()=>{2&e.$$.dirty&&(o=l||"")},t=S(t),[i,l,a,c,p,h,function(e){const t=document.getElementsByClassName("pac-item").length;if("Enter"===e.key||"Tab"===e.key)if(t){document.getElementsByClassName("pac-item-selected").length||function(){const e=new KeyboardEvent("keydown",{key:"ArrowDown",code:"ArrowDown",keyCode:40});p.dispatchEvent(e)}()}else(function(e){return o!==e})(p.value)&&setTimeout(m,10);else"Escape"===e.key&&setTimeout(m,10);t&&"Enter"===e.key&&e.preventDefault()},t,r,s,d,function(e){D[e?"unshift":"push"]((()=>{p=e,n(4,p)}))}]}class ae extends te{constructor(e){super(),ee(this,e,le,ie,b,{apiKey:9,options:8,placeholder:0,value:1,required:2,pattern:3,onSelect:10})}}const ce=e=>{e.style.display="none"},de=(e,t="block")=>{e.style.display=t};function ue(e){let t=1;const n=setInterval((function(){t<=.1&&(clearInterval(n),e.style.display="none"),e.style.opacity=`${t}`,e.style.filter="alpha(opacity="+100*t+")",t-=.3*t}),1)}const fe=[];const pe=["stateShort","zip","availability","servingNow"],me=["state_id","zip","Availability","serving_now"];const he={state_id:"stateShort",zip:"zip",Availability:"availability",serving_now:"servingNow"},ge=e=>{const t=e.split("\n");if(t.length<1)return;const[n,...o]=t,s=n.split(",");if(function(e){return me.reduce(((t,n)=>t&&e.includes(n)),!0)}(s))return o.map((e=>{const t={},n=e.split(",");if(s.forEach(((e,o)=>{const s=he[e];void 0!==s&&(t[s]=`${n[o]}`)})),function(e){const t=Object.keys(e);return pe.reduce(((e,n)=>e&&t.includes(n)),!0)}(t))return t;console.warn(`Found invalid deregulated row: ${t}`)}),[]);throw new Error(`Missing required deregulated zip column names: ${s}`)},be=[],ye=e=>{const t=function(e,t=u){let n;const o=new Set;function s(t){if(b(e,t)&&(e=t,n)){const t=!fe.length;for(const t of o)t[1](),fe.push(t,e);if(t){for(let e=0;e<fe.length;e+=2)fe[e][0](fe[e+1]);fe.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(r,i=u){const l=[r,i];return o.add(l),1===o.size&&(n=t(s)||u),r(e),()=>{o.delete(l),0===o.size&&n&&(n(),n=null)}}}}(be);return{store:t,load:async()=>{try{const n=await(async e=>{const t=await fetch(e.zipsCsvUrl),n=await(await t.blob()).text();return ge(n)})(e);t.set(n)}catch(e){console.error("Cannot load zips",e)}}}},{document:ve}=x;function we(e){let t,n;return{c(){t=$("p"),n=C(e[4]),j(t,"class","preorder-address-error-message")},m(e,o){E(e,t,o),_(t,n)},p(e,t){16&t&&P(n,e[4])},d(e){e&&A(t)}}}function Se(e){let t,n,o,s,r,i,l,a,c,d,u,f,p,m,h,g;i=new ae({props:{class:"location-search-input",apiKey:e[0],placeholder:"Enter your home address",onSelect:e[17],options:{componentRestrictions:{country:"us"}}}});let b=e[4]&&we(e);return{c(){var g;t=$("div"),n=$("div"),o=$("img"),r=k(),(g=i.$$.fragment)&&g.c(),l=k(),a=$("button"),c=C(e[1]),d=k(),b&&b.c(),u=k(),f=$("div"),p=k(),m=$("script"),v(o.src,s="https://cdn.jsdelivr.net/gh/BasePowerCompany/preorder-booking@1.0.1/public/Base_files/map-pin.svg")||j(o,"src","https://cdn.jsdelivr.net/gh/BasePowerCompany/preorder-booking@1.0.1/public/Base_files/map-pin.svg"),j(o,"alt","Map pin icon"),j(n,"class","input-address-container"),j(a,"class","submitAddressButton button secondary w-button"),j(t,"class","input-address-wrap"),j(f,"class","focus_overlay"),j(m,"charset","utf-8"),v(m.src,h="//js-eu1.hsforms.net/forms/embed/v2.js")||j(m,"src","//js-eu1.hsforms.net/forms/embed/v2.js")},m(e,s){E(e,t,s),_(t,n),_(n,o),_(n,r),J(i,n,null),_(t,l),_(t,a),_(a,c),_(t,d),b&&b.m(t,null),E(e,u,s),E(e,f,s),E(e,p,s),_(ve.head,m),g=!0},p(e,[n]){const o={};1&n&&(o.apiKey=e[0]),28&n&&(o.onSelect=e[17]),i.$set(o),(!g||2&n)&&P(c,e[1]),e[4]?b?b.p(e,n):(b=we(e),b.c(),b.m(t,null)):b&&(b.d(1),b=null)},i(e){g||(G(i.$$.fragment,e),g=!0)},o(e){!function(e,t,n,o){if(e&&e.o){if(Z.has(e))return;Z.add(e),(void 0).c.push((()=>{Z.delete(e),o&&(n&&e.d(1),o())})),e.o(t)}else o&&o()}(i.$$.fragment,e),g=!1},d(e){e&&A(t),W(i),b&&b.d(),e&&A(u),e&&A(f),e&&A(p),A(m)}}}function xe(e,t,n){let s,r,{targetAvailableText:i}=t,{targetDisplayAddress:a}=t,{googlePublicApiKey:c}=t,{googleSheetConfig:d}=t,{addressCtaText:u="See if my home qualifies"}=t;const{store:f,load:p}=ye(d);w(e,f,(e=>n(18,r=e))),O((async()=>{p(),jQuery(".input-address-container").on("click",(function(){jQuery(".focus_overlay").show(),jQuery(".input-address-container").addClass("focused"),jQuery("input.location-search-input").attr("placeholder","Enter your home address"),jQuery("button.submitAddressButton").hide()})),jQuery(".input-address-container").on("keydown",(function(){jQuery("input.location-search-input").attr("placeholder","")})),jQuery(".focus_overlay").on("click",(function(){jQuery(".focus_overlay").hide(),jQuery(".submitAddressButton").show(),jQuery(".input-address-container").removeClass("focused")}))}));let m,{panelEl:h}=t,{stateContainerEl:g}=t,{addressPanelEl:b}=t,{targetAvailableStateEl:y}=t,{targetNotAvailableStateEl:v}=t,{onAddressSelect:S}=t,{onAddressSubmitSuccess:x=()=>{}}=t,{hidePanelEl:_=!1}=t;const E=()=>{if(!m)return void n(4,s="Please enter a full address.");if(!m.postalCode||!m.houseNumber||!m.street)return void n(4,s="Please enter a full address.");_||function(e,t="block"){let n=.1;e.style.opacity="0",e.style.display=t;const o=setInterval((function(){n>=1&&clearInterval(o),e.style.opacity=`${n}`,e.style.filter="alpha(opacity="+100*n+")",n+=.3*n}),1)}(h),de(g),ce(b);document.querySelector(a).innerHTML=m.formattedAddress;const e=r.find((e=>e.zip===m.postalCode))||null;e?(document.querySelector(i).innerHTML=e.availability,de(y),ce(v),o(window.hsFormPreorder,m,e),l.update({selectedAddress:m,zipConfig:e}),null==x||x(m,"lead-preorder-form",e)):(de(v),ce(y),o(window.hsFormNewsletter,m),l.update({selectedAddress:m,zipConfig:null}),null==x||x(m,"lead-newsletter-form",e))};return e.$$set=e=>{"targetAvailableText"in e&&n(7,i=e.targetAvailableText),"targetDisplayAddress"in e&&n(8,a=e.targetDisplayAddress),"googlePublicApiKey"in e&&n(0,c=e.googlePublicApiKey),"googleSheetConfig"in e&&n(9,d=e.googleSheetConfig),"addressCtaText"in e&&n(1,u=e.addressCtaText),"panelEl"in e&&n(10,h=e.panelEl),"stateContainerEl"in e&&n(11,g=e.stateContainerEl),"addressPanelEl"in e&&n(12,b=e.addressPanelEl),"targetAvailableStateEl"in e&&n(13,y=e.targetAvailableStateEl),"targetNotAvailableStateEl"in e&&n(14,v=e.targetNotAvailableStateEl),"onAddressSelect"in e&&n(2,S=e.onAddressSelect),"onAddressSubmitSuccess"in e&&n(15,x=e.onAddressSubmitSuccess),"hidePanelEl"in e&&n(16,_=e.hidePanelEl)},n(4,s=""),n(3,m=void 0),[c,u,S,m,s,f,E,i,a,d,h,g,b,y,v,x,_,e=>{const t=(e=>{console.log(e);const t=(e.address_components||[]).reduce((function(e,t){return t.types.forEach((function(n){e[n]=t})),e}),{}),n=(e,n=!1)=>e in t?n?t[e].short_name:t[e].long_name:null;return{title:e.name,formattedAddress:e.formatted_address,externalId:e.place_id,externalUrl:e.url,houseNumber:n("street_number"),street:n("route"),street_2:[n("floor"),n("subpremise")].filter((e=>!!e)).join(",")||null,city:n("locality")||n("sublocality")||n("sublocality_level_1")||n("neighborhood")||n("administrative_area_level_3")||n("administrative_area_level_2"),county:n("administrative_area_level_2"),stateShort:n("administrative_area_level_1",!0),stateLong:n("administrative_area_level_1"),countryCode:n("country",!0),countryLong:n("country"),postalCode:n("postal_code")}})(e);S?.(t),window.blur(),n(4,s=""),n(3,m=t),E()}]}class _e extends te{constructor(e){super(),ee(this,e,xe,Se,b,{targetAvailableText:7,targetDisplayAddress:8,googlePublicApiKey:0,googleSheetConfig:9,addressCtaText:1,panelEl:10,stateContainerEl:11,addressPanelEl:12,targetAvailableStateEl:13,targetNotAvailableStateEl:14,onAddressSelect:2,onAddressSubmitSuccess:15,hidePanelEl:16})}}function Ee(e){let t,n,o,s,r,i,l,a,c,d,f,p,m,g,b,y,v,w,S,x,q,T,N,O,B,L,D,K,I,Q,M=(e[1][0]||"")+"",V=(e[1][1]||"")+"",R=(e[1][2]||"")+"",U=(e[1][3]||"")+"",H=(e[1][4]||"")+"";return{c(){t=$("div"),n=$("div"),n.textContent="Enter your zip code",o=k(),s=$("div"),r=$("div"),i=$("input"),l=k(),a=$("div"),c=$("div"),d=C(M),f=k(),p=$("div"),m=C(V),g=k(),b=$("div"),y=C(R),v=k(),w=$("div"),S=C(U),x=k(),q=$("div"),T=C(H),N=k(),O=$("button"),B=C(e[0]),D=k(),K=$("div"),j(n,"class","zip-badge"),j(i,"type","text"),j(i,"inputmode","numeric"),j(i,"pattern","[0-9]*"),j(i,"class","zip-search-input"),j(i,"maxlength","5"),j(c,"class","zip-box"),F(c,"filled",e[1].length>=1),j(p,"class","zip-box"),F(p,"filled",e[1].length>=2),j(b,"class","zip-box"),F(b,"filled",e[1].length>=3),j(w,"class","zip-box"),F(w,"filled",e[1].length>=4),j(q,"class","zip-box"),F(q,"filled",e[1].length>=5),j(a,"class","zip-boxes"),j(r,"class","zip-input-layout"),j(O,"class","submitZipButton button secondary w-button"),O.disabled=L=!e[2],j(s,"class","input-zip-container"),j(t,"class","input-zip-wrap"),j(K,"class","focus_overlay")},m(u,h){E(u,t,h),_(t,n),_(t,o),_(t,s),_(s,r),_(r,i),_(r,l),_(r,a),_(a,c),_(c,d),_(a,f),_(a,p),_(p,m),_(a,g),_(a,b),_(b,y),_(a,v),_(a,w),_(w,S),_(a,x),_(a,q),_(q,T),_(s,N),_(s,O),_(O,B),E(u,D,h),E(u,K,h),I||(Q=[z(i,"input",e[4]),z(i,"keydown",e[8]),z(O,"click",e[5])],I=!0)},p(e,[t]){2&t&&M!==(M=(e[1][0]||"")+"")&&P(d,M),2&t&&F(c,"filled",e[1].length>=1),2&t&&V!==(V=(e[1][1]||"")+"")&&P(m,V),2&t&&F(p,"filled",e[1].length>=2),2&t&&R!==(R=(e[1][2]||"")+"")&&P(y,R),2&t&&F(b,"filled",e[1].length>=3),2&t&&U!==(U=(e[1][3]||"")+"")&&P(S,U),2&t&&F(w,"filled",e[1].length>=4),2&t&&H!==(H=(e[1][4]||"")+"")&&P(T,H),2&t&&F(q,"filled",e[1].length>=5),1&t&&P(B,e[0]),4&t&&L!==(L=!e[2])&&(O.disabled=L)},i:u,o:u,d(e){e&&A(t),e&&A(D),e&&A(K),I=!1,h(Q)}}}function Ae(e,t,n){let o,s,{googleSheetConfig:r}=t,{addressCtaText:i="Get started"}=t,{onAddressSubmitSuccess:l=()=>{}}=t;const{store:a,load:c}=ye(r);w(e,a,(e=>n(10,s=e))),O((async()=>{c();const e=document.querySelector(".input-zip-container"),t=document.querySelector(".focus_overlay"),n=document.querySelector(".zip-search-input");e&&t&&(e.addEventListener("click",(()=>{5!==d.length&&(t.style.display="block",e.classList.add("focused")),null==n||n.focus()})),t.addEventListener("click",(()=>{t.style.display="none",e.classList.remove("focused")})))}));let d="";const u=()=>{if(!d)return;if(5!==d.length)return;console.log("Submitting zip code:",d);const e=s.find((e=>e.zip===d))||null;console.log("Found zip config:",e);const t={title:"",formattedAddress:d,externalId:"",externalUrl:"",houseNumber:"",street:"",street_2:"",city:"",county:"",stateShort:(null==e?void 0:e.stateShort)||"",stateLong:"",countryCode:"US",countryLong:"United States",postalCode:d};console.log("Calling onAddressSubmitSuccess with:",{address:t,type:e?"lead-preorder-form":"lead-newsletter-form",zipConfig:e}),null==l||l(t,e?"lead-preorder-form":"lead-newsletter-form",e)};return e.$$set=e=>{"googleSheetConfig"in e&&n(6,r=e.googleSheetConfig),"addressCtaText"in e&&n(0,i=e.addressCtaText),"onAddressSubmitSuccess"in e&&n(7,l=e.onAddressSubmitSuccess)},e.$$.update=()=>{2&e.$$.dirty&&n(2,o=5===d.length)},[i,d,o,a,e=>{const t=e.target,o=t.value.replace(/\D/g,"");o.length>5?t.value=o.slice(0,5):t.value=o,n(1,d=t.value)},u,r,l,e=>"Enter"===e.key&&o&&u()]}class $e extends te{constructor(e){super(),ee(this,e,Ae,Ee,b,{googleSheetConfig:6,addressCtaText:0,onAddressSubmitSuccess:7})}}const Ce={initialize:e=>{const{targetElAddressInput:t=document.getElementById("hero-address-entry"),googlePublicApiKey:n,targetPanel:o,targetAddressPanel:s,targetAvailableState:r,targetNotAvailableState:i,targetStateContainer:l,targetAvailableText:a,targetDisplayAddress:c,googleSheetConfig:u,hsFormSuccess:f,hsFormNewsletter:p,querySelectorClickToOpenForm:m,onAddressSelect:h,onAddressSubmitSuccess:g,hidePanelEl:b,addressCtaText:y}=e;d({hsFormSuccess:f,hsFormNewsletter:p});const v=document.querySelector(o),w=document.querySelector(l),S=document.querySelector(s),x=document.querySelector(r),_=document.querySelector(i);document.querySelectorAll(m).forEach((e=>{e.addEventListener("click",(e=>{e.preventDefault(),t.scrollIntoView({behavior:"smooth"});const n=t.getBoundingClientRect().top+window.scrollY-300;window.scrollTo({top:n,behavior:"smooth"}),setTimeout((()=>{t.querySelector("input").focus()}),1e3)}))})),document.querySelectorAll(".close-button").forEach((e=>{e.addEventListener("click",(()=>{ue(v)}))}));return new _e({target:t,props:{googlePublicApiKey:n,googleSheetConfig:u,targetAvailableText:a,targetDisplayAddress:c,addressPanelEl:S,targetAvailableStateEl:x,stateContainerEl:w,panelEl:v,targetNotAvailableStateEl:_,onAddressSelect:h,onAddressSubmitSuccess:g,hidePanelEl:b,addressCtaText:"See if my home qualifies"}})},initializeZipCode:e=>{const{targetElAddressInput:t=document.getElementById("zip-code-entry"),googlePublicApiKey:n,targetPanel:o,targetAddressPanel:s,targetAvailableState:r,targetNotAvailableState:i,targetStateContainer:l,targetAvailableText:a,targetDisplayAddress:c,googleSheetConfig:u,hsFormSuccess:f,hsFormNewsletter:p,querySelectorClickToOpenForm:m,onAddressSubmitSuccess:h,hidePanelEl:g,addressCtaText:b}=e;d({hsFormSuccess:f,hsFormNewsletter:p});const y=document.querySelector(o);document.querySelector(l),document.querySelector(s),document.querySelector(r),document.querySelector(i),document.querySelectorAll(m).forEach((e=>{e.addEventListener("click",(e=>{e.preventDefault(),t.scrollIntoView({behavior:"smooth"});const n=t.getBoundingClientRect().top+window.scrollY-300;window.scrollTo({top:n,behavior:"smooth"}),setTimeout((()=>{t.querySelector("input").focus()}),1e3)}))})),document.querySelectorAll(".close-button").forEach((e=>{e.addEventListener("click",(()=>{ue(y)}))}));return new $e({target:t,props:{googleSheetConfig:u,onAddressSubmitSuccess:h,addressCtaText:b}})}};window.BasePreorderApp=Ce}));
//# sourceMappingURL=embed.js.map
