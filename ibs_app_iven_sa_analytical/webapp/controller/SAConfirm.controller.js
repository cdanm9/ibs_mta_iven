sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatter",
	"sap/ui/core/routing/History"
], function (Controller, MessageToast, JSONModel, MessageBox, BusyIndicator, formatter, History) {
	"use strict";

	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.SAConfirm", {
        formatter: formatter,
		onInit: function () {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
            //get SAP model
			this.oModel = this.getOwnerComponent().getModel("oDataModel2");
			var oRouter = this.getOwnerComponent().getRouter().getRoute("SAConfirm");
			oRouter.attachPatternMatched(this.handleRouteMatched1, this);
		},
		
		handleRouteMatched1: function (oEvent) {
			// debugger;
			var that = this;
			BusyIndicator.show(0);
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");
			this.oPModel.setProperty("/Ebeln", oEvent.getParameter("arguments").objectId);
			
			that.data = that.getOwnerComponent().getModel("hData").getData();
			var oPrevModel = new JSONModel(that.data);
			that.getView().setModel(oPrevModel, "headerModel");
			
			//read SAP data for getting PO details
			that.oModel.read("/S_HEADERSet('" + this.oPModel.getProperty("/Ebeln") + "')/Confirmnav", {
				success: function (Data) {
					// debugger;
					BusyIndicator.hide();
					//set model to detail page
					that.oDetailModel = new JSONModel(Data);
					that.getView().setModel(that.oDetailModel, "detailModel");
					  //that.detailModel.setData(Data);
				},
				error: function (Error) {
					// debugger;
					BusyIndicator.hide();
					MessageToast.show(JSON.parse(Error.responseText).error.message.value);
				}
			});
		},
		
		onQuanPress: function (e) {
			// debugger;
			var that = this;
			if (!this.QuantFrag) {
				this.QuantFrag = sap.ui.xmlfragment("com.ibs.ibsappivensaanalytical.view.fragments.SAReqQtyFrag", this);
				this.getView().addDependent(this.QuantFrag);
			}
			var sPath = e.getSource().getBindingContext("detailModel").getPath();
			var data = that.detailModel.getProperty(sPath);
            that.oModel.read("/S_LINEITEMSSet('" + data.Schedule_No + "')", {
				success: function (Data) {
					//debugger;
					BusyIndicator.hide();
					//set model to detail page
					that.oQtyModel = new JSONModel(Data);
					that.getView().setModel(that.oQtyModel, "itemModel");
				},
				error: function (Error) {
					//debugger;
					BusyIndicator.hide();
					MessageToast.show(JSON.parse(Error.responseText).error.message.value);
				}
			});
			

			this.QuantFrag.openBy(e.getSource());
		},
		
		onSubPress: function () {
			// debugger;
			var that = this;
			var flag = true;
			BusyIndicator.show(0);
			var payload1 = that.getView().getModel("hData").getData();
			// var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
   //                     pattern: "yyyy-MM-ddTHH:mm:ss"
   //                 });
            delete payload1.__metadata;  
            delete payload1.Sitemnav;
            var aFinalItemsArr = [];
			that.oTable = that.getView().byId("tableConf");
			var aSelectedContext = that.oTable.getSelectedContexts();
			var iItemsLength = aSelectedContext.length;
			if(iItemsLength === 0) {
				BusyIndicator.hide();
            	return MessageBox.error("Please select line item");
            }
			var selectItems;
			for (var i = 0; i < aSelectedContext.length; i++) {
				  	selectItems = aSelectedContext[i].getModel("detailModel").getData();
	                if (selectItems.results[i].__metadata) delete selectItems.results[i].__metadata;
	                if (selectItems.results[i].Date === "" || !selectItems.results[i].Date) {
	                	flag = false;
	                }
	                // aFinalItemsArr.push(selectItems);
              }
              if(flag === false) {
              	BusyIndicator.hide();
            	return MessageBox.error("Please select 'Confirm Date' for the selected line item");
              }
            
            payload1.Confirmnav = selectItems;
            
            that._callHData(payload1,"/S_HEADERSet");
		},
		
		_callHData: function (payload1,SEntity) {
		   //debugger;
		   var that = this;	
		   that.oModel.create(SEntity, payload1, {
				async: true,
				success: function (oData, response) {
					// debugger;
					BusyIndicator.hide();
					var msg = "Agreement (" + that.oPModel.getProperty("/Ebeln") + ") is confirmed successfully.";
					MessageBox.show(msg, {
						icon: MessageBox.Icon.SUCCESS,
						title: "SUCCESS",
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (oAction) {
							if (oAction === "OK") {
								BusyIndicator.hide();
								//clear models on detail page
								
                                that.getView().setModel(new JSONModel([]), "detailModel");
								//navto main page
								var router = sap.ui.core.UIComponent.getRouterFor(that);
								router.navTo("POEntries");
								// that.onBack();
							}
						}
					});
				},
				error: function (error) {
					// debugger;
					BusyIndicator.hide();
					MessageBox.error(error.responseText);
				}
			});
		},
		
		onBack: function () {
			this.getView().setModel(new JSONModel([]), "detailModel");
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("PODetails", {
				"objectId": this.oPModel.getProperty("/Ebeln")
			});
		}

	});
});