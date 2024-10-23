sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller,JSONModel,Filter,FilterOperator) {   
	"use strict";
	let that;  
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.Help", {   
		onInit: function () {
			that=this;
			that.oDataAppSaInfoModel = this.getOwnerComponent().getModel("appSaInfo")
			let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
			let appPath = appId.replaceAll(".", "/");
			that.appModulePath = jQuery.sap.getModulePath(appPath);
			that._getAppUserManual();
			let oRouter=this.getOwnerComponent().getRouter().getRoute("iVenHelp")     
            oRouter.attachPatternMatched(that._onObjectHelpMatched)
		},
		_onObjectHelpMatched:function(oEvent){
			that._getAppUserManual();
		},
		_getAppUserManual:function(){
			let oList = that.oDataAppSaInfoModel.bindList("/MasterIvenSAInfo",undefined,[],[
			  new Filter("APP_CODE", FilterOperator.Contains, "IVEN_HLP")   
			],{});   
			oList.requestContexts().then((odata) => { 
				  let aHelpApps = [],i=0; 
				  odata.forEach(element => {     
					aHelpApps.push(element.getObject());    
				  }); 
				  for(i in aHelpApps){          
					aHelpApps[i].LOGO_URL=that.appModulePath+aHelpApps[i].LOGO_URL         
				  }
				  let oHelpPDF=new JSONModel(aHelpApps)            
				  that.getView().setModel(oHelpPDF,"appUserManual")    
			}); 
		}
	});

});