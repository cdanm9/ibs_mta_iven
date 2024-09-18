sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"com/ibs/ibsappivenpcanalytical/model/formatterInvCreation",
	'sap/ui/core/BusyIndicator'
], function (Controller, JSONModel, Filter, MessageToast, Sorter, MessageBox, formatter, BusyIndicator) {
	"use strict";
	sLoginId = '8300894';
    sLoginType = 'partner';
	var sLoginId, sLoginType,oStorage,appModulePath;
	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.Invoice_Master", {
		formatter: formatter,

		onInit: function () {
			debugger
			//this.getView().setBusy(true);
			BusyIndicator.show(0);
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//get SAP and HANA models
			// this.oModel = this.getOwnerComponent().getModel("oDataModel");
			this.oModel2 = this.getOwnerComponent().getModel("oDataModelInvCreation");

			var oRouter = this.getOwnerComponent().getRouter().getRoute("invcreation");
			oRouter.attachPatternMatched(this.handleRouteMatched, this);
		},
		handleRouteMatched: function (oEvent) {
			//get UI model from component.js
			var that = this;
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModelInvCre");
			this.oPModel.setProperty("/iconTabFilterSelected", "Open");
			this.getView().byId("invoiceTable").setVisible(false);
			this.getView().byId("POTable").setVisible(true);
			
			jQuery.sap.require("jquery.sap.storage");
			oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

			if (oStorage.get("mySessionData")) {
				var oData = oStorage.get("mySessionData");
				sLoginId = oData.Collection[0].id;
				sLoginType = oData.Collection[0].type;
				that._user();
			    that.getView().byId("idIconTabBar").fireSelect();
                that.readData();
				that.readInvoiceData();
			} else {
				//get user attributes
			    this._getLoginDetails();
			}
		},


		// _getLoginDetails: function () {
        //     // debugger;
        //     var that = this, url;
		// 	var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
		// 	var appPath = appId.replaceAll(".", "/");
		// 	appModulePath = jQuery.sap.getModulePath(appPath);
        //     url = appModulePath + "/user-api/attributes";
			

		// 	that.oPModel.setProperty("/AttachURL", appModulePath);
			
		// 	return new Promise(function (resolve, reject) {
        //     $.ajax({
        //         url: url,
        //         type: 'GET',
        //         contentType: 'application/json',
        //         success: function (data, response) {
					
        //     //         sLoginId = data.login_name[0];
        //     //         sLoginType = data.user_type[0];
        //             // sLoginId = '8300894';
        //             // sLoginType = 'partner';
        //             that._user();
		// 			that.getView().byId("idIconTabBar").fireSelect();
        //             that.readData();
		// 			that.readInvoiceData();
        //         },
        //         error: function (e) {
		// 			BusyIndicator.hide();
		// 			MessageBox.error("Error While reading the Data");

        //         }
        //     });
		// });
        // },

		_getLoginDetails: function () {
			// $.get("/services/userapi/attributes").done(function (results) {
				//   sLoginId = results.login_name;
				// sLoginType = results.user_type;
				sLoginId = '8300894';
				sLoginType = 'partner';
				this._user();
				this.oPModel.setProperty("/tableTitle", "Open GRN");
				this.readData();
				this.readInvoiceData();
			// }.bind(this));
		},
		_user: function () {
			this.oModel2.mCustomHeaders.loginid = sLoginId;
			this.oModel2.mCustomHeaders.logintype = sLoginType;
		},

		readData: function () {
            //   debugger;
			var that = this;
			var afilters=[];
			var filter = new sap.ui.model.Filter("Vendorcode", sap.ui.model.FilterOperator.EQ, sLoginId);
			afilters.push(filter)
			var filter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, '');
			afilters.push(filter1)
			// path = "/IBDASNHEADSet?$filter=Vendorcode eq '" + sLoginId + "'";
			// var path = "/IBDASNHEADSet?$filter=(Vendorcode eq " + sLoginId + ")" + " and " + "(Status eq " + "'" + "" + "')";
			// var filter1 = new sap.ui.model.Filter("Buyer", sap.ui.model.FilterOperator.EQ, "");
			// read detail data from SAP
			// this.oModel2.read("/GRNDATASet", {
				this.oModel2.read("/IBDASNHEADSet", {
				// urlParameters: {
				// 	"$top": 30
				//   },
				filters: afilters,
				success: function (data) {
					//SAP data

					for (let i = 0; i < data.results.length; i++) {
						if (data.results[i].Status!=="" ) {
							data.results.splice(i,1)
							i--;
						}	
					}
					
					var sData = data.results;
					//console.log(that.data);

					//set SAP model to list.
					var oModel = new JSONModel(data.results);
					that.getView().setModel(oModel, "lists");

					//fire select of icontabbar to select 'pending' tab by default.
					// that.getView().byId("idIconTabBar").fireSelect();

					//to display count on icontabbar icons
					var oCountObj = {
						"Total": sData.length,
						"Confirmed": 0,
						"Pending": 0,
						// "Rejected": 0
					};

					var oModel1 = new JSONModel(oCountObj);
					that.getView().setModel(oModel1, "CountModel");

					// that.getView().setBusy(false);
					BusyIndicator.hide();
				},
				error: function (e) {
					// that.getView().setBusy(false);
					BusyIndicator.hide();
					MessageBox.show(JSON.parse(e.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
			});
		},

		readInvoiceData: function () {
            // debugger;
			var that = this;
			var filter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, '01');
			// var filter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.NE, '6');
			// var filter1 = new sap.ui.model.Filter("Buyer", sap.ui.model.FilterOperator.EQ, "");

			// read detail data from SAP
			this.oModel2.read("/ReqHeadSet", {
				// urlParameters: {
				// 	"$top": 30
				//   },
				filters: [filter],
				success: function (data) {
					//SAP data
					
				
					// for (let i = 0; i < data.results.length; i++) {
					// 	if (data.results[i].Status==="6") {
					// 		data.results.splice(i,1)
					// 		i--;
					// 	}	
					// }
					var sData = data.results;
					//console.log(that.data);

					//set SAP model to list.
					var oModel = new JSONModel(data.results);
					that.getView().setModel(oModel, "invoicelists");

					//fire select of icontabbar to select 'pending' tab by default.
					// that.getView().byId("idIconTabBar").fireSelect();

					//to display count on icontabbar icons
					var oCountObj = {
						"Total": sData.length,
						"Confirmed": 0,
						"Pending": 0,
						// "Rejected": 0
					};

					var oModel1 = new JSONModel(oCountObj);
					that.getView().setModel(oModel1, "vCountModel");

					// that.getView().setBusy(false);
					BusyIndicator.hide();
				},
				error: function (e) {
					// that.getView().setBusy(false);
					BusyIndicator.hide();
					MessageBox.show(JSON.parse(e.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
			});
		},

		onSelectionChange: function (oEvent) {
			var sKey = this.oPModel.getProperty("/iconTabFilterSelected");
			if (sKey === "Open") {
				var oObj = oEvent.getSource().getSelectedItem().getBindingContext("lists").getObject();
				com.ibs.ibsappivenpcanalytical.oSelObject = oObj;
                
				var oRouter = this.getOwnerComponent().getRouter();
				this.oPModel.setProperty("/PO_Status", oObj.Status);
				oRouter.navTo("Invoice_Detail", {
					"objectId": oObj.Asnno,
					"objectStatus": 0
				});
			} else {
				var oObj = oEvent.getSource().getSelectedItem().getBindingContext("invoicelists").getObject();
				com.ibs.ibsappivenpcanalytical.oSelObject = oObj;
				var oRouter = this.getOwnerComponent().getRouter();
				this.oPModel.setProperty("/PO_Status", oObj.Status);
				oRouter.navTo("Invoice_Detail", {
					"objectId": oObj.Grnno,
					"objectStatus": oObj.Status
				});
			}
		},
		onFilterSelect: function (oEvent) {
			//
			var oBinding = this.byId("POTable").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				oFilter;

			// in case of fireselect oEvent.getParameter("key") is undefined, so get that value from pmodel
			if (sKey === undefined) {
				sKey = this.oPModel.getProperty("/iconTabFilterSelected");
			}
			//status column will only be visible if 'all PO' tab is selected
			this.oPModel.setProperty("/statusVisible", false);

			if (sKey === "Open") {
				// this.oPModel.setProperty("/tableTitle", "Open GRN");
				 this.oPModel.setProperty("/tableTitle", "Open ASN");
				// oFilter = [new Filter("Status", "EQ", "03")];
				this.getView().byId("invoiceTable").setVisible(false);
				this.getView().byId("POTable").setVisible(true);
				this.readData();

			} else if (sKey === "Submitted") {
				this.oPModel.setProperty("/tableTitle", "Pending Invoices");
				// oFilter = [new Filter("Status", "EQ", "01"), new Filter("Status", "EQ", "02")];
				this.getView().byId("invoiceTable").setVisible(true);
				this.getView().byId("POTable").setVisible(false);
				this.readInvoiceData();
			}
			// else if (sKey === "Rejected") {
			// 	this.oPModel.setProperty("/tableTitle", "Rejected Orders");
			// 	oFilter = [new Filter("Status", "EQ", "RBV")];
			// } 
			else {
				this.oPModel.setProperty("/tableTitle", "Open GRN");
				this.oPModel.setProperty("/statusVisible", true);
				oFilter = [];
			}
			// oBinding.filter(oFilter);
			this.oPModel.setProperty("/searchFieldValue", "");
		},
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var sKey = this.oPModel.getProperty("/iconTabFilterSelected");
			if (sKey === "Open") {
				var oFilter = new Filter("Ponumber", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter1 = new Filter("Grnnum", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter2 = new Filter("Asnno", sap.ui.model.FilterOperator.Contains, sValue);
				var comFil = new sap.ui.model.Filter([oFilter, oFilter1,oFilter2]);
				this.getView().byId("POTable").getBinding("items").filter(comFil, "Application");
			} else {
				var oFilter = new Filter("Ponumber", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter1 = new Filter("Grnno", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter2 = new Filter("Vendorinvno", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter3 = new Filter("Asnno", sap.ui.model.FilterOperator.Contains, sValue);

				var comFil = new sap.ui.model.Filter([oFilter, oFilter1, oFilter2,oFilter3]);
				this.getView().byId("invoiceTable").getBinding("items").filter(comFil, "Application");
			}
		},

	});

});


