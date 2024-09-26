// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.ibsappivenpcinvsubmit.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );

  sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel"
    ],
    function (BaseController, JSONModel) {   
      "use strict";
      var appModulePath;
  
      return BaseController.extend("com.ibs.ibsappivensaanalytical.controller.pc_inv_submit.NPOInvCreate", {   
        onInit: function () {
       
          var oViewModel;
  
          oViewModel = new JSONModel({
            layout: "OneColumn",
            previousLayout: "",
            actionButtonsInfo: {
              midColumn: {
                fullScreen: false
              }
            }
          });
          this.getView().setModel(oViewModel, "appView");
  
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          appModulePath = jQuery.sap.getModulePath(appPath);   
  
          // var oRouter = this.getOwnerComponent().getRouter().getRoute("RouteApp");
          // oRouter.attachPatternMatched(this.handleRouteMatched, this);
  
          // this.handleRouteMatched();    
        },
  
        getRouter: function () {
          return sap.ui.core.UIComponent.getRouterFor(this);
        },   
        
        handleRouteMatched: function (oEvent) {   
          // debugger
          var that = this;
          var oCloud = true;
          var oPremise = true;
          var url = appModulePath + "/odata/v4/addtional-process/checkServiceAvailability(cloudSrv=" + oCloud + ",onPremiseSrv=" + oPremise + ")";
          // that.getRouter().navTo("RouteServiceMsg");
          $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            success: function (data, response) {
              if(oCloud === true && oPremise === true && data.value[0].cloudSrv !== null && data.value[0].onPremiseSrv !== null) {
                that.getRouter().navTo("RouteView1");
              }
              else if(oCloud === true && oPremise === false && data.value[0].cloudSrv !== null) {
                that.getRouter().navTo("RouteView1");
              }
              else if(oCloud === false && oPremise === true && data.value[0].onPremiseSrv !== null) {
                that.getRouter().navTo("RouteView1");
              }
              else {
                that.getRouter().navTo("ServiceMsg");
              }
            },
            error: function (oError) {
              that.getRouter().navTo("ServiceMsg");
            }
          });
          // that.getRouter().navTo("RouteView1");
        }
      });
    }
  );
  
  