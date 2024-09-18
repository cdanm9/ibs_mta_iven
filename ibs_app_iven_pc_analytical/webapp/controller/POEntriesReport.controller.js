sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"../model/formatterPOReport",       
    'sap/ui/export/library',
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/library",
    "sap/ui/core/ValueState",
	'sap/ui/core/BusyIndicator'
], function (Controller, JSONModel, Filter, MessageToast, Sorter, MessageBox, formatter, exportLibrary, Spreadsheet, library, ValueState, BusyIndicator) {
	"use strict";
    var sKey;
    var sLoginId,sLoginType,oStorage;
    var clicks = 0;
    var num = 0;
    var count1;
	var appModulePath;
	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.POEntriesReport", {   
		formatter: formatter,   
		onInit: function () {
           //this.getView().setBusy(true);
            BusyIndicator.show(0);
          
			// apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//get SAP and HANA models
			this.oModel2 = this.getOwnerComponent().getModel("oDataModelPOService");   
			// this.oModel1 = this.getOwnerComponent().getModel("CloudXsOdata");
			sKey = this.getView().byId("idIconTabBar").getSelectedKey();
			var oRouter = this.getOwnerComponent().getRouter().getRoute("po_report");  
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
				that._read();
				that.readData(num);
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
		_read : function () {
			var that = this;
			this.oModel2.read("/HeaderSet/$count", {
				success: function (data) {
					that.count = data;
					var oObj = {
						"Total": that.count
					};
					var oModel1 = new JSONModel(oObj);
					that.getView().setModel(oModel1, "tests");
					count1 = that.count - 30;
				},
				error: function (e) {}
			});
		},
		_getLoginDetails: function () {
            // debugger;
            var that = this, url;
			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
			var appPath = appId.replaceAll(".", "/");
			appModulePath = jQuery.sap.getModulePath(appPath);
            url = appModulePath + "/user-api/attributes";   

			// sLoginId = '8300894';   
			// sLoginType = 'partner';
			
			// return new Promise(function (resolve, reject) {

            $.ajax({  
                url: url,
                type: 'GET',  
                contentType: 'application/json',
                success: function (data, response) {					
                    sLoginId = data.login_name[0];
                    sLoginType = data.user_type[0];
                    // sLoginId = '8300894';   
                    // sLoginType = 'partner';
                    that._user();
					that._read();
					that.readData(num);
                },
                error: function (e) {

                }
            });
			
		// });
        },

		// _getLoginDetails: function () {
		// 	// $.get("/services/userapi/attributes").done(function (results) {
		// 		// sLoginId = results.login_name;
		// 		// sLoginType = results.user_type;
		// 		sLoginId = '8300894';
		// 	    sLoginType = 'partner';
		// 		this._user();
		// 		this._read();
		// 	    this.readData(num);
		// 	// }.bind(this));
		// },
		_user: function () {
			this.oModel2.mCustomHeaders.loginid = sLoginId;
			this.oModel2.mCustomHeaders.logintype = sLoginType;
		},
		
		next : function() {
			// debugger;
			if(clicks < 0)
			{
			 clicks = 0;
			 clicks += 1;	     
			}
			else{		   
		     clicks += 1;
			};		 
			num = clicks * 30;
			count1;
				if(count1 < 30)
				{
				 var Btn = this.getView().byId("btn_next");
				 Btn.setEnabled(false);
				}				
				if(num >= 30)
				{	
	   		     var Btn = this.getView().byId("btn_previous");
	   			 Btn.setEnabled(true);			   			
				}				
				this.readData(num);
				count1 = count1 - 30;
		},
		
		previous : function() { 
			// debugger;
			var Btn = this.getView().byId("btn_next");
				 Btn.setEnabled(true);
			clicks -= 1;
			if(clicks <= 0)
			{		
			  num = 0;
			}
			else{	       		
			 num = clicks * 30;   
			}; 
			
   			if(num < count1)
			{		  
			 var Btn = this.getView().byId("btn_next");
			 Btn.setEnabled(true);
			}
   			if(num === 0)
   			{
   		     var Btn = this.getView().byId("btn_previous");
   			 Btn.setEnabled(false);
   			}   			
   			this.readData(num);
			count1 = count1 + 30;
   		},
		
		readData: function (num) {
			var that = this;
			// var filter = new sap.ui.model.Filter("VendorCode", sap.ui.model.FilterOperator.EQ, this._sUserID);
			// var filter1 = new sap.ui.model.Filter("Buyer", sap.ui.model.FilterOperator.EQ, "");
			if(!num)
				num=0;
			// read detail data from SAP
			this.oModel2.read("/HeaderSet", {
				urlParameters: {
					"$top": 30 + num,
					// "$skip": num
			    },
			    // filters: [filter, filter1],
				success: function (data) {
					//debugger;
					that.data = data.results;
					// console.log(that.data);
			
					var oModel = new JSONModel(that.data);
					that.getView().setModel(oModel, "lists");
					
					//fire select of icontabbar to select 'pending' tab by default.
					that.getView().byId("idIconTabBar").fireSelect();
					
					//to display count on icontabbar icons
					var oCountObj = {
						"Total": that.data.length,
						"Confirmed": 0,
						"Pending": 0,
					    // "Rejected": that.data.length
					};
					for (var i = 0; i < that.data.length; i++) {
						if (that.data[i].Status === "04") {
							oCountObj.Confirmed = oCountObj.Confirmed + 1;
						} else if (that.data[i].Status === "01" || that.data[i].Status === "02" || that.data[i].Status === "03") {
							oCountObj.Pending = oCountObj.Pending + 1;
						} 
						// else if (that.data[i].Status === "01" || that.data[i].Status === "02" || that.data[i].Status === "03") {
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
		
		onFilterSelect: function (oEvent) {
			//debugger;
			var oBinding = this.byId("POTable").getBinding("items"),
				oFilter;
			sKey = oEvent.getParameter("key");
			
			// in case of fireselect oEvent.getParameter("key") is undefined, so get that value from pmodel
			if (sKey === undefined) {
				sKey = this.oPModel.getProperty("/iconTabFilterSelected");
			}
			//status column will only be visible if 'all PO' tab is selected
			this.oPModel.setProperty("/statusVisible", false);
			
			if (sKey === "Confirmed") {
				this.oPModel.setProperty("/tableTitle", "Complete Orders");
				oFilter = [new Filter("Status", "EQ", "04")];
			} else if (sKey === "Pending") {
				this.oPModel.setProperty("/tableTitle", "Open Orders");
				oFilter = [new Filter("Status", "EQ", "01"), new Filter("Status", "EQ", "02"), new Filter("Status", "EQ", "03")];
			} 
			else {
				this.oPModel.setProperty("/tableTitle", "Total Orders");
				this.oPModel.setProperty("/statusVisible", true);
				oFilter = [];
			}
			oBinding.filter(oFilter);
			this.oPModel.setProperty("/searchFieldValue", "");
		},
		
		// readData1: function (num) {
		// 	var that = this;
		// 	this.getView().setBusy(true);
		// 	this.oModel2.read("/HeaderSet", {
		// 		urlParameters: {
		// 			"$top": 30,
		// 			"$skip": num
		// 	    },
		// 		success: function (data) {
		// 			that.data = data.results;
		// 			var oModel = new JSONModel(that.data);
		// 			that.getView().setModel(oModel, "lists");
					
		// 			//fire select of icontabbar to select 'pending' tab by default.
		// 			that.getView().byId("idIconTabBar").fireSelect();
					
		// 			//to display count on icontabbar icons
		// 			var oCountObj = {
		// 				"Total": that.data.length,
		// 				"Confirmed": 0,
		// 				"Pending": 0
		// 			};
		// 			for (var i = 0; i < that.data.length; i++) {
		// 				if (that.data[i].Status === "04") {
		// 					oCountObj.Confirmed = oCountObj.Confirmed + 1;
		// 				} else if (that.data[i].Status === "01" || that.data[i].Status === "02" || that.data[i].Status === "03") {
		// 					oCountObj.Pending = oCountObj.Pending + 1;
		// 				} 
		// 			}
		// 			var oModel1 = new JSONModel(oCountObj);
		// 			that.getView().setModel(oModel1, "CountModel");
					
		// 			that.getView().setBusy(false);
		// 		},
		// 		error: function (e) {
		// 			that.getView().setBusy(false);
		// 			MessageToast.show(JSON.parse(e.responseText).error.message.value);
		// 		}
		// 	});
		// },
		
		onSelectionChange: function (oEvent) {
			BusyIndicator.show(0);
			var oObj = oEvent.getSource().getSelectedItem().getBindingContext("lists").getObject();
			var oRouter = this.getOwnerComponent().getRouter();
			this.oPModel.setProperty("/PO_Status", oObj.Status);
			oRouter.navTo("PODetailsReport", {   
				"objectId": oObj.PoNumber,
				"objectStatus": oObj.Status
			});
		},
		
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oFilter = new Filter("PoNumber", sap.ui.model.FilterOperator.Contains, sValue);
			var comFil = new sap.ui.model.Filter([oFilter]);
			this.getView().byId("POTable").getBinding("items").filter(comFil, "Application");
		},
		handleValueHelpPONo: function (oEvent) {
			// debugger
            var sInputValue = oEvent.getSource().getValue();
            this.inputId = oEvent.getSource().getId();
            if (!this._valueHelpDialog) {       
                this._valueHelpDialog = sap.ui.xmlfragment("com.ibs.ibsappivenpcanalytical.view.fragments.PONumber",this);
                this.getView().addDependent(this._valueHelpDialog);
            }
            this._valueHelpDialog.open(sInputValue);
        },
        _handleValueHelpF4PoNumber: function (evt) {
			// debugger;
            var sValue = evt.getParameter("value");
            var oFilter = new Filter("PoNumber",sap.ui.model.FilterOperator.Contains, sValue);
            evt.getSource().getBinding("items").filter([oFilter]);
        },
        _handleValueHelpPoNumber: function (evt) {    
			// debugger;
            var oSelectedItem = evt.getParameter("selectedItem");
            if (oSelectedItem) {
                var paDocInput = this.byId(this.inputId);
                paDocInput.setValue(oSelectedItem.getTitle());
            }
            evt.getSource().getBinding("items").filter([]);
        },
        _handleValueHelpPoNumberClose1: function (evt) {
            this.getView().byId("id_Po").setValue("");
        },   
        
        onSelectGo: function () {
        	// debugger;
        	var that = this;
        	var poNo = this.getView().byId("id_Po").getValue();
        	var dateRange = this.getView().byId("date");
        	var status = this.getView().byId("id_status").getSelectedKey();
        	var aFilters = [];
        	
        	var oTable = that.getView().byId("POTable");
        	var binding = oTable.getBinding("items");
        	if (poNo === "" && status === "" && !dateRange.getValue()) {
				   // that.getView().setBusy(false);
					BusyIndicator.hide();
				   return MessageBox.show("Please select value from atleast one filter",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				  });
			    }
        	if (poNo !== "") {
                aFilters.push(new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, poNo));
            }
            if (dateRange.getValue() && sKey === "Confirmed") {
                var FromDate = dateRange.getDateValue();
                var ToDate = dateRange.getSecondDateValue();    
                var filter1 = new sap.ui.model.Filter("PoDate", sap.ui.model.FilterOperator.BT, FromDate, ToDate);
                	aFilters = [new Filter("Status", "EQ", "04"), filter1];
            } else if (dateRange.getValue() && sKey === "Pending") {
                var FromDate = dateRange.getDateValue();
                var ToDate = dateRange.getSecondDateValue();    
                var filter1 = new sap.ui.model.Filter("PoDate", sap.ui.model.FilterOperator.BT, FromDate, ToDate);
                	aFilters = [new Filter("Status", "EQ", "01"), new Filter("Status", "EQ", "02"), new Filter("Status", "EQ", "03"), filter1];
            } else if (dateRange.getValue() && sKey === "All") {
                var FromDate = dateRange.getDateValue();
                var ToDate = dateRange.getSecondDateValue();    
                var filter1 = new sap.ui.model.Filter("PoDate", sap.ui.model.FilterOperator.BT, FromDate, ToDate);
                aFilters = [filter1];
            }
            if (status !== "") {
                aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, status));
            }
            binding.filter(aFilters);
        },
        refreshTableFilter: function () {
			this.getView().byId("date").setValue(null);
			this.getView().byId("id_status").setSelectedKey("");
			this.getView().byId("id_Po").setValue("");
			var oFilter = [];
			var oTable = this.getView().byId("POTable");
        	var binding = oTable.getBinding("items");
        	if (sKey === "Confirmed") {
				oFilter = [new Filter("Status", "EQ", "04")];
			} else if (sKey === "Pending") {
				oFilter = [new Filter("Status", "EQ", "01"), new Filter("Status", "EQ", "02"), new Filter("Status", "EQ", "03")];
			} else {
				oFilter = [];
			}
			binding.filter(oFilter);
		},
        
        onStatusChange: function(oEvent) {
        	this.aFilterItems = oEvent.getParameters().changedItems;
        },
        
        onExport: function () {
                var that = this;
                var oSettings, oSheet, aColumns;
                that.oTable = this.byId("POTable");
                that.TblData = that.oTable.getModel("lists").getData();
                var data = [];
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd.MM.yyyy"
                });
                for (var i = 0; i < that.TblData.length; i++) {
                   // console.log(that.TblData[i]);
                    var obj = that.TblData[i].Status;
                    if(obj === "01"){
                        obj = "Pending with Vendor";
                    }else if(obj === "02"){
                        obj = "Partially Confirmed by Vendor";
                    }else if(obj === "03"){
                        obj = "Pending with Buyer";
                    }else if(obj === "04"){
                        obj = "Completed";
                    }else if(obj === "05"){
                        obj = "Returned Good/Service";
                    } else {
                      obj = "";  
                    }
                    // console.log(obj);
                    var objData = {
                        "PoNumber" : that.TblData[i].PoNumber,
                        "PoDate" : dateFormat.format(that.TblData[i].PoDate),
                        "PoAmount" : Number(that.TblData[i].PoAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        "Currency" : that.TblData[i].Currency,
                        "BuyerName" : that.TblData[i].BuyerName,
                        "HeaderText" : that.TblData[i].HeaderText,
                        "NoteToSupp" : that.TblData[i].NoteToSupp,
                        "Status" : obj
                    };
                    data.push(objData);
                }
                if (data !== undefined && data.length !== 0) {
                    aColumns = that._columnsDataExcel();
                    oSettings = {
                        workbook: {
                            columns: aColumns,
                            hierarchyLevel: "Level",
                            sheetName: "PO Report"
                        },
                        fileName: 'PO Report.xlsx',
                        dataSource: data,
                        worker: false // We need to disable worker because we are using a MockServer as OData Service
                    };
                    oSheet = new Spreadsheet(oSettings);
                    oSheet.build().finally(function () {
                        oSheet.destroy();
                    });
                }
            },
            _columnsDataExcel: function () {
               // debugger;
                var EdmType = exportLibrary.EdmType;
                var aColumns = [];
                aColumns.push({
                    label: "PO Number",
                    property: "PoNumber",
                    width: "7rem"
                });
                aColumns.push({
                    label: "PO Date",
                    property: "PoDate",
                    width: "7rem"
                });
                aColumns.push({
                    label: "Amount",
                    property: "PoAmount",
                    width: "7rem"
                });
                aColumns.push({
                    label: "Currency",
                    property: "Currency",
                    width: "3.5rem"
                });
                aColumns.push({
                    label: "Buyer",
                    property: "BuyerName",
                    width: "12rem"
                });  
                aColumns.push({
                    label: "Header Text",
                    property: "HeaderText",
                    width: "12rem"
                }); 
                aColumns.push({
                    label: "Note",
                    property: "NoteToSupp",
                    width: "12rem"
                }); 
                aColumns.push({
                    label: "Status",
                    property: "Status",
                    width: "7rem"
                });               
                return aColumns;
            },
	});
});
