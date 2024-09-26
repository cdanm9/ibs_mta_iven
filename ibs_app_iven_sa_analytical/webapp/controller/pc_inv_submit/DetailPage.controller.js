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
      var header_id, appModulePath, context, oModel, model, oPO_FILE_NO, that;
  
      return Controller.extend("com.ibs.ibsappivensaanalytical.controller.pc_inv_submit.DetailPage", {
        formatter: formatter,
        onInit: function () {
          context = this;
          that = this;
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("DetailPage").attachPatternMatched(this._onRouteMatched, this);
        },
  
        _onRouteMatched: function (oEvent) {
          oPO_FILE_NO = oEvent.getParameters().arguments.PO_FILE_NO;
          oPO_FILE_NO = Number(oPO_FILE_NO);
          oModel = this.getOwnerComponent().getModel("oDataDocInfoExt");  
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          appModulePath = jQuery.sap.getModulePath(appPath);
          context.getView().byId("pdfViewer").setVisible(false);
          context.getView().byId("onclose").setVisible(false);
          this.readHeaderInfo(oPO_FILE_NO);
          // this.readHeader(header_id);
        },
  
        editdata: function (oEvent) {
  
          context = this;
  
          context.byId("tablerowvisible").setVisible(false);
          context.byId("tablerowvisible1").setVisible(true);
          // context.byId("tablerowvisible").setVisible(false);
          //context.getView().byId("six").setEditable(true);
          //context.getView().byId("one").setEditable(true);
          context.getView().byId("two").setEditable(true);
          context.getView().byId("three").setEditable(true);
          context.getView().byId("four").setEditable(true);
          context.getView().byId("five").setEditable(true);
  
          // context.byId("tablerowvisible1").setVisible(true);
          context.byId("editbtn").setVisible(false);
          context.byId("onSave").setVisible(true);
          context.byId("cancel").setVisible(true);
        },
  
        readHeaderInfo: function (oPO_FILE_NO) {
  
          var url = appModulePath + "/odata/v4/doc-info-ext/HeaderSet?$filter=(PO_FILE_NO eq " + oPO_FILE_NO + ")&$expand=TO_LINEITEM";
          $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            success: function (oData, response) {
              ;
              BusyIndicator.hide();
              var oModel = new JSONModel();
              oModel.setData(oData);
              that.getOwnerComponent().setModel(oModel, "headerLineItems");
              that.getView().byId("tablerowvisible").setVisibleRowCount(oData.value[0].TO_LINEITEM.length);
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
  
        readHeader: function (header_id) {
          context = this;
          sap.ui.core.BusyIndicator.show();
          // sap.ui.core.BusyIndicator.show();
          var myJSONModel1 = new JSONModel();
          var sEntity = "/HeaderSet";
          var oFilters = [];
          oFilters.push(new Filter("FILE_ID", sap.ui.model.FilterOperator.EQ, header_id));   
          var oList = this.getOwnerComponent().getModel("oDataDocInfoExt").bindList(sEntity, undefined, [], oFilters, {
            $expand: "TO_LINEITEM"
          });
          oList.requestContexts().then((odata) => {
  
            var data = [];
            odata.forEach(element => {
              data.push(element.getObject());
  
            });
            myJSONModel1.setData(data);
            context.getView().setModel(myJSONModel1, "HeaderData");
            sap.ui.core.BusyIndicator.hide();
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
  
        onGeneratePDFPress: function () {
         
          BusyIndicator.show(0);
          var oFileId = that.getOwnerComponent().getModel("headerLineItems").getData().value[0].FILE_ID;
          context.byId("tablerowvisible").setVisible(true);
          var sEntity = "/ATTACHMENT";
          var oFilters = [];
          oFilters.push(new sap.ui.model.Filter("FILE_ID", sap.ui.model.FilterOperator.EQ, oFileId));
          var pdf = this.getOwnerComponent().getModel("oDataDocInfoExt").bindList(sEntity, undefined, [], oFilters);
  
          pdf.requestContexts().then((odata) => {
            var data = [];
            odata.forEach(element => {
              data.push(element.getObject());
  
            });
            var base64EncodedPDF = data[0].FILE_CONTENT;
            var contentType = "application/pdf";
            var decodedPdfContent = atob(base64EncodedPDF);
            var blob = that.b64toBlob(decodedPdfContent, contentType);
            var _pdfurl = URL.createObjectURL(blob);
  
            jQuery.sap.addUrlWhitelist("blob");
            var myJSONModel2 = new JSONModel({
              Source: _pdfurl,
              Title: "",
              Height: "800px"
            });
            context.getView().setModel(myJSONModel2, "atfile");
            context.getView().byId("pdfViewer").setVisible(true);
            context.getView().byId("onclose").setVisible(true);
            BusyIndicator.hide();
          });
          
        },
        OnClosePdf: function () {
          context.getView().byId("pdfViewer").setVisible(false);
          context.getView().byId("onclose").setVisible(false);
        },
  
        b64toBlob: function (b64Data, contentType) {
          contentType = contentType || '';
          var byteCharacters = atob(b64Data);
          var byteArrays = [];
          var sliceSize = 512; // Define slice size here
          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          var blob = new Blob(byteArrays, {
            type: contentType
          });
          return blob;
        },
  
        toggleFullScreen: function () {
  
          var bFullScreen = this.getView().getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
          this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
          if (!bFullScreen) {
            this.getView().getModel("appView").setProperty("/previousLayout", this.getView().getModel("appView").getProperty("/layout"));
            this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
          } else {
            this.getView().getModel("appView").setProperty("/layout", this.getView().getModel("appView").getProperty("/previousLayout"));
          }
        },
  
        onCloseDetailPress: function () {
  
          this.getView().getModel("appView").setProperty("/layout", "OneColumn");
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteView1");
        },
        onCancel: function (oEvent) {
          context.byId("tablerowvisible").setVisible(true);
          context.byId("tablerowvisible1").setVisible(false);
  
          //context.getView().byId("six").setEditable(false);
          //context.getView().byId("one").setEditable(false);
          context.getView().byId("two").setEditable(false);
          context.getView().byId("three").setEditable(false);
          context.getView().byId("four").setEditable(false);
          context.getView().byId("five").setEditable(false);
  
          context.byId("editbtn").setVisible(true);
          context.byId("onSave").setVisible(false);
          context.byId("cancel").setVisible(false);
        },
        Ondescription: function (oEvent) {
          
  
          var index = oEvent.getSource().getParent().getIndex();
          var input = oEvent.getSource();
          var value = input.getValue();
          //var inputIndex = input.getParent().getIndex(input);
          var oInput = oEvent.getSource();
          var sColumnId = oInput.getId();
          var columnname = sColumnId.split('--')[2].split('-')[0];
          model = this.getView().getModel("HeaderData").getData();
          model[0].TO_LINEITEM[index][columnname] = value
  
  
        },
        OnSave: function () {
          
          context = this;
          context.getView().getModel("HeaderData").setData(model);
  
          context.byId("tablerowvisible").setVisible(true);
          context.byId("tablerowvisible1").setVisible(false);
          context.byId("editbtn").setVisible(true);
          context.byId("onSave").setVisible(false);
          context.byId("cancel").setVisible(false);
  
  
          //context.getView().byId("six").setEditable(false);
          //context.getView().byId("one").setEditable(false);
          context.getView().byId("two").setEditable(false);
          context.getView().byId("three").setEditable(false);
          context.getView().byId("four").setEditable(false);
          context.getView().byId("five").setEditable(false);
  
          // var lineItemArr = [];
          // var itemiddata = context.getView().getModel("attachFileLine").getData();
          // var lineItem = this.getView().getModel("TableModel").getData();
  
  
        },
  
        OnApprove: function () {
          ;
          sap.ui.core.BusyIndicator.show();
          context = this;
          //FILE_ID = context.getView().byId("one").getValue();
          var GROSSAMOUNT = context.getView().byId("two").getValue();
          var CURRENCYCODE = context.getView().byId("three").getValue();
          var DOCUMENTDATE = context.getView().byId("four").getValue();
          var DOCUMENTNUMBER = context.getView().byId("five").getValue();
          //PURCHASEORDERNUMBER = context.getView().byId("six").getValue();
  
          // var date = new Date(DOCUMENTDATE);
          // var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          //   pattern: "yyyy-MM-ddTHH:mm:ss"
          // });
          // var fdateFormatted = dateFormat.format(date);
          var lineitems = this.getView().getModel("HeaderData").getData()[0].TO_LINEITEM;
  
          for (var i = 0; i < lineitems.length; i++) {
            lineitems[i].HEADERID = Number(lineitems[i].HEADERID);
            lineitems[i].ITEMID = Number(lineitems[i].ITEMID);
            lineitems[i].NETAMOUNT = Number(lineitems[i].NETAMOUNT);
            lineitems[i].QUANTITY = Number(lineitems[i].QUANTITY);
            lineitems[i].UNITPRICE = Number(lineitems[i].UNITPRICE);
  
          }
  
          var payload = {
            "ACTION": "UPDATE",
            "DOC_HEADER": {
              "HEADERID": this.getView().getModel("HeaderData").getData()[0].HEADERID,
              "FILE_ID": header_id,
              "GROSSAMOUNT": Number(GROSSAMOUNT),
              "CURRENCYCODE": CURRENCYCODE,
              "DOCUMENTDATE": DOCUMENTDATE,
              "DOCUMENTNUMBER": DOCUMENTNUMBER,
              "PURCHASEORDERNUMBER": this.getView().getModel("HeaderData").getData()[0].PURCHASEORDERNUMBER,
              "STATUS": "APPROVE"
            },
            "DOC_LINEITEMS": lineitems,
            "ATTACHMENT": {}
          };
  
          // var ContextBinding = oModel.bindContext("/POUpdate(...)"); // AddBook is the Action Name
          // ContextBinding.setParameter("payload", payload) // input is the payload value
          // ContextBinding.execute().then(
          //   function () {
          //     
          //     MessageBox.success("Your request is Approved");
          //     //this.readEntity();             // Calling read function to refresh data
          //   }.bind(this), function (oError) {
          //     
          //     MessageBox.error("Error while approving: ", oError);
          //   });
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          appModulePath = jQuery.sap.getModulePath(appPath);
          var path = appModulePath + "/odata/v4/doc-info-ext/POUpdate";
  
          $.ajax({
            url: path,
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.success("Your Order has been Approved", {
                actions: [MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
  
                  if (sAction === "OK") {
                    // context.getView().byId("one").setEditable(false),
                    context.getView().byId("two").setEditable(false),
                      context.getView().byId("three").setEditable(false),
                      context.getView().byId("four").setEditable(false),
                      context.getView().byId("five").setEditable(false),
                      // context.getView().byId("six").setEditable(false),
  
                      context.byId("tablerowvisible").setVisible(true);
                    context.byId("tablerowvisible1").setVisible(false);
                    sap.ui.core.BusyIndicator.show();
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(context);
                    oRouter.navTo("RouteMasterPage");
                    context.getView().getModel("appView").setProperty("/layout", "OneColumn");
  
                  }
                }
              });
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error while Approving the Order")
            }
  
          })
  
        },
  
        OnReject: function () {
          ;
          sap.ui.core.BusyIndicator.show();
          context = this;
          //FILE_ID = context.getView().byId("one").getValue();
          var GROSSAMOUNT = context.getView().byId("two").getValue();
          var CURRENCYCODE = context.getView().byId("three").getValue();
          var DOCUMENTDATE = context.getView().byId("four").getValue();
          var DOCUMENTNUMBER = context.getView().byId("five").getValue();
          //PURCHASEORDERNUMBER = context.getView().byId("six").getValue();
  
          // var date = new Date(DOCUMENTDATE);
          // var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          //   pattern: "yyyy-MM-ddTHH:mm:ss"
          // });
          // var fdateFormatted = dateFormat.format(date);
          var lineitems = this.getView().getModel("HeaderData").getData()[0].TO_LINEITEM;
  
          for (var i = 0; i < lineitems.length; i++) {
            lineitems[i].HEADERID = Number(lineitems[i].HEADERID);
            lineitems[i].ITEMID = Number(lineitems[i].ITEMID);
            lineitems[i].NETAMOUNT = Number(lineitems[i].NETAMOUNT);
            lineitems[i].QUANTITY = Number(lineitems[i].QUANTITY);
            lineitems[i].UNITPRICE = Number(lineitems[i].UNITPRICE);
  
          }
  
          var payload = {
            "ACTION": "UPDATE",
            "DOC_HEADER": {
              "HEADERID": this.getView().getModel("HeaderData").getData()[0].HEADERID,
              "FILE_ID": header_id,
              "GROSSAMOUNT": Number(GROSSAMOUNT),
              "CURRENCYCODE": CURRENCYCODE,
              "DOCUMENTDATE": DOCUMENTDATE,
              "DOCUMENTNUMBER": DOCUMENTNUMBER,
              "PURCHASEORDERNUMBER": this.getView().getModel("HeaderData").getData()[0].PURCHASEORDERNUMBER,
              "STATUS": "REJECT"
            },
            "DOC_LINEITEMS": lineitems,
            "ATTACHMENT": {}
          };
  
          // var ContextBinding = oModel.bindContext("/POUpdate(...)"); // AddBook is the Action Name
          // ContextBinding.setParameter("payload", payload) // input is the payload value
          // ContextBinding.execute().then(
          //   function () {
          //     
          //     MessageBox.success("Your request is Approved");
          //     //this.readEntity();             // Calling read function to refresh data
          //   }.bind(this), function (oError) {
          //     
          //     MessageBox.error("Error while approving: ", oError);
          //   });
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          appModulePath = jQuery.sap.getModulePath(appPath);
          var path = appModulePath + "/odata/v4/doc-info-ext/POUpdate";
  
          $.ajax({
            url: path,
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.success("Your Order has been Rejected", {
                actions: [MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
  
                  if (sAction === "OK") {
                    //context.getView().byId("one").setEditable(false),
                    context.getView().byId("two").setEditable(false),
                      context.getView().byId("three").setEditable(false),
                      context.getView().byId("four").setEditable(false),
                      context.getView().byId("five").setEditable(false),
                      // context.getView().byId("six").setEditable(false),
  
                      context.byId("tablerowvisible").setVisible(true);
                    context.byId("tablerowvisible1").setVisible(false);
                    sap.ui.core.BusyIndicator.show();
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(context);
                    oRouter.navTo("RouteMasterPage");
                    context.getView().getModel("appView").setProperty("/layout", "OneColumn");
                  }
                }
              });
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error while Rejecting the Order")
            }
  
          })
  
        },
  
        // RowSelector : function(oEvent){
        //   ;
        //   context.getView().byId("deleteaction").setVisible(true);
  
        //   var oTable = oEvent.getSource(); 
        //   var aSelectedIndices = oTable.getSelectedIndices();
  
        //   for(var i=0; i<aSelectedIndices.length; i++){
        //     oTable.getModel("HeaderData").getProperty("/results/"+aSelectedIndices[i]+"")
        //   }
        // }
  
      });
    });
  