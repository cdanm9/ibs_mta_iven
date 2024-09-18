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

//     return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.Page2", {
//         onInit: function () {

            
//         },

       
//     });
// });
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatterASN",
	"sap/ui/export/Spreadsheet"
], function (Controller, History, JSONModel, MessageToast, Filter, FilterOperator, MessageBox, BusyIndicator, formatter, Spreadsheet) {
	"use strict";
    var sLoginId,sLoginType,oStorage,appModulePath;
	var context = null;
	var oView = null;
	var oRouter = null;
	var oTable = null;
	var viewModel = null;
	var headerModel = null;
	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.Page2", {
        formatter: formatter,
		onInit: function () {
            context = this;
			oView = context.getView();
			viewModel = new JSONModel();
			headerModel = new JSONModel();
			
			oRouter = context.getOwnerComponent().getRouter();
			// apply content density mode to root view
			// oView.addStyleClass(context.getOwnerComponent().getContentDensityClass());

			context.onPremSrvModel = context.getOwnerComponent().getModel("onPremService");

			var getRoute = oRouter.getRoute("Page2");
			getRoute.attachPatternMatched(context._onObjectMatched, this);
		},
		
		onAfterRendering: function () {
			oTable = oView.byId("idMainReport");
			// context.readStatusMaster();
		},

		_onObjectMatched: function (oEvent) {
			var that = this;
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("viewModel");
			// this.getView().byId("idIconTabBar").fireSelect();

			jQuery.sap.require("jquery.sap.storage");
			oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

			if (oStorage.get("mySessionData")) {
				var oData = oStorage.get("mySessionData");
				sLoginId = oData.Collection[0].id;
				sLoginType = oData.Collection[0].type;
				that._user();
			    that.getView().byId("idIconTabBar").fireSelect();
			} else {
				//get user attributes
			    this._getLoginDetails();
			}
			
			//********************Omkar 06/01/2023**************************//
			com.ibs.ibsappivenpcanalytical.ind2 = "X";
			that.getOwnerComponent().getService("ShellUIService").then(function (oShellService) {
				oShellService.setBackNavigation(function () {
					if (com.ibs.ibsappivenpcanalytical.ind2 === "X") {
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
        //     // debugger;
        //     var that = this, url;
		// 	var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
		// 	var appPath = appId.replaceAll(".", "/");
		// 	appModulePath = jQuery.sap.getModulePath(appPath);
        //     url = appModulePath + "/user-api/attributes";

		// 	that.oPModel.setProperty("/AttachURL", appModulePath);
			
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
		//             that.getView().byId("idIconTabBar").fireSelect();
        //         },
        //         error: function (e) {

        //         }
        //     });
		// // });
        // },
		
		_getLoginDetails: function () {
			// $.get("/services/userapi/attributes").done(function (results) {
				// sLoginId = results.login_name;
				// sLoginType = results.user_type;
				sLoginId = '8300894';
			    sLoginType = 'partner';
				this._user();
			    this.getView().byId("idIconTabBar").fireSelect();
			// }.bind(this));
		},
		_user: function () {
			context.onPremSrvModel.mCustomHeaders.loginid = sLoginId;
			context.onPremSrvModel.mCustomHeaders.logintype = sLoginType;
		},
		
		readSAPData: function (entity, filters) {
			// debugger;
			BusyIndicator.show(0);
			// this._user();
			context.onPremSrvModel.read(entity, {
				urlParameters: {
					"$select": "PoNumber,PoDate,Currency,PoAmount,BuyerName,Status,Asnno,HeaderText,NoteToSupp",
					// "$top": 100,
					// "$skip": 0
				},
				// filters: [filters],
				success: function (data) {
					// console.log(data);
					headerModel.setData(data.results);
					oView.getModel("viewModel").setProperty("/mainTableCount", data.results.length);
					// headerModel.setSizeLimit(data.results.length);
					oView.setModel(headerModel, "headerModel");
					BusyIndicator.hide();
				},
				error: function (e) {
					
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
		
		onFilterSelect: function (oEvent) {
			// var that = this;
			var sKey = oEvent.getParameter("key"),
				oFilter;

			// in case of fireselect oEvent.getParameter("key") is undefined, so get that value from pmodel
			if (sKey === undefined) {
				sKey = this.oPModel.getProperty("/iconTabFilterSelected");
			}
			if (sKey === "Open") {
				this.readSAPData("/HeaderSet"); //for main page open POs
				oView.getModel("viewModel").setProperty("/Table1Visible", true);
				oView.getModel("viewModel").setProperty("/Table2Visible", false);
			} else if (sKey === "Submitted") {
				// oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 7);
				this.readSAPData("/AsnSubmitSet");
                oView.getModel("viewModel").setProperty("/Table1Visible", false);
				oView.getModel("viewModel").setProperty("/Table2Visible", true);
			} else if (sKey === "Deleted") {
				
			}
		},
        setViewModel: function () {
			var oViewObj = {
				"mainTableCount": 0
			};
			viewModel.setData(oViewObj);
			oView.setModel(viewModel, "viewModel");
		},
        onSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			// var aSearchFilter = [];
			if (sQuery) {
				var oFilter = new Filter("PoNumber", sap.ui.model.FilterOperator.Contains, sQuery);
			    var oFilter1 = new Filter("Asnno", sap.ui.model.FilterOperator.Contains, sQuery);
			    var comFil = new sap.ui.model.Filter([oFilter, oFilter1]);
				// aSearchFilter.push(new Filter("PoNumber", FilterOperator.Contains, sQuery));
				// aSearchFilter = new Filter({
				// 	filters: aSearchFilter,
				// 	and: false
				// });
			}
			if (this.oPModel.getProperty("/Table1Visible")) {
				var binding = oTable.getBinding("items");
			
			} else {
				var oTable1 = oView.byId("idMainReport1");
				var binding = oTable1.getBinding("items");
			}
			binding.filter(comFil, "Application");
		},
		
		onItemPress: function (oEvent) {
			debugger;
			BusyIndicator.show(0);
			var oItem = oEvent.getSource().getSelectedItem().getBindingContext("headerModel").getObject();
			oEvent.getSource().removeSelections(true);

			if (this.oPModel.getProperty("/Table1Visible") && oItem.PoNumber !== undefined && oItem.PoNumber !== "") {
				com.ibs.ibsappivenpcanalytical.oSelObject = oItem;
				oRouter.navTo("DetailASN", {
					navValue: oItem.PoNumber,
					navAsn: oItem.PoNumber
				});
			} else if (this.oPModel.getProperty("/Table2Visible") && oItem.PoNumber !== undefined && oItem.PoNumber !== "") {
				com.ibs.ibsappivenpcanalytical.oSelObject = oItem;
				oRouter.navTo("DetailASN", {
					navValue: oItem.PoNumber,
					navAsn: oItem.Asnno
				});
			}
		}
	});
});

