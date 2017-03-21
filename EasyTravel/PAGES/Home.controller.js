sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView;
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
                var profileimg = oView.byId("imgProfileMini");
                profileimg.setSrc("../Images/profileimagemini.jpg?" + new Date().getTime());
            }
            var viewId = oView.getId();
            var ppc = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie("ProfilePicChanged");
            if (ppc) {
                var oModel = sap.ui.getCore().getModel("user");
                oView.byId("lblNome").setText(oModel.getData().Name);
                oView.byId("lblCognome").setText(oModel.getData().Surname);
                oView.byId("lblMobile").setText(oModel.getData().Mobile);
                sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--detailProfile");
                if (oModel.getData().isImg) {
                    var profileimg = oView.byId("imgProfile");
                    profileimg.setSrc("../Images/profileimage.jpg?" + new Date().getTime());
                }
                var ppc = sap.ui.controller("sap.ui.easytravel.login.Login").eraseCookie("ProfilePicChanged");
            }
            else
                sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--detailMain");
            oView.byId("toolPage").setSideExpanded(false);
        },
        onEditImage: function () {
            var viewId = oView.getId();
            var imgpicker = document.getElementById(viewId + "--imagePicker");
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    //RIDUCO LE DIMENSIONI DELL'IMMAGINE E LA QUALITA'
                    var perferedWidth = 300;
                    var ratio = perferedWidth / img.width;
                    var canvas = $("<canvas>")[0];
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    var oModel = sap.ui.getCore().getModel("user");
                    //PASSO IL BASE64 DELL'IMMAGINE IN jpeg
                    var input_data = {
                        "Mobile": oModel.getData().Mobile,
                        "Image": canvas.toDataURL("image/jpeg")
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/editImage',
                        data: input_data,
                        success: function (response) {
                            sap.ui.controller("sap.ui.easytravel.login.Login").createCookie('ProfilePicChanged', true, 1);
                            location.reload();
                        },
                        error: function (response) {
                            console.log('Error: ', error);
                        }
                    });
                };
                img.src = e.target.result;
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
            reader.readAsDataURL(imgpicker.files[0]);
        },
        onItemSelect: function (oEvent) {
            var key = oEvent.getParameter('item').getKey();
            switch (key) {
                case "home": {
                    var item = oEvent.getParameter('item');
                    var viewId = this.getView().getId();
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--detailMain");
                    break;
                }
                case "logout": {
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    oModel.attachRequestSent(function () {
                        sap.ui.core.BusyIndicator.show();
                    });
                    var input_data = {
                        "mobile": mobile,
                        "token": sap.ui.controller("sap.ui.easytravel.login.Login").readCookie("authenticationToken")
                    };
                    oModel.loadData("api/Home/logoutUser", input_data);
                    oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onLogoutComplete);
                    break;
                }
            }
        },
        onBtnProfileImg: function (oEvent) {
            var oButton = oEvent.getSource();
            if (!this._menu) {
                this._menu = sap.ui.xmlfragment(
                    "sap.ui.easytravel.home.MenuItemEventing",
                    this
                );
                this.getView().addDependent(this._menu);
            }
            var eDock = sap.ui.core.Popup.Dock;
            this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
        },
        handleMenuItemPress: function (oEvent) {
            switch (oEvent.getParameter("item").getText()) {
                case "Visualizza profilo": {
                    var oModel = sap.ui.getCore().getModel("user");
                    oView.byId("lblNome").setText(oModel.getData().Name);
                    oView.byId("lblCognome").setText(oModel.getData().Surname);
                    oView.byId("lblMobile").setText(oModel.getData().Mobile);
                    var viewId = this.getView().getId();
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--detailProfile");
                    if (oModel.getData().isImg) {
                        var profileimg = oView.byId("imgProfile");
                        profileimg.setSrc("../Images/profileimage.jpg?" + new Date().getTime());
                    }
                    break;
                }
                case "Impostazioni": {
                    var oModel = sap.ui.getCore().getModel("user");
                    var viewId = this.getView().getId();
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--detailSettings");
                    break;
                }
                case "Logout": {
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    oModel.attachRequestSent(function () {
                        sap.ui.core.BusyIndicator.show();
                    });
                    var input_data = {
                        "mobile": mobile,
                        "token": sap.ui.controller("sap.ui.easytravel.login.Login").readCookie("authenticationToken")
                    };
                    oModel.loadData("api/Home/logoutUser", input_data);
                    oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onLogoutComplete);
                    break;
                }
            }
        },
        onTilePress: function (oEvent) {
            var id = oEvent.getParameter("id");
            var name = "Zoom";
            var src = "";
            if (id.includes("tile1")) {
                name = "Home";
                src = "../Images/slide1.jpg";
            }
            if (id.includes("tile2")){
                name = "Destinazione";
                src = "../Images/slide2.jpg";
            }
            if (id.includes("tile3")){
                name = "Passaggio";
                src = "../Images/slide3.jpg";
            }
            if (id.includes("tile4")){
                name = "Mappa";
                src = "../Images/slide4.jpg";
            }
            var dialog = new sap.m.Dialog({
                title: name,
                content: new sap.m.Image({
                    src: src,
                    id: "myimagedialog"
                }),
                beginButton: new sap.m.Button({
                    text: 'OK',
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });
            dialog.addStyleClass("myDialog");
            dialog.open();
            document.getElementById("myimagedialog").className += " myImageDialog";
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