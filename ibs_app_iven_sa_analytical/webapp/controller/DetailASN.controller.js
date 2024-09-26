sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatterASN",
	"sap/ui/export/Spreadsheet"    
], function (Controller, History, JSONModel, MessageToast, Filter, FilterOperator, MessageBox, BusyIndicator, formatter, Spreadsheet) {
	"use strict";
    var context = null;
	var oView = null;
	var oRouter = null;
	var headerModel = null;
	var detailModel = null;
	var viewModel = null;
	var segBtnClicked = null;
	var comparisonArray = null;
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.DetailASN", {
        formatter: formatter,
		onInit: function () {
            //Global variable assigments
			debugger
			context = this;
			oView = context.getView();
			headerModel = new JSONModel();
			detailModel = new JSONModel();
			viewModel = new JSONModel();
			// context.odataModel = sap.ui.getCore().getModel("oDataModel");
			// context.getcsrf();
			// apply content density mode to root view
			// oView.addStyleClass(context.getOwnerComponent().getContentDensityClass());
			
			//get SAP model
			context.oOnPremSrvModel = context.getOwnerComponent().getModel("onPremService");
			
			oRouter = context.getOwnerComponent().getRouter();
			var getRoute = oRouter.getRoute("DetailASN");
			getRoute.attachPatternMatched(context._onObjectMatched, this);
		},
		
		_onObjectMatched: function (oEvent) {
			// debugger;
			 BusyIndicator.show(0);
			// get the URL arguements passed from main page
			// debugger;
			var sPoNumber = oEvent.getParameter("arguments").navValue;
			var sAsnNo = oEvent.getParameter("arguments").navAsn;
			context.oSelObject = com.ibs.ibsappivensaanalytical.oSelObject;
            com.ibs.ibsappivensaanalytical.ind2 = "X";
			// removes all previosly selected row in items table
			 context.oTable = oView.byId("idItemsTable");
			// context.oTable.removeSelections(true);
			// context.setViewModel();

			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("viewModel");
			this.oPModel.setProperty("/AttachURL", this.oPModel.getProperty("/AttachURL"));
			this.oPModel.setProperty("/SaveFragmentComment", "");
			this.oPModel.setProperty("/setSubmitBusy", null);
			this.oPModel.setProperty("/SubmitEdtable", null);
			this.oPModel.setProperty("/ShowSideContent", false);
			this.oPModel.setProperty("/btnEnable", false);
            var date = new Date();
			this.oPModel.setProperty("/minDate", date);
			if (this.oPModel.getProperty("/Table1Visible")) {
				context.readPOHeadSet(sPoNumber);
				this.oPModel.setProperty("/NoAttachText", "Click on the ‘Add’ button to attach files");
				this.oPModel.setProperty("/NoAttachDesc", "Use the 'Add' button to upload files");
			} else {
				context.readPOHeadSet1(sPoNumber,sAsnNo);
			    this.oPModel.setProperty("/ChangeButtonVisible", true);
			    this.oPModel.setProperty("/NoAttachText", "No files found.");
			    this.oPModel.setProperty("/NoAttachDesc", "There are no attached files!");
			}
			 context.readAttachments(sAsnNo);

			// headerModel.setData(context.oSelObject);
			// oView.setModel(headerModel, "headerModel");
		},
		
		readPOHeadSet: function (sPoNumber) {
			// debugger;
			var that = this;
			context.oOnPremSrvModel.read("/HeaderSet('" + sPoNumber + "')", {
			    urlParameters: {
					$expand: "NavHeaderToItem"
				},	
				success: function (data) {
					BusyIndicator.hide();
					 //console.log(data);
					detailModel.setData(data);
					oView.setModel(detailModel, "detailmodel");
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});
                    var shipPoDate = dateFormat.format(new Date());
                    that.shipPoDate1 = new Date(data.NavHeaderToItem.results[0].DeliveryDate);
                    // context.getView().byId("idShipdate").setValue(shipPoDate);
            
					context.onTablePress();
					// context.getView().setModel(new JSONModel(), "attachModel");
				},
				error: function (e) {
					BusyIndicator.hide();
					// MessageToast.show("Error while reading D header data");
				}
			});
		},
		readPOHeadSet1: function (sPoNumber,sAsnNo) {
			// debugger;                             
			context.oOnPremSrvModel.read("/AsnSubmitSet(PoNumber='" + sPoNumber + "',Asnno='" + sAsnNo + "')", {
				urlParameters: {
					$expand: "NavAsntoItem"
				},
				success: function (data) {
					BusyIndicator.hide();
					// console.log(data);
					detailModel.setData(data);
					oView.setModel(detailModel, "detailmodel");
					// context.onTablePress();
					 //context.getView().setModel(new JSONModel(), "attachModel");
				},
				error: function (e) {
					BusyIndicator.hide();
					// MessageToast.show("Error while reading D header data");
				}
			});
		},
		setViewModel: function () {
			var oViewObj = {
				"SaveFragmentComment": "",
				"setSubmitBusy": null,
				"SubmitEdtable": null
			};
			viewModel.setData(oViewObj);
			oView.setModel(viewModel, "viewModel");
		},
		
		onEstimateChange: function () {
			// debugger;
		    var that = this;
			var d = new Date();
			var d1 = new Date();
			var fromDate = this.getView().byId("idShipdate").getValue();
			var toDate = this.getView().byId("idEstmdate").getValue();
			d.setFullYear(fromDate.substring(0, 4), fromDate.substring(5, 7) - 1, fromDate.substring(8, 10));
			d1.setFullYear(toDate.substring(0, 4), toDate.substring(5, 7) - 1, toDate.substring(8, 10));
			if (!fromDate) {
				BusyIndicator.hide();
				that.getView().byId("idEstmdate").setValue("");
				return MessageBox.show("Please select 'Shipping Date' first",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			}
			if (d > d1) {
				BusyIndicator.hide();
				that.getView().byId("idEstmdate").setValue("");
				return MessageBox.show("'Estimated Delivery Date' should be greater than or equal to 'Shipping Date'",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			}
			// if (fromDate > toDate) {
			// 	that.getView().setBusy(false);
			// 	this.getView().byId("idEstmdate").setValue("");
			// 	return MessageBox.warning("'Estimated Delivery Date' cannot be greater than 'PO Delivery Date' ( "  +  dateFormat.format(that.shipPoDate1) + " )");
			// }
		},
		
		readAttachments: function (sAsnNo) {
			// var that = this;
			// this.oModel1 = this.getOwnerComponent().getModel("CloudXsOdata");
			var filter = new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, sAsnNo);
			// var filter1 = new sap.ui.model.Filter("DocumentId", sap.ui.model.FilterOperator.EQ, 'FOL38000000000004EXT46000000000023');
			this.oOnPremSrvModel.read("/ASNATTACHSet", {
				filters: [filter],
				success: function (Data) {
					// debugger;
					context.getView().setModel(new JSONModel(Data), "attachModel");
				},
				error: function (e) {
					MessageBox.show("Error while reading data",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				  });
				}
			});
		},
		
		onBack: function () {
			// debugger;
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.oPModel.setProperty("/EditDeleteBtnVisible", false);
			this.oPModel.setProperty("/ChangeButtonVisible", false);
			if(this.oPModel.getProperty("/Table1Visible")) {
				var oItems = context.oTable.getItems();
	            var chkAll = this.getView().byId("check").setSelected(false);
				for (var i = 0; i < oItems.length; i++) {
				  if(oItems[i].getCells()[0].getSelected() === true) { 
				  	oItems[i].getCells()[0].setSelected(false); 
				  } 
				}
			}
		    this.getView().setModel(new JSONModel([]), "detailmodel");
			this.getView().setModel(new JSONModel([]), "table4Data");
			if(this.oPModel.getProperty("/Table2Visible")) {
				context.oTable1 = oView.byId("idItemsTable1").getItems();
				for (var j = 0; j < context.oTable1.length; j++) {
				  if(context.oTable1[j].getCells()[2].getEditable() === true) { 
				  	context.oTable1[j].getCells()[2].setEditable(false); 
				  } 
				  if(context.oTable1[j].getCells()[8].getSelectedKey() === "U" || context.oTable1[j].getCells()[8].getSelectedKey() === "D") { 
				  	context.oTable1[j].getCells()[8].setSelectedKey("X");
				  } 
				}
			}
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("Page2", true);
			}
			this.oPModel.setProperty("/Packingid",""); 
	        context.getView().byId("idEstmdate").setValue(null);
	        context.getView().byId("idShipdate").setValue(null);
	        // this.oPModel.setProperty("/Carrname",""); 
	        this.oPModel.setProperty("/Trackingno","");
	        this.oPModel.setProperty("/btnEnable", false);	
		},
		
		onSelect: function (oEvent) {
			var oItem = oView.byId("idItemsTable").getItems();
			for (var i = 0; i < oItem.length; i++) {
				if(oItem[i].getCells()[0].getSelected(false)) {
					this.getView().byId("check").setSelected(false);
				}
				if(oItem[i].getCells()[0].getSelected(true)) {
					var sTick = "YES";
				}
			}
			if(sTick === "YES") {
				this.oPModel.setProperty("/btnEnable", true);
			} else {
				this.oPModel.setProperty("/btnEnable", false);	
			}
		},
		onSelectAll: function (oEvent) {
			var selectCheck = oEvent.getSource().getSelected();
			var oItems = oView.byId("idItemsTable").getItems();
			for (var i = 0; i < oItems.length; i++) {
			  if(selectCheck === true && (oItems[i].getCells()[10].getText() === "Pending" || oItems[i].getCells()[10].getText() === "Partially Delivered")) { 
			     oItems[i].getCells()[0].setSelected(true);
			     this.oPModel.setProperty("/btnEnable", true);
			  } else if(selectCheck === false && (oItems[i].getCells()[10].getText() === "Pending" || oItems[i].getCells()[10].getText() === "Partially Delivered")) { 
			     oItems[i].getCells()[0].setSelected(false);
			      this.oPModel.setProperty("/btnEnable", false);
			  } 
			}
		},
		
		onTablePress: function (oEvent) {
			// debugger;
			var that = this;
			BusyIndicator.show(0);
			var sPO, sPOItem;
			if (oEvent === undefined) {
				sPO = this.getView().getModel("detailmodel").getProperty("/PoNumber");
				sPOItem = this.getView().getModel("detailmodel").getProperty("/NavHeaderToItem/results/0/PoItem");
			} else {
				sPO = oEvent.getSource().getBindingContext("detailmodel").getObject().PoNumber;
				sPOItem = oEvent.getSource().getBindingContext("detailmodel").getObject().PoItem;
			}

			context.oOnPremSrvModel.read("/ItemSet(PoNumber='" + sPO + "',PoItem='" + sPOItem + "')/NavItemToConf", {
				success: function (Data) {
					// console.log(Data);
					BusyIndicator.hide();
					that.getView().setModel(new JSONModel(Data), "table4Data");
				},
				error: function (e) {
					BusyIndicator.hide();
					MessageToast.show(JSON.parse(e.responseText).error.message.value);
				}
			});
		},
		
		openSaveFragment: function () {
			 if (context.validation()) {
				if (!segBtnClicked && this.oPModel.getProperty("/EditDeleteBtnVisible")) {
					return MessageBox.show("No Change",{
					icon: MessageBox.Icon.WARNING,
					title: "WARNING",
					actions: sap.m.MessageBox.Action.OK,  
					emphasizedAction: sap.m.MessageBox.Action.OK
				 });
				} else {
					if (!context._saveFragment) {
						context._saveFragment = sap.ui.xmlfragment(
							"com.ibs.ibsappivensaanalytical.view.fragments.saveFragment",
							context
						);
						oView.addDependent(context._saveFragment);
					}

					this.oPModel.setProperty("/SubmitEdtable", true);
					context._saveFragment.open();
				}
			 }
		},
		closeSaveFragment: function () {
			this.oPModel.setProperty("/SaveFragmentComment", "");
			context._saveFragment.close();
		},
		
		onQtylivechange: function (oEvent) {
			// debugger;
			var sDelQtyInput = oEvent.getSource();
			var sPath = sDelQtyInput.getParent().getBindingContext("detailmodel").getPath();

			var sDelQtyVal = sDelQtyInput.getValue();
			var numTest = sDelQtyVal.match(/^[0-9]*$/);	
			if (!numTest) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please enter only Numbers");
				oEvent.getSource().setValue("");
				return;
			}
			sDelQtyVal = (sDelQtyVal !== "" && sDelQtyVal !== null && sDelQtyVal !== "NaN") ? parseFloat(sDelQtyVal.replace(/[^\d]/g, ''), 10) :
				parseFloat("0", 10);
			var oRowObject = sDelQtyInput.getParent().getBindingContext("detailmodel").getObject();
			if(this.oPModel.getProperty("/Table1Visible")) {
				var sPendingQtyVal = parseFloat(oRowObject.PendingQty, 10);
				if (sDelQtyVal > sPendingQtyVal) {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Delivery Qty cannot be greater than Pending Qty.");
					oEvent.getSource().setValue("");
				} else {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				}
			} else {
				var sPendingQtyVal = parseFloat(oRowObject.Poqty, 10);
				if (sDelQtyVal > sPendingQtyVal) {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Delivery Qty cannot be greater than PO Quantity.");
					oEvent.getSource().setValue("");
				} else {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				}
			}
		},
		validation: function () {
			//debugger;
			var bFlag = true;
			if(this.oPModel.getProperty("/Table1Visible")) {
				var sPackingid = oView.getModel("viewModel").getProperty("/Packingid");
				var sTrackingNo = oView.getModel("viewModel").getProperty("/Trackingno");
				// var sCarrname = oView.getModel("viewModel").getProperty("/Carrname");
				var sShippingdate = oView.getModel("viewModel").getProperty("/Shippingdate");
				var sEstimateddate = oView.getModel("viewModel").getProperty("/Estimateddate");
			
			// var aSelectedContext = context.oTable.getSelectedContexts();
			// var aSelectedContextLen = aSelectedContext.length;
            var oItems = context.oTable.getItems();
			for (var i = 0; i < oItems.length; i++) {
			  if(oItems[i].getCells()[0].getSelected() === true) { var tick = "Y"; } 
			  if(oItems[i].getCells()[4].getValue() === "") { var show = "N"; } 
			}

			// var bFlag = true;
			if (sPackingid === "" || sPackingid === undefined || sPackingid === null) {
				MessageBox.show("Please enter Packing Slip Id.",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
				bFlag = false;
			} else if (sTrackingNo === "" || sTrackingNo === undefined || sTrackingNo === null) {
				MessageBox.show("Please enter Tracking No.",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
				bFlag = false;
			} 
			// else if (sCarrname === "" || sCarrname === undefined || sCarrname === null) {
			// 	MessageToast.show("Please enter Carrier No.");
			// 	bFlag = false;
			// } 
			else if (sShippingdate === "" || sShippingdate === undefined || sShippingdate === null) {
				MessageBox.show("Please enter Shipping Date.",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
				bFlag = false;
			} else if (sEstimateddate === "" || sEstimateddate === undefined || sEstimateddate === null) {
				MessageBox.show("Please enter Estimated Date.",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
				bFlag = false;
			} 
			// else if (!(new Date(sEstimateddate) >= new Date(sShippingdate))) {
			// 	MessageToast.show("Estimated Date cannot be less than Shipping Date.");
			// 	bFlag = false;
			// } 
			else if (tick === undefined) {
				if (!this.oPModel.getProperty("/EditDeleteBtnVisible")) {
					MessageBox.show("Please select atleast one PO item.",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
					bFlag = false;
				}
			}
			else if (show === "N") {
				if (!this.oPModel.getProperty("/EditDeleteBtnVisible")) {
					MessageBox.show("Enter Delivery Qty for the line item",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
					bFlag = false;
				}
			}
			return bFlag;
		  }	else {
			  context.oTable1 = oView.byId("idItemsTable1");
			  var oItems = context.oTable1.getItems();
				for (var j = 0; j < oItems.length; j++) {
				  if(oItems[j].getCells()[2].getValue() === "") { var show = "N"; } 
				}
				if (show === "N") {
					MessageBox.show("Enter Delivery Qty for the line item",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
					bFlag = false;
				}
			    return bFlag;	
		  }
		},
		
		onSubmit: function () {
			if (this.oPModel.getProperty("/EditDeleteBtnVisible")) {
				this.onSubmitChanges();
			} else {
				this.onSubmitnew();
			}
		},
		
		onSubmitnew: function () {
			 //debugger;
			var that = this;
			context.title = "Save";
			this.oPModel.setProperty("/setSubmitBusy", true);
			oView.getModel("viewModel").setProperty("/SubmitEdtable", false);
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
            var carrName = this.oPModel.getProperty("/Carrname"); 
            if(carrName !== undefined ){
            	 carrName = this.oPModel.getProperty("/Carrname"); 
            } else {
                 carrName = "";
            }
            payload1.Packingid = this.oPModel.getProperty("/Packingid"); 
            payload1.Estimateddate = dateFormat.format(new Date(this.oPModel.getProperty("/Estimateddate")));
            payload1.Shippingdate = dateFormat.format(new Date(this.oPModel.getProperty("/Shippingdate")));
            payload1.Carrname = carrName; 
            payload1.Trackingno = this.oPModel.getProperty("/Trackingno"); 
           
            delete payload1.__metadata;
			// delete payload1.NavHeaderToItem;
			
			var aFinalItemsArr = [];
			context.oTable = oView.byId("idItemsTable");
			// var aSelectedContext = context.oTable.getSelectedContexts();
			// var iItemsLength = aSelectedContext.length;
			var oItems = context.oTable.getItems();
			var selectItems = {};
			for (var i = 0; i < oItems.length; i++) {
			  if(oItems[i].getCells()[0].getSelected() === true) {	
                selectItems = oItems[i].getBindingContext("detailmodel").getObject();
                if (selectItems.__metadata) delete selectItems.__metadata;
                if (selectItems.NavItemToConf) delete selectItems.NavItemToConf;
                
                if (selectItems.DeliveryDate) {
            	  selectItems.DeliveryDate = dateFormat.format(new Date(selectItems.DeliveryDate));
                }
	            if (selectItems.ConfQty.toString().length < 5) {
                  selectItems.ConfQty = selectItems.ConfQty + '.000';
                }
                if(selectItems.Status !== "" || selectItems.Status === "") {
                	selectItems.Status = "X";
                }
                aFinalItemsArr.push(selectItems);
			  } 
            }
            payload1.NavHeaderToItem = aFinalItemsArr;
            
            that._callHData(payload1,"/HeaderSet");
		},
		
		onSubmitChanges: function () {
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
            payload1.Status = "M";
               if(!payload1.Estimateddate) {
	               this.oPModel.setProperty("/setSubmitBusy", false);
	               that.closeMatDialog();
            	   return MessageBox.show("Estimated Date is missing",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
               }
               if(!payload1.Shippingdate) {
	               this.oPModel.setProperty("/setSubmitBusy", false);
	               that.closeMatDialog();
            	   return MessageBox.show("Shipping Date is missing",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
               }
			payload1.Shippingdate = dateFormat.format(oView.getModel("detailmodel").getProperty("/Shippingdate"));
			payload1.Estimateddate = dateFormat.format(oView.getModel("detailmodel").getProperty("/Estimateddate"));
			delete payload1.__metadata;
			
			var aFinalItemsArr = [];
			context.oTable = oView.byId("idItemsTable1");
			var oItems = context.oTable.getItems();
			var selectItems = {};
			for (var i = 0; i < oItems.length; i++) {
				selectItems = oItems[i].getBindingContext("detailmodel").getObject();
				if (selectItems.__metadata) delete selectItems.__metadata;
				var segBtn = oItems[i].getCells()[8];
				var sBtn = segBtn.getProperty("selectedKey");
				if(sBtn === "U") {
				  selectItems.Status = "U";	
				} else if(sBtn === "D") {
				  selectItems.Status = "D";		
				} else {
				  selectItems.Status = "";	
				}
				if (selectItems.Deliverydate) {
            	  selectItems.Deliverydate = dateFormat.format(new Date(selectItems.Deliverydate));
                }
                if (selectItems.Deliveryqty.toString().length < 5) {
                  selectItems.Deliveryqty = selectItems.Deliveryqty + '.000';
                }
                aFinalItemsArr.push(selectItems);
			}
			payload1.NavAsntoItem = aFinalItemsArr;
			
			that._callHData(payload1,"/AsnSubmitSet",context.title);
		},
		
		_callHData: function (payload1,SEntity) {
		  // debugger;
		   var that = this;	
		   this.fileUploader = that.getView().byId("UploadCollection");
		   context.oOnPremSrvModel.create(SEntity, payload1, {
				async: true,
				success: function (oData, response) {
					// debugger;
					that.oPModel.setProperty("/setSubmitBusy", false);
					context.ASNNo = oData.Asnno;
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

								//navto main page
								// var router = sap.ui.core.UIComponent.getRouterFor(that);
								// router.navTo("Main");
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
				if (data[i].code === "ASN/001") {
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
							"com.ibs.ibsappivensaanalytical.view.fragments.errorHandle",
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
			if (!this.dAction) {
				this.dAction = sap.ui.xmlfragment(
					"com.ibs.ibsappivensaanalytical.view.fragments.deleteFragment",
					this
				);
				this.getView().addDependent(this.dAction);
			}
		   this.dAction.open();	
		},
		closeDeleteFragment: function () {
			this.dAction.close();
			this.oPModel.setProperty("/DeleteFragmentComment", "");
		},
		onDeleteFrag: function () {
		//	debugger;
			if (!this.oPModel.getProperty("/DeleteFragmentComment")) {
				// this.dAction.close();
			   return MessageBox.show("Please enter comments.",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			} else {
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
	            if(!payload1.Estimateddate) {
	               this.oPModel.setProperty("/setSubmitBusy", false);
	               that.closeMatDialog();
            	   return MessageBox.show("Estimated Date is missing",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
               }
               if(!payload1.Shippingdate) {
	               this.oPModel.setProperty("/setSubmitBusy", false);
	               that.closeMatDialog();
            	   return MessageBox.show("Shipping Date is missing",{
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,  
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
               }
				payload1.Shippingdate = dateFormat.format(oView.getModel("detailmodel").getProperty("/Shippingdate"));
				payload1.Estimateddate = dateFormat.format(oView.getModel("detailmodel").getProperty("/Estimateddate"));
				delete payload1.__metadata;
				var aFinalItemsArr = [];
				context.oTable = oView.byId("idItemsTable1");
				var oItems = context.oTable.getItems();
				var selectItems = {};
				for (var i = 0; i < oItems.length; i++) {
					selectItems = oItems[i].getBindingContext("detailmodel").getObject();
					if (selectItems.__metadata) delete selectItems.__metadata;
					    selectItems.Status = "D";	
					if (selectItems.Deliverydate) {
	            	  selectItems.Deliverydate = dateFormat.format(new Date(selectItems.Deliverydate));
	                }
	                aFinalItemsArr.push(selectItems);
				}
				payload1.NavAsntoItem = aFinalItemsArr;
				
				that._callHData(payload1,"/AsnSubmitSet");
			}
		},
		onEditPress: function () {
			this.oPModel.setProperty("/EditDeleteBtnVisible", true);
			this.oPModel.setProperty("/ChangeButtonVisible", false);
		},
		
		onBeforeUploadStarts: function (oEvent) {
			// debugger;
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: context.ASNNo + "|" + oEvent.getParameter("fileName")
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
				that.odataModel._request({
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
					// debugger
					that.header_xcsrf_token = response.headers["x-csrf-token"];
				});
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
		
		// onTypeMissmatch: function (oEvent) {
		// 	debugger;
		// 	BusyIndicator.hide();
		// 	var fType = oEvent.getParameters().files[0].fileType;
		// 	if(fType !== "txt" && fType !== "jpg" && fType !== "docx" && fType !== "pdf" && fType !== "xlsx") {
		// 	     sap.m.MessageBox.show("File Type uploaded is not allowed",{
		// 			icon: MessageBox.Icon.ERROR,
		// 			title: "ERROR",
		// 			actions: sap.m.MessageBox.Action.CLOSE,  
		// 			emphasizedAction: sap.m.MessageBox.Action.CLOSE
		// 		});
		// 	} else {
		// 		this.onChangeA();
		// 	}
		// },
		
		onSegBtnSelChange: function (oEvent) {
		//	debugger;
			segBtnClicked = true;
			var aItems = oEvent.getSource().getParent().getParent().getItems();
			var oModel = oEvent.getSource().getBindingContext("detailmodel");
			var sItem = oModel.getPath();
			var sIndex = sItem.charAt(sItem.length - 1);
			if (oEvent.getSource().getSelectedKey() === "U") {
				aItems[sIndex].mAggregations.cells[2].setEditable(true);
			} else if (oEvent.getSource().getSelectedKey() === "D") {
				aItems[sIndex].mAggregations.cells[2].setEditable(false);
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