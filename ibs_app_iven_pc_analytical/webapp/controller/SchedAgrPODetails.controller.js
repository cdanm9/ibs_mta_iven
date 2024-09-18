sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	'sap/ui/core/BusyIndicator',
	"../model/formatterSchedAgr"    
], function (Controller, MessageToast, JSONModel, MessageBox, BusyIndicator, formatter) {
	"use strict";

	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.SchedAgrPODetails", {
		formatter: formatter,
		onInit: function () {
			var that = this;
            // apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			// that.odataModel = sap.ui.getCore().getModel("oDataModel");
			// that.getcsrf();
    
			//get SAP model
			that.oModel = that.getOwnerComponent().getModel("SchedAgreement");    

			var oRouter = this.getOwnerComponent().getRouter().getRoute("SchedAgrPODetails");
			oRouter.attachPatternMatched(this.handleRouteMatched, this);
		},
		
		handleRouteMatched: function (oEvent) {
			var that = this;
			// debugger
			BusyIndicator.show(0);
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");
			this.oPModel.setProperty("/Ebeln", oEvent.getParameter("arguments").objectId);
			this.oPModel.setProperty("/AttachURL", this.oPModel.getProperty("/AttachURL"));
			
			//read SAP data for getting PO details
			that.oModel.read("/S_HEADERSet('" + this.oPModel.getProperty("/Ebeln") + "')", {
				//expanding line items ans corresponding service line items
				urlParameters: {
					$expand: "HeaderToItem"    //Confirmnav
				},
				success: function (Data) {
				//	debugger;
					BusyIndicator.hide();
					//set model to detail page
					that.oHeaderModel = new JSONModel(Data);
					that.getView().setModel(that.oHeaderModel, "hData");
					
					var abc = Data.HeaderToItem.results[0].Item_No;
					that.oModel.read("/S_ITEMSet(Schedule_No='" + that.oPModel.getProperty("/Ebeln") + "',Schedule_Item='',Item_No='" + abc + "')/NavConfirmSet", {
						success: function (Data) {
							// debugger;
							that.getView().setModel(new JSONModel(Data), "table4Data");
						},
						error: function (e) {}
					});
					
					var oItems = that.getView().byId("table3").getItems();
					for (var i = 0; i < oItems.length; i++) {
						// if (oItems[i].getCells()[9].getText() === "" || oItems[i].getCells()[9].getText() === "Confirmation not required") {
						// 	that.oPModel.setProperty("/fieldEnable", false);
						// }
						if (oItems[i].getCells()[10].getVisible() === true) {
							that.oPModel.setProperty("/btnEnable", true);
						}
					}
					
					// that.readAttachments(that.oPModel.getProperty("/Ebeln"));
				},
				error: function (Error) {
					// debugger;
					BusyIndicator.hide();
					MessageToast.show(JSON.parse(Error.responseText).error.message.value);
				}
			});
		},
		
		onConfirmPress: function (oEvent) {
			// debugger;
			var that = this;
			var oTable1 = that.getView().byId("table3");
			var oItems1 = oTable1.getItems();
			var selectItems1 = {},flag1 = true,flag = true;
			for (var i = 0; i < oItems1.length; i++) {
				selectItems1 = oItems1[i].getBindingContext("hData").getObject();
				if (selectItems1.Quantity === "" || !selectItems1.Quantity) {
                	flag = false;
                }
				if (selectItems1.Date === "" || !selectItems1.Date) {
                	flag1 = false;
                }
			}
			if(flag === false) {
            	return MessageBox.error("Please enter 'Quantity' in the line item");
            }
			if(flag1 === false) {
            	return MessageBox.error("Please select 'Confirm Date' for the line item");
            }
			if (!that._saveFragment) {
				that._saveFragment = sap.ui.xmlfragment(
					"com.ibs.ibsappivenpcanalytical.view.fragments.saveDialog",
					that
				);
				that.getView().addDependent(that._saveFragment);
			}
			that._saveFragment.open();
		},
		closeMatDialog: function () {
			var that = this;
			that._saveFragment.close();
		},
		
		onQtylivechange: function (oEvent) {
			// debugger;
			var sDelQtyInput = oEvent.getSource();
			var sPath = sDelQtyInput.getParent().getBindingContext("hData").getPath();

			var sDelQtyVal = sDelQtyInput.getValue();
			var numTest = sDelQtyVal.match(/^[0-9]*$/);	
			// if (!numTest) {
			// 	oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please enter only Numbers");
			// 	oEvent.getSource().setValue("");
			// 	return;
			// }
			sDelQtyVal = (sDelQtyVal !== "" && sDelQtyVal !== null && sDelQtyVal !== "NaN") ? parseFloat(sDelQtyVal.replace(/[^\d]/g, ''), 10) :
				parseFloat("0", 10);
			var oRowObject = sDelQtyInput.getParent().getBindingContext("hData").getObject();
				// var sPendingQtyVal = parseFloat(oRowObject.Po_Qty, 10);
				var sPendingQtyVal = parseFloat(oRowObject.Po_Qty, 10) - parseFloat(oRowObject.Confirm_Qty, 10);
				if (sDelQtyVal > sPendingQtyVal) {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Quantity should not be greater than '" + sPendingQtyVal + "' " + oRowObject.Uom);
					oEvent.getSource().setValue("");
				} else {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				}
		},
		
		readAttachments: function (sSchNo) {
			var that = this;
			// this.oModel1 = this.getOwnerComponent().getModel("CloudXsOdata");
			var filter = new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, sSchNo);
			
			that.oModel.read("/ASNATTACHSet", {
				filters: [filter],
				success: function (Data) {
					// debugger;
					that.getView().setModel(new JSONModel(Data), "attachModel");
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
		
		onTablePress: function (oEvent) {
			//debugger;
			var that = this;
			BusyIndicator.show(0);
			this.abc = oEvent.getSource().getBindingContext("hData").getObject().Item_No;
			that.oModel.read("/S_ITEMSet(Schedule_No='" + this.oPModel.getProperty("/Ebeln") + "',Schedule_Item='',Item_No='" + this.abc + "')/NavConfirmSet", {
				success: function (Data) {
					// debugger;
					BusyIndicator.hide();
					that.getView().setModel(new JSONModel(Data), "table4Data");
				},
				error: function (e) {
					// debugger;
					BusyIndicator.hide();
					MessageBox.show(JSON.parse(e.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
			});
		},
		
		onSubmit: function () {
			// debugger;
			var that = this;
			BusyIndicator.show(0);
			that.closeMatDialog();
			var payload1 = that.getView().getModel("hData").getData();
            delete payload1.__metadata;  
            var aFinalItemsArr = [];
			var oTable = that.getView().byId("table3");
			var oItems = oTable.getItems();
			var selectItems = {};
			for (var i = 0; i < oItems.length; i++) {
				  	selectItems = oItems[i].getBindingContext("hData").getObject();
	                if (selectItems.__metadata) delete selectItems.__metadata;
	                aFinalItemsArr.push(selectItems);
              }
              
            payload1.HeaderToItem = aFinalItemsArr;
            
            that._callHData(payload1,"/S_HEADERSet");
		},
		
		_callHData: function (payload1,SEntity) {
		   //debugger;
		   var that = this;	
		   that.fileUploader = that.getView().byId("UploadCollection");
		   that.oModel.create(SEntity, payload1, {
				async: true,
				success: function (oData, response) {
					// debugger;
					BusyIndicator.hide();
					// that.SchNo = oData.Asnno;
					// that.fileUploader.upload();
					var msg = "Agreement (" + that.oPModel.getProperty("/Ebeln") + ") is confirmed successfully.";
					MessageBox.show(msg, {
						icon: MessageBox.Icon.SUCCESS,
						title: "SUCCESS",
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (oAction) {
							if (oAction === "OK") {
								BusyIndicator.hide();
								//clear models on detail page
								that.closeMatDialog();
								//navto main page
								var router = sap.ui.core.UIComponent.getRouterFor(that);
								router.navTo("SchedAgreement");
								// that.onBack();
							}
						}
					});
				},
				error: function (error) {
					// debugger;
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
				}
			});
		},
		
		onBackNav: function () {
			var that = this;
			that.oPModel.setProperty("/btnEnable", false);
			// that.oPModel.setProperty("/fieldEnable", true);
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("SchedAgreement");
		},
		
		onBeforeUploadStarts: function (oEvent) {
			// debugger;
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: that.SchNo + "|" + oEvent.getParameter("fileName")
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
			if (this.header_xcsrf_token) {
				// var that = this;
				var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
					name: "x-csrf-token",
					value: this.header_xcsrf_token
				});
				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			}
		},
		getcsrf: function () {
			// Get CSRF token
			var that = this;
			if (!this.header_xcsrf_token) {
				//var model = this.getView().getModel();
				var oServiceUrl = that.odataModel.sServiceUrl;
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
		
	});
});