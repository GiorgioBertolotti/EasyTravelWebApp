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
        },
        onBtnRegister: function(oEvent){
            var app = sap.ui.getCore().byId("EasyTravel");
            app.to("registerPage","flip");
        },
        onBtnIP: function (oEvent) {
            var dialog = new sap.m.Dialog({
                title: "Imposta IP Server",
                content: new sap.m.Input({
                    id: "txtIP",
                    placeholder: "Server IP",
                    type: "Text"
                }),
                beginButton: new sap.m.Button({
                    text: "OK",
                    type: "Accept",
                    press: function (oEvent) {
                        var ip = $("#txtIP-inner").val();
                        var input_data = { "ip": ip };
                        var oModel = new sap.ui.model.json.JSONModel();
                        sap.ui.getCore().setModel(oModel, "ip");
                        oModel.attachRequestSent(function () {
                            sap.ui.core.BusyIndicator.show();
                        });
                        oModel.loadData("api/Login/setIP", input_data);
                        oModel.attachRequestCompleted(function () {
                            sap.ui.controller("sap.ui.easytravel.login.Login").onSetIPComplete;
                        });
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Annulla",
                    type: "Reject",
                    press: function (oEvent) {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });
            dialog.addStyleClass("myDialog");
            dialog.open();
        },
        onSetIPComplete: function () {
            sap.ui.core.BusyIndicator.hide();
        }
    });
});