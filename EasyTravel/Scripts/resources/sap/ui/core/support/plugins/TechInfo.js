/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','../Plugin','../Support','../ToolsAPI','jquery.sap.encoder','jquery.sap.script'],function(q,P,S,T){"use strict";var a=P.extend("sap.ui.core.support.plugins.TechInfo",{constructor:function(o){P.apply(this,["sapUiSupportTechInfo","Technical Information",o]);this._aEventIds=this.isToolPlugin()?[this.getId()+"Data",this.getId()+"FinishedE2ETrace"]:[this.getId()+"ToggleDebug",this.getId()+"SetReboot",this.getId()+"Refresh",this.getId()+"StartE2ETrace",this.getId()+"ToggleStatistics"];if(this.isToolPlugin()){this.e2eLogLevel="medium";this.e2eTraceStarted=false;}}});a.prototype.onsapUiSupportTechInfoData=function(e){var t=this;var d=e.getParameter("data");d.modules.sort();this.e2eTraceStarted=d["e2e-trace"].isStarted;var h=["<div class='sapUiSupportToolbar'>","<a href='#' id='",t.getId(),"-Refresh' class='sapUiSupportLink'>Refresh</a>","<div><div class='sapUiSupportTechInfoCntnt'>","<table border='0' cellpadding='3'>"];l(h,true,true,"SAPUI5 Version",function(b){try{var v=sap.ui.getVersionInfo();var V="<a href='"+sap.ui.resource("","sap-ui-version.json")+"' target='_blank' title='Open Version Info'>"+q.sap.escapeHTML(v.version||"")+"</a>";b.push(V," (built at ",q.sap.escapeHTML(v.buildTimestamp||""),", last change ",q.sap.escapeHTML(v.scmRevision||""),")");}catch(c){b.push("not available");}});l(h,true,true,"Core Version",function(b){return d.version+" (built at "+d.build+", last change "+d.change+")";});l(h,true,true,"Loaded jQuery Version",function(b){return d.jquery;});l(h,true,true,"User Agent",function(b){return d.useragent+(d.docmode?", Document Mode '"+d.docmode+"'":"");});l(h,true,true,"Debug Sources",function(b){b.push((d.debug?"ON":"OFF"),"<a href='#' id='",t.getId(),"-tggleDbgSrc' class='sapUiSupportLink'>Toggle</a>");});l(h,true,true,"Application",d.appurl);m(h,true,true,"Configuration (bootstrap)",d.bootconfig);m(h,true,true,"Configuration (computed)",d.config);if(!q.isEmptyObject(d.libraries)){m(h,true,true,"Libraries",d.libraries);}m(h,true,true,"Loaded Libraries",d.loadedLibraries);l(h,true,true,"Loaded Modules",function(b){q.each(d.modules,function(i,v){if(v.indexOf("sap.ui.core.support")<0){b.push("<span>",q.sap.escapeHTML(v||""),"</span>");if(i<d.modules.length-1){b.push(", ");}}});});m(h,true,true,"URI Parameters",d.uriparams);l(h,true,true,"E2E Trace",function(b){b.push("<label class='sapUiSupportLabel'>Trace Level:</label>","<select id='",t.getId(),"-logLevelE2ETrace' class='sapUiSupportTxtFld' style='margin-left:10px'>","<option value='low'"+(t.e2eLogLevel==='low'?" selected":"")+">LOW</option>","<option value='medium'"+(t.e2eLogLevel==='medium'?" selected":"")+">MEDIUM</option>","<option value='high'"+(t.e2eLogLevel==='hight'?" selected":"")+">HIGH</option>","</select>");b.push("<button id='"+t.getId()+"-startE2ETrace' class='sapUiSupportBtn "+(d["e2e-trace"].isStarted?" active":"")+"' style='margin-left: 10px;'>"+(d["e2e-trace"].isStarted?"Running...":"Start")+"</button>");b.push("<div style='margin-top:5px'>");b.push("<label class='sapUiSupportLabel'>XML Output:</label>");b.push("<textarea id='"+t.getId()+"-outputE2ETrace' style='width:100%;height:50px;margin-top:5px;resize:none;box-sizing:border-box'></textarea>");b.push("</div>");});h.push("</table></div>");this.$().html(h.join(""));this.$("tggleDbgSrc").bind("click",function(e){e.preventDefault();S.getStub().sendEvent(t.getId()+"ToggleDebug",{});});this.$("Refresh").bind("click",function(e){e.preventDefault();S.getStub().sendEvent(t.getId()+"Refresh",{});});this.$("outputE2ETrace").bind("click",function(){this.focus();this.select();});this.$("startE2ETrace").bind("click",function(){if(!t.e2eTraceStarted){t.e2eLogLevel=t.$("logLevelE2ETrace").val();t.$("startE2ETrace").addClass("active").text("Running...");t.$("outputE2ETrace").text("");S.getStub().sendEvent(t.getId()+"StartE2ETrace",{level:t.e2eLogLevel});t.e2eTraceStarted=true;}});document.title="SAPUI5 Diagnostics - "+d.title;};a.prototype.onsapUiSupportTechInfoToggleDebug=function(e){q.sap.debug(!q.sap.debug());s(this);};a.prototype.onsapUiSupportTechInfoSetReboot=function(e){q.sap.setReboot(e.getParameter("rebootUrl"));};a.prototype.onsapUiSupportTechInfoStartE2ETrace=function(e){var t=this,L=e.getParameter("level");sap.ui.require(['sap/ui/core/support/trace/E2eTraceLib'],function(E){E.start(L,function(b){S.getStub().sendEvent(t.getId()+"FinishedE2ETrace",{trace:b});});});};a.prototype.onsapUiSupportTechInfoFinishedE2ETrace=function(e){this.$("startE2ETrace").removeClass("active").text("Start");this.$("outputE2ETrace").text(e.getParameter("trace"));this.e2eTraceStarted=false;};a.prototype.onsapUiSupportTechInfoRefresh=function(e){s(this);};a.prototype.onsapUiSupportTechInfoToggleStatistics=function(e){q.sap.statistics(!q.sap.statistics());s(this);};a.prototype.init=function(o){P.prototype.init.apply(this,arguments);if(!this.isToolPlugin()){s(this);return;}this.$().html("No Information available");};function s(p){var c=T.getFrameworkInformation();var d={version:c.commonInformation.version,build:c.commonInformation.buildTime,change:c.commonInformation.lastChange,jquery:c.commonInformation.jquery,useragent:c.commonInformation.userAgent,docmode:c.commonInformation.documentMode,debug:c.commonInformation.debugMode,bootconfig:c.configurationBootstrap,config:c.configurationComputed,libraries:c.libraries,loadedLibraries:c.loadedLibraries,modules:c.loadedModules,uriparams:c.URLParameters,appurl:c.commonInformation.applicationHREF,title:c.commonInformation.documentTitle,statistics:c.commonInformation.statistics};var E=sap.ui.require('sap/ui/core/support/trace/E2eTraceLib');d["e2e-trace"]={isStarted:E?E.isStarted():false};S.getStub().sendEvent(p.getId()+"Data",{data:d});}function l(b,r,c,d,e){b.push("<tr><td ",r?"align='right' ":"","valign='top'>","<label class='sapUiSupportLabel'>",q.sap.escapeHTML(d||""),"</label></td><td",c?" class='sapUiSupportTechInfoBorder'":"",">");var f=e;if(q.isFunction(e)){f=e(b);}b.push(q.sap.escapeHTML(f||""));b.push("</td></tr>");}function m(b,r,c,d,e){l(b,r,c,d,function(b){b.push("<table border='0' cellspacing='0' cellpadding='3'>");q.each(e,function(i,v){var f="";if(v){if(typeof(v)==="string"||typeof(v)==="string"||typeof(v)==="boolean"){f=v;}else if((q.isArray(v)||q.isPlainObject(v))&&window.JSON){f=window.JSON.stringify(v);}}l(b,false,false,i,""+f);});b.push("</table>");});}return a;});
