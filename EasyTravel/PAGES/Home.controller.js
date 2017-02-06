sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView;
    return Controller.extend("sap.ui.easytravel.home.Home", {
        onInit: function () {
            oView = this.getView();
            this.model.setData(this.data);
            oView.setModel(this.model);
            this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
        },
        onItemSelect: function (oEvent) {
            var key = oEvent.getParameter('item').getKey();
            switch (key) {
                case "logout": {
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    oModel.attachRequestSent(function () {
                        sap.ui.core.BusyIndicator.show();
                    });
                    var input_data = { "mobile": mobile };
                    oModel.loadData("api/Home/logoutUser", input_data);
                    oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onLogoutComplete);
                    break;
                }
            }
        },
        onToggleMenu: function () {
            var viewId = this.getView().getId();
            var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
            var sideExpanded = toolPage.getSideExpanded();

            this._setToggleButtonTooltip(sideExpanded);

            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },
        _setToggleButtonTooltip: function (bLarge) {
            var toggleButton = this.getView().byId('sideNavigationToggleButton');
            if (bLarge) {
                toggleButton.setTooltip('Large Size Navigation');
            } else {
                toggleButton.setTooltip('Small Size Navigation');
            }
        },
        onLogoutComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("user");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                var app = sap.ui.getCore().byId("EasyTravel");
                app.to("loginPage");
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onLogoutComplete);
        },
        model: new sap.ui.model.json.JSONModel(),
        data: {
            navigation: [{
                title: 'Home',
                icon: 'sap-icon://home',
                key: 'home'
            }, {
                title: 'Chiedi passaggio',
                icon: 'sap-icon://thumb-up',
                key: 'autostoppista'
            }, {
                title: 'Offri pasaggio',
                icon: 'sap-icon://car-rental',
                key: 'autista'
            }, {
                title: 'Mappa',
                icon: 'sap-icon://map-2',
                key: 'map'
            }, {
                title: 'Logout',
                icon: 'sap-icon://visits',
                key: 'logout'
            }]
        }
    });
});