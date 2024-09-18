sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime info for the device the UI5 app is running on as JSONModel
         */
		createAppDetailsModel:function(){
			var oAppDetails = {
				UserFullName:"",
				UserInitials:"",   
				AppList: [
					{
						AppKey: "Page1",
						AppText: "Order Dashboard",
						AppIcon:"sap-icon://monitor-payments"     
					},
					{
						AppKey: "invcreation",
						AppText: "Invoice Creation",
						AppIcon:"sap-icon://create-form",   
						SubApps: [    
							{
								AppKey: "invcreation",
								AppText: "Invoice Creation",   
								AppIcon:"sap-icon://create-form"
							},
							{
								AppKey: "InvCreationAI",
								AppText: "Invoice Creation AI",   
								AppIcon:"sap-icon://customer-and-supplier"       
							},
							{
								AppKey: "RouteView1",   
								AppText: "Non PO Invoice Creation",
								AppIcon: "sap-icon://document-text"   
							}
						]
					},
					{
						AppKey: "OrderConfirmation",
						AppText: "Order Confirmation",
						AppIcon:"sap-icon://complete",   
						SubApps: [    
							{
								AppKey: "Master",
								AppText: "PO Confirmation",
								AppIcon:"sap-icon://employee"
							},   
							{
								AppKey: "SchedAgreement",
								AppText: "Scheduler Agreement",
								AppIcon:"sap-icon://customer-order-entry"
							}
						]   
					},
					
					{
						AppKey: "prcOrderReport",
						AppText: "Order Reports",   
						AppIcon:"sap-icon://business-objects-experience",
						SubApps: [    
							{ AppKey: "invoice_payment_rpt", AppText: "Invoice Payment Report",AppIcon:"sap-icon://payment-approval" },
							{ AppKey: "pc_grn_fiori_rept", AppText: "GRN Report",AppIcon:"sap-icon://course-book" },
							{ AppKey: "po_report", AppText: "Purchase Order Report",AppIcon:"sap-icon://sales-document" },  
							{ AppKey: "po_report_byr", AppText: "Purchase Order Report Buyer",AppIcon:"sap-icon://supplier" },
							{ AppKey: "potoinvoice_fiori_rept", AppText: "PO To Invoice Fiori Report" ,AppIcon:"sap-icon://document-text"},
							{ AppKey: "po_status_report", AppText: "PO Status Report(Beta Version)" ,AppIcon:"sap-icon://supplier"},
						]
					},
					{
						AppKey: "prcOrderBuyer",
						AppText: "Order Buyer",   
						AppIcon:"sap-icon://customer",
						SubApps: [     
							{ AppKey: "po_report_byr", AppText: "Purchase Order Report Buyer",AppIcon:"sap-icon://supplier" }
						]
					},
					{
						AppKey: "Quotation",    
						AppText: "Quotation",      
						AppIcon:"sap-icon://sales-quote",  
						SubApps: [        
							{
								AppKey: "RFQCreation",
								AppText: "RFQ Creation",
								AppIcon:"sap-icon://create-form"
							}
						]
					},
					{
						AppKey: "ServiceOrder",
						AppText: "Service Order",
						AppIcon:"sap-icon://activate",  
						SubApps:[{
							AppKey: "SESPOList",
							AppText: "SES Creation",
							AppIcon:"sap-icon://create-entry-time"  
						}]
					},
					{
						AppKey: "Shipping",
						AppText: "Shipping",
						AppIcon:"sap-icon://shipping-status",  
						SubApps:[{   
								AppKey: "Page2",
								AppText: "ASN Creation",   
								AppIcon:"sap-icon://add-document"
							}]
					}
				]
			};
			var oModel = new JSONModel(oAppDetails);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
		},
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        createPropertyModel: function () {
			var oPropertyModel = {
				"iconTabFilterSelected": "Pending",
				"statusVisible": true,
				"tableTitle": "Orders",
				"fragDatePickerValue": new Date(),
				"servicePO": false,
				"editCheck": false,
				"btnEnable": false,
				"inputEnable": false,//RFQ Creation App
				"BtnEnable1": false,//RFQ Creation App
				"BtnEnable": false,  //RFQ Creation App  
				"fieldEnable": true //Scheduler Agreement    
			};
			var oModel = new JSONModel(oPropertyModel);
			return oModel;
		},

        createPropertyModelASN: function () {
			var oPropertyModelASN = {
				"mainTableCount": 0,
				"iconTabFilterSelected": "Open",
				"EditDeleteBtnVisible": false,
				"ChangeButtonVisible":false,
				"btnEnable": false
			};
			var oModel = new JSONModel(oPropertyModelASN);
			return oModel;
		},

		createPropertyModelSES: function () {
			var oPropertyModelSES = {
				"mainTableCount": 0,
				"iconTabFilterSelected": "Pending",
				"btnEnable": false
			};
			var oModel = new JSONModel(oPropertyModelSES);
			return oModel;
		},

		createPropertyModelInvCreation: function () {
            // debugger;
			var oPropertyModelInvCreation = {
				"iconTabFilterSelected": "Open",
				"statusVisible": true,
				"tableTitle": "Invoices",
				"fragDatePickerValue": new Date(),
				"servicePO": false,
				"editCheck": false,
				"btnEnable": false
			};
			var oModel = new JSONModel(oPropertyModelInvCreation);
			return oModel;
		}
    };

});