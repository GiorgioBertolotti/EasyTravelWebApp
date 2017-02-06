sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView;
    return Controller.extend("sap.ui.easytravel.register.Register", {
        onInit: function(){
            oView = this.getView();
        },
        onBtnBack: function (oEvent) {
            var app = sap.ui.getCore().byId("EasyTravel");
            app.to("loginPage", "flip");
        },
        onBtnRegister: function (oEvent) {
            var name = oView.byId("txtName").getValue();
            var surname = oView.byId("txtSurname").getValue();
            var email = oView.byId("txtEmail").getValue();
            var mobile = oView.byId("txtMobile").getValue();
            var password = oView.byId("txtPassword").getValue();
            var confirm = oView.byId("txtConfirm").getValue();
            if (!name || !surname || !email || !mobile || !password || !confirm) {
                sap.m.MessageToast.show("Compilare tutti i campi");
                return;
            }
            if (password != confirm) {
                sap.m.MessageToast.show("Password e Conferma non coincidono");
                return;
            }
            var md5 = CryptoJS.MD5(password).toString();
            var oModel = new sap.ui.model.json.JSONModel();
            sap.ui.getCore().setModel(oModel, "register");
            oModel.attachRequestSent(function () {
                sap.ui.core.BusyIndicator.show();
            });
            var input_data = { "nome": name, "cognome": surname, "mail": email, "mobile": mobile, "password": md5 };
            oModel.loadData("api/Login/registerUser", input_data);
            oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.register.Register").onRegisterComplete);
        },
        onRegisterComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("register");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                var app = sap.ui.getCore().byId("EasyTravel");
                app.to("loginPage");
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.register.Register").onRegisterComplete);
        }
    });
});