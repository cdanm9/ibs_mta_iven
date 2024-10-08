// sap.ui.define([
//     "sap/m/MessageToast"
// ], function(MessageToast) {
//     'use strict';

//     return {
//         onAfterRendering: function(oEvent) {
//             MessageToast.show("Custom handler invoked.");
//         }
//     };
// });

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	var oDataModel;
	var that;

sap.ui.controller("com.ibs.ibsappivenpotoinvoicefiorireptfe.ext.controller.ListReportExt", {

	onClickActionHeaderSet1: function (oEvent) {

	},
	onInit: function () {
        // this._getLoginDetails();
	},

	onAfterRendering:function(){
		var that = this;
		debugger;
		jQuery.sap.require("jquery.sap.storage");
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
        var sLoginId, sLoginType,sVendorCode;
		if (oStorage.get("mySessionData")) {
			var oData = oStorage.get("mySessionData");
			sVendorCode = oData.Collection[0].id;
			sLoginId = oData.Collection[0].id;
			sLoginType = oData.Collection[0].type;
			var oDataModel = that.getOwnerComponent().getModel();
			oDataModel.setHeaders({
				// "Lifnr": sVendorCode,
				"loginid": sLoginId,
				"logintype": sLoginType 
			});
		} else {
			// get user attributes
			this._getLoginDetails();
		}
	},

	_getLoginDetails1: function () {
		debugger;
		var that = this;
		var sLoginId, sLoginType,sVendorCode;
		var that = this, url;
		var appId = "com.ibspl.iven.ivenpotoinvoicefiorirept";
		var appPath = appId.replaceAll(".", "/");
		var appModulePath = jQuery.sap.getModulePath(appPath);
		url = appModulePath + "/user-api/attributes";
		var oDataModel = that.getOwnerComponent().getModel();

		$.ajax({
			url: url,
			type: 'GET',
			contentType: 'application/json',
			success: function (data, response) {
				sVendorCode = data.name;				
				sLoginId = data.login_name[0];
				sLoginType = data.user_type[0];
				oDataModel.setHeaders({
					// "Lifnr": sVendorCode,
					"loginid": sLoginId,
					"logintype": sLoginType 
				});
			},
			error: function (e) {

			}
		
		});
	},

	_getLoginDetails: function () {
		debugger
		var that = this;

		var oDataModel = that.getOwnerComponent().getModel();
		oDataModel.setHeaders ({
			// "Lifnr": "8300894",
			"loginid": "8300894",
			"logintype":"partner" 
		});		
	  }
   })
});