sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatterRFQ",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"sap/ui/core/routing/History"
], function (Controller, JSONModel, formatter, MessageBox, BusyIndicator, History) {
	"use strict";
	var that;
	var value;
	var oDataModel;
	var dataArr = [];
	var arrr1 = [];
	var eClick = "";
	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.View2", {
        formatter: formatter,
		onInit: function () {
		//	debugger;
			that = this;
			oDataModel = this.getOwnerComponent().getModel("RFQCreation");
			var nav = sap.ui.core.UIComponent.getRouterFor(this);
			nav.getRoute("View2").attachPatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			// debugger;
			BusyIndicator.show(0);
			dataArr = [], value="", that = this;
			this.oPModel = this.getOwnerComponent().getModel("viewModel");
			var suppQuo = oEvent.getParameter("arguments").PR_NO;
			com.ibs.ibsappivenpcanalytical.ind2 = "X";
			oDataModel.read("/QuotationHeaderSet('" + suppQuo + "')", {
				urlParameters: {
					$expand: "NavHeaderToItem"
				},
				success: function (oData) {
				//	debugger;
					BusyIndicator.hide();
					var oModel2 = new JSONModel(oData);
					that.getView().setModel(oModel2, "iModel");
					var abc = oData.NavHeaderToItem.results;
					for(var i = 0; i < abc.length; i++) {
						var test = abc[i].Netpriceamount
					 	if(abc[i].Netpriceamount === "0.00") {value="O";}
					 }
					if(value === "O") {
						that.oPModel.setProperty("/BtnEnable1", false);
					 	that.oPModel.setProperty("/BtnEnable", true);
					 	that.oPModel.setProperty("/Enabled", false);
					} else {
						that.oPModel.setProperty("/BtnEnable1", true);
					 	that.oPModel.setProperty("/BtnEnable", false);
					 	that.oPModel.setProperty("/Enabled", false);
					 	// setTimeout(function () {
					  //      for(var i = 0; i < abc.length; i++) {
							// 	var item = abc[i].Supplierquotationitem;
							// 	// console.log(item);
							//     oDataModel.read("/QuotationItemSet(Supplierquotation='" + suppQuo + "',Supplierquotationitem='" + item + "')/NavItemToPriceItem", {
							// 		success: function (oData1) {
							// 			//debugger;
							// 			BusyIndicator.hide();
							// 			console.log(oData1.results);
							// 			dataArr.push(oData1.results);
							// 		},
							// 		error: function (error) {
							// 			//debugger
							// 			BusyIndicator.hide();
							// 			// MessageBox.show(JSON.parse(error.responseText).error.message.value);
							// 			MessageBox.show(error.responseText);
							// 		}
							// 	});
							// }
			    //     	}, 4000);
					}
				},
				error: function (error) {
					// debugger
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
				}
			});
		},	
		
	
		navigateToView1: function (oEvent) {
			//debugger
			// var oHistory = History.getInstance();
			// var sPreviousHash = oHistory.getPreviousHash();
			this.oPModel.setProperty("/inputEnable", false);
			this.oPModel.setProperty("/BtnEnable1", false);
		    this.oPModel.setProperty("/BtnEnable", false);
		    that.oPModel.setProperty("/Enabled", false);
			value="";
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {
				oRouter.navTo("RouteView1", true);
			// }
		},
		editdata: function () {
			//debugger;
			this.oPModel.setProperty("/inputEnable", true);
		},
		
		openSaveFragment: function () {
			if (!this._saveFragment) {
				this._saveFragment = sap.ui.xmlfragment(
					"com.ibs.ibsappivenpcanalytical.view.fragments.saveFragment",this
				);
				this.getView().addDependent(this._saveFragment);
			}
			this._saveFragment.open();
		},
		closeSaveFragment: function () {
			this._saveFragment.close();
		},
		
		onSubmitSave: function () {   
			// debugger;
		    that = this;
			this.oPModel.setProperty("/setSubmitBusy", true);
			var payload1 = this.getView().getModel("iModel").getData();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "yyyy-MM-ddTHH:mm:ss"
                    });
            payload1.Creationdate = dateFormat.format(new Date(payload1.Creationdate));
            payload1.Paymentterms = that.getView().byId("id_payment").getValue();
            payload1.Netpaymentdays = that.getView().byId("id_Day").getValue();
            payload1.Incotermsversion = that.getView().byId("id_IncoVer").getValue();
            payload1.Incotermslocation1 = that.getView().byId("id_IncoLoc").getValue();
            payload1.Cashdiscount1percent = that.getView().byId("id_Disc1").getValue();
            payload1.Cashdiscount2percent = that.getView().byId("id_Disc2").getValue();
            payload1.Qtnlifecyclestatus = "02";
            delete payload1.__metadata;
			var aFinalItemsArr = [],aItemsArr = [];
			that.oTable = that.getView().byId("idItemsTable");
			var oItems = that.oTable.getItems();
			var selectItems = {};
			// debugger;
			for (var i = 0; i < oItems.length; i++) {
                selectItems = oItems[i].getBindingContext("iModel").getObject();
                if (selectItems.__metadata) delete selectItems.__metadata;
                if (selectItems.NavItemToPriceItem) delete selectItems.NavItemToPriceItem;
                
                if (selectItems.Creationdate) {
            	  selectItems.Creationdate = dateFormat.format(new Date(selectItems.Creationdate));
                }
                if (selectItems.Schedulelinedeliverydate) {
            	  selectItems.Schedulelinedeliverydate = dateFormat.format(new Date(selectItems.Schedulelinedeliverydate));
                }
                
                // selectItems.Schedulelineorderquantity = that.oTable.getItems()[i].getCells()[5].getValue();
                selectItems.Netpriceamount = that.oTable.getItems()[i].getCells()[7].getValue();
                selectItems.Netamount = parseFloat(that.oTable.getItems()[i].getCells()[8].getNumber().replace(/,/g, '')).toString();
	            
	            // for (var j = 0; j < dataArr.length; j++){
	            // 	var itemData = dataArr[j][j];
	            // 	if(selectItems.Supplierquotationitem === itemData.Supplierquotationitem) {
	            // 		if (itemData.__metadata) delete itemData.__metadata;
	            // 		aItemsArr.push(itemData);
	            // 		selectItems.NavItemToPriceItem = aItemsArr;
	            // 	}
	            // }
                
                aFinalItemsArr.push(selectItems);
            }
            payload1.NavHeaderToItem = aFinalItemsArr;
          
            that._callHData(payload1,"/QuotationHeaderSet");
		},
		
		_callHData: function (payload1,SEntity) {
		//   debugger;    
		   that = this;	    
		   that.fileUploader = that.getView().byId("UploadCollection");
		   oDataModel.create(SEntity, payload1, {
				async: true,
				success: function (oData, response) {
					// debugger;
					that.oPModel.setProperty("/setSubmitBusy", false);
					// that.ASNNo = oData.Asnno;
					// that.fileUploader.upload();
					if(that.oPModel.getProperty("/BtnEnable1") === true) {
					   var msg = "Quotation (" + oData.Supplierquotation + ") has been submitted";
					   	that.oPModel.setProperty("/SaveFragmentComment", "");
					    that.closeSaveFragment();
					} else {
					    var msg = "Quotation data saved";	
					}
					MessageBox.show(msg, {
						icon: MessageBox.Icon.SUCCESS,
						title: "SUCCESS",
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (oAction) {
							if (oAction === "OK") {
								that.oPModel.setProperty("/setSubmitBusy", false);
								var oModel = new JSONModel();
								that.getView().setModel(oModel, "iModel");
								
								that.navigateToView1();
							}
						}
					});
				},
				error: function (error) {
					//debugger;
					that.oPModel.setProperty("/setSubmitBusy", false);
					that.closeSaveFragment();
					MessageBox(JSON.parse(error.responseText).error.message.value);
					// that.showErrors(JSON.parse(error.responseText).error.innererror.errordetails);
				}
			});
		},
		
		onSelectionItem: function (oEvent) {
			// debugger;
			that = this;
            BusyIndicator.show(0);
			var data = oEvent.getSource().getSelectedItem().getBindingContext("iModel").getObject();
			var oTable = this.getView().byId("idItemsTable");
            var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			that.oPModel.setProperty("/inputEnable", that.oPModel.getProperty("/inputEnable"));
			that.oPModel.setProperty("/itemData", data);
			// that.oPModel.setProperty("/QuoQty",parseFloat(oTable.getItems()[itemIndex].getCells()[5].getValue()).toFixed(2));
			that.oPModel.setProperty("/QuoQty",data.Schedulelineorderquantity);
			that.oPModel.setProperty("/NetOrdAmt",parseFloat(oTable.getItems()[itemIndex].getCells()[7].getValue()).toFixed(2));
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("View3", {
				"QUO_NO": data.Supplierquotation,            
				"ITEM_NO": data.Supplierquotationitem
			});
		},
		
		onQuoChange: function(evt) {
			// debugger;
			var that = this;
			var oTable = that.getView().byId("idItemsTable");
        	var quovalue = parseFloat(evt.getParameters().value);
        	var index = Number(evt.getParameters().id.split("-")[4]);
        	var netValue = parseFloat(evt.getSource().getBindingContext("iModel").getObject().Netpriceamount);
        	var totalamount = (quovalue * netValue);
        	var condAmount = Number(totalamount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        	oTable.getItems()[index].getCells()[8].setNumber(condAmount);
		},
		
		onNetpriceChange: function(evt) {
			//  debugger;
			var that = this;
			var amtValue = "Y";
			var oTable1 = that.getView().byId("idItemsTable");
        	var Netvalue = parseFloat(evt.getParameters().value);
        	if(!Netvalue) {
        		Netvalue = 0;
        	}
        	var index = Number(evt.getParameters().id.split("-")[4]);
        	var QuoValue = parseFloat(evt.getSource().getBindingContext("iModel").getObject().Schedulelineorderquantity);
        	var totalAmount = (Netvalue * QuoValue);
        	var condAmt = Number(totalAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        	oTable1.getItems()[index].getCells()[8].setNumber(condAmt);
        	
        	if(that.oPModel.getProperty("/BtnEnable") === true) {
	        	var oItems = oTable1.getItems();
	        	for (var i = 0; i < oItems.length; i++) {
	        		var netAmount = parseFloat(oItems[i].getCells()[8].getNumber().replace(/,/g, ''));
		        	if(netAmount === 0) {
		        		amtValue = "";
		        	} 
	        	}
	        	if(amtValue === "Y") {
	        		that.oPModel.setProperty("/Enabled", true);
	        	} else {
	        		that.oPModel.setProperty("/Enabled", false);
	        	}
        	}
		},
		
		onSave: function () {
		    that = this;
			var payload1 = this.getView().getModel("iModel").getData();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "yyyy-MM-ddTHH:mm:ss"
                    });
            payload1.Creationdate = dateFormat.format(new Date(payload1.Creationdate));
            payload1.Paymentterms = that.getView().byId("id_payment").getValue();
            payload1.Netpaymentdays = that.getView().byId("id_Day").getValue();
            payload1.Incotermsversion = that.getView().byId("id_IncoVer").getValue();
            payload1.Incotermslocation1 = that.getView().byId("id_IncoLoc").getValue();
            payload1.Cashdiscount1percent = that.getView().byId("id_Disc1").getValue();
            payload1.Cashdiscount2percent = that.getView().byId("id_Disc2").getValue();
            payload1.Qtnlifecyclestatus = "01";
            delete payload1.__metadata;
			var aFinalItemsArr = [],aItemsArr = [];
			that.oTable = that.getView().byId("idItemsTable");
			var oItems = that.oTable.getItems();
			var selectItems = {};
			//debugger;
			for (var i = 0; i < oItems.length; i++) {
                selectItems = oItems[i].getBindingContext("iModel").getObject();
                if (selectItems.__metadata) delete selectItems.__metadata;
                if (selectItems.NavItemToPriceItem) delete selectItems.NavItemToPriceItem;
                
                if (selectItems.Creationdate) {
            	  selectItems.Creationdate = dateFormat.format(new Date(selectItems.Creationdate));
                }
                if (selectItems.Schedulelinedeliverydate) {
            	  selectItems.Schedulelinedeliverydate = dateFormat.format(new Date(selectItems.Schedulelinedeliverydate));
                }
                
                // selectItems.Schedulelineorderquantity = that.oTable.getItems()[i].getCells()[5].getValue();
                selectItems.Netpriceamount = that.oTable.getItems()[i].getCells()[7].getValue();
                selectItems.Netamount = parseFloat(that.oTable.getItems()[i].getCells()[8].getNumber().replace(/,/g, '')).toString();
                
                aFinalItemsArr.push(selectItems);
            }
            payload1.NavHeaderToItem = aFinalItemsArr;
          
            that._callHData(payload1,"/QuotationHeaderSet");
		}

	});
});