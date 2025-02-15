import{G as M,M as C,$ as e,c as v,d as j,f as z}from"./DarkTheme-7d442e55.js";import{a as E,m as N,F as t,h as H,j as W,b as J}from"./main-04baad83.js";import{a as K}from"./peripherals-ea334129.js";const D={};D.initialize=function(R){M.active_tab_ref=this,M.active_tab="auxiliary";let k=null,S=!0;function L(){C.send_message(E.MSP_MODE_RANGES,!1,!1,U)}function U(){C.send_message(E.MSP_MODE_RANGES_EXTRA,!1,!1,y)}function y(){C.send_message(E.MSP_BOXIDS,!1,!1,F)}function F(){C.send_message(E.MSP_RSSI_CONFIG,!1,!1,X)}function X(){C.send_message(E.MSP_RC,!1,!1,$)}function $(){N.loadSerialConfig(w)}function w(){e("#content").load("./tabs/auxiliary.html",B)}C.send_message(E.MSP_BOXNAMES,!1,!1,L);function q(l,c){const n=e("#tab-auxiliary-templates .mode").clone();let o=t.AUX_CONFIG[l];const g=K(c,o),p=W.camelize(o.replace(/\s+/g,""));return e(n).attr("id",`mode-${l}`),e(n).find(".name").text(g),e(n).find(".helpicon").attr("i18n_title",`auxiliaryHelpMode_${p}`),e(n).data("index",l),e(n).data("id",c),e(n).find(".name").data("modeElement",n),e(n).find("a.addRange").data("modeElement",n),e(n).find("a.addLink").data("modeElement",n),c==0&&e(n).find(".addLink").hide(),n}function G(l){const c=e(l).find(".logic"),r=e(c).find("option");r.remove();let n=r.clone();n.text(v.getMessage("auxiliaryModeLogicOR")),n.val(0),c.append(n),n=r.clone(),n.text(v.getMessage("auxiliaryModeLogicAND")),n.val(1),c.append(n),r.val(0)}function P(l){const c=e("#tab-auxiliary-templates .range"),r=e(c).find(".channel"),n=e(r).find("option");n.remove();let o=n.clone();o.text(v.getMessage("auxiliaryAutoChannelSelect")),o.val(-1),r.append(o);for(let g=0;g<l;g++)o=n.clone(),o.text(`AUX ${g+1}`),o.val(g),r.append(o);n.val(-1),G(c)}function V(){const l=e("#tab-auxiliary-templates .link"),c=e(l).find(".linkedTo"),r=e(c).find("option");r.remove();let n=r.clone();n.text(""),n.val(0),c.append(n);for(let o=1;o<t.AUX_CONFIG.length;o++)n=r.clone(),n.text(t.AUX_CONFIG[o]),n.val(t.AUX_CONFIG_IDS[o]),c.append(n);c.sortSelect(),r.val(0),G(l)}function b(l,c,r,n){const o=e(l).data("index"),g=e(l).find(".ranges"),p={min:[900],max:[2100]};let m=[1300,1700];n!==void 0&&(m=[n.start,n.end]);const _=g.children().length;let f=e("#tab-auxiliary-templates .range").clone();f.attr("id",`mode-${o}-range-${_}`),g.append(f),_==0?e(f).find(".logic").hide():_==1&&g.children().eq(0).find(".logic").show(),e(f).find(".channel-slider").noUiSlider({start:m,behaviour:"snap-drag",margin:25,step:25,connect:!0,range:p,format:wNumb({decimals:0})});const i=`#mode-${o}-range-${_}`;e(`${i} .channel-slider`).Link("lower").to(e(`${i} .lowerLimitValue`)),e(`${i} .channel-slider`).Link("upper").to(e(`${i} .upperLimitValue`));let a=[900,1e3,1200,1400,1500,1600,1800,2e3,2100];e(window).width()<575&&(a=[1e3,1200,1400,1600,1800,2e3]),e(f).find(".pips-channel-range").noUiSlider_pips({mode:"values",values:a,density:4,stepped:!0}),e(f).find(".deleteRange").data("rangeElement",f),e(f).find(".deleteRange").data("modeElement",l),e(f).find("a.deleteRange").click(function(){l=e(this).data("modeElement"),f=e(this).data("rangeElement"),f.remove();const d=e(l).find(".ranges").children();d.length==1&&d.eq(0).find(".logic").hide()}),e(f).find(".channel").val(c),e(f).find(".logic").val(r)}function T(l,c,r){const n=e(l).data("id"),o=e(l).data("index"),g=e(l).find(".ranges"),p=g.children().length;let m=e("#tab-auxiliary-templates .link").clone();m.attr("id",`mode-${o}-link-${p}`),g.append(m),p==0?e(m).find(".logic").hide():p==1&&g.children().eq(0).find(".logic").show();const _=e(m).find(".linkedTo");e(_).find(`option[value="${n}"]`).prop("disabled",!0),e(m).find(".deleteLink").data("linkElement",m),e(m).find(".deleteLink").data("modeElement",l),e(m).find("a.deleteLink").click(function(){l=e(this).data("modeElement"),m=e(this).data("linkElement"),m.remove();const f=e(l).find(".ranges").children();f.length==1&&f.eq(0).find(".logic").hide()}),e(m).find(".linkedTo").val(r),e(m).find(".logic").val(c)}function B(){let l=t.RC.active_channels-4;P(l),V();const c=e(".tab-auxiliary .modes");for(let i=0;i<t.AUX_CONFIG.length;i++){const a=t.AUX_CONFIG_IDS[i],d=q(i,a);c.append(d);for(let s=0;s<t.MODE_RANGES.length;s++){const u=t.MODE_RANGES[s],h=t.MODE_RANGES_EXTRA[s];if(!(u.id!=a||h.id!=a))if(a==0||h.linkedTo==0){const x=u.range;if(x.start>=x.end)continue;b(d,u.auxChannelIndex,h.modeLogic,x)}else T(d,h.modeLogic,h.linkedTo)}}const r=Math.max(...t.AUX_CONFIG.map(i=>i.length));e(".tab-auxiliary .mode .info").css("min-width",`${Math.round(r*H("A"))}px`),e("a.addRange").click(function(){const i=e(this).data("modeElement");b(i,-1,0)}),e("a.addLink").click(function(){const i=e(this).data("modeElement");T(i,0,0)}),v.localizePage(),e("a.save").click(function(){const i=t.MODE_RANGES.length;t.MODE_RANGES=[],t.MODE_RANGES_EXTRA=[],e(".tab-auxiliary .modes .mode").each(function(){const d=e(this),s=d.data("id");e(d).find(".range").each(function(){const u=e(this).find(".channel-slider").val(),h={id:s,auxChannelIndex:parseInt(e(this).find(".channel").val()),range:{start:u[0],end:u[1]}};t.MODE_RANGES.push(h);const x={id:s,modeLogic:parseInt(e(this).find(".logic").val()),linkedTo:0};t.MODE_RANGES_EXTRA.push(x)}),e(d).find(".link").each(function(){const u=parseInt(e(this).find(".linkedTo").val());if(u==0)e(this).remove();else{const h={id:s,auxChannelIndex:0,range:{start:900,end:900}};t.MODE_RANGES.push(h);const x={id:s,modeLogic:parseInt(e(this).find(".logic").val()),linkedTo:u};t.MODE_RANGES_EXTRA.push(x)}})});for(let d=t.MODE_RANGES.length;d<i;d++){const s={id:0,auxChannelIndex:0,range:{start:900,end:900}};t.MODE_RANGES.push(s);const u={id:0,modeLogic:0,linkedTo:0};t.MODE_RANGES_EXTRA.push(u)}N.sendModeRanges(a);function a(){N.writeConfiguration(!1)}});function n(i){return i<900?i=900:i>2100&&(i=2100),i}function o(i,a){const d=(a-900)/1200*100;e(".modes .ranges .range").each(function(){parseInt(e(this).find(".channel").val())===i&&e(this).find(".marker").css("left",`${d}%`)})}function g(){C.send_message(E.MSP_RC,!1,!1,p)}function p(){let i=!1;for(let a=0;a<t.AUX_CONFIG.length;a++){let d=e(`#mode-${a}`);if(d.find(" .range").length==0&&d.find(" .link").length==0){d.removeClass("off").removeClass("on").removeClass("disabled");continue}if(J(t.CONFIG.mode,a))e(".mode .name").eq(a).data("modeElement").addClass("on").removeClass("off").removeClass("disabled"),a==0&&e(".mode .name").eq(a).html(t.AUX_CONFIG[a]);else if(a==0){let s=!1;if(t.CONFIG.armingDisableCount>0){const u=1<<t.CONFIG.armingDisableCount-1;(t.CONFIG.armingDisableFlags&u)>0&&(s=!0)}s?(e(".mode .name").eq(a).data("modeElement").removeClass("on").removeClass("off").addClass("disabled"),e(".mode .name").eq(a).html(`${t.AUX_CONFIG[a]}<br>${v.getMessage("auxiliaryDisabled")}`)):(e(".mode .name").eq(a).data("modeElement").removeClass("on").removeClass("disabled").addClass("off"),e(".mode .name").eq(a).html(t.AUX_CONFIG[a]))}else e(".mode .name").eq(a).data("modeElement").removeClass("on").removeClass("disabled").addClass("off");i=!0}if(S){S=!1;let a=_&&i;for(let d=0;d<t.AUX_CONFIG.length;d++){let s=e(`#mode-${d}`);!s.find(" .range").length&&!s.find(" .link").length&&s.toggle(!a)}}m(t.RC.channels,t.RC.active_channels,t.RSSI_CONFIG.channel),l=t.RC.active_channels-4;for(let a=0;a<l;a++)o(a,n(t.RC.channels[a+4]))}function m(i,a,d){const s=e('.tab-auxiliary select.channel option[value="-1"]:selected');if(s.length===0){k=null;return}const u=function(){k=i.slice(0)};if(!k||i.length===0)return u();let h=i.map(function(I,O){return Math.abs(k[O]-I)});h=h.slice(0,a);const x=h.reduce(function(I,O){return I>O?I:O},0);if(x<100)return u();const A=h.indexOf(x);return A>=4&&A!=d-1&&s.parent().val(A-4),u()}let _=!1;const f=j("hideUnusedModes");e("input#switch-toggle-unused").change(function(){_=e(this).prop("checked"),S=!0,z({hideUnusedModes:_}),p()}).prop("checked",!!f.hideUnusedModes).change(),p(),M.interval_add("aux_data_pull",g,50),M.interval_add("status_pull",function(){C.send_message(E.MSP_STATUS)},250,!0),M.content_ready(R)}};D.cleanup=function(R){R&&R()};export{D as auxiliary};
