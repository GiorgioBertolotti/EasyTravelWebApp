sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView;
    return Controller.extend("sap.ui.easytravel.login.Login", {
        onInit: function () {
            oView = this.getView();
            oView.byId("imglogo").addStyleClass("myLogo");
        }
    });
});