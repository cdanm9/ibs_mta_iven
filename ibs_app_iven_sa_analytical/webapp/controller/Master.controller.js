// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
// 	"sap/m/Popover",
// 	"sap/m/Button",
// 	"sap/m/library"
// ],
// function (Controller,JSONModel, Popover, Button, library) {
//     "use strict";
//     var oDatamodel;
//      var oContext;
//     var ButtonType = library.ButtonType,
//     PlacementType = library.PlacementType;

//     return Controller.extend("com.ibs.ibsappivensaanalytical.controller.Master", {
//         onInit: function () {

//             // oContext=this
//             // oDatamodel = this.getOwnerComponent().getModel("datamodel")
     
            
//             // this.getView().setModel(oDatamodel, "data")
// 			// this._setToggleButtonTooltip();
//         },

//         // onItemSelect: function(oEvent){
// 		// 	debugger
// 		// 	// var userSelected = oEvent.getParameter("item").getkey();
// 		// 	var userSelected = oEvent.mParameters.item.mProperties.key;
// 		// 	this.getOwnerComponent().getRouter().navTo(userSelected);
// 		// }
//     });
// });

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"com/ibs/ibsappivensaanalytical/model/formatter",
	'sap/ui/core/BusyIndicator'
], function (Controller, JSONModel, Filter, MessageToast, Sorter, MessageBox, formatter, BusyIndicator) {
	"use strict";
    var sLoginId,sLoginType,oStorage,appModulePath;
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.Master", {
	// return Controller.extend("com.ibs.ibsappivensaanalytical.controller.POEntries", {
        formatter: formatter,
			onInit: function () {
			var that = this;
            debugger
			 //this.getView().setBusy(true);
             BusyIndicator.show(0);
			// apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//get SAP and HANA models
			// this.oModel = this.getOwnerComponent().getModel("oDataModel");
			this.oModel2 = this.getOwnerComponent().getModel("oDataModel2");
			
			var oRouter = this.getOwnerComponent().getRouter().getRoute("Master");
			oRouter.attachPatternMatched(this.handleRouteMatched, this);
		},
		handleRouteMatched: function (oEvent) {
			var that = this;
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");
		
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

		// _getLoginDetails: function () {
        //     debugger;
        //     var that = this, url;
		// 	var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
		// 	var appPath = appId.replaceAll(".", "/");
		// 	appModulePath = jQuery.sap.getModulePath(appPath);
        //     url = appModulePath + "/user-api/attributes";

			
		// 	// return new Promise(function (resolve, reject) {
        //     $.ajax({
        //         url: url,
        //         type: 'GET',
        //         contentType: 'application/json',
        //         success: function (data, response) {				
        //             sLoginId = data.login_name[0];
        //             sLoginType = data.user_type[0];
        //             // sLoginId = '8300894';
        //             // sLoginType = 'partner';
        //             that._user();
        //             that.readData();
        //         },
        //         error: function (e) {

        //         }
        //     });
		// // });
        // },

		_getLoginDetails: function () {
			// $.get("/services/userapi/attributes").done(function (results) {
			 //   sLoginId = results.login_name;
				// sLoginType = results.user_type;
				sLoginId = '8300894';
			    sLoginType = 'partner';
				this._user();
				this.readData();
			// }.bind(this));
		},
		_user: function () {
			this.oModel2.mCustomHeaders.loginid = sLoginId;
			this.oModel2.mCustomHeaders.logintype = sLoginType;
		},
		
		readData: function () {
			var that = this;
			// var filter = new sap.ui.model.Filter("VendorCode", sap.ui.model.FilterOperator.EQ, this._sUserID);
			// var filter1 = new sap.ui.model.Filter("Buyer", sap.ui.model.FilterOperator.EQ, "");
			
			// read detail data from SAP
			this.oModel2.read("/HeaderSet", {
				// urlParameters: {
				// 	"$top": 30
			 //   },
			    // filters: [filter, filter1],
				success: function (data) {
					//SAP data
					//debugger;
					that.data = data.results;
					//console.log(that.data);
			
					//set SAP model to list.
					var oModel = new JSONModel(that.data);
					that.getView().setModel(oModel, "lists");
					
					//fire select of icontabbar to select 'pending' tab by default.
					that.getView().byId("idIconTabBar").fireSelect();
					
					//to display count on icontabbar icons
					var oCountObj = {
						"Total": that.data.length,
						"Confirmed": 0,
						"Pending": 0,
						// "Rejected": 0
					};
					for (var i = 0; i < that.data.length; i++) {
						if (that.data[i].Status === "03") {
							oCountObj.Confirmed = oCountObj.Confirmed + 1;
						} else if (that.data[i].Status === "01" || that.data[i].Status === "02") {
							oCountObj.Pending = oCountObj.Pending + 1;
						} 
						// else if (that.data[i].Confirmcode === "RBV" && that.data[i].Rejectindicator === false) {
						// 	oCountObj.Rejected = oCountObj.Rejected + 1;
						// }
					}
					var oModel1 = new JSONModel(oCountObj);
					that.getView().setModel(oModel1, "CountModel");
					
					// that.getView().setBusy(false);
					BusyIndicator.hide();
				},
				error: function (e) {
					// that.getView().setBusy(false);
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
			debugger
			BusyIndicator.show(0);
			var oObj = oEvent.getSource().getSelectedItem().getBindingContext("lists").getObject();
			var oRouter = this.getOwnerComponent().getRouter();
			this.oPModel.setProperty("/PO_Status", oObj.Status);
			oRouter.navTo("PODetails", {
				"objectId": oObj.PoNumber,
				"objectStatus": oObj.Status
			});
		},
		onFilterSelect: function (oEvent) {
			//debugger;
			var oBinding = this.byId("POTable").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				oFilter;
			
			// in case of fireselect oEvent.getParameter("key") is undefined, so get that value from pmodel
			if (sKey === undefined) {
				sKey = this.oPModel.getProperty("/iconTabFilterSelected");
			}
			//status column will only be visible if 'all PO' tab is selected
			this.oPModel.setProperty("/statusVisible", false);
			
			if (sKey === "Confirmed") {
				this.oPModel.setProperty("/tableTitle", "In Process Orders");
				oFilter = [new Filter("Status", "EQ", "03")];
			} else if (sKey === "Pending") {
				this.oPModel.setProperty("/tableTitle", "Pending Orders");
				oFilter = [new Filter("Status", "EQ", "01"), new Filter("Status", "EQ", "02")];
			} 
			// else if (sKey === "Rejected") {
			// 	this.oPModel.setProperty("/tableTitle", "Rejected Orders");
			// 	oFilter = [new Filter("Status", "EQ", "RBV")];
			// } 
			else {
				this.oPModel.setProperty("/tableTitle", "Orders");
				this.oPModel.setProperty("/statusVisible", true);
				oFilter = [];
			}
			oBinding.filter(oFilter);
			this.oPModel.setProperty("/searchFieldValue", "");
		},
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oFilter = new Filter("PoNumber", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter1 = new Filter("Ernam", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new Filter("Netwr", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("Waers", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter4 = new Filter("Potype", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter5 = new Filter("Potypedec", sap.ui.model.FilterOperator.Contains, sValue);
			var comFil = new sap.ui.model.Filter([oFilter, oFilter1, oFilter2, oFilter3, oFilter4, oFilter5]);
			this.getView().byId("POTable").getBinding("items").filter(comFil, "Application");
		},
	});
});



