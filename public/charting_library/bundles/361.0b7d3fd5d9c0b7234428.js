(self.webpackChunktradingview=self.webpackChunktradingview||[]).push([[361],{79081:e=>{e.exports={menuWrap:"menuWrap-Kq3ruQo8",isMeasuring:"isMeasuring-Kq3ruQo8",scrollWrap:"scrollWrap-Kq3ruQo8",momentumBased:"momentumBased-Kq3ruQo8",menuBox:"menuBox-Kq3ruQo8",isHidden:"isHidden-Kq3ruQo8"}},83021:(e,t,n)=>{"use strict";n.d(t,{SubmenuContext:()=>s,SubmenuHandler:()=>i});var o=n(50959);const s=o.createContext(null);function i(e){const[t,n]=(0,o.useState)(null),i=(0,o.useRef)(null),r=(0,o.useRef)(new Map);return(0,o.useEffect)((()=>()=>{null!==i.current&&clearTimeout(i.current)}),[]),o.createElement(s.Provider,{value:{current:t,setCurrent:function(e){null!==i.current&&(clearTimeout(i.current),i.current=null);null===t?n(e):i.current=setTimeout((()=>{i.current=null,n(e)}),100)},registerSubmenu:function(e,t){return r.current.set(e,t),()=>{r.current.delete(e)}},isSubmenuNode:function(e){return Array.from(r.current.values()).some((t=>t(e)))}}},e.children)}},90692:(e,t,n)=>{"use strict";n.d(t,{MatchMedia:()=>s});var o=n(50959);class s extends o.PureComponent{constructor(e){super(e),this._handleChange=()=>{this.forceUpdate()},this.state={query:window.matchMedia(this.props.rule)}}componentDidMount(){this._subscribe(this.state.query)}componentDidUpdate(e,t){this.state.query!==t.query&&(this._unsubscribe(t.query),this._subscribe(this.state.query))}componentWillUnmount(){this._unsubscribe(this.state.query)}render(){return this.props.children(this.state.query.matches)}static getDerivedStateFromProps(e,t){return e.rule!==t.query.media?{query:window.matchMedia(e.rule)}:null}_subscribe(e){e.addEventListener("change",this._handleChange)}_unsubscribe(e){e.removeEventListener("change",this._handleChange)}}},64706:(e,t,n)=>{"use strict";n.d(t,{MenuContext:()=>o});const o=n(50959).createContext(null)},27317:(e,t,n)=>{"use strict";n.d(t,{DEFAULT_MENU_THEME:()=>v,Menu:()=>g});var o=n(50959),s=n(97754),i=n.n(s),r=n(50151),l=n(9859),a=n(14729),u=n(50655),c=n(59064),d=n(67961),h=n(4741),p=n(83021),m=n(64706),f=n(79081);const v=f;var _;!function(e){e[e.IndentFromWindow=0]="IndentFromWindow"}(_||(_={}));class g extends o.PureComponent{constructor(e){super(e),this._containerRef=null,this._scrollWrapRef=null,this._raf=null,this._scrollRaf=null,this._scrollTimeout=void 0,this._manager=new d.OverlapManager,this._hotkeys=null,this._scroll=0,this._handleContainerRef=e=>{this._containerRef=e,this.props.reference&&("function"==typeof this.props.reference&&this.props.reference(e),"object"==typeof this.props.reference&&(this.props.reference.current=e))},this._handleScrollWrapRef=e=>{this._scrollWrapRef=e,"function"==typeof this.props.scrollWrapReference&&this.props.scrollWrapReference(e),"object"==typeof this.props.scrollWrapReference&&(this.props.scrollWrapReference.current=e)},this._handleCustomRemeasureDelegate=()=>{this._resizeForced(),this._handleMeasure()},this._handleMeasure=({callback:e,forceRecalcPosition:t}={})=>{var n,o,s,i,a,u,c,d,h,p,m,f;if(this.state.isMeasureValid&&!t)return;const{position:v}=this.props,_=(0,
r.ensureNotNull)(this._containerRef);let g=_.getBoundingClientRect();const C=document.documentElement.clientHeight,b=document.documentElement.clientWidth,M=null!==(n=this.props.closeOnScrollOutsideOffset)&&void 0!==n?n:0;let x=C-0-M;const y=g.height>x;if(y){(0,r.ensureNotNull)(this._scrollWrapRef).style.overflowY="scroll",g=_.getBoundingClientRect()}const{width:S,height:W}=g,R="function"==typeof v?v({contentWidth:S,contentHeight:W,availableWidth:b,availableHeight:C}):v,w=null!==(s=null===(o=null==R?void 0:R.indentFromWindow)||void 0===o?void 0:o.left)&&void 0!==s?s:0,E=b-(null!==(i=R.overrideWidth)&&void 0!==i?i:S)-(null!==(u=null===(a=null==R?void 0:R.indentFromWindow)||void 0===a?void 0:a.right)&&void 0!==u?u:0),O=(0,l.clamp)(R.x,w,Math.max(w,E)),N=(null!==(d=null===(c=null==R?void 0:R.indentFromWindow)||void 0===c?void 0:c.top)&&void 0!==d?d:0)+M,D=C-(null!==(h=R.overrideHeight)&&void 0!==h?h:W)-(null!==(m=null===(p=null==R?void 0:R.indentFromWindow)||void 0===p?void 0:p.bottom)&&void 0!==m?m:0);let P=(0,l.clamp)(R.y,N,Math.max(N,D));if(R.forbidCorrectYCoord&&P<R.y&&(x-=R.y-P,P=R.y),t&&void 0!==this.props.closeOnScrollOutsideOffset&&R.y<=this.props.closeOnScrollOutsideOffset)return void this._handleGlobalClose(!0);const k=null!==(f=R.overrideHeight)&&void 0!==f?f:y?x:void 0;this.setState({appearingMenuHeight:t?this.state.appearingMenuHeight:k,appearingMenuWidth:t?this.state.appearingMenuWidth:R.overrideWidth,appearingPosition:{x:O,y:P},isMeasureValid:!0},(()=>{this.props.doNotRestorePosition||this._restoreScrollPosition(),e&&e()}))},this._restoreScrollPosition=()=>{const e=document.activeElement,t=(0,r.ensureNotNull)(this._containerRef);if(null!==e&&t.contains(e))try{e.scrollIntoView()}catch(e){}else(0,r.ensureNotNull)(this._scrollWrapRef).scrollTop=this._scroll},this._resizeForced=()=>{this.setState({appearingMenuHeight:void 0,appearingMenuWidth:void 0,appearingPosition:void 0,isMeasureValid:void 0})},this._resize=()=>{null===this._raf&&(this._raf=requestAnimationFrame((()=>{this.setState({appearingMenuHeight:void 0,appearingMenuWidth:void 0,appearingPosition:void 0,isMeasureValid:void 0}),this._raf=null})))},this._handleGlobalClose=e=>{this.props.onClose(e)},this._handleSlot=e=>{this._manager.setContainer(e)},this._handleScroll=()=>{this._scroll=(0,r.ensureNotNull)(this._scrollWrapRef).scrollTop},this._handleScrollOutsideEnd=()=>{clearTimeout(this._scrollTimeout),this._scrollTimeout=setTimeout((()=>{this._handleMeasure({forceRecalcPosition:!0})}),80)},this._handleScrollOutside=e=>{e.target!==this._scrollWrapRef&&(this._handleScrollOutsideEnd(),null===this._scrollRaf&&(this._scrollRaf=requestAnimationFrame((()=>{this._handleMeasure({forceRecalcPosition:!0}),this._scrollRaf=null}))))},this.state={}}componentDidMount(){this._handleMeasure({callback:this.props.onOpen});const{customCloseDelegate:e=c.globalCloseDelegate,customRemeasureDelegate:t}=this.props;e.subscribe(this,this._handleGlobalClose),null==t||t.subscribe(null,this._handleCustomRemeasureDelegate),window.addEventListener("resize",this._resize)
;const n=null!==this.context;this._hotkeys||n||(this._hotkeys=h.createGroup({desc:"Popup menu"}),this._hotkeys.add({desc:"Close",hotkey:27,handler:()=>{this.props.onKeyboardClose&&this.props.onKeyboardClose(),this._handleGlobalClose()}})),this.props.repositionOnScroll&&window.addEventListener("scroll",this._handleScrollOutside,{capture:!0})}componentDidUpdate(){this._handleMeasure()}componentWillUnmount(){const{customCloseDelegate:e=c.globalCloseDelegate,customRemeasureDelegate:t}=this.props;e.unsubscribe(this,this._handleGlobalClose),null==t||t.unsubscribe(null,this._handleCustomRemeasureDelegate),window.removeEventListener("resize",this._resize),window.removeEventListener("scroll",this._handleScrollOutside,{capture:!0}),this._hotkeys&&(this._hotkeys.destroy(),this._hotkeys=null),null!==this._raf&&(cancelAnimationFrame(this._raf),this._raf=null),null!==this._scrollRaf&&(cancelAnimationFrame(this._scrollRaf),this._scrollRaf=null),this._scrollTimeout&&clearTimeout(this._scrollTimeout)}render(){const{id:e,role:t,"aria-label":n,"aria-labelledby":s,"aria-activedescendant":r,"aria-hidden":l,"aria-describedby":c,"aria-invalid":d,children:h,minWidth:v,theme:_=f,className:g,maxHeight:b,onMouseOver:M,onMouseOut:x,onKeyDown:y,onFocus:S,onBlur:W}=this.props,{appearingMenuHeight:R,appearingMenuWidth:w,appearingPosition:E,isMeasureValid:O}=this.state,N={"--ui-kit-menu-max-width":`${E&&E.x}px`,maxWidth:"calc(100vw - var(--ui-kit-menu-max-width) - 6px)"};return o.createElement(m.MenuContext.Provider,{value:this},o.createElement(p.SubmenuHandler,null,o.createElement(u.SlotContext.Provider,{value:this._manager},o.createElement("div",{id:e,role:t,"aria-label":n,"aria-labelledby":s,"aria-activedescendant":r,"aria-hidden":l,"aria-describedby":c,"aria-invalid":d,className:i()(g,_.menuWrap,!O&&_.isMeasuring),style:{height:R,left:E&&E.x,minWidth:v,position:"fixed",top:E&&E.y,width:w,...this.props.limitMaxWidth&&N},"data-name":this.props["data-name"],ref:this._handleContainerRef,onScrollCapture:this.props.onScroll,onContextMenu:a.preventDefaultForContextMenu,tabIndex:this.props.tabIndex,onMouseOver:M,onMouseOut:x,onKeyDown:y,onFocus:S,onBlur:W},o.createElement("div",{className:i()(_.scrollWrap,!this.props.noMomentumBasedScroll&&_.momentumBased),style:{overflowY:void 0!==R?"scroll":"auto",maxHeight:b},onScrollCapture:this._handleScroll,ref:this._handleScrollWrapRef},o.createElement(C,{className:_.menuBox},h)))),o.createElement(u.Slot,{reference:this._handleSlot})))}update(e){e?this._resizeForced():this._resize()}focus(e){var t;null===(t=this._containerRef)||void 0===t||t.focus(e)}blur(){var e;null===(e=this._containerRef)||void 0===e||e.blur()}}function C(e){const t=(0,r.ensureNotNull)((0,o.useContext)(p.SubmenuContext)),n=o.useRef(null);return o.createElement("div",{ref:n,className:e.className,onMouseOver:function(e){if(!(null!==t.current&&e.target instanceof Node&&(o=e.target,null===(s=n.current)||void 0===s?void 0:s.contains(o))))return;var o,s;t.isSubmenuNode(e.target)||t.setCurrent(null)},"data-name":"menu-inner"},e.children)}
g.contextType=p.SubmenuContext},29197:(e,t,n)=>{"use strict";n.d(t,{CloseDelegateContext:()=>i});var o=n(50959),s=n(59064);const i=o.createContext(s.globalCloseDelegate)},20520:(e,t,n)=>{"use strict";n.d(t,{PopupMenu:()=>h});var o=n(50959),s=n(32227),i=n(62942),r=n(42842),l=n(27317),a=n(29197);const u=o.createContext(void 0);var c=n(36383);const d=o.createContext({setMenuMaxWidth:!1});function h(e){const{controller:t,children:n,isOpened:h,closeOnClickOutside:p=!0,doNotCloseOn:m,onClickOutside:f,onClose:v,onKeyboardClose:_,"data-name":g="popup-menu-container",...C}=e,b=(0,o.useContext)(a.CloseDelegateContext),M=o.useContext(d),x=(0,o.useContext)(u),y=(0,c.useOutsideEvent)({handler:function(e){f&&f(e);if(!p)return;const t=(0,i.default)(m)?m():null==m?[]:[m];if(t.length>0&&e.target instanceof Node)for(const n of t){const t=s.findDOMNode(n);if(t instanceof Node&&t.contains(e.target))return}v()},mouseDown:!0,touchStart:!0});return h?o.createElement(r.Portal,{top:"0",left:"0",right:"0",bottom:"0",pointerEvents:"none"},o.createElement("span",{ref:y,style:{pointerEvents:"auto"}},o.createElement(l.Menu,{...C,onClose:v,onKeyboardClose:_,onScroll:function(t){const{onScroll:n}=e;n&&n(t)},customCloseDelegate:b,customRemeasureDelegate:x,ref:t,"data-name":g,limitMaxWidth:M.setMenuMaxWidth},n))):null}},50655:(e,t,n)=>{"use strict";n.d(t,{Slot:()=>o.Slot,SlotContext:()=>o.SlotContext});var o=n(99663)}}]);