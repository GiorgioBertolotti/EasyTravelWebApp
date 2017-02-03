/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./Bar','./InputBase','./ComboBoxTextField','./ComboBoxBase','./Dialog','./MultiInput','./Input','./ToggleButton','./List','./MultiComboBoxRenderer','./Popover','./library','sap/ui/core/EnabledPropagator','sap/ui/core/IconPool','jquery.sap.xml'],function(q,B,I,C,a,D,M,b,T,L,c,P,l,E,d){"use strict";var e=a.extend("sap.m.MultiComboBox",{metadata:{library:"sap.m",properties:{selectedKeys:{type:"string[]",group:"Data",defaultValue:[]}},associations:{selectedItems:{type:"sap.ui.core.Item",multiple:true,singularName:"selectedItem"}},events:{selectionChange:{parameters:{changedItem:{type:"sap.ui.core.Item"},selected:{type:"boolean"}}},selectionFinish:{parameters:{selectedItems:{type:"sap.ui.core.Item[]"}}}}}});d.insertFontFaceStyle();E.apply(e.prototype,[true]);e.prototype.onsapend=function(o){sap.m.Tokenizer.prototype.onsapend.apply(this._oTokenizer,arguments);};e.prototype.onsaphome=function(o){sap.m.Tokenizer.prototype.onsaphome.apply(this._oTokenizer,arguments);};e.prototype.onsapdown=function(o){if(!this.getEnabled()||!this.getEditable()){return;}o.setMarked();o.preventDefault();var i=this.getSelectableItems();var f=i[0];if(f&&this.isOpen()){this.getListItem(f).focus();return;}if(this._oTokenizer.getSelectedTokens().length){return;}this._oTraversalItem=this._getNextTraversalItem();if(this._oTraversalItem){this.updateDomValue(this._oTraversalItem.getText());this.selectText(0,this.getValue().length);}};e.prototype.onsapup=function(o){if(!this.getEnabled()||!this.getEditable()){return;}o.setMarked();o.preventDefault();if(this._oTokenizer.getSelectedTokens().length){return;}this._oTraversalItem=this._getPreviousTraversalItem();if(this._oTraversalItem){this.updateDomValue(this._oTraversalItem.getText());this.selectText(0,this.getValue().length);}};e.prototype._selectItemByKey=function(o){var v,p,f,i,g,h=this.isOpen();if(!this.getEnabled()||!this.getEditable()){return;}if(o){o.setMarked();}v=this._getUnselectedItems(h?"":this.getValue());for(i=0;i<v.length;i++){if(v[i].getText().toUpperCase()===this.getValue().toUpperCase()){f=v[i];g=true;break;}}if(g){p={item:f,id:f.getId(),key:f.getKey(),fireChangeEvent:true,fireFinishEvent:true,suppressInvalidate:true,listItemUpdated:false};this._bPreventValueRemove=false;if(this.getValue()===""||q.sap.startsWithIgnoreCase(f.getText(),this.getValue())){if(this.getListItem(f).isSelected()){this.setValue('');}else{this.setSelection(p);}}}else{this._bPreventValueRemove=true;this._showWrongValueVisualEffect();}if(o){this.close();}};e.prototype.onsapenter=function(o){I.prototype.onsapenter.apply(this,arguments);this._selectItemByKey(o);};e.prototype.onsaptabnext=function(o){var i=this.getValue();if(i){var s=this._getUnselectedItemsStartingText(i);if(s.length===1){this._selectItemByKey(o);}else{this._showWrongValueVisualEffect();this.setValue(null);}}};e.prototype.onsapfocusleave=function(o){var p=this.getAggregation("picker");var f=sap.ui.getCore().byId(o.relatedControlId);var F=f&&f.getFocusDomRef();if(!p||!p.getFocusDomRef()||!F||!q.contains(p.getFocusDomRef(),F)){this.setValue(null);}if(p&&F){if(q.sap.equal(p.getFocusDomRef(),F)){this.focus();}}};e.prototype.onfocusin=function(o){this.getEditable()&&this.addStyleClass("sapMMultiComboBoxFocus");if(o.target===this.getOpenArea()){this.focus();}if(!this.isOpen()&&this.shouldValueStateMessageBeOpened()){this.openValueStateMessage();}};e.prototype._handleItemTap=function(o){if(o.target.childElementCount===0||o.target.childElementCount===2){this._bCheckBoxClicked=false;if(this.isOpen()&&!this._isListInSuggestMode()){this.close();}}};e.prototype._handleItemPress=function(o){if(this.isOpen()&&this._isListInSuggestMode()&&this.getPicker().oPopup.getOpenState()!==sap.ui.core.OpenState.CLOSING){this.clearFilter();var i=this._getLastSelectedItem();if(i){this.getListItem(i).focus();}}};e.prototype._handleSelectionLiveChange=function(o){var f=o.getParameter("listItem");var i=o.getParameter("selected");var n=this._getItemByListItem(f);if(f.getType()==="Inactive"){return;}if(!n){return;}var p={item:n,id:n.getId(),key:n.getKey(),fireChangeEvent:true,suppressInvalidate:true,listItemUpdated:true};if(i){this.fireChangeEvent(n.getText());this.setSelection(p);}else{this.fireChangeEvent(n.getText());this.removeSelection(p);}if(this._bCheckBoxClicked){this.setValue(this._sOldValue);if(this.isOpen()&&this.getPicker().oPopup.getOpenState()!==sap.ui.core.OpenState.CLOSING){f.focus();}}else{this._bCheckBoxClicked=true;this.setValue("");this.close();}};e.prototype.onkeydown=function(o){a.prototype.onkeydown.apply(this,arguments);if(!this.getEnabled()||!this.getEditable()){return;}this._bIsPasteEvent=(o.ctrlKey||o.metaKey)&&(o.which===q.sap.KeyCodes.V);if(this.getValue().length===0&&(o.ctrlKey||o.metaKey)&&(o.which===q.sap.KeyCodes.A)&&this._hasTokens()){this._oTokenizer.focus();this._oTokenizer.selectAllTokens(true);o.preventDefault();}if(this.isPickerDialog()){this._sOldValue=this.getPickerTextField().getValue();this._iOldCursorPos=q(this.getFocusDomRef()).cursorPos();}};e.prototype.oninput=function(o){a.prototype.oninput.apply(this,arguments);var v=o.target.value,i,r,f,V,g=o.srcControl;if(!this.getEnabled()||!this.getEditable()){return;}if(this._bIsPasteEvent){g.updateDomValue(this._sOldValue||"");return;}f=this._getItemsStartingText(v,true);V=!!f.length;if(!V&&v!==""){g.updateDomValue(this._sOldValue||"");if(this._iOldCursorPos){q(g.getFocusDomRef()).cursorPos(this._iOldCursorPos);}this._showWrongValueVisualEffect();return;}i=this.getEnabledItems();r=this._sOldInput&&this._sOldInput.length>v.length;if(r&&(this.isPickerDialog()&&this._getFilterSelectedButton().getPressed())){i=this.getSelectedItems();}else if(r){i=this.getItems();}this.filterItems(i,v);if((!this.getValue()||!V)&&!this.bOpenedByKeyboardOrButton&&!this.isPickerDialog()){this.close();}else{this.open();}this._sOldInput=v;};e.prototype.filterItems=function(i,v){i.forEach(function(o){var m=q.sap.startsWithIgnoreCase(o.getText(),v);if(v===""){m=true;if(!this.bOpenedByKeyboardOrButton){return;}}var f=this.getListItem(o);if(f){f.setVisible(m);}},this);};e.prototype.onkeyup=function(o){if(!this.getEnabled()||!this.getEditable()){return;}this._sOldValue=this.getValue();this._iOldCursorPos=q(this.getFocusDomRef()).cursorPos();};e.prototype._showWrongValueVisualEffect=function(){var o=this.getValueState();if(o===sap.ui.core.ValueState.Error){return;}if(this.isPickerDialog()){this.getPickerTextField().setValueState(sap.ui.core.ValueState.Error);q.sap.delayedCall(1000,this.getPickerTextField(),"setValueState",[o]);}else{this.setValueState(sap.ui.core.ValueState.Error);q.sap.delayedCall(1000,this,"setValueState",[o]);}};e.prototype.createPicker=function(p){var o=this.getAggregation("picker");if(o){return o;}o=this["create"+p]();this.setAggregation("picker",o,true);var r=this.getRenderer(),f=r.CSS_CLASS_MULTICOMBOBOX;o.setHorizontalScrolling(false).addStyleClass(r.CSS_CLASS_COMBOBOXBASE+"Picker").addStyleClass(f+"Picker").addStyleClass(f+"Picker-CTX").attachBeforeOpen(this.onBeforeOpen,this).attachAfterOpen(this.onAfterOpen,this).attachBeforeClose(this.onBeforeClose,this).attachAfterClose(this.onAfterClose,this).addEventDelegate({onBeforeRendering:this.onBeforeRenderingPicker,onAfterRendering:this.onAfterRenderingPicker},this).addContent(this.getList());return o;};e.prototype.createPickerTextField=function(){return new b();};e.prototype.onBeforeRendering=function(){a.prototype.onBeforeRendering.apply(this,arguments);var i=this.getItems();var o=this.getList();if(o){this._synchronizeSelectedItemAndKey(i);o.destroyItems();this._clearTokenizer();this._fillList(i);if(o.getItemNavigation()){this._iFocusedIndex=o.getItemNavigation().getFocusedIndex();}this.setEditable(this.getEditable());}};e.prototype.onBeforeRenderingPicker=function(){var o=this["_onBeforeRendering"+this.getPickerType()];if(o){o.call(this);}};e.prototype.onAfterRenderingPicker=function(){var o=this["_onAfterRendering"+this.getPickerType()];if(o){o.call(this);}};e.prototype.onBeforeOpen=function(){var p=this["_onBeforeOpen"+this.getPickerType()];this.addStyleClass(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"Pressed");this._resetCurrentItem();this.addContent();this._aInitiallySelectedItems=this.getSelectedItems();if(p){p.call(this);}};e.prototype.onAfterOpen=function(){this.closeValueStateMessage();};e.prototype.onBeforeClose=function(){a.prototype.onBeforeClose.apply(this,arguments);};e.prototype.onAfterClose=function(){this.removeStyleClass(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"Pressed");this.clearFilter();!this._bPreventValueRemove&&this.setValue("");this._sOldValue="";if(this.isPickerDialog()){this.getPickerTextField().setValue("");this._getFilterSelectedButton().setPressed(false);}this.fireSelectionFinish({selectedItems:this.getSelectedItems()});};e.prototype._onBeforeOpenDialog=function(){};e.prototype._onBeforeOpenPopover=function(){var p=this.getPicker(),o=this.getDomRef(),w;if(o&&p){w=(o.offsetWidth/parseFloat(sap.m.BaseFontSize))+"rem";p.setContentMinWidth(w);}};e.prototype._decoratePopover=function(p){var t=this;p.open=function(){return this.openBy(t);};};e.prototype.createPopover=function(){var p=new P({showArrow:false,showHeader:false,placement:sap.m.PlacementType.Vertical,offsetX:0,offsetY:0,initialFocus:this,bounce:false});this._decoratePopover(p);return p;};e.prototype.createDialog=function(){var o=a.prototype.createDialog.apply(this,arguments),s=this._createFilterSelectedButton();o.getSubHeader().addContent(s);return o;};e.prototype._createFilterSelectedButton=function(){var i=d.getIconURI("multiselect-all"),r=this.getRenderer(),t=this;return new T({icon:i,press:t._filterSelectedItems.bind(this)}).addStyleClass(r.CSS_CLASS_MULTICOMBOBOX+"ToggleButton");};e.prototype._getFilterSelectedButton=function(){return this.getPicker().getSubHeader().getContent()[1];};e.prototype._filterSelectedItems=function(o){var f=o.oSource,g,m,v=this.getPickerTextField().getValue(),p=f.getPressed(),V=this.getVisibleItems(),i=this.getItems(),s=this.getSelectedItems();if(p){V.forEach(function(h){m=s.indexOf(h)>-1?true:false;g=this.getListItem(h);if(g){g.setVisible(m);}},this);}else{this.filterItems(i,v);}};e.prototype.revertSelection=function(){this.setSelectedItems(this._aInitiallySelectedItems);};e.prototype.createList=function(){var r=this.getRenderer();this._oList=new L({width:"100%",mode:sap.m.ListMode.MultiSelect,includeItemInSelection:true,rememberSelections:false}).addStyleClass(r.CSS_CLASS_COMBOBOXBASE+"List").addStyleClass(r.CSS_CLASS_MULTICOMBOBOX+"List").attachBrowserEvent("tap",this._handleItemTap,this).attachSelectionChange(this._handleSelectionLiveChange,this).attachItemPress(this._handleItemPress,this);this._oList.addEventDelegate({onAfterRendering:this.onAfterRenderingList},this);};e.prototype.setSelection=function(o){if(o.item&&this.isItemSelected(o.item)){return;}if(!o.item){return;}this.addAssociation("selectedItems",o.item,o.suppressInvalidate);var s=this.getKeys(this.getSelectedItems());this.setProperty("selectedKeys",s,o.suppressInvalidate);if(!o.listItemUpdated&&this.getListItem(o.item)){this.getList().setSelectedItem(this.getListItem(o.item),true);}var t=new sap.m.Token({key:o.key});t.setText(o.item.getText());t.setTooltip(o.item.getText());o.item.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"Token",t);this._oTokenizer.addToken(t);this.$().toggleClass("sapMMultiComboBoxHasToken",this._hasTokens());this.setValue('');if(o.fireChangeEvent){this.fireSelectionChange({changedItem:o.item,selected:true});}if(o.fireFinishEvent){if(!this.isOpen()){this.fireSelectionFinish({selectedItems:this.getSelectedItems()});}}};e.prototype.removeSelection=function(o){if(o.item&&!this.isItemSelected(o.item)){return;}if(!o.item){return;}this.removeAssociation("selectedItems",o.item,o.suppressInvalidate);var s=this.getKeys(this.getSelectedItems());this.setProperty("selectedKeys",s,o.suppressInvalidate);if(!o.listItemUpdated&&this.getListItem(o.item)){this.getList().setSelectedItem(this.getListItem(o.item),false);}if(!o.tokenUpdated){var t=this._getTokenByItem(o.item);o.item.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"Token",null);this._oTokenizer.removeToken(t);}this.$().toggleClass("sapMMultiComboBoxHasToken",this._hasTokens());if(o.fireChangeEvent){this.fireSelectionChange({changedItem:o.item,selected:false});}if(o.fireFinishEvent){if(!this.isOpen()){this.fireSelectionFinish({selectedItems:this.getSelectedItems()});}}};e.prototype._synchronizeSelectedItemAndKey=function(f){if(!f.length){q.sap.log.info("Info: _synchronizeSelectedItemAndKey() the MultiComboBox control does not contain any item on ",this);return;}var s=this.getSelectedKeys()||this._aCustomerKeys;var k=this.getKeys(this.getSelectedItems());if(s.length){for(var i=0,K=null,o=null,g=null,h=s.length;i<h;i++){K=s[i];if(k.indexOf(K)>-1){if(this._aCustomerKeys.length&&(g=this._aCustomerKeys.indexOf(K))>-1){this._aCustomerKeys.splice(g,1);}continue;}o=this.getItemByKey(""+K);if(o){if(this._aCustomerKeys.length&&(g=this._aCustomerKeys.indexOf(K))>-1){this._aCustomerKeys.splice(g,1);}this.setSelection({item:o,id:o.getId(),key:o.getKey(),fireChangeEvent:false,suppressInvalidate:true,listItemUpdated:false});}}return;}};e.prototype._getTokenByItem=function(i){return i?i.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"Token"):null;};e.prototype.updateItems=function(r){var k,i,K=this.getSelectedKeys();var u=a.prototype.updateItems.apply(this,arguments);i=this.getSelectedItems();k=(i.length===K.length)&&i.every(function(o){return o&&o.getKey&&K.indexOf(o.getKey())>-1;});if(!k){i=K.map(this.getItemByKey,this);this.setSelectedItems(i);}return u;};e.prototype._getSelectedItemsOf=function(f){for(var i=0,g=f.length,s=[];i<g;i++){if(this.getListItem(f[i]).isSelected()){s.push(f[i]);}}return s;};e.prototype._getLastSelectedItem=function(){var t=this._oTokenizer.getTokens();var o=t.length?t[t.length-1]:null;if(!o){return null;}return this._getItemByToken(o);};e.prototype._getOrderedSelectedItems=function(){var f=[];for(var i=0,t=this._oTokenizer.getTokens(),g=t.length;i<g;i++){f[i]=this._getItemByToken(t[i]);}return f;};e.prototype._getFocusedListItem=function(){if(!document.activeElement){return null;}var f=sap.ui.getCore().byId(document.activeElement.id);if(this.getList()&&q.sap.containsOrEquals(this.getList().getFocusDomRef(),f.getFocusDomRef())){return f;}return null;};e.prototype._getFocusedItem=function(){var o=this._getFocusedListItem();return this._getItemByListItem(o);};e.prototype._isRangeSelectionSet=function(o){var $=o.getDomRef();return $.indexOf(this.getRenderer().CSS_CLASS_MULTICOMBOBOX+"ItemRangeSelection")>-1?true:false;};e.prototype._hasTokens=function(){return this._oTokenizer.getTokens().length>0;};e.prototype._getCurrentItem=function(){if(!this._oCurrentItem){return this._getFocusedItem();}return this._oCurrentItem;};e.prototype._setCurrentItem=function(i){this._oCurrentItem=i;};e.prototype._resetCurrentItem=function(){this._oCurrentItem=null;};e.prototype._decorateListItem=function(o){o.addDelegate({onkeyup:function(f){var i=null;if(f.which==q.sap.KeyCodes.SPACE&&this.isOpen()&&this._isListInSuggestMode()){this.open();i=this._getLastSelectedItem();if(i){this.getListItem(i).focus();}return;}},onkeydown:function(f){var i=null,g=null;if(f.shiftKey&&f.which==q.sap.KeyCodes.ARROW_DOWN){g=this._getCurrentItem();i=this._getNextVisibleItemOf(g);}if(f.shiftKey&&f.which==q.sap.KeyCodes.ARROW_UP){g=this._getCurrentItem();i=this._getPreviousVisibleItemOf(g);}if(f.shiftKey&&f.which===q.sap.KeyCodes.SPACE){g=this._getCurrentItem();this._selectPreviousItemsOf(g);}if(i&&i!==g){if(this.getListItem(g).isSelected()){this.setSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:true,suppressInvalidate:true});this._setCurrentItem(i);}else{this.removeSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:true,suppressInvalidate:true});this._setCurrentItem(i);}return;}this._resetCurrentItem();if((f.ctrlKey||f.metaKey)&&f.which==q.sap.KeyCodes.A){f.setMarked();f.preventDefault();var v=this.getSelectableItems();var s=this._getSelectedItemsOf(v);if(s.length!==v.length){v.forEach(function(i){this.setSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:true,suppressInvalidate:true,listItemUpdated:false});},this);}else{v.forEach(function(i){this.removeSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:true,suppressInvalidate:true,listItemUpdated:false});},this);}}}},true,this);o.addEventDelegate({onsapbackspace:function(f){f.preventDefault();},onsapshow:function(f){f.setMarked();if(f.keyCode===q.sap.KeyCodes.F4){f.preventDefault();}if(this.isOpen()){this.close();return;}if(this.hasContent()){this.open();}},onsaphide:function(f){this.onsapshow(f);},onsapenter:function(f){f.setMarked();this.close();},onsaphome:function(f){f.setMarked();f.preventDefault();var v=this.getSelectableItems();var i=v[0];this.getListItem(i).focus();},onsapend:function(f){f.setMarked();f.preventDefault();var v=this.getSelectableItems();var i=v[v.length-1];this.getListItem(i).focus();},onsapup:function(f){f.setMarked();f.preventDefault();var v=this.getSelectableItems();var i=v[0];var g=q(document.activeElement).control()[0];if(g===this.getListItem(i)){this.focus();f.stopPropagation(true);}},onfocusin:function(f){this.addStyleClass(this.getRenderer().CSS_CLASS_MULTICOMBOBOX+"Focused");},onfocusout:function(f){this.removeStyleClass(this.getRenderer().CSS_CLASS_MULTICOMBOBOX+"Focused");},onsapfocusleave:function(f){var p=this.getAggregation("picker");var g=sap.ui.getCore().byId(f.relatedControlId);if(p&&g&&q.sap.equal(p.getFocusDomRef(),g.getFocusDomRef())){if(f.srcControl){f.srcControl.focus();}}}},this);if(sap.ui.Device.support.touch){o.addEventDelegate({ontouchstart:function(f){f.setMark("cancelAutoClose");}});}};e.prototype._createTokenizer=function(){var t=new sap.m.Tokenizer({tokens:[]}).attachTokenChange(this._handleTokenChange,this);t.setParent(this);t.addEventDelegate({onAfterRendering:this._onAfterRenderingTokenizer},this);return t;};e.prototype._handleTokenChange=function(o){var t=o.getParameter("type");var f=o.getParameter("token");var i=null;if(t!==sap.m.Tokenizer.TokenChangeType.Removed&&t!==sap.m.Tokenizer.TokenChangeType.Added){return;}if(t===sap.m.Tokenizer.TokenChangeType.Removed){i=(f&&this._getItemByToken(f));if(i&&this.isItemSelected(i)){this.removeSelection({item:i,id:i.getId(),key:i.getKey(),tokenUpdated:true,fireChangeEvent:true,fireFinishEvent:true,suppressInvalidate:true});!this.isPickerDialog()&&this.focus();this.fireChangeEvent("");}}};e.prototype.onAfterRenderingList=function(){var o=this.getList();if(this._iFocusedIndex!=null&&o.getItems().length>this._iFocusedIndex){o.getItems()[this._iFocusedIndex].focus();this._iFocusedIndex=null;}};e.prototype.onAfterRendering=function(){a.prototype.onAfterRendering.apply(this,arguments);var p=this.getPicker();var o=q(this.getDomRef());var f=o.find(this.getRenderer().DOT_CSS_CLASS_MULTICOMBOBOX+"Border");p._oOpenBy=f[0];};e.prototype.onfocusout=function(o){this.removeStyleClass("sapMMultiComboBoxFocus");a.prototype.onfocusout.apply(this,arguments);};e.prototype.onpaste=function(o){var O;if(window.clipboardData){O=window.clipboardData.getData("Text");}else{O=o.originalEvent.clipboardData.getData('text/plain');}var s=this._oTokenizer._parseString(O);if(s&&s.length>0){this.getSelectableItems().forEach(function(i){if(q.inArray(i.getText(),s)>-1){this.setSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:true,fireFinishEvent:true,suppressInvalidate:true,listItemUpdated:false});}},this);}};e.prototype.onsapbackspace=function(o){if(!this.getEnabled()||!this.getEditable()){o.preventDefault();return;}if(this.getCursorPosition()>0||this.getValue().length>0){return;}sap.m.Tokenizer.prototype.onsapbackspace.apply(this._oTokenizer,arguments);o.preventDefault();};e.prototype.onsapdelete=function(o){if(!this.getEnabled()||!this.getEditable()){return;}if(this.getValue()&&!this._isCompleteTextSelected()){return;}sap.m.Tokenizer.prototype.onsapdelete.apply(this._oTokenizer,arguments);};e.prototype.onsapnext=function(o){if(o.isMarked()){return;}var f=q(document.activeElement).control()[0];if(!f){return;}if(f===this._oTokenizer||this._oTokenizer.$().find(f.$()).length>0&&this.getEditable()){this.focus();}};e.prototype.onsapprevious=function(o){if(this.getCursorPosition()===0&&!this._isCompleteTextSelected()){if(o.srcControl===this){sap.m.Tokenizer.prototype.onsapprevious.apply(this._oTokenizer,arguments);}}};e.prototype.getOpenArea=function(){if(this.isPickerDialog()){return this.getDomRef();}else{return a.prototype.getOpenArea.apply(this,arguments);}};e.prototype._getItemsStartingText=function(t,i){var f=[],s=i?this.getEnabledItems():this.getSelectableItems();s.forEach(function(o){if(q.sap.startsWithIgnoreCase(o.getText(),t)){f.push(o);}},this);return f;};e.prototype._getUnselectedItemsStartingText=function(t){var i=[];this._getUnselectedItems().forEach(function(o){if(q.sap.startsWithIgnoreCase(o.getText(),t)){i.push(o);}},this);return i;};e.prototype.getCursorPosition=function(){return this._$input.cursorPos();};e.prototype._isCompleteTextSelected=function(){if(!this.getValue().length){return false;}var i=this._$input[0];if(i.selectionStart!==0||i.selectionEnd!==this.getValue().length){return false;}return true;};e.prototype._selectPreviousItemsOf=function(i){var f;do{f=true;var p=this._getPreviousVisibleItemOf(i);if(p){var o=this.getListItem(p);if(o){f=this.getListItem(p).getSelected();}}this.setSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:true,suppressInvalidate:true});i=p;}while(!f);};e.prototype._getNextVisibleItemOf=function(i){var f=this.getSelectableItems();var g=f.indexOf(i)+1;if(g<=0||g>f.length-1){return null;}return f[g];};e.prototype._getPreviousVisibleItemOf=function(i){var f=this.getSelectableItems();var g=f.indexOf(i)-1;if(g<0){return null;}return f[g];};e.prototype._getNextUnselectedItemOf=function(i){var f=this._getUnselectedItems();var g=f.indexOf(i)+1;if(g<=0||g>f.length-1){return null;}return f[g];};e.prototype._getPreviousUnselectedItemOf=function(i){var f=this._getUnselectedItems();var g=f.indexOf(i)-1;if(g<0){return null;}return f[g];};e.prototype._getNextTraversalItem=function(){var i=this._getItemsStartingText(this.getValue());var s=this._getUnselectedItems();if(i.indexOf(this._oTraversalItem)>-1&&this._oTraversalItem.getText()===this.getValue()){return this._getNextUnselectedItemOf(this._oTraversalItem);}if(i.length&&i[0].getText()===this.getValue()){return this._getNextUnselectedItemOf(i[0]);}return i.length?i[0]:s[0];};e.prototype._getPreviousTraversalItem=function(){var i=this._getItemsStartingText(this.getValue());if(i.indexOf(this._oTraversalItem)>-1&&this._oTraversalItem.getText()===this.getValue()){return this._getPreviousUnselectedItemOf(this._oTraversalItem);}if(i.length&&i[i.length-1].getText()===this.getValue()){return this._getPreviousUnselectedItemOf(i[i.length-1]);}if(i.length){return i[i.length-1];}else{var s=this._getUnselectedItems();if(s.length>0){return s[s.length-1];}else{return null;}}};e.prototype.findFirstEnabledItem=function(f){f=f||this.getItems();for(var i=0;i<f.length;i++){if(f[i].getEnabled()){return f[i];}}return null;};e.prototype.getVisibleItems=function(){for(var i=0,o,f=this.getItems(),v=[];i<f.length;i++){o=this.getListItem(f[i]);if(o&&o.getVisible()){v.push(f[i]);}}return v;};e.prototype.findLastEnabledItem=function(i){i=i||this.getItems();return this.findFirstEnabledItem(i.reverse());};e.prototype.setSelectedItems=function(i){this.removeAllSelectedItems();if(!i||!i.length){return this;}if(!q.isArray(i)){q.sap.log.warning("Warning: setSelectedItems() has to be an array of sap.ui.core.Item instances or of valid sap.ui.core.Item IDs",this);return this;}i.forEach(function(o){if(!(o instanceof sap.ui.core.Item)&&(typeof o!=="string")){q.sap.log.warning("Warning: setSelectedItems() has to be an array of sap.ui.core.Item instances or of valid sap.ui.core.Item IDs",this);return;}if(typeof o==="string"){o=sap.ui.getCore().byId(o);}this.setSelection({item:o?o:null,id:o?o.getId():"",key:o?o.getKey():"",suppressInvalidate:true});},this);return this;};e.prototype.addSelectedItem=function(i){if(!i){return this;}if(typeof i==="string"){i=sap.ui.getCore().byId(i);}this.setSelection({item:i?i:null,id:i?i.getId():"",key:i?i.getKey():"",fireChangeEvent:false,suppressInvalidate:true});return this;};e.prototype.removeSelectedItem=function(i){if(!i){return null;}if(typeof i==="string"){i=sap.ui.getCore().byId(i);}if(!this.isItemSelected(i)){return null;}this.removeSelection({item:i,id:i.getId(),key:i.getKey(),fireChangeEvent:false,suppressInvalidate:true});return i;};e.prototype.removeAllSelectedItems=function(){var i=[];var f=this.getAssociation("selectedItems",[]);f.forEach(function(o){var g=this.removeSelectedItem(o);if(g){i.push(g.getId());}},this);return i;};e.prototype.removeSelectedKeys=function(k){var i=[],f;if(!k||!k.length||!q.isArray(k)){return i;}var o;k.forEach(function(K){o=this.getItemByKey(K);if(o){this.removeSelection({item:o?o:null,id:o?o.getId():"",key:o?o.getKey():"",fireChangeEvent:false,suppressInvalidate:true});i.push(o);}if(this._aCustomerKeys.length&&(f=this._aCustomerKeys.indexOf(K))>-1){this._aCustomerKeys.splice(f,1);}},this);return i;};e.prototype.setSelectedKeys=function(k){this.removeAllSelectedItems();this._aCustomerKeys=[];this.addSelectedKeys(k);return this;};e.prototype.addSelectedKeys=function(k){k=this.validateProperty("selectedKeys",k);k.forEach(function(K){var i=this.getItemByKey(K);if(i){this.addSelectedItem(i);}else if(K!=null){this._aCustomerKeys.push(K);}},this);return this;};e.prototype.getSelectedKeys=function(){var i=this.getSelectedItems()||[],k=[];i.forEach(function(o){k.push(o.getKey());},this);if(this._aCustomerKeys.length){k=k.concat(this._aCustomerKeys);}return k;};e.prototype._getUnselectedItems=function(){return q(this.getSelectableItems()).not(this.getSelectedItems()).get();};e.prototype.getSelectedItems=function(){var i=[],f=this.getAssociation("selectedItems")||[];f.forEach(function(s){var o=sap.ui.getCore().byId(s);if(o){i.push(o);}},this);return i;};e.prototype.getSelectableItems=function(){return this.getEnabledItems(this.getVisibleItems());};e.prototype.getWidth=function(){return this.getProperty("width")||"100%";};e.prototype.setEditable=function(f){a.prototype.setEditable.apply(this,arguments);this._oTokenizer.setEditable(f);return this;};e.prototype.clearFilter=function(){this.getItems().forEach(function(i){this.getListItem(i).setVisible(i.getEnabled()&&this.getSelectable(i));},this);};e.prototype._isListInSuggestMode=function(){return this.getList().getItems().some(function(o){return!o.getVisible()&&this._getItemByListItem(o).getEnabled();},this);};e.prototype._mapItemToListItem=function(i){if(!i){return null;}var s=this.getRenderer().CSS_CLASS_MULTICOMBOBOX+"Item";var f=(this.isItemSelected(i))?s+"Selected":"";var o=new sap.m.StandardListItem({type:sap.m.ListType.Active,visible:i.getEnabled()}).addStyleClass(s+" "+f);o.setTooltip(i.getTooltip());i.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"ListItem",o);o.setTitle(i.getText());if(f){var t=new sap.m.Token({key:i.getKey()});t.setText(i.getText());t.setTooltip(i.getText());i.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"Token",t);this._oTokenizer.addToken(t);}this.setSelectable(i,i.getEnabled());this._decorateListItem(o);return o;};e.prototype._findMappedItem=function(o,f){for(var i=0,f=f||this.getItems(),g=f.length;i<g;i++){if(this.getListItem(f[i])===o){return f[i];}}return null;};e.prototype.setSelectable=function(i,s){if(this.indexOfItem(i)<0){return;}i._bSelectable=s;var o=this.getListItem(i);if(o){o.setVisible(s);}var t=this._getTokenByItem(i);if(t){t.setVisible(s);}};e.prototype.getSelectable=function(i){return i._bSelectable;};e.prototype._fillList=function(f){if(!f){return null;}if(!this._oListItemEnterEventDelegate){this._oListItemEnterEventDelegate={onsapenter:function(h){if(h.srcControl.isSelected()){h.setMarked();}}};}for(var i=0,o,g=f.length;i<g;i++){o=this._mapItemToListItem(f[i]);o.removeEventDelegate(this._oListItemEnterEventDelegate);o.addDelegate(this._oListItemEnterEventDelegate,true,this,true);this.getList().addAggregation("items",o,true);if(this.isItemSelected(f[i])){this.getList().setSelectedItem(o,true);}}};e.prototype.init=function(){C.prototype.init.apply(this,arguments);this.createList();this.bItemsUpdated=false;this._bCheckBoxClicked=true;this._bPreventValueRemove=false;this.setPickerType(sap.ui.Device.system.phone?"Dialog":"Popover");this._oTokenizer=this._createTokenizer();this._aCustomerKeys=[];this._aInitiallySelectedItems=[];};e.prototype.clearSelection=function(){this.removeAllSelectedItems();};e.prototype.addItem=function(i){this.addAggregation("items",i);if(i){i.attachEvent("_change",this.onItemChange,this);}if(this.getList()){this.getList().addItem(this._mapItemToListItem(i));}return this;};e.prototype.insertItem=function(i,f){this.insertAggregation("items",i,f,true);if(i){i.attachEvent("_change",this.onItemChange,this);}if(this.getList()){this.getList().insertItem(this._mapItemToListItem(i),f);}return this;};e.prototype.getEnabledItems=function(i){i=i||this.getItems();return i.filter(function(o){return o.getEnabled();});};e.prototype.getItemByKey=function(k){return this.findItem("key",k);};e.prototype.removeItem=function(i){i=this.removeAggregation("items",i);if(this.getList()){this.getList().removeItem(i&&this.getListItem(i));}this.removeSelection({item:i,id:i?i.getId():"",key:i?i.getKey():"",fireChangeEvent:false,suppressInvalidate:true,listItemUpdated:true});return i;};e.prototype.isItemSelected=function(i){return this.getSelectedItems().indexOf(i)>-1;};e.prototype.findItem=function(p,v){var m="get"+p.charAt(0).toUpperCase()+p.slice(1);for(var i=0,f=this.getItems();i<f.length;i++){if(f[i][m]()===v){return f[i];}}return null;};e.prototype._clearTokenizer=function(){this._oTokenizer.destroyAggregation("tokens",true);};e.prototype.getList=function(){return this._oList;};e.prototype.exit=function(){a.prototype.exit.apply(this,arguments);if(this.getList()){this.getList().destroy();this._oList=null;}if(this._oTokenizer){this._oTokenizer.destroy();this._oTokenizer=null;}};e.prototype.destroyItems=function(){this.destroyAggregation("items");if(this.getList()){this.getList().destroyItems();}this._oTokenizer.destroyTokens();return this;};e.prototype.removeAllItems=function(){var i=this.removeAllAggregation("items");this.removeAllSelectedItems();if(this.getList()){this.getList().removeAllItems();}return i;};e.prototype._getItemByListItem=function(o){return this._getItemBy(o,"ListItem");};e.prototype._getItemByToken=function(t){return this._getItemBy(t,"Token");};e.prototype._getItemBy=function(o,s){s=this.getRenderer().CSS_CLASS_COMBOBOXBASE+s;for(var i=0,f=this.getItems(),g=f.length;i<g;i++){if(f[i].data(s)===o){return f[i];}}return null;};e.prototype.getListItem=function(i){return i?i.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"ListItem"):null;};e.prototype.getAccessibilityInfo=function(){var t=this.getSelectedItems().map(function(o){return o.getText();}).join(" ");var i=a.prototype.getAccessibilityInfo.apply(this,arguments);i.type=sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_MULTICOMBO");i.description=((i.description||"")+" "+t).trim();return i;};return e;},true);
