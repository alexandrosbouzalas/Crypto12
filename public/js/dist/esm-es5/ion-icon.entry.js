import{r as registerInstance,h,H as Host,a as getElement}from"./index-14843ae0.js";import{i as isStr,b as inheritAttributes,g as getUrl,c as getName}from"./utils-40a8b8f4.js";var validateContent=function(e){var t=document.createElement("div");t.innerHTML=e;for(var i=t.childNodes.length-1;i>=0;i--){if(t.childNodes[i].nodeName.toLowerCase()!=="svg"){t.removeChild(t.childNodes[i])}}var o=t.firstElementChild;if(o&&o.nodeName.toLowerCase()==="svg"){var n=o.getAttribute("class")||"";o.setAttribute("class",(n+" s-ion-icon").trim());if(isValid(o)){return t.innerHTML}}return""};var isValid=function(e){if(e.nodeType===1){if(e.nodeName.toLowerCase()==="script"){return false}for(var t=0;t<e.attributes.length;t++){var i=e.attributes[t].value;if(isStr(i)&&i.toLowerCase().indexOf("on")===0){return false}}for(var t=0;t<e.childNodes.length;t++){if(!isValid(e.childNodes[t])){return false}}}return true};var ioniconContent=new Map;var requests=new Map;var getSvgContent=function(e,t){var i=requests.get(e);if(!i){if(typeof fetch!=="undefined"&&typeof document!=="undefined"){i=fetch(e).then((function(i){if(i.ok){return i.text().then((function(i){if(i&&t!==false){i=validateContent(i)}ioniconContent.set(e,i||"")}))}ioniconContent.set(e,"")}));requests.set(e,i)}else{ioniconContent.set(e,"");return Promise.resolve()}}return i};var iconCss=":host{display:inline-block;width:1em;height:1em;contain:strict;fill:currentColor;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}:host .ionicon{stroke:currentColor}.ionicon-fill-none{fill:none}.ionicon-stroke-width{stroke-width:32px;stroke-width:var(--ionicon-stroke-width, 32px)}.icon-inner,.ionicon,svg{display:block;height:100%;width:100%}:host(.flip-rtl) .icon-inner{-webkit-transform:scaleX(-1);transform:scaleX(-1)}:host(.icon-small){font-size:18px !important}:host(.icon-large){font-size:32px !important}:host(.ion-color){color:var(--ion-color-base) !important}:host(.ion-color-primary){--ion-color-base:var(--ion-color-primary, #3880ff)}:host(.ion-color-secondary){--ion-color-base:var(--ion-color-secondary, #0cd1e8)}:host(.ion-color-tertiary){--ion-color-base:var(--ion-color-tertiary, #f4a942)}:host(.ion-color-success){--ion-color-base:var(--ion-color-success, #10dc60)}:host(.ion-color-warning){--ion-color-base:var(--ion-color-warning, #ffce00)}:host(.ion-color-danger){--ion-color-base:var(--ion-color-danger, #f14141)}:host(.ion-color-light){--ion-color-base:var(--ion-color-light, #f4f5f8)}:host(.ion-color-medium){--ion-color-base:var(--ion-color-medium, #989aa2)}:host(.ion-color-dark){--ion-color-base:var(--ion-color-dark, #222428)}";var Icon=function(){function e(e){var t=this;registerInstance(this,e);this.iconName=null;this.inheritedAttributes={};this.isVisible=false;this.mode=getIonMode();this.lazy=false;this.sanitize=true;this.hasAriaHidden=function(){var e=t.el;return e.hasAttribute("aria-hidden")&&e.getAttribute("aria-hidden")==="true"}}e.prototype.componentWillLoad=function(){this.inheritedAttributes=inheritAttributes(this.el,["aria-label"])};e.prototype.connectedCallback=function(){var e=this;this.waitUntilVisible(this.el,"50px",(function(){e.isVisible=true;e.loadIcon()}))};e.prototype.disconnectedCallback=function(){if(this.io){this.io.disconnect();this.io=undefined}};e.prototype.waitUntilVisible=function(e,t,i){var o=this;if(this.lazy&&typeof window!=="undefined"&&window.IntersectionObserver){var n=this.io=new window.IntersectionObserver((function(e){if(e[0].isIntersecting){n.disconnect();o.io=undefined;i()}}),{rootMargin:t});n.observe(e)}else{i()}};e.prototype.loadIcon=function(){var e=this;if(this.isVisible){var t=getUrl(this);if(t){if(ioniconContent.has(t)){this.svgContent=ioniconContent.get(t)}else{getSvgContent(t,this.sanitize).then((function(){return e.svgContent=ioniconContent.get(t)}))}}}var i=this.iconName=getName(this.name,this.icon,this.mode,this.ios,this.md);if(i){this.ariaLabel=i.replace(/\-/g," ")}};e.prototype.render=function(){var e,t;var i=this,o=i.iconName,n=i.ariaLabel,r=i.inheritedAttributes;var s=this.mode||"md";var a=this.flipRtl||o&&(o.indexOf("arrow")>-1||o.indexOf("chevron")>-1)&&this.flipRtl!==false;return h(Host,Object.assign({"aria-label":n!==undefined&&!this.hasAriaHidden()?n:null,role:"img",class:Object.assign(Object.assign((e={},e[s]=true,e),createColorClasses(this.color)),(t={},t["icon-".concat(this.size)]=!!this.size,t["flip-rtl"]=!!a&&this.el.ownerDocument.dir==="rtl",t))},r),this.svgContent?h("div",{class:"icon-inner",innerHTML:this.svgContent}):h("div",{class:"icon-inner"}))};Object.defineProperty(e,"assetsDirs",{get:function(){return["svg"]},enumerable:false,configurable:true});Object.defineProperty(e.prototype,"el",{get:function(){return getElement(this)},enumerable:false,configurable:true});Object.defineProperty(e,"watchers",{get:function(){return{name:["loadIcon"],src:["loadIcon"],icon:["loadIcon"]}},enumerable:false,configurable:true});return e}();var getIonMode=function(){return typeof document!=="undefined"&&document.documentElement.getAttribute("mode")||"md"};var createColorClasses=function(e){var t;return e?(t={"ion-color":true},t["ion-color-".concat(e)]=true,t):null};Icon.style=iconCss;export{Icon as ion_icon};