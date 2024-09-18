sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatterSES",
	"sap/ui/export/Spreadsheet"
], function (Controller, History, JSONModel, MessageToast, Filter, FilterOperator, MessageBox, BusyIndicator, formatter, Spreadsheet) {
	"use strict";
    var context = null;
	var oView = null;
	var oRouter = null;
	var headerModel = null;
	var detailModel = null;
	var viewModel = null;
	var selectedItem;
	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.SESPODetails", {
        formatter: formatter,
		onInit: function () {
             //Global variable assigments
			context = this;
			oView = context.getView();
			headerModel = new JSONModel();
			detailModel = new JSONModel();
			viewModel = new JSONModel();
			// context.odataModel = sap.ui.getCore().getModel("oDataModel");
			// context.getcsrf();
			// oView.addStyleClass(context.getOwnerComponent().getContentDensityClass());
			
			//get SAP model
			context.oOnPremSrvModel = context.getOwnerComponent().getModel("oDataModelSES");
			
			oRouter = context.getOwnerComponent().getRouter();
			var getRoute = oRouter.getRoute("SESPODetails");
			getRoute.attachPatternMatched(context._onObjectMatched, this);
		},
		
		_onObjectMatched: function (oEvent) {
			// debugger;
			BusyIndicator.show(0);
			// get the URL arguements passed from main page
			var sPoNumber = oEvent.getParameter("arguments").navValue;
			var sSesNo = oEvent.getParameter("arguments").navSes;
			context.oSelObject = com.ibs.ibsappivenpcanalytical.oSelObject;
			com.ibs.ibsappivenpcanalytical.ind2 = "X";
			context.oTable = oView.byId("idItemsTable");
			
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("viewModelSES");
			this.oPModel.setProperty("/AttachURL", this.oPModel.getProperty("/AttachURL"));
			this.oPModel.setProperty("/SaveFragmentComment", "");
			this.oPModel.setProperty("/setSubmitBusy", null);
			this.oPModel.setProperty("/SubmitEdtable", null);
			this.oPModel.setProperty("/ShowSideContent", false);
			this.oPModel.setProperty("/btnEnable", false);
			
			if (this.oPModel.getProperty("/Table1VisibleSES")) {
				context.readPOHeadSet(sPoNumber);
				this.oPModel.setProperty("/NoAttachText", "Click on the ‘Add’ button to attach files");
				this.oPModel.setProperty("/NoAttachDesc", "Use the 'Add' button to upload files");
				
				// this.oPModel.setProperty("/tableSelectModel", "None");
			} else {
				context.readPOHeadSet1(sPoNumber,sSesNo);
				this.oPModel.setProperty("/NoAttachText", "No files found.");
				this.oPModel.setProperty("/NoAttachDesc", "There are no attached files!");
			}
			context.readAttachments(sSesNo);
		},
		
		readPOHeadSet: function (sPoNumber) {
			// debugger;
			context.oOnPremSrvModel.read("/HeaderSet('" + sPoNumber + "')", {
			   urlParameters: {
					$expand: "NavHeaderToItem/NavItemToDetail"
				},	
				success: function (data) {
					BusyIndicator.hide();
					 //console.log(data);
					detailModel.setData(data);
					oView.setModel(detailModel, "detailmodel");
				},
				error: function (e) {
					BusyIndicator.hide();
					// MessageToast.show("Error while reading D header data");
				}
			});
		},
		readPOHeadSet1: function (sPoNumber,sSesNo) {
			// debugger;                             
			context.oOnPremSrvModel.read("/SESHeaderSet(PoNumber='" + sPoNumber + "',SesNo='" + sSesNo + "')", {
				urlParameters: {
					$expand: "NavSesToItem,NavSesToDetails"
				},
				success: function (data) {
					// debugger;
					BusyIndicator.hide();
					// console.log(data);
					detailModel.setData(data);
					oView.setModel(detailModel, "detailmodel");
				},
				error: function (e) {
					BusyIndicator.hide();
					// MessageToast.show("Error while reading D header data");
				}
			});
		},
		readAttachments: function (sSesNo) {
			// var that = this;
			// this.oModel1 = this.getOwnerComponent().getModel("CloudXsOdata");
			var filter = new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, sSesNo);
			// var filter1 = new sap.ui.model.Filter("DocumentId", sap.ui.model.FilterOperator.EQ, 'FOL38000000000004EXT46000000000023');
			this.oOnPremSrvModel.read("/SESATTACHSet", {
				filters: [filter],
				success: function (Data) {
					context.getView().setModel(new JSONModel(Data), "attachModel");
				},
				error: function (e) {
					MessageToast.show("Error while reading Attachment data");
				}
			});
		},
		showSrvLineItems: function (oEvent) {
			//debugger;
			var that = this;
			selectedItem = oEvent.getSource().getParent().getBindingContext("detailmodel").getObject();
			context.oTable = that.getView().byId("idProductsTable");
			var srvData = context.oTable.getItems();
			// || srvData[0].getCells()[0].getText() === selectedItem.PoItem
			if (srvData[0] === undefined) {
				this.abc = oEvent.getSource().getBindingContext("detailmodel").getObject().PoItem;
				context.oOnPremSrvModel.read("/ItemSet(PoNumber='" + context.oSelObject.PoNumber + "',PoItem='" + this.abc + "')/NavItemToDetail", {
					success: function (Data) {
						that.getView().setModel(new JSONModel(Data), "copyData");
					},
					error: function (e) {
						MessageToast.show(JSON.parse(e.responseText).error.message.value);
					}
				});
				if (!this.ViewSPO) {
					this.ViewSPO = sap.ui.xmlfragment(
						"com.ibs.ibsappivenpcanalytical.view.fragments.servicePO",this
					);
					this.getView().addDependent(this.ViewSPO);
				}
				this.ViewSPO.open();
			} else {
			     return	MessageBox.show("Another Material is already selected, do you want to clear previous selections?", {
			     	icon: MessageBox.Icon.WARNING,
			     	title: "WARNING",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction === "YES") {
							that.getView().setModel(new JSONModel([]), "servicePOData");
						}
					}
				});
			}
		},
		closeSrvPODialog: function () {
			this.ViewSPO.close();
		},
	   	onQtylivechange: function (oEvent) {
			// debugger;
			var sDelQtyInput = oEvent.getSource();
	
			var sDelQtyVal = sDelQtyInput.getValue();
			// sDelQtyVal = (sDelQtyVal !== "" && sDelQtyVal !== null && sDelQtyVal !== "NaN") ? parseFloat(sDelQtyVal.replace(/[^\d]/g, ''), 10) :
			// 	parseFloat("0", 10);
			sDelQtyVal = parseFloat(sDelQtyVal);
			context.oTable = context.getView().byId("idProductsTable");	
			var oRowObject = sDelQtyInput.getParent().getBindingContext("servicePOData").getObject();
			
			// var sPendingQtyVal = parseFloat(oRowObject.Quantity, 10);
			var sPendingQtyVal = parseFloat(oRowObject.Quantity);
			if (sDelQtyVal > sPendingQtyVal) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Posted Qty cannot be greater than Pending Qty.");
				oEvent.getSource().setValue("");
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},
		copyLineItems: function (oEvent) {
			// debugger;
			var that = this;
		    // BusyIndicator.show(0);
			context.oTable = sap.ui.getCore().byId("idProductsTable");
            var aSelectedContext = context.oTable.getSelectedContexts();
			var iItemsLength = aSelectedContext.length;
			var oItems = context.oTable.getSelectedItems();
			var selectItems = {},aItemsArr = [];
			if(iItemsLength === 0) {
				return MessageBox.show("Select line item",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			} else {
				for (var i = 0; i < oItems.length; i++) {
					selectItems = oItems[i].getBindingContext("copyData").getObject(); 
					aItemsArr.push(selectItems);
				}
				var oSelModel = new JSONModel(aItemsArr);
				// BusyIndicator.hide();
			    that.getView().setModel(oSelModel, "servicePOData");
			    this.closeSrvPODialog();
			    this.oPModel.setProperty("/btnEnable", true);
			}
		},
		openSaveFragment: function () {
			// debugger;
		    context.oTable = context.getView().byId("idProductsTable");
			var oItems = context.oTable.getItems();
			if(oItems.length === 0) {
				return MessageBox.show("Please add data in Service Entry Sheet",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			}
			for (var i = 0; i < oItems.length; i++) {
			  if(oItems[i].getCells()[3].getValue() === "") { var show = "N"; } 
			 }
			 if (show === "N") {
				return MessageBox.show("Please enter Posted Qty",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			 } else {
					if (!context._saveFragment) {
						context._saveFragment = sap.ui.xmlfragment(
							"com.ibs.ibsappivenpcanalytical.view.fragments.saveFragment",
							context
						);
						oView.addDependent(context._saveFragment);
					}
				context._saveFragment.open();
			 }
		},
		closeSaveFragment: function () {
			context._saveFragment.close();
			this.oPModel.setProperty("/SaveFragmentComment", "");
		},
		
		onSubmitSave: function () {
		//	debugger;
			var that = this;
			context.title = "Save";
			this.oPModel.setProperty("/setSubmitBusy", true);
			var payload1 = this.getView().getModel("detailmodel").getData();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "yyyy-MM-ddTHH:mm:ss"
                    });
            payload1.PoDate = dateFormat.format(new Date(payload1.PoDate));
            var cmnts = this.oPModel.getProperty("/SaveFragmentComment");
                if(cmnts !== undefined ){
                	 cmnts = this.oPModel.getProperty("/SaveFragmentComment");
                } else {
                     cmnts = "";
                }
            payload1.Message = cmnts; 
            payload1.Status = "C";  
            delete payload1.__metadata;
            
            context.oTable = sap.ui.getCore().byId("idProductsTable");
			var oItems = context.oTable.getModel("servicePOData").getData();
			var selectItems = {},aFinalItemsArr = [];
			for (var i = 0; i < oItems.length; i++) {
				selectItems = oItems[i];
				if (selectItems.__metadata) delete selectItems.__metadata;
				if (selectItems.PendingQty.toString().length < 5) {
                  selectItems.PendingQty = selectItems.PendingQty + '.000';
                }
               aFinalItemsArr.push(selectItems);
			}
            // var oTable1 = oView.byId("idItemsTable");
			// var oItems1 = oTable1.getItems();
			  var selectItems1 = {},SArray = [];
			// for (var j = 0; j < oItems1.length; j++) {
				 //selectItems1 = oItems1[j].getBindingContext("detailmodel").getObject();
				 selectItems1 = selectedItem;
				 if (selectItems1.__metadata) delete selectItems1.__metadata;
				 //if (selectItems1.NavItemToDetail) delete selectItems1.NavItemToDetail;
				 
				 if (selectItems1.DeliveryDate) {
            	  selectItems1.DeliveryDate = dateFormat.format(new Date(selectItems1.DeliveryDate));
                }
                
                selectItems1.NavItemToDetail = aFinalItemsArr;
                
                SArray.push(selectItems1);
			// }
			payload1.NavHeaderToItem = SArray;
		    that._callHData(payload1,"/HeaderSet");
		},
		
		_callHData: function (payload1,SEntity) {
		  // debugger;
		   var that = this;	
		   context.fileUploader = that.getView().byId("UploadCollection");
		   context.oOnPremSrvModel.create(SEntity, payload1, {
				async: true,
				success: function (oData, response) {
					 //debugger;
					that.oPModel.setProperty("/setSubmitBusy", false);
					 context.SESNo = oData.SesNo;
					 context.fileUploader.upload();
					var msg = oData.Message;
					that.closeMatDialog();
					MessageBox.show(msg, {
						icon: MessageBox.Icon.SUCCESS,
						title: "SUCCESS",
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (oAction) {
							if (oAction === "OK") {
								that.oPModel.setProperty("/setSubmitBusy", false);
								//clear models on detail page
								var oModel = new JSONModel();
								that.getView().setModel(oModel, "detailmodel");
								that.onBack();
							}
						}
					});
				},
				error: function (error) {
					// debugger;
					that.oPModel.setProperty("/setSubmitBusy", false);
					that.closeMatDialog();
					that.showErrors(JSON.parse(error.responseText).error.innererror.errordetails);
				}
			});
		},
		showErrors: function (data) {
			var that = this;
			var aMockMessages = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].code === "SES/001") {
					var obj = {
						type: "Error",
						message: data[i].message
					};
					aMockMessages.push(obj);
				} else if (data[i].code === "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
					var oModel = new JSONModel();
					oModel.setData(aMockMessages);
					that.getView().setModel(oModel, "errorhandler");
					if (!this.eAction) {
						this.eAction = sap.ui.xmlfragment(
							"com.ibs.ibsappivenpcanalytical.view.fragments.errorHandleSES",
							this
						);
						this.getView().addDependent(this.eAction);
					}
					this.oPModel.setProperty("/dialogTitle",data[i].message);
					this.oPModel.setProperty("/dialogState", "Error");
					this.eAction.open();
				}
			}
		},
		closeErrorDialog: function () {
			var that = this;
			this.eAction.close();
	        that.onBack();
		},
		onDelete: function () {
			context.oTable = oView.byId("idItemsTable1");
            var aSelectedContext = context.oTable.getSelectedContexts();
			var iItemsLength = aSelectedContext.length;
			if(iItemsLength === 0) {
				BusyIndicator.hide();
				return MessageBox.show("Select atleast one line item",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			} else {
				if (!this.dAction) {
					this.dAction = sap.ui.xmlfragment(
						"com.ibs.ibsappivenpcanalytical.view.fragments.deleteFragment",
						this
					);
					this.getView().addDependent(this.dAction);
				}
			   this.dAction.open();	
			}
		},
		closeDeleteFragment: function () {
			this.dAction.close();
			this.oPModel.setProperty("/DeleteFragmentComment", "");
		},
		onDeleteFrag: function () {
			if (!this.oPModel.getProperty("/DeleteFragmentComment")) {
				// this.dAction.close();
			   return MessageBox.show("Please enter comments",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			} else {
				// debugger;
				context.title = "Dlt";
				var that = this;
				this.oPModel.setProperty("/setSubmitBusy", true);
				var payload1 = this.getView().getModel("detailmodel").getData();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
	                        pattern: "yyyy-MM-ddTHH:mm:ss"
	                    });
	            payload1.PoDate = dateFormat.format(new Date(payload1.PoDate));
	            payload1.Message = this.oPModel.getProperty("/DeleteFragmentComment");
	            payload1.Status = "D";
	            delete payload1.__metadata;
	            var aFinalItemsArr = [];
				context.oTable = oView.byId("idItemsTable1");
				var oItems = context.oTable.getSelectedItems();
				var selectItems = {};
				for (var i = 0; i < oItems.length; i++) {
					selectItems = oItems[i].getBindingContext("detailmodel").getObject();
					if (selectItems.__metadata) delete selectItems.__metadata;
					
					if (selectItems.DeliveryDate) {
	            	  selectItems.DeliveryDate = dateFormat.format(new Date(selectItems.DeliveryDate));
	                }
	                aFinalItemsArr.push(selectItems);
				}
				payload1.NavSesToItem = aFinalItemsArr;
				
				that._callHData(payload1,"/SESHeaderSet");
			}
		},
		
		onFileSizeExceed: function (oEvent) {
			BusyIndicator.hide();
			sap.m.MessageBox.show("File Size Exceeded the 5MB limit",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
		},
		onFilenameLengthExceed: function (oEvent) {
			BusyIndicator.hide();
			sap.m.MessageBox.show("Filename Length Exceeded the 150 characters limit",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
		},
			
        onBack: function () {
        	var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setModel(new JSONModel([]), "detailmodel");
			this.getView().setModel(new JSONModel([]), "servicePOData");
			this.oPModel.setProperty("/btnEnable", false);
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("SESPOList", true);
			}
		},
		
		onBeforeUploadStarts: function (oEvent) {
			// var that = this;
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: context.SESNo + "|" + oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},
		onUploadComplete: function (oEvent) {

		},
		onChangeA: function (oEvent) {
			// debugger;
			if(oEvent) {
				var oUploadCollection = oEvent.getSource();
			} else {
				var oUploadCollection = this.getView().byId("UploadCollection");
			}
			// Header Token
			// if (this.header_xcsrf_token) {
				// var that = this;
				var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
					name: "x-csrf-token",
					value: context.oOnPremSrvModel.oHeaders["x-csrf-token"]
				});
				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			// }
		},
		getcsrf: function () {
			// Get CSRF token
			var that = this;
			if (!this.header_xcsrf_token) {
				//var model = this.getView().getModel();
				var oServiceUrl = context.odataModel.sServiceUrl;
				//var that = this;
				//sap.ui.core.BusyIndicator.show(0);
				this.odataModel._request({
					requestUri: oServiceUrl,
					method: "GET",
					headers: {
						"X-Requested-With": "XMLHttpRequest",
						"Content-Type": "application/atom+xml",
						"DataServiceVersion": "2.0",
						"X-CSRF-Token": "Fetch"
					}
				}, function (data, response) {
					//sap.ui.core.BusyIndicator.hide();
					that.header_xcsrf_token = response.headers["x-csrf-token"];
				});
			}
		},
		
		closeMatDialog: function () {
			if(context.title === "Save") {
				context._saveFragment.close();
				BusyIndicator.hide();
				this.oPModel.setProperty("/SaveFragmentComment", "");
			} else {
				context.dAction.close();
				BusyIndicator.hide();
			    this.oPModel.setProperty("/DeleteFragmentComment", "");
			}
		}
	});
});