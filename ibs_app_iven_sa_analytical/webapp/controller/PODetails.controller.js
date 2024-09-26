sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"com/ibs/ibsappivensaanalytical/model/formatter",
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/ui/core/BusyIndicator'
], function (Controller, MessageToast, JSONModel, MessageBox, formatter, MessagePopover, MessageItem, BusyIndicator) {
	"use strict";
	var oMessagePopover;
	var popover = null;
	var cModel;
	var selectKey, tblItems;
	return Controller.extend("com.ibs.ibsappivensaanalytical.controller.PODetails", {
		formatter: formatter,
		onInit: function () {
            debugger
			// apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//get SAP model
			this.oModel = this.getOwnerComponent().getModel("oDataModel2");

			var oRouter = this.getOwnerComponent().getRouter().getRoute("PODetails");
			oRouter.attachPatternMatched(this.handleRouteMatched, this);
		},
		handleRouteMatched: function (oEvent) {
            debugger
			BusyIndicator.show(0);
			var that = this;
			//get UI model from component.js
			this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");
			// console.log(oEvent.getParameter("arguments").objectStatus);
			this.oPModel.setProperty("/Ebeln", oEvent.getParameter("arguments").objectId);
			this.oPModel.setProperty("/PO_Status", oEvent.getParameter("arguments").objectStatus);
			this.oPModel.setProperty("/POPageTitle", "Order: " + oEvent.getParameter("arguments").objectId);
			this.oPModel.setProperty("/setSubmitBusy", null);
			com.ibs.ibsappivensaanalytical.ind2 = "X";
			// this.oPModel.setProperty("/btnEnable", false);

			//read SAP data for getting PO details
			this.oModel.read("/HeaderSet('" + this.oPModel.getProperty("/Ebeln") + "')", {
				//expanding line items ans corresponding service line items
				urlParameters: {
					$expand: "NavHeaderToItem,NavHeaderToComment"
				},
				success: function (Data) {
					//debugger;
					//console.log(Data);
					BusyIndicator.hide();

					//set model to detail page
					var oHeaderModel = new JSONModel(Data);
					that.getView().setModel(oHeaderModel, "hData");

					var abc = Data.NavHeaderToItem.results[0].PoItem;
					that.oModel.read("/ItemSet(PoNumber='" + that.oPModel.getProperty("/Ebeln") + "',PoItem='" + abc + "')/NavConfirmSet", {
						success: function (Data) {
							that.getView().setModel(new JSONModel(Data), "table4Data");
						},
						error: function (e) {}
					});
					//debugger;
					var oItems = that.getView().byId("table3").getItems();
					for (var i = 0; i < oItems.length; i++) {
						if (oItems[i].getCells()[14].getVisible() === true) {
							that.oPModel.setProperty("/btnEnable", true);
						}
					}
					//	read event logs
					that.readTimeline();
					//  read Attachments
					that.readAttachments();
				},
				error: function (Error) {
					//debugger;
					BusyIndicator.hide();
					// MessageBox.show(JSON.parse(Error.responseText).error.message.value);
				}
			});
		},
		readTimeline: function () {
			var that = this;
			var filter = new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, this.oPModel.getProperty("/Ebeln"));
			this.oModel.read("/CommentSet", {
				filters: [filter],
				success: function (Data) {
					that.getView().setModel(new JSONModel(Data), "tData");
				},
				error: function (e) {
					MessageBox.show(JSON.parse(e.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
			});
		},
		readAttachments: function () {
			var that = this;
			var filter = new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, this.oPModel.getProperty("/Ebeln"));
			this.oModel.read("/AttachmentSet", {
				filters: [filter],
				success: function (Data) {
					//	console.log(Data);
					// debugger;
					that.getView().setModel(new JSONModel(Data), "attachData");
				},
				error: function (e) {
					MessageBox.show(JSON.parse(e.responseText).error.message.value, {
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
			this.abc = oEvent.getSource().getBindingContext("hData").getObject().PoItem;
			this.oModel.read("/ItemSet(PoNumber='" + this.oPModel.getProperty("/Ebeln") + "',PoItem='" + this.abc + "')/NavConfirmSet", {
				success: function (Data) {
					//debugger;
					//console.log(Data);
					BusyIndicator.hide();
					that.getView().setModel(new JSONModel(Data), "table4Data");
				},
				error: function (e) {
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

		showServiceItem: function (oEvent) {
			//debugger;
			var that = this;
			this.abc = oEvent.getSource().getBindingContext("hData").getObject().PoItem;
			this.oModel.read("/ItemSet(PoNumber='" + this.oPModel.getProperty("/Ebeln") + "',PoItem='" + this.abc + "')/NavSESDetailsSet", {
				success: function (Data) {
					that.getView().setModel(new JSONModel(Data), "servicePOData");
				},
				error: function (e) {
					MessageBox.show(JSON.parse(e.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
			});
			if (!this.ViewSPO) {
				this.ViewSPO = sap.ui.xmlfragment(
					"com.ibs.ibsappivensaanalytical.view.fragments.servicePO", this
				);
				this.getView().addDependent(this.ViewSPO);
			}
			this.ViewSPO.open();
		},
		closeSPODialog: function () {
			this.ViewSPO.close();
		},
		onBackNav: function () {
			// debugger;
			var that = this;
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Master");
			this.handleSideContentHide();
			var oItems = that.getView().byId("table3").getItems();
			for (var i = 0; i < oItems.length; i++) {
				if (oItems[i].getCells()[14].getSelectedKey() !== "" || oItems[i].getCells()[14].getSelectedKey() === "" || oItems[i].getCells()[
						15].getVisible() === true) {
					oItems[i].getCells()[14].setSelectedKey("01");
					oItems[i].getCells()[15].setVisible(false);
				}
			}
			that.oPModel.setProperty("/btnEnable", false);
			that.getView().setModel(new JSONModel(), "table4Data");
			that.getView().setModel(new JSONModel(), "oCngModel");
		},

		onActionChange: function (oEvent) {
			//debugger;
			var that = this;
			that.chnPo = that.getView().getModel("oCngModel");
			if (that.chnPo !== undefined) {
				cModel = "Y";
			}
			that.aArr = [];
			that.oevent = oEvent.getSource();
			var selectedItems = {};
			selectKey = oEvent.getSource().getSelectedKey();
			if (selectKey === "03") {
				//debugger
				selectedItems = oEvent.getSource().getBindingContext("hData").getObject();
				if (selectedItems.NewQuantity) {
					selectedItems.NewQuantity = selectedItems.PendingQty;
				}
				if (selectedItems.NewDelDate === null) {
					selectedItems.NewDelDate = selectedItems.DeliveryDate;
				}
				that.aArr.push(selectedItems);
				var oChngModel = new JSONModel(that.aArr);
				that.getView().setModel(oChngModel, "chgData");

				if (!this.ViewCPO) {
					this.ViewCPO = sap.ui.xmlfragment(
						"com.ibs.ibsappivensaanalytical.view.fragments.changePO", this
					);
					this.getView().addDependent(this.ViewCPO);
				}
				this.ViewCPO.open();
				//*************Savan Patel  17-12-2022***********//
				// for()
				// sap.ui.getCore().byId("newDate").getItems()[0].getCells()[9].setMinDate(new Date());
				// var oDatePicker = sap.ui.getCore().byId("newDate1minmax");
				// oDatePicker.init();
				// oDatePicker._createPopup();
				// oDatePicker._createPopupContent();
				// oDatePicker._oCalendar.setShowWeekNumbers(false);
				var date = new Date();
				this.oPModel.setProperty("/minDate", date);
				sap.ui.getCore().byId("id_ChnPo").getItems()[0].getCells()[10].getItems()[1].setVisible(false);
				//*************Savan Patel  17-12-2022*********** end//
				that.sFrag = "O";

			}

			if (selectKey !== "03") {
				that.arry = [];
				var oItems = that.getView().byId("table3").getItems();
				for (var i = 0; i < oItems.length; i++) {
					if (oItems[i].getCells()[14].getSelectedKey() !== "03") {
						oItems[i].getCells()[15].setVisible(false);
					}
				}
				var tblItems1 = oEvent.getSource().getBindingContext("hData").getObject().PoItem;
				if (that.chnPo !== undefined) {
					var xyz = that.getView().getModel("oCngModel").getData();
					for (var j = 0; j < xyz.length; j++) {
						if (tblItems1 !== xyz[j].PoItem) {
							var eItem = xyz[j];
							that.arry.push(eItem);
						}
					}
					var oSModel = new JSONModel(that.arry);
					that.getView().setModel(oSModel, "oCngModel");
				}
			}
		},
		showchngPoItem: function (oEvent) {
			//	debugger;
			var that = this;
			that.arry = [];
			tblItems = oEvent.getSource().getBindingContext("hData").getObject().PoItem;
			var xyz = that.getView().getModel("oCngModel").getData();
			for (var j = 0; j < xyz.length; j++) {
				if (tblItems === xyz[j].PoItem) {
					var exItem = xyz[j];
					that.arry.push(exItem);
				}
			}
			var oSModel = new JSONModel(that.arry);
			that.getView().setModel(oSModel, "oEditCModel");
			if (!this.eViewCPO) {
				this.eViewCPO = sap.ui.xmlfragment(
					"com.ibs.ibsappivensaanalytical.view.fragments.EditChngPO", this
				);
				this.getView().addDependent(this.eViewCPO);
			}
			this.eViewCPO.open();
		},
		closeMatDialog2: function () {
			this.eViewCPO.close();
		},

		handleEvents: function () {
			this.byId("DynamicSideContent").setShowSideContent(true);
		},
		handleSideContentHide: function () {
			this.byId("DynamicSideContent").setShowSideContent(false);
		},

		onSubmitPress: function () {
			var context = this;
			if (!context._saveFragment) {
				context._saveFragment = sap.ui.xmlfragment(
					"com.ibs.ibsappivensaanalytical.view.fragments.saveChange",
					context
				);
				context.getView().addDependent(context._saveFragment);
			}
			context._saveFragment.open();
		},
		closeSaveFragment: function () {
			var context = this;
			context._saveFragment.close();
			this.oPModel.setProperty("/SaveFragmentComment", "");
		},

		onInputChange: function (event) {
			// debugger;
			var val = parseInt(event.getSource().getValue());
			var numTest = event.getSource().getValue().match(/^[0-9]*$/);
			if (!numTest) {
				event.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please enter only Numbers");
				event.getSource().setValue("");
				return;
			}
			if (val <= 0) {
				event.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Enter value greater than zero");
				event.getSource().setValue("");
			} else {
				event.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},

		onValidate: function () {
			//debugger;
			var that = this;
			var flag = true;
			this.sArray = [];
			this.confmdQTYCount = 0;
			var Items = sap.ui.getCore().byId("id_ChnPo").getItems();
			this.materialNum = Items[0].getBindingContext("chgData").getObject().MaterialDes;

			for (var i = 0; i < Items.length; i++) {
				var item = Items[i];
				var iMaterial = item.getBindingContext("chgData").getObject().MaterialDes;
				if (item.getBindingContext("chgData").getObject().NewDelDate === null) {
					return MessageBox.show("Select Delivery Date for material " + iMaterial + "", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
				if (item.getBindingContext("chgData").getObject().NewQuantity === "") {
					return MessageBox.show("Enter Quantity for material " + iMaterial + "", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
				if (iMaterial === this.materialNum) {
					this.obj = item.getBindingContext("chgData").getObject();
					this.sArray.push(this.obj);
					this.PoQnty = parseFloat(this.obj.PendingQty);
					this.confmdQTYCount = parseFloat(this.confmdQTYCount) + parseFloat(this.obj.NewQuantity);
				} else {
					this.materialNum = iMaterial;
					this.confmdQTYCount = 0;
					--i;
				}
			}
			var t = sap.ui.getCore().byId("id_ChnPo").getModel("chgData").getData();
			var s = that.aArr;
			for (var p = 0; p < s.length; p++) {
				var cq = t.filter(function (e) {
					if (e.MaterialDes === s[p].MaterialDes) {
						return e;
					}
				});
				var cqty = 0,
					cDate = "";
				const dDate = new Set([]);
				for (var r = 0; r < cq.length; r++) {
					cqty += Number(cq[r].NewQuantity);
					dDate.add(cq[r].NewDelDate.toString());
					cDate += cq[r].NewDelDate.toString();
				}

				if (Number(s[p].PendingQty) === cqty && s[p].DeliveryDate.toString() === cDate) {
					return MessageBox.show("No Changes Found", {
						icon: MessageBox.Icon.WARNING,
						title: "WARNING",
						actions: sap.m.MessageBox.Action.OK,
						emphasizedAction: sap.m.MessageBox.Action.OK
					});
					flag = false;
				}
				if (Number(s[p].PendingQty) < cqty) {
					return MessageBox.show("Entered New Quantity of material (" + s[p].MaterialDes + ") should not exceed Pending Quantity", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
					flag = false;
				}
				if (Number(s[p].PendingQty) > cqty) {
					return MessageBox.show("Entered New Quantity of material (" + s[p].MaterialDes + ") should be equal to Pending Quantity", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
					flag = false;
				}
				if (dDate.size !== cq.length) {
					return MessageBox.show("Entered Delivery Date of material (" + s[p].MaterialDes + ") should not be same", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
					flag = false;
				}
			}
			return flag;
		},

		_fetchTokenForUpload: function (csrf) {
			var token;
			$.ajax({
				url: csrf,
				headers: {
					"X-CSRF-Token": "Fetch",
				},
				method: "GET",
				async: false,
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		onChangeSubmit: function (oEvent) {
			// debugger;
			var that = this;
			var eData = cModel;
			var validflag = this.onValidate();
			if (validflag === true) {
				var existItems = {},
					selectItems = {},
					aItemsArr = [];
				if (eData === "Y") {
					var abc = that.getView().getModel("oCngModel").getData();
					for (var j = 0; j < abc.length; j++) {
						existItems = abc[j];
						aItemsArr.push(existItems);
					}
				}
				that.oTable = sap.ui.getCore().byId("id_ChnPo");
				var oItems = that.oTable.getItems();
				for (var i = 0; i < oItems.length; i++) {
					selectItems = oItems[i].getBindingContext("chgData").getObject();
					aItemsArr.push(selectItems);
				}
				var oSelModel = new JSONModel(aItemsArr);
				// console.log(aItemsArr);
				that.getView().setModel(oSelModel, "oCngModel");
				that.sFrag = "S";
				this.closeMatDialog1();
				var oItems = that.getView().byId("table3").getItems();
				for (var i = 0; i < oItems.length; i++) {
					if (oItems[i].getCells()[14].getVisible() === true && oItems[i].getCells()[14].getSelectedKey() === "03") {
						oItems[i].getCells()[15].setVisible() === true;
					}
				}
				return MessageToast.show("Data saved");
			}
		},
		onChangeESubmit: function (oEvent) {
			var that = this;
			var validflag = this.onEValidate();
			if (validflag === true) {
				var xyz = that.getView().getModel("oCngModel").getData();
				var sEexist = {},
					selEItems = {},
					aEArr = [];
				for (var j = 0; j < xyz.length; j++) {
					if (tblItems !== xyz[j].PoItem) {
						sEexist = xyz[j];
						aEArr.push(sEexist);
					}
				}
				that.eTable = sap.ui.getCore().byId("id_EditPo");
				var eItems = that.eTable.getItems();
				for (var i = 0; i < eItems.length; i++) {
					selEItems = eItems[i].getBindingContext("oEditCModel").getObject();
					aEArr.push(selEItems);
				}
				var eModel = new JSONModel(aEArr);
				that.getView().setModel(eModel, "oCngModel");
				this.closeMatDialog2();
				return MessageToast.show("Data updated");
			}
		},

		onSubmit_Yes: function (oEvent) {
			// debugger;
			var that = this;
			that.oPModel.setProperty("/setSubmitBusy", true);
			// var text = (this.oPModel.getProperty("/actionAccept")) ? "confirmed" : "rejected";
			var payload1 = this.getView().getModel("hData").getData();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			payload1.PoDate = dateFormat.format(new Date(payload1.PoDate));
			var cmnts = this.oPModel.getProperty("/SaveFragmentComment");
			if (cmnts !== undefined) {
				cmnts = this.oPModel.getProperty("/SaveFragmentComment");
			} else {
				//cmnts = "";
				that.oPModel.setProperty("/setSubmitBusy", false);
				return MessageBox.show("Please add your comment", {
					icon: MessageBox.Icon.ERROR,
					title: "ERROR",
					actions: sap.m.MessageBox.Action.CLOSE,
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			}
			payload1.Message = cmnts;
			payload1.Status = "S";
			delete payload1.__metadata;
			//delete payload1.NavHeaderToItem.results.__metadata;
			delete payload1.NavHeaderToConfirm;
			delete payload1.NavHeaderToComment;
			delete payload1.NavChangeDelSet;
			// debugger;
			var selectItems1 = {},
				aFinalItemsArr = [];
			var cModel = that.getView().getModel("oCngModel");
			if (cModel !== undefined) {
				var oItems1 = cModel.getData();
				for (var j = 0; j < oItems1.length; j++) {
					selectItems1 = oItems1[j];
					if (selectItems1.__metadata) delete selectItems1.__metadata;
					if (selectItems1.NavSESDetailsSet) delete selectItems1.NavSESDetailsSet;
					if (selectItems1.NavConfirmSet) delete selectItems1.NavConfirmSet;
					if (selectItems1.DeliveryDate) {
						selectItems1.DeliveryDate = dateFormat.format(new Date(selectItems1.DeliveryDate));
					}
					if (selectItems1.NewDelDate) {
						selectItems1.NewDelDate = dateFormat.format(new Date(selectItems1.NewDelDate));
					}
					if (selectItems1.Status !== "" || selectItems1.Status === "") {
						selectItems1.Status = "C";
					}
					aFinalItemsArr.push(selectItems1);
				}
			}

			var oTable = that.getView().byId("table3");
			// var oItems = oTable.getSelectedItems();
			var oItems = oTable.getItems();
			var selectItems = {};
			for (var i = 0; i < oItems.length; i++) {
				if (oItems[i].getCells()[14].getSelectedKey() !== "" && oItems[i].getCells()[14].getSelectedKey() !== "03" && oItems[i].getCells()[
						14].getVisible() === true) {

					selectItems = oItems[i].getBindingContext("hData").getObject();
					if (selectItems.__metadata) delete selectItems.__metadata;
					if (selectItems.NavSESDetailsSet) delete selectItems.NavSESDetailsSet;
					if (selectItems.NavConfirmSet) delete selectItems.NavConfirmSet;

					if (selectItems.DeliveryDate) {
						selectItems.DeliveryDate = dateFormat.format(new Date(selectItems.DeliveryDate));
					}

					if (selectItems.NewDelDate && selectItems.NewDelDate !== null) {
						selectItems.NewDelDate = dateFormat.format(new Date(selectItems.NewDelDate));
					}

					if (oItems[i].getCells()[14].getSelectedKey() === "01") {
						selectItems.Status = "A";
					} else {
						selectItems.Status = "R";
					}

					aFinalItemsArr.push(selectItems);
				}
			}
			payload1.NavHeaderToItem = aFinalItemsArr;
			//ajax call
			that._callHData(payload1);
		},

		_callHData: function (payload1) {
			var that = this;
			that.oModel.create("/HeaderSet", payload1, {
				async: true,
				success: function (oData, response) {
					// debugger;
					that.oPModel.setProperty("/setSubmitBusy", false);
					//console.log(oData.all[51].getInnerHTML());
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
								that.getView().setModel(oModel, "hData");

								//navto main page
								var router = sap.ui.core.UIComponent.getRouterFor(that);
								router.navTo("Master");
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
				if (data[i].code === "POC/001") {
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
					this.oPModel.setProperty("/dialogTitle", data[i].message);
					this.oPModel.setProperty("/dialogState", "Error");
					this.eAction.open();
				}
			}
		},
		closeErrorDialog: function () {
			var that = this;
			this.eAction.close();
			var router = sap.ui.core.UIComponent.getRouterFor(that);
			router.navTo("Master");
		},

		onPost: function (oEvent) {
			//debugger;
			var that = this;
			var mesg = that.getView().byId("emailTextId").getValue();
			var payload = {
				"PoNumber": this.oPModel.getProperty("/Ebeln"),
				"Message": mesg,
				"UserName": "",
				"Action": "",
				"UserId": ""
			};
			that.oModel.create("/CommentSet", payload, {
				method: "POST",
				async: true,
				success: function (oData, response) {
					var data = oData;
					that.readTimeline();
				},
				error: function (error) {
					// MessageToast.show(JSON.parse(error.responseText).error.message.value);
				}
			});
		},

		closeMatDialog: function () {
			var context = this;
			context._saveFragment.close();
			BusyIndicator.hide();
			this.oPModel.setProperty("/SaveFragmentComment", "");
		},
		closeMatDialog1: function () {
			var that = this;
			if (that.sFrag !== "S") {
				that.oevent.setSelectedKey("01");
			}
			this.ViewCPO.close();
			BusyIndicator.hide();
		},
		onEValidate: function () {
			//debugger;
			var that = this;
			var flag = true;
			this.sArray = [];
			this.confmdQTYCount = 0;
			var Items = sap.ui.getCore().byId("id_EditPo").getItems();
			this.materialNum = Items[0].getBindingContext("oEditCModel").getObject().MaterialDes;

			for (var i = 0; i < Items.length; i++) {
				var item = Items[i];
				var iMaterial = item.getBindingContext("oEditCModel").getObject().MaterialDes;
				if (item.getBindingContext("oEditCModel").getObject().NewDelDate === null) {
					return MessageBox.show("Select Delivery Date for material " + iMaterial + "", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
				if (item.getBindingContext("oEditCModel").getObject().NewQuantity === "") {
					return MessageBox.show("Enter Quantity for material " + iMaterial + "", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
				}
				if (iMaterial === this.materialNum) {
					this.obj = item.getBindingContext("oEditCModel").getObject();
					this.sArray.push(this.obj);
					this.PoQnty = parseFloat(this.obj.PendingQty);
					this.confmdQTYCount = parseFloat(this.confmdQTYCount) + parseFloat(this.obj.NewQuantity);
				} else {
					this.materialNum = iMaterial;
					this.confmdQTYCount = 0;
					--i;
				}
			}
			var t = sap.ui.getCore().byId("id_EditPo").getModel("oEditCModel").getData();
			var s = that.arry;
			for (var p = 0; p < s.length; p++) {
				var cq = t.filter(function (e) {
					if (e.MaterialDes === s[p].MaterialDes) {
						return e;
					}
				});
				var cqty = 0,
					cDate = "";
				const dDate = new Set([]);
				for (var r = 0; r < cq.length; r++) {
					cqty += Number(cq[r].NewQuantity);
					dDate.add(cq[r].NewDelDate.toString());
					cDate += cq[r].NewDelDate.toString();
				}

				//  if(Number(s[p].PendingQty) === cqty && s[p].DeliveryDate.toString() === cDate) {
				//  	return MessageBox.warning("No Changes Found");
				// flag = false;
				//  }
				if (Number(s[p].PendingQty) < cqty) {
					return MessageBox.show("Entered New Quantity of material (" + s[p].MaterialDes + ") should not exceed Pending Quantity", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
					flag = false;
				}
				if (Number(s[p].PendingQty) > cqty) {
					return MessageBox.show("Entered New Quantity of material (" + s[p].MaterialDes + ") should be equal to Pending Quantity", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
					flag = false;
				}
				if (dDate.size !== cq.length) {
					return MessageBox.show("Entered Delivery Date of material (" + s[p].MaterialDes + ") should not be same", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						actions: sap.m.MessageBox.Action.CLOSE,
						emphasizedAction: sap.m.MessageBox.Action.CLOSE
					});
					flag = false;
				}
			}
			return flag;
		},

		addRow: function (oEvent) {
			// debugger;
			var addObject = oEvent.getSource().getBindingContext("chgData").getObject();
			
			var newObj = Object.assign({}, addObject);
			var itemIndex = oEvent.getSource().getBindingContext("chgData").sPath;
			var index = parseInt(itemIndex.split("/")[1]) + 1;
			
			this.itemModel = this.getView().getModel("chgData").getData();
			newObj.NewQuantity="";
			// this.itemModel = this.getView().getModel("chgData").getData().NavHeaderToItem.results;
			this.itemModel.splice(index, 0, newObj);
			// for(var i=1;i<sap.ui.getCore().byId("id_ChnPo").getItems().length;i++){
			// 	sap.ui.getCore().byId("id_ChnPo").getItems()[i].getCells()[8].setValue("");
			// }
			this.itemModel.join();
			this.getView().getModel("chgData").refresh(true);
		},

		removeRow: function (oEvent) {
			// debugger;
			var selectedItem = oEvent.getSource().getBindingContext("chgData").sPath;
			var index = parseInt(selectedItem.split("/")[1]);
			if (index !== 0) {
				this.itemModel.splice(index, 1);
				this.getView().getModel("chgData").refresh(true);
			}
		},
		addERow: function (oEvent) {
			var addObject = oEvent.getSource().getBindingContext("oEditCModel").getObject();
			var newObj = Object.assign({}, addObject);
			var itemIndex = oEvent.getSource().getBindingContext("oEditCModel").sPath;
			var index = parseInt(itemIndex.split("/")[1]) + 1;
			this.itemEModel = this.getView().getModel("oEditCModel").getData();
			this.itemEModel.splice(index, 0, newObj);
			this.itemEModel.join();
			this.getView().getModel("oEditCModel").refresh(true);
		},

		removeERow: function (oEvent) {
			var selectedItem = oEvent.getSource().getBindingContext("oEditCModel").sPath;
			this.itemEModel = this.getView().getModel("oEditCModel").getData();
			var index = parseInt(selectedItem.split("/")[1]);
			if (index !== 0) {
				this.itemEModel.splice(index, 1);
				this.getView().getModel("oEditCModel").refresh(true);
			}
		}
	});
});