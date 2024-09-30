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
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.POStatusReportFE", {
		onInit: function () { 
			that=this; 
			let oIdPOStatRptFEComCont=that.getView().byId("idPOStatusReportFEComponentCont")
			Component.create({    
				usage:"POStatusReportFEComponent",
				name: "com.ibs.ibsappivenpostatusreportfe",    
				settings: {}, 
				componentData: {}, 
				async: true, 
				manifest: true})     
			.then(function (oComponent) { 
				oIdPOStatRptFEComCont.setComponent(oComponent); 
			})
			.catch(function (oError) { 
				console.error(oError);
			});    
		}
	});
});

