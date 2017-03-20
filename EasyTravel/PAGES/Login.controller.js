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
            var token = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('authenticationToken');
            if (token) {
                var oModel = new sap.ui.model.json.JSONModel();
                sap.ui.getCore().setModel(oModel, "user");
                oModel.attachRequestSent(function () {
                    sap.ui.core.BusyIndicator.show();
                });
                var input_data = { "token": token };
                oModel.loadData("api/Login/loginWithToken", input_data);
                oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onLoginTokenComplete);
            }
        },
        onBtnLogin: function (oEvent) {
            var mobile = oView.byId("txtMobile").getValue();
            var password = oView.byId("txtPassword").getValue();
            var md5 = CryptoJS.MD5(password).toString();
            var oModel = new sap.ui.model.json.JSONModel();
            sap.ui.getCore().setModel(oModel, "user");
            oModel.attachRequestSent(function () {
                sap.ui.core.BusyIndicator.show();
            });
            var input_data = { "mobile": mobile, "pass": md5 };
            oModel.loadData("api/Login/loginUser", input_data);
            oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onLoginComplete);
        },
        onBtnRegister: function(oEvent){
            var app = sap.ui.getCore().byId("EasyTravel");
            app.to("registerPage","flip");
        },
        onBtnIP: function (oEvent) {
            var oModel = new sap.ui.model.json.JSONModel();
            sap.ui.getCore().setModel(oModel, "ip");
            oModel.attachRequestSent(function () {
                sap.ui.core.BusyIndicator.show();
            });
            oModel.loadData("api/Login/getIP", {});
            oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onGetIPComplete);
        },
        onGetIPComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("ip");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            var ip = oModel.getData().IP;
            var dialog = new sap.m.Dialog({
                title: "Imposta IP Server",
                content: new sap.m.Input({
                    id: "txtIP",
                    value: ip,
                    type: "Text"
                }),
                beginButton: new sap.m.Button({
                    text: "OK",
                    type: "Accept",
                    press: function (oEvent) {
                        var ip = $("#txtIP-inner").val();
                        var input_data = { "ip": ip };
                        oModel.attachRequestSent(function () {
                            sap.ui.core.BusyIndicator.show();
                        });
                        oModel.loadData("api/Login/setIP", input_data);
                        oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onSetIPComplete);
                        dialog.close();
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
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onGetIPComplete);
        },
        onSetIPComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("ip");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                sap.m.MessageToast.show("L'IP è stato impostato correttamente");
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onSetIPComplete);
        },
        onLoginComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("user");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                if (!data.Token) {
                    sap.m.MessageToast.show("Token non generato");
                } else {
                    sap.ui.controller("sap.ui.easytravel.login.Login").createCookie('authenticationToken', data.Token, 30);
                }
                var app = sap.ui.getCore().byId("EasyTravel");
                app.to("homePage");
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onLoginComplete);
        },
        onLoginTokenComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("user");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                var app = sap.ui.getCore().byId("EasyTravel");
                app.to("homePage");
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.login.Login").onLoginTokenComplete);
        },
        createCookie: function (name,value,days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        },
        readCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },
        eraseCookie: function (name) {
            sap.ui.controller("sap.ui.easytravel.login.Login").createCookie(name, "", -1);
        }
    });
});