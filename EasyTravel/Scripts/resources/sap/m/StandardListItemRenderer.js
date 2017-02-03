/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./ListItemBaseRenderer','sap/ui/core/Renderer'],function(q,L,R){"use strict";var S=R.extend(L);S.renderLIAttributes=function(r,l){r.addClass("sapMSLI");if(l.getIcon()){r.addClass("sapMSLIIcon");}if(!l.getIconInset()){r.addClass("sapMSLIIconThumb");}if((l.getDescription()||!l.getAdaptTitleSize())&&l.getIcon()&&l.getIconInset()){r.addClass("sapMSLIDescIcon");}if((l.getDescription()||!l.getAdaptTitleSize())&&!l.getIcon()){r.addClass("sapMSLIDescNoIcon");}if(!l.getDescription()&&l.getIcon()){r.addClass("sapMSLINoDescIcon");}if(l.getType()==sap.m.ListType.Detail||l.getType()==sap.m.ListType.DetailAndActive){r.addClass("sapMSLIDetail");}};S.renderLIContent=function(r,l){var i=l.getInfo(),I=l.getInfoTextDirection(),t=l.getTitleTextDirection(),d=l.getTitle()&&(l.getDescription()||!l.getAdaptTitleSize());if(l.getIcon()){r.renderControl(l._getImage());}if(d){r.write('<div class="sapMSLIDiv">');}r.write("<div");if(!d){r.addClass("sapMSLIDiv");}r.addClass("sapMSLITitleDiv");r.writeClasses();r.write(">");r.write("<div");r.addClass(d?"sapMSLITitle":"sapMSLITitleOnly");r.writeClasses();if(t!==sap.ui.core.TextDirection.Inherit){r.writeAttribute("dir",t.toLowerCase());}r.write(">");r.writeEscaped(l.getTitle());r.write("</div>");if(i&&!d){r.write("<div");r.writeAttribute("id",l.getId()+"-info");r.addClass("sapMSLIInfo");r.addClass("sapMSLIInfo"+l.getInfoState());r.writeClasses();if(I!==sap.ui.core.TextDirection.Inherit){r.writeAttribute("dir",I.toLowerCase());}r.write(">");r.writeEscaped(i);r.write("</div>");}r.write("</div>");r.write('<div class="sapMSLIDescriptionDiv">');if(d){r.write('<div class="sapMSLIDescription">');if(l.getDescription()){r.writeEscaped(l.getDescription());}else{r.write("&nbsp;");}r.write("</div>");}if(i&&d){r.write("<div");r.writeAttribute("id",l.getId()+"-info");r.addClass("sapMSLIInfo");r.addClass("sapMSLIInfo"+l.getInfoState());r.writeClasses();if(I!==sap.ui.core.TextDirection.Inherit){r.writeAttribute("dir",I.toLowerCase());}r.write(">");r.writeEscaped(i);r.write("</div>");}r.write("</div>");if(d){r.write("</div>");}};return S;},true);
