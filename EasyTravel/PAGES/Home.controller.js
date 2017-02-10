sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView, isMenuOpened;
    return Controller.extend("sap.ui.easytravel.home.Home", {
        onInit: function () {
            oView = this.getView();
            sap.ui.controller("sap.ui.easytravel.home.Home").initializeItems();
        },
        initializeItems: function () {
            this.model.setData(this.data);
            oView.setModel(this.model);
            sap.ui.controller("sap.ui.easytravel.home.Home")._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
            var oModel = sap.ui.getCore().getModel("user");
            if (oModel.getData().isImg) {
                var profileimg = oView.byId("imgProfile");
                profileimg.setSrc("../Images/profileimage.jpg?" + new Date().getTime());
            }
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
        onBtnProfileImg: function (oEvent) {
            var oButton = oEvent.getSource();
            if (isMenuOpened) {
                if (!this._menu) {
                    this._menu = sap.ui.xmlfragment(
                        "sap.ui.easytravel.home.MenuItemEventing",
                        this
                    );
                    this.getView().addDependent(this._menu);
                }
                var eDock = sap.ui.core.Popup.Dock;
                this._menu.close();
                isMenuOpened = false;
            } else {
                if (!this._menu) {
                    this._menu = sap.ui.xmlfragment(
                        "sap.ui.easytravel.home.MenuItemEventing",
                        this
                    );
                    this.getView().addDependent(this._menu);
                }
                var eDock = sap.ui.core.Popup.Dock;
                this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
                isMenuOpened = true;
            }
        },
        handleMenuItemPress: function (oEvent) {
            switch (oEvent.getParameter("item").getText()) {
                case "Visualizza profilo": {
                    isMenuOpened = false;
                    break;
                }
                case "Impostazioni": {
                    isMenuOpened = false;
                    break;
                }
                case "Logout": {
                    isMenuOpened = false; 
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
            var toggleButton = oView.byId('sideNavigationToggleButton');
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
                sap.ui.controller("sap.ui.easytravel.login.Login").eraseCookie("authenticationToken");
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