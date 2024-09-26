// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ],
// function (Controller) {
//     "use strict";

//     return Controller.extend("com.ibs.ibsappivenpcinvsubmit.controller.View1", {
//         onInit: function () {

//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "com/ibs/ibsappivensaanalytical/model/formatterNPOInvCreate",
    "sap/m/PDFViewer",
    "sap/ui/core/BusyIndicator"
  ],
    function (Controller, jQuery, JSONModel, MessageToast, Filter, FilterOperator, MessageBox, ColumnListItem,
      Input, formatter, PDFViewer, BusyIndicator) {
      "use strict";
      var that;
      var appModulePath;  
      var context;
  
      return Controller.extend("com.ibs.ibsappivensaanalytical.controller.pc_inv_submit.View1", {
        formatter: formatter,
        onInit: function () {
          // debugger
          context = this;
          that = this;
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          appModulePath = jQuery.sap.getModulePath(appPath);
          this.cloudService = this.getOwnerComponent().getModel();
          that._getUserID();
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
        },
  
        _onRouteMatched: function (oEvent) {
  
          var g = this.getView().getParent().getParent();
          g.toBeginColumnPage(this.getView());
          this.readHeaderInfo();
          // this.readAttachmentData();
        },
  
        readHeaderInfo: function () {
          // debugger
          BusyIndicator.show();
          var url = appModulePath + "/odata/v4/doc-info-ext/HeaderSet?$expand=TO_ATTACHMENT($select=INVOICE_NO,INVOICE_DATE)";
          $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            success: function (oData, response) {
  
              BusyIndicator.hide();
              for (var i = 0; i < oData.value.length; i++) {
                oData.value[i].PO_FILE_NO = String(oData.value[i].PO_FILE_NO);
              }
              var oModel = new JSONModel();
              oModel.setData(oData);
              that.getOwnerComponent().setModel(oModel, "headerModel");
              that.statusCount(oData.value);
            },
            error: function (error) {
              BusyIndicator.hide();
              var oXMLMsg, oXML;
              if (context.isValidJsonString(error.responseText)) {
                oXML = JSON.parse(error.responseText);
                oXMLMsg = oXML.error["message"];
              } else {
                oXMLMsg = error.responseText;
              }
              MessageBox.error(oXMLMsg);
            }
          });
        },
  
        isValidJsonString: function (sDataString) {
          var value = null;
          var oArrObj = null;
          var sErrorMessage = "";
          try {
            if (sDataString === null || sDataString === "" || sDataString === undefined) {
              throw "No data found.";
            }
            value = JSON.parse(sDataString);
            if (toString.call(value) === '[object Object]' && Object.keys(value).length > 0) {
              return true;
            } else {
              throw "Error";
            }
          } catch (errorMsg) {
            if (errorMsg === "No data found.") {
              sErrorMessage = errorMsg;
            } else {
              sErrorMessage = "Invalid JSON data."
            }
            return false;
          }
          return true;
        },
  
        _getUserID: function () {
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);
          var attr = appModulePath + "/user-api/attributes";    
  
          // that._sUserName = "Sanjay Shah And Associates";
          // that._sUserID = "sanjayshah@testmail.com";
          // that._sCode = "8300894";
  
          // var oModel = new JSONModel({
          //   userId: that._sUserID,
          //   userName: that._sUserName,
          //   code: that._sCode
          // });
          // context.getOwnerComponent().setModel(oModel, "userAttriJson");
  
          return new Promise(function (resolve, reject) {
            $.ajax({
              url: attr,
              type: 'GET',
              contentType: 'application/json',
              success: function (data, response) {
              
                that._sUserName = data.firstname;
                that._sUserID = data.email.toLowerCase().trim();
                that._sCode = data.name;
  
                var oModel = new JSONModel({
                  userId: that._sUserID,
                  userName: that._sUserName,
                  code: that._sCode       
                });
                context.getOwnerComponent().setModel(oModel, "userAttriJson");
              },
              error: function (oError) {
                MessageBox.error("Error while reading User Attributes");
              }
            });
          });   
        },
  
        onCreate: function (oEvent) {
          BusyIndicator.show(0);
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("createView");
        },
  
        onFilterSelect: function (oEvent) {
          var aFilters = []
          var liveData = oEvent.getParameter("key");
          if (liveData) {
            if (liveData === "all") { liveData = ""; }
            var oFilter = new sap.ui.model.Filter([
              new sap.ui.model.Filter("STATUS", sap.ui.model.FilterOperator.Contains, liveData)
            ], false);
            aFilters.push(oFilter);
          }
          this.getView().byId("productsTable").getBinding("items").filter(aFilters);
  
          this.byId("id_search").setValue("");
        },
  
        onSearch: function (oEvent) {
          var aFilters = []
          var liveData = oEvent.getSource().getProperty('value');
          if (liveData) {
            var oFilter = new sap.ui.model.Filter([
              new sap.ui.model.Filter("PO_FILE_NO", sap.ui.model.FilterOperator.Contains, liveData),
              new sap.ui.model.Filter("TO_ATTACHMENT/INVOICE_NO", sap.ui.model.FilterOperator.Contains, liveData)
            ], false);
            aFilters.push(oFilter);
          }
          this.getView().byId("productsTable").getBinding("items").filter(aFilters);
        },
  
        readAttachmentData: function (oEvent) {
          sap.ui.core.BusyIndicator.show();
          var amodel = new JSONModel();
          var oList = this.getOwnerComponent().getModel("oDataDocInfoExt").bindList("/ATTACHMENT", undefined, [], [], {
            $expand: "TO_HEADER"
          });
          oList.requestContexts().then((odata) => {
  
            var data = [];
            odata.forEach(element => {
              data.push(element.getObject());
  
            });
            amodel.setData(data);
            this.getView().setModel(amodel, "AttachmentData");
            this.statusCount(data);
            sap.ui.core.BusyIndicator.hide();
          });
  
        },
  
        statusCount: function (tempData) {
          var count1 = 0, count2 = 0, count3 = 0, count4 = 0;
          for (var i = 0; i < tempData.length; i++) {
            if (tempData[i].STATUS === "PENDING") {
              count1 += 1;
            } else if (tempData[i].STATUS === "PROCESSED") {
              count2 += 1;
            } else if (tempData[i].STATUS === "APPROVE") {
              count3 += 1;
            } else if (tempData[i].STATUS === "REJECT") {
              count4 += 1;
            }
          }
  
          var countData = new JSONModel();
          this.getView().setModel(countData, "CountData");
          this.getView().getModel("CountData").setProperty("/count1", count1);
          this.getView().getModel("CountData").setProperty("/count2", count2);
          this.getView().getModel("CountData").setProperty("/count3", count3);
          this.getView().getModel("CountData").setProperty("/count4", count4);
          this.getView().getModel("CountData").setProperty("/AllData", tempData.length);
  
        },
  
        onListItemPress: function (oEvent) {
          var status = oEvent.getSource().getSelectedItem().getBindingContext("headerModel").getObject().STATUS;
          if (status !== "PENDING") {
            BusyIndicator.show(0);
            var oPO_FILE_NO = oEvent.getSource().getSelectedItem().getBindingContext("headerModel").getObject().PO_FILE_NO;
            oPO_FILE_NO = Number(oPO_FILE_NO);
            this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("DetailPage", {
              "PO_FILE_NO": oPO_FILE_NO,
            });
          } else {
            MessageBox.information("The request is in process");
            return;
          }
        },
      });
    });
  