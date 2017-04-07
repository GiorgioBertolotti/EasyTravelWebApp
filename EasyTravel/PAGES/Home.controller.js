sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView, stato, isFirstMapLoad, marker, geocoder, LatLngDest;
    return Controller.extend("sap.ui.easytravel.home.Home", {
        onInit: function () {
            oView = this.getView();
            sap.ui.controller("sap.ui.easytravel.home.Home").initializeItems();
            isFirstMapLoad = true;
        },
        //
        // SETTINGS
        //
        onBtnSave: function () {
            var oModel = sap.ui.getCore().getModel("user");
            var mobile = oModel.getData().Mobile;
            var rangepicker = oView.byId("rangePicker").getValue();
            var oldpwd = oView.byId("txtOldPassword").getValue();
            var newpwd = oView.byId("txtNewPassword").getValue();
            var confirm = oView.byId("txtConfirmPassword").getValue();
            var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
            oModel = new sap.ui.model.json.JSONModel();
            sap.ui.getCore().setModel(oModel, "range");
            oModel.attachRequestSent(function () {
                sap.ui.core.BusyIndicator.show();
            });
            var input_data = { "ip":ip,"mobile": mobile, "range": rangepicker };
            oModel.loadData("api/Login/editRange", input_data);
            oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onEditRangeComplete);
            var errore = "";
            if (!oldpwd)
                return;
            if (newpwd) {
                if (newpwd == confirm) {
                    oldpwd = CryptoJS.MD5(oldpwd).toString();
                    newpwd = CryptoJS.MD5(newpwd).toString();
                    var input_data = {
                        "ip": ip,
                        "Mobile": mobile,
                        "OldPassword": oldpwd,
                        "NewPassword": newpwd
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/editPassword',
                        data: input_data,
                        success: function (response) {
                            var json = JSON.parse(response);
                            var stripType = "Success";
                            if (json.isError) {
                                stripType = "Error";
                            }
                            var strip = new sap.m.MessageStrip({
                                text: json.errorMessage,
                                type: stripType,
                                showIcon: true,
                                showCloseButton: true
                            });
                            var viewId = oView.getId();
                            strip.placeAt(viewId + "--stripcontainer");
                            setTimeout(function () {
                                strip.close();
                            }, 3000);
                        },
                        error: function (response) {
                            console.log('Error: ', error);
                        }
                    });
                    return;
                } else {
                    errore = "Password e conferma non coincidono";
                }
            } else {
                errore = "Inserire una nuova password";
            }
            var strip = new sap.m.MessageStrip({
                text: errore,
                type: "Error",
                showIcon: true,
                showCloseButton: true
            });
            var viewId = oView.getId();
            strip.placeAt(viewId + "--stripcontainer");
            setTimeout(function () {
                strip.close();
            }, 3000);
        },
        //
        // PROFILE
        //
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
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var oModel = sap.ui.getCore().getModel("user");
                    //PASSO IL BASE64 DELL'IMMAGINE IN jpeg
                    var input_data = {
                        "ip":ip,
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
        //
        // AUTOSTOPPISTA
        //
        InitMap: function () {
            var position = { lat: 0, lng: 0 };
            geocoder = new google.maps.Geocoder;
            var options = {
                enableHighAccuracy: true,
                timeout: 4000
            };
            function success(pos) {
                var crd = pos.coords;
                position.lat = crd.latitude;
                position.lng = crd.longitude;
                var viewId = oView.getId();
                var dest = "";
                var map = new google.maps.Map(document.getElementById(viewId + '--map'), {
                    zoom: 12,
                    center: position
                });
                marker = new google.maps.Marker({
                    position: position,
                    map: map
                });
                geocoder.geocode({ 'location': position }, function (results, status) {
                    if (status === 'OK') {
                        if (results[1]) {
                            dest = results[1].formatted_address;
                        }
                    }
                });
                marker.addListener('click', function () {
                    stato = 31;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    LatLngDest = this.position;
                    oView.byId("lblLatDest").setText(LatLngDest.lat());
                    oView.byId("lblLngDest").setText(LatLngDest.lng());
                    oView.byId("lblGeoDest").setText("(" + dest + ")");
                    oView.byId("imgLoading").setSrc("../Images/loadinganimation.gif");
                });
                google.maps.event.addListener(map, "click", function (event) {
                    var latlng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
                    geocoder.geocode({ 'location': latlng }, function (results, status) {
                        if (status === 'OK') {
                            if (results[1]) {
                                dest = results[1].formatted_address;
                                sap.m.MessageToast.show(results[1].formatted_address);
                            }
                        }
                    });
                    marker.setMap(null);
                    var markernew = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    markernew.addListener('click', function () {
                        stato = 31;
                        sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                        LatLngDest = this.position;
                        oView.byId("lblLatDest").setText(LatLngDest.lat());
                        oView.byId("lblLngDest").setText(LatLngDest.lng());
                        oView.byId("lblGeoDest").setText("(" + dest + ")");
                        oView.byId("imgLoading").setSrc("../Images/loadinganimation.gif");
                    });
                    marker = markernew;
                });
            };
            function error(err) {
                sap.m.MessageToast.show(err.message);
                var viewId = oView.getId();
                var map = new google.maps.Map(document.getElementById(viewId + '--map'), {
                    zoom: 4,
                    center: position
                });
                var marker = new google.maps.Marker({
                    position: position,
                    map: map
                });
            };
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error, options);
            } else {
                sap.m.MessageToast.show("Geolocation is not supported by this browser");
            }
        },
        onBtnBackToMap: function (oEvent) {
            stato = 30;
            sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
        },
        //
        // USER INTERFACE
        //
        updateUI: function (newstate) {
            if (oView.byId("toolPage").getSideExpanded())
                oView.byId("toolPage").toggleSideContentMode();
            var viewId = oView.getId();
            var detailPage = "detailMain";
            switch (newstate) {
                case 0: {
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    oModel.attachRequestSent(function () {
                        sap.ui.core.BusyIndicator.show();
                    });
                    var input_data = {
                        "ip": ip,
                        "mobile": mobile,
                        "token": sap.ui.controller("sap.ui.easytravel.login.Login").readCookie("authenticationToken")
                    };
                    oModel.loadData("api/Home/logoutUser", input_data);
                    oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onLogoutComplete);
                    break;
                }
                case 20: {
                    detailPage = "detailMain";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    break;
                }
                case 21: {
                    detailPage = "detailSettings";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    var oModel = sap.ui.getCore().getModel("user");
                    oView.byId("rangePicker").setValue(oModel.getData().Range);
                    break;
                }
                case 22: {
                    detailPage = "detailProfile";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    break;
                }
                case 30: {
                    detailPage = "detailAutostop";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    if (isFirstMapLoad) {
                        sap.ui.controller("sap.ui.easytravel.home.Home").InitMap();
                        isFirstMapLoad = false;
                    }
                    break;
                }
                case 31: {
                    detailPage = "detailWaiting";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    break;
                }
                case 40: {
                    detailPage = "detailDrivers";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    var range = oModel.getData().Range;
                    var options = {
                        enableHighAccuracy: true,
                        timeout: 4000
                    };
                    function success(pos) {
                        oModel = new sap.ui.model.json.JSONModel();
                        sap.ui.getCore().setModel(oModel, "autostoppisti");
                        oModel.attachRequestSent(function () {
                            sap.ui.core.BusyIndicator.show();
                        });
                        //var input_data = { "ip": ip, "mobile": mobile, "lat": pos.coords.latitude, "lon": pos.coords.longitude, "range": range };
                        var input_data = { "ip": ip, "mobile": mobile, "lat": "45.6424541", "lon": "9.586026", "range": range };
                        oModel.loadData("api/Home/getAutostoppisti", input_data);
                        oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onGetAutostoppistiComplete);
                    };
                    function error(err) {
                        sap.m.MessageToast.show(err.message);
                        oModel = new sap.ui.model.json.JSONModel();
                        sap.ui.getCore().setModel(oModel, "autostoppisti");
                        oModel.attachRequestSent(function () {
                            sap.ui.core.BusyIndicator.show();
                        });
                        var input_data = { "ip": ip, "mobile": mobile, "lat": 0, "lon": 0, "range": range };
                        oModel.loadData("api/Home/getAutostoppisti", input_data);
                        oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onGetAutostoppistiComplete);
                    };
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(success, error, options);
                    } else {
                        sap.m.MessageToast.show("Geolocation is not supported by this browser");
                    }
                    break;
                }
                case 50: {
                    detailPage = "detailMap";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    break;
                }
            }
        },
        //
        // MENU
        //
        handleMenuItemPress: function (oEvent) {
            switch (oEvent.getParameter("item").getText()) {
                case "Visualizza profilo": {
                    stato = 22;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    var oModel = sap.ui.getCore().getModel("user");
                    oView.byId("lblNome").setText(oModel.getData().Name);
                    oView.byId("lblCognome").setText(oModel.getData().Surname);
                    oView.byId("lblMobile").setText(oModel.getData().Mobile);
                    if (oModel.getData().isImg) {
                        var profileimg = oView.byId("imgProfile");
                        profileimg.setSrc(oModel.getData().Base64);
                    }
                    break;
                }
                case "Impostazioni": {
                    stato = 21;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    break;
                }
                case "Logout": {
                    stato = 0;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    break;
                }
            }
        },
        onItemSelect: function (oEvent) {
            var key = oEvent.getParameter('item').getKey();
            switch (key) {
                case "home": {
                    stato = 20;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    break;
                }
                case "autostoppista": {
                    stato = 30;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    break;
                }
                case "autista": {
                    stato = 40;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                    break;
                }
                case "logout": {
                    stato = 0;
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
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
        //
        // INIT
        //
        initializeItems: function () {
            this.model.setData(this.data);
            oView.setModel(this.model);
            sap.ui.controller("sap.ui.easytravel.home.Home")._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
            var oModel = sap.ui.getCore().getModel("user");
            if (oModel.getData().isImg) {
                var profileimg = oView.byId("imgProfileMini");
                profileimg.setSrc(oModel.getData().Base64);
            }
            var ppc = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie("ProfilePicChanged");
            if (ppc) {
                stato = 22;
                sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
                var oModel = sap.ui.getCore().getModel("user");
                oView.byId("lblNome").setText(oModel.getData().Name);
                oView.byId("lblCognome").setText(oModel.getData().Surname);
                oView.byId("lblMobile").setText(oModel.getData().Mobile);
                if (oModel.getData().isImg) {
                    var profileimg = oView.byId("imgProfile");
                    profileimg.setSrc(oModel.getData().Base64);
                }
                var ppc = sap.ui.controller("sap.ui.easytravel.login.Login").eraseCookie("ProfilePicChanged");
            }
            else {
                stato = 20;
                sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
            }
        },
        //
        // AJAX CALLS COMPLETE
        //
        onGetAutostoppistiComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("autostoppisti");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                var list = oView.byId("listAutostoppisti");
                list.removeAllItems();
                for (var a in data) {
                    var img = "../Images/ic_user.png";
                    if (data[a].isImg) {
                        img = data[a].Base64.toString();
                    }
                    list.addItem(new sap.m.StandardListItem({
                        title: data[a].Name + " " + data[a].Surname,
                        description: data[a].Destination,
                        icon: img,
                        type: "Active"
                    }));
                }
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onGetAutostoppistiComplete);
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
        onEditRangeComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("range");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                if (data.errorMessage == "Il range è uguale") {
                    var strip = new sap.m.MessageStrip({
                        text: data.errorMessage,
                        type: "Warning",
                        showIcon: true,
                        showCloseButton: true
                    });
                    var viewId = oView.getId();
                    strip.placeAt(viewId + "--stripcontainer");
                    setTimeout(function () {
                        strip.close();
                    }, 3000);
                }
                else
                    sap.m.MessageToast.show(data.errorMessage);
            } else {
                var strip = new sap.m.MessageStrip({
                    text: "Range modificato",
                    type: "Success",
                    showIcon: true,
                    showCloseButton: true
                });
                var viewId = oView.getId();
                strip.placeAt(viewId + "--stripcontainer");
                setTimeout(function () {
                    strip.close();
                }, 3000);
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onEditRangeComplete);
        },
        onEditPasswordComplete: function () {
            sap.ui.core.BusyIndicator.hide();
            var oModel = sap.ui.getCore().getModel("password");
            var data = JSON.parse(oModel.getData());
            oModel.setData(data);
            if (data.isError) {
                sap.m.MessageToast.show(data.errorMessage);
            } else {
                var strip = new sap.m.MessageStrip({
                    text: data.errorMessage,
                    type: "Success",
                    showIcon: true,
                    showCloseButton: true
                });
                var viewId = oView.getId();
                strip.placeAt(viewId + "--stripcontainer");
            }
            sap.ui.core.BusyIndicator.hide();
            oModel.detachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onEditPasswordComplete);
        },
        //
        // OTHER
        //
        onTilePress: function (oEvent) {
            var id = oEvent.getParameter("id");
            var name = "Zoom";
            var src = "";
            if (id.includes("tile1")) {
                name = "Home";
                src = "../Images/slide1.jpg";
            }
            if (id.includes("tile2")) {
                name = "Destinazione";
                src = "../Images/slide2.jpg";
            }
            if (id.includes("tile3")) {
                name = "Passaggio";
                src = "../Images/slide3.jpg";
            }
            if (id.includes("tile4")) {
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
