sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
	function (jQuery, UIComponent) {
	    "use strict";

	    return UIComponent.extend("sap.ui.easytravel.login.Component", {
	        metadata: {
	            name: "Login",
	            version: "1.0",
	            includes: [],
	            dependencies: {
	                libs: ["sap.m", "sap.ui.layout"],
	                components: []
	            },
	            rootView: "sap.ui.easytravel.login.Login",
	            config: {
	                resourceName: "sap.ui.easytravel.login"
	            }
	        }
	    });
	});

sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
	function (jQuery, UIComponent) {
	    "use strict";

	    return UIComponent.extend("sap.ui.easytravel.register.Component", {
	        metadata: {
	            name: "Register",
	            version: "1.0",
	            includes: [],
	            dependencies: {
	                libs: ["sap.m", "sap.ui.layout"],
	                components: []
	            },
	            rootView: "sap.ui.easytravel.register.Register",
	            config: {
	                resourceName: "sap.ui.easytravel.register"
	            }
	            //config: {
	            //    resourceName: "i18n",
	            //    resourceBundle: "XXXX",
	            //    serviceConfig: {
	            //        name: "main",
	            //        serviceUrl: "XXXXX",
	            //    }
	            //}
	        }
	    });
	});