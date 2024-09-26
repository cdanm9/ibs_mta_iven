sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatterInvCreation",
	"sap/ui/export/Spreadsheet"
], function (Controller, History, JSONModel, MessageToast, Filter, FilterOperator, MessageBox, BusyIndicator, formatter, Spreadsheet) {
	"use strict";
	var counter = 0;
	var context = null;
	var oView = null;
	var oRouter = null;
	var headerModel = null;
	var detailModel = null;
	var viewModel = null;
	var selectedItem;
	var vendorAmt=[];
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.Invoice_Detail", {
		formatter: formatter,
		onInit: function () {
			// debugger
			context = this;
			oView = context.getView();
			headerModel = new JSONModel();
			detailModel = new JSONModel();
			viewModel = new JSONModel();

			oView.addStyleClass(context.getOwnerComponent().getContentDensityClass());

			//get SAP model
			context.oOnPremSrvModel = context.getOwnerComponent().getModel("oDataModelInvCreation");

			oRouter = context.getOwnerComponent().getRouter();
			var getRoute = oRouter.getRoute("Invoice_Detail");
			getRoute.attachPatternMatched(context._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
            // debugger
			// BusyIndicator.show(0);
			// get the URL arguements passed from main page
			var sgrnNumber = oEvent.getParameter("arguments").objectId;
			var sStatus = oEvent.getParameter("arguments").objectStatus;
			// context.grnNumber = sgrnNumber;
			context.oSelObject = com.ibs.ibsappivensaanalytical.oSelObject;
			// this.odataModel = sap.ui.getCore().getModel("oDataModel");
			// this.getcsrf();
			headerModel.setData(context.oSelObject);
			oView.setModel(headerModel, "headerModel");
			context.oTable = oView.byId("idItemsTable");
			context.getHeader(context.oSelObject.Ponumber);
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModelInvCre");
			this.oPModel.setProperty("/AttachURL", this.oPModel.getProperty("/AttachURL"));
			this.oPModel.setProperty("/TaxInput", false);
			this.oPModel.setProperty("/GrnNo", sgrnNumber);
			this.oPModel.setProperty("/SaveFragmentComment", "");
			this.oPModel.setProperty("/setSubmitBusy", null);
			this.oPModel.setProperty("/SubmitEdtable", null);
			this.oPModel.setProperty("/ShowSideContent", false);
			this.oPModel.setProperty("/btnEnableInvCreation", false);

			this.getView().byId("idInvoiceNo").setValue();
			this.getView().byId("idInvoiceDate").setValue();
			this.getView().byId("idInvoiceNo").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("idInvoiceDate").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("txPerc").setValue();
			this.getView().byId("taxAmount").setValue();




			// if (this.oPModel.getProperty("/Table1Visible")) {
			// context.readPOHeadSet(sgrnNumber);
			if (sStatus === "0") {
				context.readPOItemSet(sgrnNumber);
				this.getView().byId("id_page").setVisible(true);
				this.getView().byId("ObjectPageLayout").setVisible(true);
				this.getView().byId("ObjectPage").setVisible(false);
				 context.readAttachments();
			} else {
				context.readInvoiceItemSet(sgrnNumber);
				this.getView().byId("id_page").setVisible(false);
				this.getView().byId("ObjectPageLayout").setVisible(false);
				this.getView().byId("ObjectPage").setVisible(true);
				context.readAttachments();
			}

			// context.readPOItemSet(sgrnNumber);
			this.oPModel.setProperty("/NoAttachText", "Use the 'Add' button to keep files ready for upload");

		},

		// readPOHeadSet: function (grnNumber) {
		// 	// 
		// 	context.oOnPremSrvModel.read("/HeaderSet('" + grnNumber + "')", {
		// 		urlParameters: {
		// 			$expand: "NavHeaderToItem/NavItemToDetail"
		// 		},
		// 		success: function (data) {
		// 			BusyIndicator.hide();
		// 			//console.log(data);
		// 			detailModel.setData(data);
		// 			oView.setModel(detailModel, "detailmodel");
		// 		},
		// 		error: function (e) {
		// 			BusyIndicator.hide();
		// 			// MessageToast.show("Error while reading D header data");
		// 		}
		// 	});
		// },

		getHeader: function (poNumber) {
			//read SAP data for getting PO details
			context.oOnPremSrvModel.read("/HeaderSet('" + poNumber + "')", {
				//expanding line items ans corresponding service line items
				// urlParameters: {
				// 	$expand: "NavHeaderToItem,NavHeaderToComment"
				// },
				success: function (Data) {
					
					//console.log(Data);
					context.getView().setBusy(false);
					//set model to detail page
					var oHeaderModel = new JSONModel(Data);
					context.getView().setModel(oHeaderModel, "hData");

				},
				error: function (Error) {
					//
					context.getView().setBusy(false);
					// MessageBox.show(JSON.parse(Error.responseText).error.message.value);
				}
			});
		},
		readPOItemSet: function (grnNumber) {
			var filter = new sap.ui.model.Filter("Asnno", sap.ui.model.FilterOperator.EQ, grnNumber);
			// context.oOnPremSrvModel.read("/GRNITEMSet", {
				context.oOnPremSrvModel.read("/IBDASNITEMSet", {
				filters: [filter],
				success: function (data) {
					var total = 0;
					for (var i = 0; i < data.results.length; i++) {
						total = total + parseFloat(data.results[i].Totalamt);
						vendorAmt.push(data.results[i].Netwr);
					}
					context.getView().getModel("headerModel").getData().Grnamt = total;
					context.getView().getModel("headerModel").refresh(true);
					BusyIndicator.hide();
					//console.log(data);
					// debugger;
					detailModel.setData(data);
					oView.setModel(detailModel, "detailmodel");
				},
				error: function (e) {
					BusyIndicator.hide();
					// MessageToast.show("Error while reading D header data");
				}
			});
		},

		readInvoiceItemSet: function (grnNumber) {

			// ("/HeaderSet('" + sPoNumber + "')"
			// var filter = new sap.ui.model.Filter("Grnno", sap.ui.model.FilterOperator.EQ, grnNumber);
			// that.oModel.read("/ItemSet(PoNumber='" + that.oPModel.getProperty("/Ebeln") + "',PoItem='" + abc + "')/NavConfirmSet", {
			context.oOnPremSrvModel.read("/ReqHeadSet('" + grnNumber + "')", {
				// filters: [filter],
				urlParameters: {
					$expand: "ReqHeadToItem"
				},
				success: function (data) {
					var total = 0;
					for (var i = 0; i < data.ReqHeadToItem.results.length; i++) {
						total = total + parseFloat(data.ReqHeadToItem.results[i].Totalamt);
					}
					context.getView().getModel("headerModel").getData().Grnamt = total;
					context.getView().getModel("headerModel").refresh(true);
					BusyIndicator.hide();
					//console.log(data);
					// debugger
					detailModel.setData(data.ReqHeadToItem);
					oView.setModel(detailModel, "detailmodel");
				},
				error: function (e) {
					BusyIndicator.hide();
					// MessageToast.show("Error while reading D header data");
				}
			});
		},

		onBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setModel(new JSONModel([]), "detailmodel");
			// this.getView().setModel(new JSONModel([]), "servicePOData");
			this.oPModel.setProperty("/btnEnableInvCreation", false);
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var invoiceDate = oView.byId("idInvoiceDate");
				var invoiceNo = this.getView().byId("idInvoiceNo");
					invoiceNo.setValueState(sap.ui.core.ValueState.None)
					invoiceDate.setValueState(sap.ui.core.ValueState.None)
				oRouter.navTo("invcreation", true);
			}
		},
		validate: function () {
			var flag = true;
			var invoiceNo = oView.byId("idInvoiceNo");
			var invoiceDate = oView.byId("idInvoiceDate");

			if (invoiceNo.getValue() === "") {
				invoiceNo.setValueState(sap.ui.core.ValueState.Error).setValueStateText("Enter Invoice Reference Number.");
				invoiceNo.focus();
				flag = false;
			} else if (invoiceNo.getValue().length > 16) {
				invoiceNo.setValueState(sap.ui.core.ValueState.Error).setValueStateText("Enter valid Invoice Reference Number with 16 digits.");
				invoiceNo.focus();
				flag = false;
			} else invoiceNo.setValueState(sap.ui.core.ValueState.None);

			if (invoiceDate.getValue() === "") {
				invoiceDate.setValueState(sap.ui.core.ValueState.Error).setValueStateText("Select Invoice Date.");
				invoiceDate.focus();
				flag = false;
			} else invoiceDate.setValueState(sap.ui.core.ValueState.None);
			return flag;

		},
		// Live Change
		liveChangeAmount:function(oEvent){
			// debugger;
			var Number=/^[0-9]+$/;
			var Value=oEvent.getParameters().value;
			var id=oEvent.getParameters().id.split("-");
			var Index=id[id.length-1];
		 if(!Value.match(Number)){
		 	this.getView().byId("idItemsTable").getItems()[Index].getCells()[5].setValueState("Information").setValueStateText("Amount Contains Only Numbers");
		 }
		 else{
		 	this.getView().byId("idItemsTable").getItems()[Index].getCells()[5].setValueState("None");
		 	Value=Number(Value)
		 	var val= Value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		 	this.getView().byId("idItemsTable").getItems()[Index].getCells()[5].setValue(val);
		 }
			
             Value = Value.replace(/[^0-9]/g, '');
            this.getView().byId("idItemsTable").getItems()[Index].getCells()[5].setValue(Value);
			
		},

		openSaveFragment: function () {
			// 
			this._getPayload();
			var validateData = context.validate();
			if (validateData === true) {

				if (!context._saveFragment) {
					context._saveFragment = sap.ui.xmlfragment(
						"com.ibs.ibsappivensaanalytical.view.fragments.saveFragmentInvCreation",
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

		_getPayload: function () {
        //    debugger;
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var invoiceDate = dateFormat.format(new Date(oView.byId("idInvoiceDate").getValue()));
			var payload = {
				// "Grnno": context.oSelObject.Grnnum,
				"Grnno":context.oSelObject.Asnno,
				"Vendorcode": "8300894",
				"Ponumber": context.oSelObject.Ponumber,
				"Vendorname": '',
				"Fiscalyear": null,
				"Vendorinvno": oView.byId("idInvoiceNo").getValue(),
				"Vendorinvdate": invoiceDate,
				"Status": "",
				"ReqHeadToItem": []
			};

			var itemData = this.getView().getModel("detailmodel").getData();
			for (var i = 0; i < itemData.results.length; i++) {
				itemData.results[i].Grnno=itemData.results[i].Asnno // 
				itemData.results[i].Totalamt = itemData.results[i].Totalamt.toString();
				itemData.results[i].Netpr = itemData.results[i].Netpr.toString();
					itemData.results[i].Vat = String(itemData.results[i].Vat);
				if (itemData.results[i].__metadata) delete itemData.results[i].__metadata;
				payload.ReqHeadToItem.push(...itemData.results);
			}
			return payload;
		},

		onSubmitSave: function () {

			var payload = context._getPayload();

			var that = this;
			this.fileUploader = that.getView().byId("UploadCollection");

			context.oOnPremSrvModel.create("/ReqHeadSet", payload, {
				async: true,
				success: function (oData, response) {
					// 
					that.oPModel.setProperty("/setSubmitBusy", false);
					// context.ASNNo = oData.Asnno;
					context.onUpload();
					var msg = "Invoice submitted for PO - " + oData.Ponumber + ", ASN Number - " + oData.Grnno;
					that.closeSaveFragment();
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
					// 
					that.oPModel.setProperty("/setSubmitBusy", false);
					that.closeSaveFragment();
					that.showErrors(JSON.parse(error.responseText).error.innererror.errordetails);
				}
			});
		},
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/***************************Upload Collection*********************/

	
		onAttachmentPress: function (oEvent) {
			// debugger;
			// this.getView().setBusy(true);
			// this.getView().getModel("attach").setProperty("/busy", true);
			var url, obj, mediasrc, path,
			sServiceUrl = this.getView().getModel().sServiceUrl;
			obj = oEvent.getSource().getBindingContext("attachModel").getObject();
			mediasrc = obj.__metadata.media_src;
			url = mediasrc.split("ZIVN_INV_CREAT_SRV")[1];
			path = sServiceUrl + url;
			$.ajax({
				url: path,
				type: 'GET',
				contentType: 'application/json',
				// headers: headers,
				// filters: [filter],
				success: function (data, response) {
					// debugger;
					if (data === "" || data === undefined || data === null) {
						sap.m.MessageBox.information("No Attachments found ");
					
					} else {
						sap.m.URLHelper.redirect(path, true);
					}
					
				},
				error: function (oError) {
					// debugger
			
				}
			});

		},
		onUpload: function () {

			this.onStartUpload();
		},
		onStartUpload: function () {
			var context = this;
			/*console.log("Upload Started " + context.byId("UploadCollection"));*/
			var oUploadCollection = context.byId("UploadCollection");
			var cFiles = oUploadCollection.getItems().length;
			this.fileLength = cFiles;
			var uploadInfo = cFiles + " file(s)";
			if (cFiles > 0) {
				context.getView().setBusy(true);
				oUploadCollection.upload();
			} else {
				// /onUpload/ sap.m.MessageBox.error("Please Attach File First.", {
				// 	icon: sap.m.MessageBox.Icon.ERROR,
				// 	title: "ERROR"
				// });
			}
		},
		_fetchTokenForUpload: function () {
			// 
			var token;
			$.ajax({
				url: "/sap/opu/odata/sap/ZIVN_INV_CREAT_SRV/",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},
		onBeforeUploadStarts: function (oEvent) {
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: context.oSelObject.Asnno + '|' + oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onChangeA: function (oEvent) {
			// 
			var context = this;
			// var csrftoken = context._fetchTokenForUpload();
			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: context.oOnPremSrvModel.oHeaders["x-csrf-token"]
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onFileSizeExceed: function () {
			// 
			var sMsg = "Cannot Attach File that occupies more than 5MB.";
			sap.m.MessageBox.show(sMsg, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error!",
				actions: [sap.m.MessageBox.Action.OK],
				contentWidth: "100px"
			});
		},
		onFilenameLengthExceed: function (oEvent) {
			var sMsg = "Maximum file name length is 55 characters.";
			sap.m.MessageBox.show(sMsg, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error!",
				actions: [sap.m.MessageBox.Action.OK],
				contentWidth: "100px"
			});
		},
		onTypeMissmatch: function () {
			// 
			var sMsg = "This file type is not supported.";
			sap.m.MessageBox.show(sMsg, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error!",
				actions: [sap.m.MessageBox.Action.OK],
				contentWidth: "100px"
			});
		},
		onUploadComplete: function (oEvent) {
			// debugger;
			// 
			// counter++;
			// if (context.fileLength === counter) {
			// 	context.getView().setBusy(false);
			// 	sap.m.MessageBox.show("File(s) upload Successfully.", {
			// 		title: "Success",
			// 		icon: sap.m.MessageBox.Icon.SUCCESS
			// 	});
			// 	counter = 0;
			// }
		},

		readAttachments: function () {
            //  debugger;
			// var that = this;
			// this.oModel1 = this.getOwnerComponent().getModel("CloudXsOdata");
			var Asnno=context.oSelObject.Asnno || context.oSelObject.Grnno
			if (context.oSelObject.Status==="01") {
				Asnno=context.oSelObject.Grnno
			}
			var filter = new sap.ui.model.Filter("RequestNo", sap.ui.model.FilterOperator.EQ, Asnno);
			// var filter1 = new sap.ui.model.Filter("DocumentId", sap.ui.model.FilterOperator.EQ, 'FOL38000000000004EXT46000000000023');
			this.oOnPremSrvModel.read("/AttachmentSet", {
				filters: [filter],
				success: function (Data) {
					// 
					context.getView().setModel(new JSONModel(Data), "attachModel");
				},
				error: function (e) {
					MessageBox.show("Error while reading data", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
			});
		},

		handleRadioBtn: function (oEvent) {
			
			var sIndex = oEvent.getSource().getSelectedIndex();
			if (sIndex === 0) {
				// if (this.oPModel.getProperty("/Tax%value") !== "") {

				// 	this.onHeaderData();
				// }
				this.oPModel.setProperty("/SelectIndex", 0);
				this.oPModel.setProperty("/RadioTaxType", true);
				this.oPModel.setProperty("/TaxInput", false);
			} else {
				this.oPModel.setProperty("/SelectIndex", 1);
				this.oPModel.setProperty("/RadioTaxType", false);
				this.oPModel.setProperty("/TaxInput", true);
				this.oPModel.setProperty("/Tax%value", "");
				this.oPModel.setProperty("/TaxAmtvalue", "");
				// this.getView().byId("amtheader").setNumber(this.PoAmount);
				// this.onDataRead();
			}
		},
		invRef:function(oEvent){
		
			var length=oEvent.getParameters().value.length;
				var invoiceNo = this.getView().byId("idInvoiceNo");
			if(length>16){
				invoiceNo.setValueState(sap.ui.core.ValueState.Information).setValueStateText("Invoice Reference Number Can't Be Greater Then 16 Number");
				var lastValue=oEvent.getParameters().value.slice(0,length-1);
				invoiceNo.setValue(lastValue);
			}
			else{
					invoiceNo.setValueState(sap.ui.core.ValueState.None)
			}
		},
		invRefdate: function (oEvent) {

			var invoiceDate = this.getView().byId("idInvoiceDate");
			const regexPattern = /^\d{4}-\d{2}-\d{2}$/;

			if (regexPattern.test(invoiceDate.getValue())) {
				invoiceDate.setValueState(sap.ui.core.ValueState.None)
			} else {
				invoiceDate.setValueState(sap.ui.core.ValueState.Error)
				invoiceDate.setValueStateText("Please Select Invoice Date");
			}

		},
		onTaxP: function (oEvent) {
	        //  debugger;
			var itemData = this.getView().getModel("detailmodel").getData();
			var tax = parseInt(oEvent.getSource().getValue());
			var total = 0;
			var taxTotal = 0;
			for (var i = 0; i < itemData.results.length; i++) {
				itemData.results[i].Vat = tax;
				itemData.results[i].Netpr = parseFloat(itemData.results[i].Netwr) * (tax / 100);
				itemData.results[i].Netpr= itemData.results[i].Netpr.toFixed(2);
				itemData.results[i].Totalamt = (parseFloat(itemData.results[i].Netwr)) + (parseFloat(itemData.results[i].Netpr));
				total = total + parseFloat(itemData.results[i].Totalamt);
				taxTotal = taxTotal + parseFloat(itemData.results[i].Netpr);
			}
			this.oPModel.setProperty("/TaxAmtvalue", taxTotal);
			this.getView().getModel("detailmodel").refresh(true);
			this.getView().getModel("headerModel").getData().Grnamt = total.toFixed(2);
			this.getView().getModel("headerModel").refresh(true);
		},
		onAmount:function(oEvent){
			// debugger;
				var itemData = this.getView().getModel("detailmodel").getData();
			var NetWr = parseInt(oEvent.getSource().getValue());
			var total = 0;
			var tax;
			var i=oEvent.getParameters().id.split("-")[4];
			
			var taxTotal = 0;
			var vendoramt=this.getView().byId("idItemsTable").getItems()[i].getCells()[5]
			if(oEvent.getSource().getValue()===''){
				NetWr=vendorAmt[i];
				
				vendoramt.setValueState(sap.ui.core.ValueState.Warning).setValueStateText("Vendor Amount Can't be Empty")
			}
			else if(NetWr===0){
				NetWr=vendorAmt[i];
				vendoramt.setValueState(sap.ui.core.ValueState.Warning).setValueStateText("Vendor Amount Can't be Zero")
			}
				itemData.results[i].Netwr=String(NetWr)
				tax=itemData.results[i].Vat;
				itemData.results[i].Netpr = parseFloat(itemData.results[i].Netwr) * (tax / 100);
				itemData.results[i].Netpr= itemData.results[i].Netpr.toFixed(2);
				itemData.results[i].Totalamt = (parseFloat(itemData.results[i].Netwr)) + (parseFloat(itemData.results[i].Netpr));
				// total = total + parseFloat(itemData.results[i].Totalamt).toFixed(2);
					for (var j = 0; j < itemData.results.length; j++) {
				total = total + parseFloat(itemData.results[j].Totalamt)
					}
			// this.oPModel.setProperty("/TaxAmtvalue", taxTotal);
			this.getView().getModel("detailmodel").refresh(true);
			this.getView().getModel("headerModel").getData().Grnamt = total.toFixed(2);;
			this.getView().getModel("headerModel").refresh(true);

		},
		onChange: function (evt) {
			
			var that = this;
			var taxvalue = parseFloat(evt.getParameters().value);
			// index = Number(evt.getParameters().id.split("-")[4]);
			var totalPrice = evt.getSource().getBindingContext("detailmodel").getObject();
			if (totalPrice !== undefined) {
				totalPrice = parseFloat(evt.getSource().getBindingContext("detailmodel").getObject().Netwr);
			} else {
				totalPrice = parseFloat(evt.getSource().getBindingContext("detailmodel").getObject().Netwr);
			}
			if (!taxvalue) {
				taxvalue = 0;
			}
			var taxPerc = (taxvalue / 100) * totalPrice;
			var totalAmount = (totalPrice + taxPerc).toFixed(2);

			evt.getSource().getBindingContext("detailmodel").getObject().Netpr = taxPerc;
			evt.getSource().getBindingContext("detailmodel").getObject().Totalamt = totalAmount;

			this.getView().getModel("detailmodel").refresh(true);
			var total = 0;
			var itemData = this.getView().getModel("detailmodel").getData();
			for (var i = 0; i < itemData.results.length; i++) {
				total = total + parseFloat(itemData.results[i].Totalamt);
			}
			this.getView().getModel("headerModel").getData().Grnamt = total;
			this.getView().getModel("headerModel").refresh(true);

		},

		calculateTotalOrder: function () {
			// 
			var that = this;
			var data = that.getView().byId("idItemsTable").getItems();
			that.totalValue = 0.00;
			for (var i = 0; i < data.length; i++) {
				var val = data[i].getBindingContext("hData").getObject().TotalAmt;
				if (val) {
					that.totalValue = parseFloat(that.totalValue) + parseFloat(val);
				}
			}
			that.totalValue = that.totalValue.toFixed(2);
			that.getView().byId("amtheader").setNumber(that.totalValue);
		}

	});

});