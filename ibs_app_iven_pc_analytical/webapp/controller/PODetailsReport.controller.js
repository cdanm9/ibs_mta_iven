sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"../model/formatter",  
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/ui/core/BusyIndicator'   
], function (Controller, MessageToast, JSONModel, MessageBox, formatter, MessagePopover, MessageItem, BusyIndicator) {
	"use strict";

	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.PODetailsReport", {   
        formatter: formatter,
		onInit: function () {
            	// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//get SAP model
			this.oModel = this.getOwnerComponent().getModel("oDataModelPOService");

			var oRouter = this.getOwnerComponent().getRouter().getRoute("PODetailsReport");     
			oRouter.attachPatternMatched(this.handleRouteMatched, this);
		},
		
		handleRouteMatched: function (oEvent) {
			BusyIndicator.show(0);
			var that = this;
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");

			this.oPModel.setProperty("/Ebeln", oEvent.getParameter("arguments").objectId);
			this.oPModel.setProperty("/PO_Status", oEvent.getParameter("arguments").objectStatus);
			this.oPModel.setProperty("/POPageTitle", "Order: " + oEvent.getParameter("arguments").objectId);
			this.oPModel.setProperty("/setSubmitBusy", null);
            com.ibs.ibsappivenpcanalytical.ind2 = "X";  
			//read SAP data for getting PO details
			this.oModel.read("/HeaderSet('" + this.oPModel.getProperty("/Ebeln") + "')", {
				//expanding line items ans corresponding service line items
				urlParameters: {
					$expand: "NavHeaderToItem,NavHeaderToComment"
				},
				success: function (Data) {
					// debugger;
					// console.log(Data);
					BusyIndicator.hide();
					
					//set model to detail page
					var oHeaderModel = new JSONModel(Data);
					that.getView().setModel(oHeaderModel, "hData");
					
					var abc = Data.NavHeaderToItem.results[0].PoItem;
					 that.oModel.read("/ItemSet(PoNumber='" + that.oPModel.getProperty("/Ebeln") + "',PoItem='" + abc + "')/NavConfirmSet", {
						success: function (Data) {
							that.getView().setModel(new JSONModel(Data), "table4Data");
						},
						error: function (e) {}
					});
					//GRN Details fetch
					var filter = [];
					
					//correct filter
					 filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, that.oPModel.getProperty("/Ebeln")));
					 filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, abc));
					 
					//test filter
					 //filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ,"4200000226"));
					 //filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, "00030"));
					 
					 that.oModel.read("/GRNDetailsSet", {
					 	filters:[filter],
						success: function (Data) {
							console.log(Data);
							// debugger;
							that.getView().setModel(new JSONModel(Data), "GoodReceiptSet");
						},
						error: function (e) {
							// debugger;
						}
					});
					
					//Invoice Details fetch
					var filter = [];
					
					//correct filter
					 filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, that.oPModel.getProperty("/Ebeln")));
					 filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, abc));
					 
					//test filter
					 //filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ,"4200000216"));
					 //filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, "00030"));
					 
					 that.oModel.read("/InvoiceDetailsSet", {
					 	filters:[filter],
						success: function (Data) {
							console.log(Data);
							// debugger;
							that.getView().setModel(new JSONModel(Data), "invoiceDetails");
						},
						error: function (e) {
							// debugger;
						}
					});
				//	read event logs
					that.readTimeline();
				//  read Attachments
				    that.readAttachments();	
				},
				error: function (Error) {
					//debugger;
					BusyIndicator.hide();
					// MessageToast.show(JSON.parse(Error.responseText).error.message.value);
				}
			});
		
		},
		readTimeline: function () {
			var that = this;
			// this.oModel = this.getOwnerComponent().getModel("CloudXsOdata");
			var filter = new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, this.oPModel.getProperty("/Ebeln"));
			this.oModel.read("/CommentSet", {
				filters: [filter],
				success: function (Data) {
				    //console.log(Data);
					that.getView().setModel(new JSONModel(Data), "tData");
				},
				error: function (e) {
					MessageBox.show(JSON.parse(e.responseText).error.message.value,{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				  });
				}
			});
		},
		readAttachments: function () {
			var that = this;
			var filter = new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, this.oPModel.getProperty("/Ebeln"));
			this.oModel.read("/AttachmentSet", {
				filters: [filter],
				success: function (Data) {
				    //console.log(Data);
					that.getView().setModel(new JSONModel(Data), "attachData");
				},
				error: function (e) {
					MessageBox.show(JSON.parse(e.responseText).error.message.value,{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				  });
				}
			});
		},
		
		onTablePress: function (oEvent) {
			//debugger;
			var that = this;
			BusyIndicator.show(0);
			this.abc = oEvent.getSource().getBindingContext("hData").getObject().PoItem;
			this.oModel.read("/ItemSet(PoNumber='" + this.oPModel.getProperty("/Ebeln") + "',PoItem='" + this.abc + "')/NavConfirmSet", {
				success: function (Data) {
					//debugger;
					//console.log(Data);
					BusyIndicator.hide();
					that.getView().setModel(new JSONModel(Data), "table4Data");
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
			//GRN Details update
			var filter = [];
					//correct filter
					 filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, this.oPModel.getProperty("/Ebeln")));
					 filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, this.abc));
					 
					 
					//test filter
					 //filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ,"4200000226"));
					 //filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, "00030"));
					 
					 
					 
					 that.oModel.read("/GRNDetailsSet", {
					 	filters:[filter],
						success: function (Data) {
							console.log(Data);
							// debugger;
							that.getView().setModel(new JSONModel(Data), "GoodReceiptSet");
						},
						error: function (e) {
							// debugger;
						}
					});
				//Invoice Details fetails
					var filter = [];
					
					//correct filter
					 filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, this.oPModel.getProperty("/Ebeln")));
					 filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, this.abc));
					 
					//test filter
					 //filter.push( new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ,"4200000216"));
					 //filter.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, "00030"));
					 
					 that.oModel.read("/InvoiceDetailsSet", {
					 	filters:[filter],
						success: function (Data) {
							console.log(Data);
							// debugger;
							that.getView().setModel(new JSONModel(Data), "invoiceDetails");
						},
						error: function (e) {
							// debugger;
						}
					});
			
		},
		
		showServiceItem: function (oEvent) {
			//debugger;
			var that = this;
			this.abc = oEvent.getSource().getBindingContext("hData").getObject().PoItem;
			this.oModel.read("/ItemSet(PoNumber='" + this.oPModel.getProperty("/Ebeln") + "',PoItem='" + this.abc + "')/NavSESDetailsSet", {
				success: function (Data) {
					that.getView().setModel(new JSONModel(Data), "servicePOData");
				},
				error: function (e) {
					MessageBox.show(JSON.parse(e.responseText).error.message.value,{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				  });
				}
			});
			if (!this.ViewSPO) {
				this.ViewSPO = sap.ui.xmlfragment(      
					"com.ibs.ibsappivenpcanalytical.view.fragments.servicePO1",this
				);      
				this.getView().addDependent(this.ViewSPO);
			}
			this.ViewSPO.open();
		},
		closeSPODialog: function () {
			this.ViewSPO.close();
		},
		onBackNav: function () {
			var that = this;
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("po_report");    
			this.handleSideContentHide();
		    that.getView().setModel(new JSONModel(), "table4Data");	
		},
		handleEvents: function () {
			this.byId("DynamicSideContent").setShowSideContent(true);
		},
		handleSideContentHide: function () {
			this.byId("DynamicSideContent").setShowSideContent(false);
		},
	});
});