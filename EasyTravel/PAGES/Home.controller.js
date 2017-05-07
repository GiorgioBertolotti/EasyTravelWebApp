sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    var oView, stato, isFirstMapLoad, map, markerpos, markerdest, geocoder, LatLngDest, targetAutostoppista, directionsDisplay, bounds;
    var markers = [];
    return Controller.extend("sap.ui.easytravel.home.Home", {
        onInit: function () {
            isFirstMapLoad = true;
            oView = this.getView();
            sap.ui.controller("sap.ui.easytravel.home.Home").initializeItems();
        },
        //
        // IMPOSTAZIONI
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
            oModel.loadData("/api/Home/editRange", input_data);
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
        // PROFILO
        //
        onFABClick: function () {
            var viewId = oView.getId();
            var imgpicker = document.getElementById(viewId + "--imagePicker");
            imgpicker.click();
        },
        onEditImage: function () {
            var viewId = oView.getId();
            var imgpicker = document.getElementById(viewId + "--imagePicker");
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    //RIDUCO LE DIMENSIONI DELL'IMMAGINE E LA QUALITA'
                    var canvas = $("<canvas>")[0];
                    canvas.width = 200;
                    canvas.height = 200;
                    var ctx = canvas.getContext("2d");
                    //CREO RIDIMENSIONAMENTO E BIANCO LATERALE
                    ctx.beginPath();
                    ctx.rect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                    if (img.width == img.height) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    } else if (img.width > img.height) {
                        var h = (img.height * 200) / img.width;
                        ctx.drawImage(img, 0, (200-h)/2, 200, h);
                    } else if (img.height > img.width) {
                        var w = (img.width * 200) / img.height;
                        ctx.drawImage(img, (200 - w)/2, 0, w, 200);
                    }
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
        onBtnBackToList: function () {
            sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(40);
        },
        //
        // MAPPA
        //
        InitMap: function () {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            if (markerpos)
                markerpos.setMap(null);
            if (markerdest)
                markerdest.setMap(null);
            if (directionsDisplay)
                directionsDisplay.setMap(null);
            if (map)
                google.maps.event.clearListeners(map, 'click');
            var position = { lat: 0, lng: 0 };
            geocoder = new google.maps.Geocoder;
            var options = {
                enableHighAccuracy: true,
                timeout: 5000
            };
            function success(pos) {
                if (stato == 41)
                    position = { lat: parseFloat(targetAutostoppista.Latitude), lng: parseFloat(targetAutostoppista.Longitude) };
                else
                    position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                var viewId = oView.getId();
                if (isFirstMapLoad) {
                    map = new google.maps.Map(document.getElementById(viewId + '--map'), {
                        zoom: 12,
                        center: position,
                        fullscreenControl: false
                    });
                    var input = document.getElementById(viewId + '--mapSearchBox-inner');
                    var searchBox = new google.maps.places.SearchBox(input);
                    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                    input.style.width = "60%";
                    input.style.marginTop = "5px";
                    map.addListener('bounds_changed', function() {
                        searchBox.setBounds(map.getBounds());
                    });
                    searchBox.addListener('places_changed', function() {
                        var places = searchBox.getPlaces();
                        if (places.length == 0) {
                            return;
                        }
                        var bounds = new google.maps.LatLngBounds();
                        places.forEach(function (place) {
                            if (stato == 30) {
                                if (markerdest)
                                    markerdest.setMap(null);
                                geocoder.geocode({ 'location': place.geometry.location }, function (results, status) {
                                    if (status === 'OK') {
                                        if (results[0]) {
                                            dest = results[0].formatted_address;
                                            sap.m.MessageToast.show(results[0].formatted_address);
                                        } else if (results[1]) {
                                            dest = results[1].formatted_address;
                                            sap.m.MessageToast.show(results[1].formatted_address);
                                        }
                                    }
                                });
                                var markernew = new google.maps.Marker({
                                    position: place.geometry.location,
                                    map: map,
                                    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                });
                                markernew.addListener('click', function () {
                                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(31);
                                    LatLngDest = this.position;
                                    oView.byId("lblLatDest").setText(LatLngDest.lat());
                                    oView.byId("lblLngDest").setText(LatLngDest.lng());
                                    oView.byId("lblGeoDest").setText("(" + dest + ")");
                                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                                    var oModel = sap.ui.getCore().getModel("user");
                                    var mobile = oModel.getData().Mobile;
                                    var input_data = {
                                        "ip": ip,
                                        "Mobile": mobile,
                                        "Type": "Autostoppista"
                                    };
                                    $.ajax({
                                        type: 'POST',
                                        url: '/api/Home/setUserType',
                                        data: input_data,
                                        success: function (response) {
                                            var json = JSON.parse(response);
                                            if (json.isError) {
                                                sap.m.MessageToast.show(json.errorMessage);
                                            }
                                        },
                                        error: function (response) {
                                            console.log('Error: ', error);
                                        }
                                    });
                                    input_data = {
                                        "ip": ip,
                                        "Mobile": mobile,
                                        "Latitude": LatLngDest.lat(),
                                        "Longitude": LatLngDest.lng()
                                    };
                                    $.ajax({
                                        type: 'POST',
                                        url: '/api/Home/setUserDestination',
                                        data: input_data,
                                        success: function (response) {
                                            var json = JSON.parse(response);
                                            if (json.isError) {
                                                sap.m.MessageToast.show(json.errorMessage);
                                            }
                                        },
                                        error: function (response) {
                                            console.log('Error: ', error);
                                        }
                                    });
                                });
                                markerdest = markernew;
                            }
                            if (place.geometry.viewport) {
                                // Only geocodes have viewport.
                                bounds.union(place.geometry.viewport);
                            } else {
                                bounds.extend(place.geometry.location);
                            }
                        });
                        map.fitBounds(bounds);
                        setTimeout(function () { map.setZoom(12); }, 250);
                    });
                    sap.ui.controller("sap.ui.easytravel.home.Home").setUserPosition(position);
                    setInterval(sap.ui.controller("sap.ui.easytravel.home.Home").updateUserPosition, 60000);
                    isFirstMapLoad = false;
                } else {
                    map.setCenter(position);
                }
                switch (stato) {
                    case 30: {
                        markerpos = new google.maps.Marker({
                            position: position,
                            map: map,
                            icon: 'http://maps.google.com/mapfiles/ms/micons/blue-pushpin.png'
                        });
                        geocoder.geocode({ 'location': position }, function (results, status) {
                            var contentString;
                            if (status === 'OK') {
                                if (results[0]) {
                                    contentString = '<div id="content">' +
                                        '<h1 id="firstHeading" class="firstHeading">La tua posizione.</h1>' +
                                        '<p>'+results[0].formatted_address+'</p>' +
                                        '</div>';
                                } else if (results[1]) {
                                    contentString = '<div id="content">' +
                                        '<h1 id="firstHeading" class="firstHeading">La tua posizione.</h1>' +
                                        '<p>' + results[1].formatted_address + '</p>' +
                                        '</div>';
                                } else
                                    contentString = "Impossibile identificare la posizione.";
                            } else {
                                contentString = "Impossibile identificare la posizione.";
                            }
                            var infowindow = new google.maps.InfoWindow({
                                content: contentString
                            });
                            markerpos.addListener('click', function () {
                                infowindow.open(map, markerpos);
                            });
                        });
                        var dest = "";
                        google.maps.event.addListener(map, "click", function (event) {
                            var latlng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
                            geocoder.geocode({ 'location': latlng }, function (results, status) {
                                if (status === 'OK') {
                                    if (results[0]) {
                                        dest = results[0].formatted_address;
                                        sap.m.MessageToast.show(results[0].formatted_address);
                                    } else if (results[1]) {
                                        dest = results[1].formatted_address;
                                        sap.m.MessageToast.show(results[1].formatted_address);
                                    }
                                }
                            });
                            if (markerdest)
                                markerdest.setMap(null);
                            var markernew = new google.maps.Marker({
                                position: latlng,
                                map: map,
                                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                            });
                            markernew.addListener('click', function () {
                                sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(31);
                                LatLngDest = this.position;
                                oView.byId("lblLatDest").setText(LatLngDest.lat());
                                oView.byId("lblLngDest").setText(LatLngDest.lng());
                                oView.byId("lblGeoDest").setText("(" + dest + ")");
                                var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                                var oModel = sap.ui.getCore().getModel("user");
                                var mobile = oModel.getData().Mobile;
                                var input_data = {
                                    "ip": ip,
                                    "Mobile": mobile,
                                    "Type": "Autostoppista"
                                };
                                $.ajax({
                                    type: 'POST',
                                    url: '/api/Home/setUserType',
                                    data: input_data,
                                    success: function (response) {
                                        var json = JSON.parse(response);
                                        if (json.isError) {
                                            sap.m.MessageToast.show(json.errorMessage);
                                        }
                                    },
                                    error: function (response) {
                                        console.log('Error: ', error);
                                    }
                                });
                                input_data = {
                                    "ip": ip,
                                    "Mobile": mobile,
                                    "Latitude": LatLngDest.lat(),
                                    "Longitude": LatLngDest.lng()
                                };
                                $.ajax({
                                    type: 'POST',
                                    url: '/api/Home/setUserDestination',
                                    data: input_data,
                                    success: function (response) {
                                        var json = JSON.parse(response);
                                        if (json.isError) {
                                            sap.m.MessageToast.show(json.errorMessage);
                                        }
                                    },
                                    error: function (response) {
                                        console.log('Error: ', error);
                                    }
                                });
                            });
                            markerdest = markernew;
                        });
                        break;
                    }
                    case 41: {
                        map.setZoom(12);
                        directionsDisplay = new google.maps.DirectionsRenderer();
                        directionsDisplay.setMap(null);
                        var start = new google.maps.LatLng(targetAutostoppista.Latitude, targetAutostoppista.Longitude);
                        var end = new google.maps.LatLng(targetAutostoppista.Destlat, targetAutostoppista.Destlon);
                        var request = {
                            origin: start,
                            destination: end,
                            travelMode: google.maps.TravelMode.DRIVING
                        };
                        var directionsService = new google.maps.DirectionsService();
                        map.setZoom(12);
                        directionsService.route(request, function (response, status) {
                            if (status == google.maps.DirectionsStatus.OK) {
                                directionsDisplay.setDirections(response);
                                directionsDisplay.setMap(map);
                                setTimeout(function () { map.setZoom(12); }, 250);
                            } else {
                                alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                            }
                        });
                        break;
                    }
                    case 50: {
                        var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                        $.ajax({
                            type: 'GET',
                            url: '/api/Home/getActiveUsers',
                            data: { "ip": ip },
                            success: function (response) {
                                var oModel = new sap.ui.model.json.JSONModel();
                                sap.ui.getCore().setModel(oModel, "attivi");
                                var data = JSON.parse(response);
                                oModel.setData(data);
                                if (data.isError) {
                                    sap.m.MessageToast.show(data.errorMessage);
                                } else {
                                    for (var a in data) {
                                        if (data[a].Type == 2) {
                                            var newmarker = new google.maps.Marker({
                                                position: { lat: parseFloat(data[a].Latitude), lng: parseFloat(data[a].Longitude) },
                                                map: map,
                                                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                                customInfo: data[a]
                                            });
                                        } else {
                                            var newmarker = new google.maps.Marker({
                                                position: { lat: parseFloat(data[a].Latitude), lng: parseFloat(data[a].Longitude) },
                                                map: map,
                                                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                                customInfo: data[a]
                                            });
                                        }
                                        var boxText = document.createElement("div");
                                        boxText.id = a;
                                        boxText.innerHTML = '<table><tr><td rowspan="2"><img height="30px" width="30px" src="' + data[a].Base64 + '"></td><th>' + data[a].Name + ' ' + data[a].Surname + '</th></tr><tr><td>E-mail: ' + data[a].Mail + '<br>Tel: ' + data[a].Mobile + '</td></tr></table>';
                                        //var contentString = '<div id="content" ><table><tr><td rowspan="2"><img height="30px" width="30px" src="' + data[a].Base64 + '"></td><th><a href="javascript:targetAutostoppista;" onclick="sap.ui.controller(\'sap.ui.easytravel.home.Home\').onShowUserProfile()">' + data[a].Name + ' ' + data[a].Surname + '</a></th></tr><tr><td>E-mail: ' + data[a].Mail + '<br>Tel: ' + data[a].Mobile + '</td></tr></table></div>';
                                        var infowindow = new google.maps.InfoWindow();
                                        google.maps.event.addListener(newmarker, 'click', (function (newmarker, boxText, infowindow) {
                                            google.maps.event.addDomListener(boxText, 'click', (function (marker) {
                                                return function () {
                                                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(51);
                                                    oView.byId("lblNome").setText(marker.customInfo.Name);
                                                    oView.byId("lblCognome").setText(marker.customInfo.Surname);
                                                    oView.byId("lblMobile").setText(marker.customInfo.Mobile);
                                                    oView.byId("lblMail").setText(marker.customInfo.Mail);
                                                    var profileimg = oView.byId("imgProfile");
                                                    profileimg.setSrc(marker.customInfo.Base64);
                                                    var viewId = oView.getId();
                                                    setTimeout(function () {
                                                        document.getElementById(viewId + '--btnBackToMap2').style.display = 'inline';
                                                        document.getElementById(viewId + '--btnBackToList').style.display = 'none';
                                                    }, 250);
                                                    document.getElementById(viewId + '--imageEditFAB').style.visibility = 'hidden';
                                                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                                                    var input_data = {
                                                        "ip": ip,
                                                        "Mobile": marker.customInfo.Mobile
                                                    };
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '/api/Home/countRides',
                                                        data: input_data,
                                                        success: function (response) {
                                                            var json = JSON.parse(response);
                                                            if (json.isError) {
                                                                sap.m.MessageToast.show(json.errorMessage);
                                                            } else {
                                                                oView.byId("lblCountRides").setText(json.errorMessage);
                                                            }
                                                        },
                                                        error: function (response) {
                                                            console.log('Error: ', response);
                                                        }
                                                    });
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '/api/Home/countContacts',
                                                        data: input_data,
                                                        success: function (response) {
                                                            var json = JSON.parse(response);
                                                            if (json.isError) {
                                                                sap.m.MessageToast.show(json.errorMessage);
                                                            } else {
                                                                oView.byId("lblCountContacts").setText(json.errorMessage);
                                                            }
                                                        },
                                                        error: function (response) {
                                                            console.log('Error: ', response);
                                                        }
                                                    });
                                                }
                                            })(newmarker));
                                            return function () {
                                                infowindow.setContent(boxText);
                                                infowindow.open(map, newmarker);
                                            };
                                        })(newmarker, boxText, infowindow));
                                        markers.push(newmarker);
                                    }
                                }
                            },
                            error: function (response) {
                                console.log('Error: ', error);
                            }
                        });
                        break;
                    }
                }
            };
            function error(err) {
                sap.m.MessageToast.show(err.message);
                var viewId = oView.getId();
                map = new google.maps.Map(document.getElementById(viewId + '--map'), {
                    zoom: 12,
                    center: position,
                    fullscreenControl: false
                });
            };
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error, options);
            } else {
                sap.m.MessageToast.show("Geolocation is not supported by this browser");
            }
        },
        onBtnBackToMap2: function () {
            sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(50);
        },
        setUserPosition: function (position) {
            var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
            var oModel = sap.ui.getCore().getModel("user");
            var mobile = oModel.getData().Mobile;
            input_data = { ip: ip, mobile: mobile, Latitude: position.lat, Longitude: position.lng };
            $.ajax({
                type: 'POST',
                url: '/api/Home/updateUserPosition',
                data: input_data,
                success: function (response) {
                    console.log('User position updated: { ip: ' + input_data.ip + ', mobile: ' + input_data.mobile + ', Latitude: ' + input_data.Latitude + ', Longitude: ' + input_data.Longitude + '}');
                },
                error: function (response) {
                    console.log('Error: ', error);
                }
            });
        },
        updateUserPosition: function () {
            var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
            var oModel = sap.ui.getCore().getModel("user");
            var mobile = oModel.getData().Mobile;
            geocoder = new google.maps.Geocoder;
            var options = {
                enableHighAccuracy: true,
                timeout: 10000
            };
            function success(pos) {
                input_data = { ip:ip, mobile: mobile, Latitude: pos.coords.latitude, Longitude: pos.coords.longitude };
                $.ajax({
                    type: 'POST',
                    url: '/api/Home/updateUserPosition',
                    data: input_data,
                    success: function (response) {
                        console.log('User position updated: { ip: ' + input_data.ip + ', mobile: ' + input_data.mobile + ', Latitude: ' + input_data.Latitude + ', Longitude: ' + input_data.Longitude + '}');
                    },
                    error: function (response) {
                        console.log('Error: ', error);
                    }
                });
                if (stato == 30) {
                    if (markerpos)
                        markerpos.setMap(null);
                    markerpos = new google.maps.Marker({
                        position: {lat:input_data.Latitude,lng:input_data.Longitude},
                        map: map,
                        icon: 'http://maps.google.com/mapfiles/ms/micons/blue-pushpin.png'
                    });
                }
            };
            function error(err) {
                input_data = { ip: ip, mobile: mobile, Latitude: 0, Longitude: 0 };
                $.ajax({
                    type: 'POST',
                    url: '/api/Home/updateUserPosition',
                    data: input_data,
                    success: function (response) {
                        console.log('User position updated: { ip: ' + input_data.ip + ', mobile: ' + input_data.mobile + ', Latitude: ' + input_data.Latitude + ', Longitude: ' + input_data.Longitude + '}');
                    },
                    error: function (response) {
                        console.log('Error: ', error);
                    }
                });
            };
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error, options);
            } else {
                error("");
            }
        },
        //
        // AUTOSTOPPISTA
        //
        onBackToAutostoppisti: function (oEvent) {
            stato = 30;
            sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(stato);
        },
        onPressAutostoppista: function (oEvent) {
            var autostoppista = this.getModel().getProperty(this.getBindingContext().getPath());
            var dialog = new sap.m.Dialog({
                title: autostoppista.Name + " " + autostoppista.Surname,
                content: [new sap.m.Button({
                    text: 'Visualizza su mappa',
                    press: function () {
                        dialog.close();
                        targetAutostoppista = autostoppista;
                        sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(41);
                    },
                    width: "100%"
                }), new sap.m.Button({
                    text: 'Visualizza profilo',
                    press: function () {
                        dialog.close();
                        sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(42);
                        oView.byId("lblNome").setText(autostoppista.Name);
                        oView.byId("lblCognome").setText(autostoppista.Surname);
                        oView.byId("lblMobile").setText(autostoppista.Mobile);
                        oView.byId("lblMail").setText(autostoppista.Mail);
                        var profileimg = oView.byId("imgProfile");
                        profileimg.setSrc(autostoppista.Base64);
                        var viewId = oView.getId();
                        setTimeout(function () {
                            document.getElementById(viewId + '--btnBackToMap2').style.display = 'none';
                            document.getElementById(viewId + '--btnBackToList').style.display = 'inline';
                        }, 250);
                        document.getElementById(viewId + '--imageEditFAB').style.visibility = 'hidden';
                        var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                        var input_data = {
                            "ip": ip,
                            "Mobile": autostoppista.Mobile
                        };
                        $.ajax({
                            type: 'POST',
                            url: '/api/Home/countRides',
                            data: input_data,
                            success: function (response) {
                                var json = JSON.parse(response);
                                if (json.isError) {
                                    sap.m.MessageToast.show(json.errorMessage);
                                } else {
                                    oView.byId("lblCountRides").setText(json.errorMessage);
                                }
                            },
                            error: function (response) {
                                console.log('Error: ', response);
                            }
                        });
                        $.ajax({
                            type: 'POST',
                            url: '/api/Home/countContacts',
                            data: input_data,
                            success: function (response) {
                                var json = JSON.parse(response);
                                if (json.isError) {
                                    sap.m.MessageToast.show(json.errorMessage);
                                } else {
                                    oView.byId("lblCountContacts").setText(json.errorMessage);
                                }
                            },
                            error: function (response) {
                                console.log('Error: ', response);
                            }
                        });
                    },
                    width: "100%"
                }), new sap.m.FlexBox({
                    items: [
                        new sap.m.Button({
                            text: autostoppista.Mobile,
                            type: "Emphasized",
                            icon: "sap-icon://call",
                            press: function () {
                                var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                                var oModel = sap.ui.getCore().getModel("user");
                                var mobile = oModel.getData().Mobile;
                                var input_data = {
                                    "ip": ip,
                                    "caller":mobile,
                                    "receiver":autostoppista.Mobile,
                                    "type":"Mobile"
                                };
                                $.ajax({
                                    type: 'POST',
                                    url: '/api/Home/addContact',
                                    data: input_data,
                                    success: function (response) {
                                        var json = JSON.parse(response);
                                        if (json.isError) {
                                            sap.m.MessageToast.show(json.errorMessage);
                                        }
                                    },
                                    error: function (response) {
                                        console.log('Error: ', response);
                                    }
                                });
                                sap.m.URLHelper.triggerTel(autostoppista.Mobile);
                            },
                            width: "150px"
                        }), new sap.m.Button({
                            text: autostoppista.Mail,
                            type: "Emphasized",
                            icon: "sap-icon://email",
                            press: function () {
                                var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                                var oModel = sap.ui.getCore().getModel("user");
                                var mobile = oModel.getData().Mobile;
                                var input_data = {
                                    "ip": ip,
                                    "caller": mobile,
                                    "receiver": autostoppista.Mobile,
                                    "type": "Mail"
                                };
                                $.ajax({
                                    type: 'POST',
                                    url: '/api/Home/addContact',
                                    data: input_data,
                                    success: function (response) {
                                        var json = JSON.parse(response);
                                        if (json.isError) {
                                            sap.m.MessageToast.show(json.errorMessage);
                                        }
                                    },
                                    error: function (response) {
                                        console.log('Error: ', response);
                                    }
                                });
                                sap.m.URLHelper.triggerEmail(autostoppista.Mail);
                            },
                            width: "150px"
                        })],
                    alignItems:"Start",
					justifyContent:"SpaceBetween"
                })],
                beginButton: new sap.m.Button({
                    text: 'Close',
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
        },
        onBtnBackToMap: function (oEvent) {
            sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(30);
        },
        //
        // USER INTERFACE
        //
        updateUI: function (newstate) {
            if (oView.byId("toolPage").getSideExpanded())
                oView.byId("toolPage").toggleSideContentMode();
            var viewId = oView.getId();
            var detailPage = "detailMain";
            //RIMUOVERE TIPO UTENTE E DESTINAZIONE
            switch (stato) {
                case 31: {
                    if (newstate == 31)
                        break;
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    var input_data = {
                        "ip": ip,
                        "Mobile": mobile
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/unsetUserType',
                        data: input_data,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.isError) {
                                sap.m.MessageToast.show(json.errorMessage);
                            }
                        },
                        error: function (response) {
                            console.log('Error: ', error);
                        }
                    });
                    break;
                }
                case 40: case 41: case 42: {
                    if (newstate == 40 || newstate == 41 || newstate == 42)
                        break;
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    var input_data = {
                        "ip": ip,
                        "Mobile": mobile
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/unsetUserType',
                        data: input_data,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.isError) {
                                sap.m.MessageToast.show(json.errorMessage);
                            }
                        },
                        error: function (response) {
                            console.log('Error: ', error);
                        }
                    });
                    break;
                }
            }
            stato = newstate;
            //IMPOSTARE NUOVA INTERFACCIA UTENTE
            switch (stato) {
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
                    oModel.loadData("/api/Home/logoutUser", input_data);
                    oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onLogoutComplete);
                    break;
                }
                case 20: {
                    detailPage = "detailMain";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    oView.byId("lblPageTitle").setText("Home");
                    var oPage = oView.byId("detailMain");
                    oPage.scrollTo(0, 0);
                    break;
                }
                case 21: {
                    detailPage = "detailSettings";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    var oModel = sap.ui.getCore().getModel("user");
                    oView.byId("rangePicker").setValue(oModel.getData().Range);
                    oView.byId("lblPageTitle").setText("Impostazioni");
                    break;
                }
                case 22: case 42: case 51: {
                    detailPage = "detailProfile";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    oView.byId("lblPageTitle").setText("Profilo utente");
                    break;
                }
                case 30: {
                    detailPage = "detailMap";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    sap.ui.controller("sap.ui.easytravel.home.Home").InitMap();
                    oView.byId("lblPageTitle").setText("Scegli destinazione");
                    break;
                }
                case 31: {
                    detailPage = "detailWaiting";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    oView.byId("lblPageTitle").setText("Attesa");
                    break;
                }
                case 40: {
                    detailPage = "detailDrivers";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    oView.byId("lblPageTitle").setText("Scelta autostoppista");
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    var range = oModel.getData().Range;
                    var options = {
                        enableHighAccuracy: true,
                        timeout:5000
                    };
                    function success(pos) {
                        oModel = new sap.ui.model.json.JSONModel();
                        sap.ui.getCore().setModel(oModel, "autostoppisti");
                        oModel.attachRequestSent(function () {
                            sap.ui.core.BusyIndicator.show();
                        });
                        //var input_data = { "ip": ip, "mobile": mobile, "lat": pos.coords.latitude, "lon": pos.coords.longitude, "range": range };
                        var input_data = { "ip": ip, "mobile": mobile, "lat": "45.6424541", "lon": "9.586026", "range": range };
                        oModel.loadData("/api/Home/getAutostoppisti", input_data);
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
                        oModel.loadData("/api/Home/getAutostoppisti", input_data);
                        oModel.attachRequestCompleted(sap.ui.controller("sap.ui.easytravel.home.Home").onGetAutostoppistiComplete);
                    };
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(success, error, options);
                    } else {
                        sap.m.MessageToast.show("Geolocation is not supported by this browser");
                    }
                    break;
                }
                case 41: case 50: {
                    detailPage = "detailMap";
                    sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + detailPage);
                    sap.ui.controller("sap.ui.easytravel.home.Home").InitMap();
                    oView.byId("lblPageTitle").setText("Mappa");
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
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(22);
                    var oModel = sap.ui.getCore().getModel("user");
                    oView.byId("lblNome").setText(oModel.getData().Name);
                    oView.byId("lblCognome").setText(oModel.getData().Surname);
                    oView.byId("lblMobile").setText(oModel.getData().Mobile);
                    oView.byId("lblMail").setText(oModel.getData().Mail);
                    var profileimg = oView.byId("imgProfile");
                    profileimg.setSrc(oModel.getData().Base64);
                    var viewId = oView.getId();
                    document.getElementById(viewId + '--btnBackToList').style.display = 'none';
                    document.getElementById(viewId + '--btnBackToMap2').style.display = 'none';
                    document.getElementById(viewId + '--imageEditFAB').style.visibility = 'visible';
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var mobile = oModel.getData().Mobile;
                    var input_data = {
                        "ip": ip,
                        "Mobile": mobile
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/countRides',
                        data: input_data,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.isError) {
                                sap.m.MessageToast.show(json.errorMessage);
                            } else {
                                oView.byId("lblCountRides").setText(json.errorMessage);
                            }
                        },
                        error: function (response) {
                            console.log('Error: ', response);
                        }
                    });
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/countContacts',
                        data: input_data,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.isError) {
                                sap.m.MessageToast.show(json.errorMessage);
                            } else {
                                oView.byId("lblCountContacts").setText(json.errorMessage);
                            }
                        },
                        error: function (response) {
                            console.log('Error: ', response);
                        }
                    });
                    break;
                }
                case "Impostazioni": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(21);
                    break;
                }
                case "Logout": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(0);
                    break;
                }
            }
        },
        onItemSelect: function (oEvent) {
            var key = oEvent.getParameter('item').getKey();
            switch (key) {
                case "home": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(20);
                    break;
                }
                case "autostoppista": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(30);
                    break;
                }
                case "autista": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(40);
                    var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                    var oModel = sap.ui.getCore().getModel("user");
                    var mobile = oModel.getData().Mobile;
                    var input_data = {
                        "ip": ip,
                        "Mobile": mobile,
                        "Type": "Autista"
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/api/Home/setUserType',
                        data: input_data,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.isError) {
                                sap.m.MessageToast.show(json.errorMessage);
                            }
                        },
                        error: function (response) {
                            console.log('Error: ', response);
                        }
                    });
                    break;
                }
                case "map": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(50);
                    break;
                }
                case "logout": {
                    sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(0);
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
            var profileimg = oView.byId("imgProfileMini");
            profileimg.setSrc(oModel.getData().Base64);
            var ppc = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie("ProfilePicChanged");
            if (ppc) {
                sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(22);
                var oModel = sap.ui.getCore().getModel("user");
                oView.byId("lblNome").setText(oModel.getData().Name);
                oView.byId("lblCognome").setText(oModel.getData().Surname);
                oView.byId("lblMobile").setText(oModel.getData().Mobile);
                oView.byId("lblMail").setText(oModel.getData().Mail);
                var profileimg = oView.byId("imgProfile");
                profileimg.setSrc(oModel.getData().Base64);
                var ip = sap.ui.controller("sap.ui.easytravel.login.Login").readCookie('ip');
                var mobile = oModel.getData().Mobile;
                var input_data = {
                    "ip": ip,
                    "Mobile": mobile
                };
                $.ajax({
                    type: 'POST',
                    url: '/api/Home/countRides',
                    data: input_data,
                    success: function (response) {
                        var json = JSON.parse(response);
                        if (json.isError) {
                            sap.m.MessageToast.show(json.errorMessage);
                        } else {
                            oView.byId("lblCountRides").setText(json.errorMessage);
                        }
                    },
                    error: function (response) {
                        console.log('Error: ', response);
                    }
                });
                $.ajax({
                    type: 'POST',
                    url: '/api/Home/countContacts',
                    data: input_data,
                    success: function (response) {
                        var json = JSON.parse(response);
                        if (json.isError) {
                            sap.m.MessageToast.show(json.errorMessage);
                        } else {
                            oView.byId("lblCountContacts").setText(json.errorMessage);
                        }
                    },
                    error: function (response) {
                        console.log('Error: ', response);
                    }
                });
                var ppc = sap.ui.controller("sap.ui.easytravel.login.Login").eraseCookie("ProfilePicChanged");
                var viewId = oView.getId();
                setTimeout(function () {
                    document.getElementById(viewId + '--btnBackToList').style.display = 'none';
                    document.getElementById(viewId + '--btnBackToMap2').style.display = 'none';
                    document.getElementById(viewId + '--imageEditFAB').style.visibility = 'visible';
                }, 250);
            }
            else {
                sap.ui.controller("sap.ui.easytravel.home.Home").updateUI(20);
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
                oModel.refresh();
                list.bindItems("/", new sap.m.StandardListItem({
                    title: "{Name} {Surname}",
                    description: "{Destination}",
                    icon: "{Base64}",
                    type: "Active",
                    press: sap.ui.controller("sap.ui.easytravel.home.Home").onPressAutostoppista
                }));
                list.setModel(oModel);
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
                src = "/../Images/slide1.jpg";
            }
            if (id.includes("tile2")) {
                name = "Destinazione";
                src = "/../Images/slide2.jpg";
            }
            if (id.includes("tile3")) {
                name = "Passaggio";
                src = "/../Images/slide3.jpg";
            }
            if (id.includes("tile4")) {
                name = "Mappa";
                src = "/../Images/slide4.jpg";
            }
            var dialog = new sap.m.Dialog({
                title: name,
                content: new sap.m.Image({
                    src: src,
                    id: "myimagedialog"
                }),
                beginButton: new sap.m.Button({
                    text: 'Close',
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
