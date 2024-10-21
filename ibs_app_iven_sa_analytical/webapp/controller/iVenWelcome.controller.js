sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller,JSONModel,Filter,FilterOperator) {   
	"use strict";
	let that;
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.iVenWelcome", {
		onInit: function () {
			that=this;
			that.oDataAppSaInfoModel = this.getOwnerComponent().getModel("appSaInfo")
			let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
			let appPath = appId.replaceAll(".", "/");
			that.appModulePath = jQuery.sap.getModulePath(appPath);
			that._getAppWelcomeImage();
			let oRouter=this.getOwnerComponent().getRouter().getRoute("iVenWelcome")     
            oRouter.attachPatternMatched(that._onObjectWelcomeMatched)
		},
		_onObjectWelcomeMatched:function(oEvent){
			that._getAppWelcomeImage();
		},
		_getAppWelcomeImage:function(){
			let oList = that.oDataAppSaInfoModel.bindList("/MasterIvenSAInfo",undefined,[],[
			  new Filter("APP_CODE", FilterOperator.Contains, "IVEN_WLC")   
			],{});   
			oList.requestContexts().then((odata) => { 
				  let aWelcomeApps = [],i=0; 
				  odata.forEach(element => {     
					aWelcomeApps.push(element.getObject()); 
				  }); 
				  for(i in aWelcomeApps){          
					aWelcomeApps[i].LOGO_URL=that.appModulePath+aWelcomeApps[i].LOGO_URL         
				  }
				  let oWelcomePage=new JSONModel(aWelcomeApps)            
				  that.getView().setModel(oWelcomePage,"appWelcomePage")    
			}); 
		  },
	});

});