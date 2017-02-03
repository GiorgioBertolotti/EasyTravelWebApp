sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView;
    return Controller.extend("sap.ui.easytravel.register.Register", {
        onInit: function () {
        },
        onBtnBack: function (oEvent) {
            var app = sap.ui.getCore().byId("EasyTravel");
            app.to("loginPage", "flip");
        }
    });
});