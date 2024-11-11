sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/HTML"
], function (Controller,JSONModel,Filter,FilterOperator,HTML) {   
	"use strict";
	let that;
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.iVenWelcome", {
		onInit: function () {
			that=this;
			that.oDataAppSaInfoModel = this.getOwnerComponent().getModel("appSaInfo")
			let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
			let appPath = appId.replaceAll(".", "/");
			that.appModulePath = jQuery.sap.getModulePath(appPath);
			// that._getAppWelcomeImage();
			let oRouter=this.getOwnerComponent().getRouter().getRoute("iVenWelcome")     
            oRouter.attachPatternMatched(that._onObjectWelcomeMatched)
		},
		_onObjectWelcomeMatched:function(oEvent){
			that._getAppWelcomeImage();
		},
		_getAppWelcomeImage:function(){
			let oCarousel=that.getView().byId("idCarousel")
			if(oCarousel.getPages().length){
				oCarousel.destroyPages()
			}
			
			let oList = that.oDataAppSaInfoModel.bindList("/MasterIvenSAInfo",undefined,[],[
			  new Filter("APP_CODE", FilterOperator.Contains, "WLC")   
			],{});   
			oList.requestContexts().then((odata) => { 
				  let aWelcomeApps = [],i=0,oCarouselContent; 
				  odata.forEach(element => {     
					aWelcomeApps.push(element.getObject()); 
				  }); 
				  for(i in aWelcomeApps){          
					aWelcomeApps[i].LOGO_URL=that.appModulePath+aWelcomeApps[i].LOGO_URL 
					oCarouselContent=that._loadImage(aWelcomeApps[i].LOGO_URL);
					if(aWelcomeApps[i].LOGO_TYPE=='text/html')
						oCarouselContent=that._loadIframe(aWelcomeApps[i].LOGO_URL);   
					oCarousel.addPage(oCarouselContent);              
				  }
				  let oWelcomePage=new JSONModel(aWelcomeApps)                     
				  that.getView().setModel(oWelcomePage,"appWelcomePage")       
			}); 
		},
		_loadIframe:function(logoURL){   
			let sIframeContent = "<iframe x-frame-options='ALLOWALL' height='100%' width='100%' src='"+logoURL+"'></iframe>" 
			let oHtmlControl = new sap.ui.core.HTML({
				content: sIframeContent 
			});
			return oHtmlControl;
		},
		_loadImage:function(logoURL){ 
			let oImageControl = new sap.m.Image({
				densityAware:true,
				width:"auto",
				height:"auto",
				src:logoURL
			});
			return oImageControl;
		}
	});

});