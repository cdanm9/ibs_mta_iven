sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
    'sap/ui/export/library',
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/library",
    "sap/ui/core/ValueState",
	'sap/ui/core/BusyIndicator',
	"sap/ui/core/Component"
], function (Controller, JSONModel, Filter, MessageToast, Sorter, MessageBox, exportLibrary, Spreadsheet, library, ValueState, BusyIndicator,Component) {
	"use strict";
    let that;    
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.iVenMaster", {   
		onInit: function () { 
			that=this; 
            that._oOwnerComponent=that.getOwnerComponent();
			that._oAppViewModel=that._oOwnerComponent.getModel("alAppView");  
            let oRouter=that._oOwnerComponent.getRouter().getRoute("iVenMaster")   
            oRouter.attachPatternMatched(that._onObjectMatched)
		},
        _onObjectMatched: function(oEvent){   
			let oPage = that.getView().byId("idIvenMasterPage"),sUrl,oAppViewModel;
			if(oPage.getContent().length)
				oPage.destroyContent(oPage.getContent())  
			oAppViewModel=that.getOwnerComponent().getModel("alAppView")  
			sUrl=oAppViewModel.getProperty("/S_APP_URL")
			if(!sUrl)   
				sUrl=oAppViewModel.getProperty("/APP_URL")   
			let oHTMLContent = new sap.ui.core.HTML({
				content: "<iframe x-frame-options='ALLOWALL' id='idiFrameiVen' height='100%' width='100%' src='"+sUrl+"'></iframe>"      
			});   
			oPage.addContent(oHTMLContent);     
			let oOwnerComponent=that.getOwnerComponent();
			let oRouter=oOwnerComponent.getRouter().navTo("Default");  
			
        }
	});
});
