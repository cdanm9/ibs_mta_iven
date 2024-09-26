sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatterSchedAgr"  
], function (Controller, JSONModel, Filter, MessageToast, Sorter, MessageBox, BusyIndicator, formatter) {
	"use strict";
     var sLoginId,sLoginType,oStorage,appModulePath;
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.SchedAgrPOEntries", {
        formatter: formatter,
		onInit: function () {
			BusyIndicator.show(0);
            // apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		
			this.oModel2 = this.getOwnerComponent().getModel("SchedAgreement");
			
			var oRouter = this.getOwnerComponent().getRouter().getRoute("SchedAgreement");
			oRouter.attachPatternMatched(this.handleRouteMatched, this);
		},
		
		onAfterRendering: function () {
			this.byId("idSchtable").removeSelections();
		},
		
		handleRouteMatched: function (oEvent) {
			var that = this;
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");
			// this.readData();    
			
			jQuery.sap.require("jquery.sap.storage");
			oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

			if (oStorage.get("mySessionData")) {
				var oData = oStorage.get("mySessionData");
				sLoginId = oData.Collection[0].id;
				sLoginType = oData.Collection[0].type;
				that._user();
                that.readData();
			} else {
				//get user attributes
			    this._getLoginDetails();
			}
		},

		_getLoginDetails: function () {
            // debugger;
            var that = this, url;
			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
			var appPath = appId.replaceAll(".", "/");
			appModulePath = jQuery.sap.getModulePath(appPath);
            url = appModulePath + "/user-api/attributes";
			
			// that.oPModel.setProperty("/AttachURL", appModulePath);      

			// return new Promise(function (resolve, reject) {  

            $.ajax({     
                url: url,  
                type: 'GET',
                contentType: 'application/json',
                success: function (data, response) {
					// debugger;
                    sLoginId = data.login_name[0];
                    sLoginType = data.user_type[0];      
                    // sLoginId = '8300894';
                    // sLoginType = 'partner';
                    that._user();
                    that.readData();
                },
                error: function (e) {
					// debugger;
					BusyIndicator.hide()     
                }
            });

		// });
        },

		// _getLoginDetails: function () {
		// 	// $.get("/services/userapi/attributes").done(function (results) {
		// 	    // sLoginId = results.login_name;
		// 	    // sLoginType = results.user_type;
		// 	    sLoginId = '8300894';
		// 		sLoginType = 'partner';
		// 		this._user();
		// 		this.readData();
		// 	// }.bind(this));
		// },

		_user: function () {
			this.oModel2.mCustomHeaders.loginid = sLoginId;
			this.oModel2.mCustomHeaders.logintype = sLoginType;
		},
		
		readData: function () {
			var that = this;
			that.oModel2.read("/S_HEADERSet", {
				success: function (data) {
					debugger;
					that.data = data.results;
					// console.log(that.data);
		
					var oModel = new JSONModel(that.data);
					that.getView().setModel(oModel, "lists");
					BusyIndicator.hide();
				},
				error: function (e) {
					// that.getView().setBusy(false);
					// debugger;
					BusyIndicator.hide();
					MessageBox.show(JSON.parse(e.responseText).error.message.value,{
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,  
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					  });
				}
			});
		},
		
		onSelectionChange: function (oEvent) {
			// debugger;
			BusyIndicator.show(0);
			var oObj = oEvent.getSource().getSelectedItem().getBindingContext("lists").getObject();
			var oRouter = this.getOwnerComponent().getRouter();
			// this.oPModel.setProperty("/PO_Status", oObj.Status);
			oRouter.navTo("SchedAgrPODetails", {
				"objectId": oObj.Schedule_No
			});
		},
        
        onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oFilter = new Filter("Schedule_No", sap.ui.model.FilterOperator.Contains, sValue);
			// var oFilter1 = new Filter("Ernam", sap.ui.model.FilterOperator.Contains, sValue);
			// var oFilter2 = new Filter("Netwr", sap.ui.model.FilterOperator.Contains, sValue);
			// var oFilter3 = new Filter("Waers", sap.ui.model.FilterOperator.Contains, sValue);
			// var oFilter4 = new Filter("Potype", sap.ui.model.FilterOperator.Contains, sValue);
			// var oFilter5 = new Filter("Potypedec", sap.ui.model.FilterOperator.Contains, sValue);
			var comFil = new sap.ui.model.Filter([oFilter]);
			this.getView().byId("idSchtable").getBinding("items").filter(comFil, "Application");
		}
	});
});


