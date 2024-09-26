sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatterRFQ",
	'sap/ui/core/BusyIndicator',
	"sap/m/MessageBox"
], function (Controller, JSONModel,formatter, BusyIndicator, MessageBox) {
	"use strict";
	var oDataModel,oStorage;
	var data;
	var that;
	var xyz;
	var sLoginId, sLoginType,appModulePath;
	var arrr = [];
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.View1", {
		formatter: formatter,
		onInit: function () {
			that = this;
			BusyIndicator.show(0);
			oDataModel = this.getOwnerComponent().getModel("RFQCreation");
			//	this.onRead();
			var nav = sap.ui.core.UIComponent.getRouterFor(this);
			nav.getRoute("RFQCreation").attachPatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function () {
			that = this;
			this.getView().byId('table').removeSelections(true);
			jQuery.sap.require("jquery.sap.storage");
			oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

			if (oStorage.get("mySessionData")) {
				var oData = oStorage.get("mySessionData");
				sLoginId = oData.Collection[0].id;
				sLoginType = oData.Collection[0].type;
				that._user();
		        that.onRead();
			} else {
				//get user attributes
			    this._getLoginDetails();
			}

			//********************Omkar 06/01/2023**************************//
			com.ibs.ibsappivensaanalytical.ind2 = "X";
			that.getOwnerComponent().getService("ShellUIService").then(function (oShellService) {
				oShellService.setBackNavigation(function () {
					if (com.ibs.ibsappivensaanalytical.ind2 === "X") {
						var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
						var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: "",
								action: ""
							}
						})) || "";
						oCrossAppNavigator.toExternal({
							target: {
								shellHash: hash
							}
						});
					} else {
						window.history.go(-1);
					}
				});
			});
			//********************Omkar 06/01/2023**************************//
		},
		onRead: function () {
			that = this;
			oDataModel.read("/QuotationHeaderSet", {
				success: function (oData) {
					// debugger;
					var oModel2 = new JSONModel(oData);
					that.getView().setModel(oModel2, "itemlist3");
					xyz = that.getView().getModel("itemlist3").getData();
					that.getView().byId('table').removeSelections(true);
					BusyIndicator.hide();
				},
				error: function (error) {
					//debugger
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
				}
			});
			// this.getView().setModel(oDataModel);

		},

        _getLoginDetails: function () {
            // debugger;
            var that = this, url;
			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
			var appPath = appId.replaceAll(".", "/");
			appModulePath = jQuery.sap.getModulePath(appPath);
            url = appModulePath + "/user-api/attributes";

			// that.oPModel.setProperty("/AttachURL", appModulePath);  
			// sLoginId = '8500004';
            //         sLoginType = 'partner';
					// sLoginId = '8500004';
                    // sLoginType = 'partner';
                    // that._user();
		            // that.onRead();
			
			// return new Promise(function (resolve, reject) {
            $.ajax({      
                url: url,
                type: 'GET',
                contentType: 'application/json',
                success: function (data, response) {					
                    sLoginId = data.login_name[0];
                    sLoginType = data.user_type[0];
                    // sLoginId = '8500004';
                    // sLoginType = 'partner';
                    that._user();
		            that.onRead();
                },
                error: function (e) {
					BusyIndicator.hide();   
                }
            });
		// });
        },

		// _getLoginDetails: function () {
		// 	// $.get("/services/userapi/attributes").done(function (results) {
		// 		// sLoginId = results.login_name;
		// 		// sLoginType = results.user_type;
		// 		sLoginId = '8300894';
		// 		sLoginType = 'partner';
		// 		this._user();
		// 		that.onRead();

		// 	// }.bind(this));
		// },

		_user: function () {
			oDataModel.mCustomHeaders.loginid = sLoginId;
			oDataModel.mCustomHeaders.logintype = sLoginType;
		},
		
		onSelectionChange: function (oEvent) {
			BusyIndicator.show(0);
			com.ibs.ibsappivensaanalytical.ind = "X";
			var data = oEvent.getSource().getSelectedItem().getBindingContext("itemlist3").getObject();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("View2", {
				"PR_NO": data.Supplierquotation
			});
		}

	});
});

