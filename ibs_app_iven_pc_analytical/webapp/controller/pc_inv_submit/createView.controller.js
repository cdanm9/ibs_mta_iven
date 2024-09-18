sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, BusyIndicator, MessageBox) {
        "use strict";
        var obj, appModulePath, context, that;
        var token;
        var sMsg

        return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.pc_inv_submit.createView", {
            onInit: function () {
                context = this;
                that = this;
                this.oDataModel = this.getOwnerComponent().getModel("onPremise");

                // var oUploadCollection = this.byId("UploadCollection");
                // oUploadCollection.attachBeforeUploadStarts(this.onBeforeUploadStarts, this);

                var oModel = new JSONModel({
                    "AttachURL": "",
                    "RequestNo": "",
                    "filename": ""
                });
                this.getOwnerComponent().setModel(oModel, "oPropertyModel");
                this.oPModel = this.getOwnerComponent().getModel("oPropertyModel");
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);
                that.oPModel.setProperty("/AttachURL", appModulePath);
                that.oPModel.setProperty("/sURL", "/sap/opu/odata/sap/ZIBS_BFPOC_SRV/POC_ATTACHSet");

                

                var csrftoken = context._fetchTokenForUpload();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("createView").attachPatternMatched(this._onRouteMatched, this);

            },

            _onRouteMatched: function (oEvent) {
                
                var g = this.getView().getParent().getParent();
                g.toBeginColumnPage(this.getView());
                obj = {
                    results: []
                };
                

                BusyIndicator.hide();

            },

            _fetchTokenForUpload: function () {
                ;

                $.ajax({
                    url: appModulePath + "/sap/opu/odata/sap/ZIBS_BFPOC_SRV/",
                    method: "GET",
                    async: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (result, xhr, data) {
                        ;
                        token = data.getResponseHeader("X-CSRF-Token");
                    }
                });

            },

            handleUpload: function (oEvent) {
                context.oDataModel.oHeaders["x-csrf-token"] = token;
                var oFileUploader = oEvent.getSource();
                var oCustomerHeaderToken = new sap.ui.unified.FileUploaderParameter({
                    name: "x-csrf-token",
                    value: context.oDataModel.oHeaders["x-csrf-token"]
                });
                oFileUploader.addHeaderParameter(oCustomerHeaderToken);

                var sbfileDetails = oEvent.getParameters("file").files;
                var filesize = sbfileDetails[0].size;
                var fileSizeInBytes = filesize;
                // Convert the bytes to Kilobytes (1 KB = 1024 Bytes)
                var fileSizeInKB = fileSizeInBytes / 1024;
                // Convert the KB to MegaBytes (1 MB = 1024 KBytes)
                var fileSizeInMB = fileSizeInKB / 1024;

                var fName = sbfileDetails[0].name;

                if (obj.results.length === 1) {
                    // that.byId("id_FileUploader").setValue("");
                    MessageBox.warning("Only one file can be uploaded");
                    return;
                } else {
                    if (fileSizeInMB > 5) {
                        MessageBox.warning("File size should be less than or equal to 5MB", {
                            icon: MessageBox.Icon.WARNING,
                            title: "WARNING",
                            actions: sap.m.MessageBox.Action.OK,
                            emphasizedAction: sap.m.MessageBox.Action.OK
                        });
                    } else if (fName.includes(".pdf")) {

                        this.sourceData = oEvent.getSource();
                        BusyIndicator.show();
                        this.sbfileUploadArr = [];
                        if (sbfileDetails.length != 0) {
                            for (var i in sbfileDetails) {
                                var mimeDet = sbfileDetails[i].type,
                                    fileName = sbfileDetails[i].name,
                                    fileType = sbfileDetails[i].type;
                                this.sbfileName = fileName;
                                // Calling method....
                                this.sbBase64conversionMethod(mimeDet, fileName, sbfileDetails[i], fileType);
                            }
                        } else {
                            this.sbfileUploadArr = [];
                        }
                    }
                    else {
                        MessageBox.warning("Please select correct File Type");
                    }
                }
            },

            handleTypeMissmatch: function (oEvent) {
                MessageBox.warning("Please select correct File Type");
            },

            sbBase64conversionMethod: function (fileMime, fileName, fileDetails, fileType) {

                // var context = this;

                if (!FileReader.prototype.readAsBinaryString) {
                    FileReader.prototype.readAsBinaryString = function (fileData) {
                        var binary = "";
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var bytes = e.reader.result;
                            var length = bytes.byteLength;
                            for (var i = 0; i < length; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            that.sbbase64ConversionRes = btoa(binary);
                            that.sbfileUploadArr.push({
                                "MimeType": fileMime,
                                "FileName": fileName,
                                "Content": that.sbbase64ConversionRes,
                                "Type": fileType
                            });
                        };
                        reader.readAsArrayBuffer(fileData);
                    };
                }

                var reader = new FileReader();
                reader.onload = function (readerEvt) {
                    var binaryString = readerEvt.target.result;
                    that.sbbase64ConversionRes = btoa(binaryString);
                    that.sbfileUploadArr = [];
                    that.sbfileUploadArr.push({
                        "MimeType": fileMime,
                        "FileName": fileName,
                        "Content": that.sbbase64ConversionRes,
                        "Type": fileType
                    });
                    that._sbgetUploadedFiles();
                };
                reader.readAsBinaryString(fileDetails);
            },
            _sbgetUploadedFiles: function () {


                var attachmentArray = [];
                if (this.sbfileUploadArr.length != 0) {
                    for (var fdata in this.sbfileUploadArr) {
                        this.sbAttachmentArr = {
                            "FILE_NAME": this.sbfileUploadArr[fdata].FileName,
                            "FILE_MIMETYPE": this.sbfileUploadArr[fdata].MimeType,
                            "FILE_CONTENT": this.sbfileUploadArr[fdata].Content,
                            "FILE_TYPE": this.sbfileUploadArr[fdata].Type
                        };
                        obj.results.push(this.sbAttachmentArr);

                        that.oPModel.setProperty("/filename", this.sbfileUploadArr[fdata].FileName);
                    }
                }

                var oattachJson = new JSONModel(obj.results);
                // oattachJson.setData(attachmentArray);
                that.getOwnerComponent().setModel(oattachJson, "attachJson");
                for (var i = 0; i < attachmentArray.length; i++) {
                    // Update attachdata with attachmentArray data
                    attachdata[that.sbIndex] = attachmentArray[i];
                }
                // this.sbfileUploadArr = [];
                BusyIndicator.hide();
            },

            onFileDeleted: function (oEvent) {
                MessageBox.confirm("Are you sure you want to Delete?", {
                    title: "Confirmation",
                    initialFocus: sap.m.MessageBox.Action.CANCEL,
                    onClose: function (sButton) {
                        if (sButton === MessageBox.Action.OK) {
                            that.byId("invDate").setValue("");
                            that.byId("invNo").setValue("");
                            that.byId("id_FileUploader").setValue("");
                            obj = {
                                results: []
                            };
                            that.getOwnerComponent().getModel("attachJson").setData([]);

                        }
                    }
                });
            },

            onSubmit: function (oEvent) {
                var sInvNo = this.byId("invNo").getValue();
                var sInvDate = this.byId("invDate").getValue();
                var sFile = this.byId("id_FileUploader").getValue();

                if (sInvNo === "" || sInvDate === "" ||
                    sInvNo === null || sInvDate === null ||
                    sInvNo === undefined || sInvDate === undefined) {
                    MessageBox.warning("Please fill all the fields");
                }
                else if (that.getOwnerComponent().getModel("attachJson") === undefined ||
                    that.getOwnerComponent().getModel("attachJson").getData().length === 0) {
                    MessageBox.warning("Please select an attachment");
                }
                else {
                    MessageBox.confirm("Are you sure you want to Submit?", {
                        title: "Confirmation",
                        initialFocus: sap.m.MessageBox.Action.CANCEL,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {

                                var surl = appModulePath + "/odata/v4/doc-info-ext/AttachmentPost";
                                const myUniversallyUniqueID = globalThis.crypto.randomUUID();

                                var temp = that.getOwnerComponent().getModel("attachJson").getData()[0];
                                var invDate = that.byId("invDate").getDateValue();
                                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                                    pattern: "yyyy-MM-dd"
                                });
                                invDate = dateFormat.format(invDate);

                                var nDate = new Date();
                                nDate = dateFormat.format(nDate);

                                var vName = that.getOwnerComponent().getModel("userAttriJson").getData().userName;
                                var vID = that.getOwnerComponent().getModel("userAttriJson").getData().userId;
                                var vCode = that.getOwnerComponent().getModel("userAttriJson").getData().code;

                                var oPayload = {
                                    "ACTION": "CREATE",
                                    "DOC_ATTACHMENT": [{
                                        "FILE_ID": myUniversallyUniqueID,
                                        "FILE_CONTENT": temp.FILE_CONTENT,
                                        "FILE_MIME_TYPE": "application/pdf",
                                        "FILE_NAME": temp.FILE_NAME,
                                        "STATUS": "PENDING",
                                        "UPLOADED_ON": new Date().toISOString(),
                                        "PO_FILE_NO": 1,
                                        "SAP_DOCUMENT_NO": null,
                                        "INVOICE_NO": that.byId("invNo").getValue().toString(),
                                        "INVOICE_DATE": invDate,
                                        "LOGIN_ID": vID
                                    }],
                                    "DOC_HEADER": [{
                                        "PO_FILE_NO": 1,
                                        "FILE_ID": myUniversallyUniqueID,
                                        "GROSSAMOUNT": null,
                                        "CURRENCYCODE": null,
                                        "DOCUMENTDATE": nDate,
                                        "DOCUMENTNUMBER": null,
                                        "PURCHASEORDERNUMBER": null,
                                        "STATUS": "PENDING",
                                        "SAPNUMBER": null,
                                        "SAPNUMBERYEAR": null,
                                        "REQUESTEDDATE": nDate,
                                        "TAXCODE": null,
                                        "TAXCODE_DESCRIPTION": null,
                                        "VENDORCODE": vCode,
                                        "VENDORNAME": vName
                                    }]
                                };
                                oPayload = JSON.stringify(oPayload);

                                BusyIndicator.show(0);
                                $.ajax({
                                    type: "POST",
                                    url: surl,
                                    data: oPayload,
                                    contentType: "application/json",
                                    dataType: "json",
                                    success: function (result) {
                                        sMsg = result.value[0].SUCCESS;
                                        sMsg = sMsg.split(": ")[1];
                                        that.oPModel.setProperty("/RequestNo", sMsg);
                                        BusyIndicator.hide();
                                        MessageBox.success(result.value[0].SUCCESS, {
                                            actions: [MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) {
                                                if (oAction === 'OK') {
                                                    ;
                                                    BusyIndicator.show(0);
                                                    // context.onUpload();
                                                    context.onFileUpload();
                                                }
                                            }
                                        });
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
                            };
                        }
                    });
                }
            },

            onChangeA: function (oEvent) {
                ;

                context.oDataModel.oHeaders["x-csrf-token"] = token;
                // var csrftoken = context._fetchTokenForUpload();
                var oUploadCollection = oEvent.getSource();
                var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: context.oDataModel.oHeaders["x-csrf-token"]
                });
                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

                var sbfileDetails = oEvent.getParameters("file").files;
                var filesize = sbfileDetails[0].size;
                var fileSizeInBytes = filesize;
                var fileSizeInKB = fileSizeInBytes / 1024;
                var fileSizeInMB = fileSizeInKB / 1024;
                var fName = sbfileDetails[0].name;

                if (obj.results.length === 1) {
                    MessageBox.warning("Only one file can be uploaded");
                    return;
                } else {
                    if (fileSizeInMB > 5) {
                        MessageBox.warning("File size should be less than or equal to 5MB", {
                            icon: MessageBox.Icon.WARNING,
                            title: "WARNING",
                            actions: sap.m.MessageBox.Action.OK,
                            emphasizedAction: sap.m.MessageBox.Action.OK
                        });
                    } else if (fName.includes(".pdf")) {

                        this.sourceData = oEvent.getSource();
                        BusyIndicator.show();
                        this.sbfileUploadArr = [];
                        if (sbfileDetails.length != 0) {
                            for (var i in sbfileDetails) {
                                var mimeDet = sbfileDetails[i].type,
                                    fileName = sbfileDetails[i].name,
                                    fileType = sbfileDetails[i].type;
                                this.sbfileName = fileName;
                                // Calling method....
                                this.sbBase64conversionMethod(mimeDet, fileName, sbfileDetails[i], fileType);
                            }
                        } else {
                            this.sbfileUploadArr = [];
                        }
                    }
                    else {
                        MessageBox.warning("Please select correct File Type");
                    }
                }
            },

            onBeforeUploadStarts: function (oEvent) {
                
                var url = appModulePath + "/sap/opu/odata/sap/ZIBS_BFPOC_SRV/POC_ATTACHSet(RequestNo='{attachModel>RequestNo}')/$value"



                
                var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: sMsg + '|' + oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            },

            onUploadComplete: function (oEvent) {
                
                // BusyIndicator.hide();
                // that.onBack();
            },

            onUpload: function () {
                this.onStartUpload();
            },

            onStartUpload: function () {
                
                var oUploadCollection = context.byId("UploadCollection");
                var cFiles = oUploadCollection.getItems().length;
                this.fileLength = cFiles;
                var uploadInfo = cFiles + " file(s)";
                if (cFiles > 0) {
                    // context.getView().setBusy(true);
                    var sUrl = that.oPModel.getProperty("/AttachURL");
                    var value = sUrl + "/sap/opu/odata/sap/ZIBS_BFPOC_SRV/POC_ATTACHSet";


                    oUploadCollection.setUploadUrl(value);
                    // oUploadCollection.setUploadUrl(location.origin+"/sap/opu/odata/sap/ZIBS_BFPOC_SRV/POC_ATTACHSet");
                    oUploadCollection.upload();

                    // oUploadCollection.attachBeforeUploadStarts(this.onBeforeUploadStarts, this);


                    // context.onBeforeUploadStarts();

                    // var oUploadItem = context.byId("uploadItemId");
                    // var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    //     name: "slug",
                    //     value: sMsg + '|' + 'Invoice'
                    // });
                    // oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);

                } else {
                    // /onUpload/ sap.m.MessageBox.error("Please Attach File First.", {
                    // 	icon: sap.m.MessageBox.Icon.ERROR,
                    // 	title: "ERROR"
                    // });
                }
            },

            // onBeforeUploadStarts: function (oEvent) {
            //     var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
            //         name: "slug",
            //         value: sMsg + '|' + oEvent.getParameter("fileName")
            //     });
            //     oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            // },

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

            onBack: function () {
                var g = this.getView().getParent().getParent();
                g.toBeginColumnPage(this.getView());
                this.byId("invDate").setValue("");
                this.byId("invNo").setValue("");
                this.byId("id_FileUploader").setValue("");
                if (this.getOwnerComponent().getModel("attachJson") !== undefined) {
                    obj = {
                        results: []
                    };
                    this.getOwnerComponent().getModel("attachJson").setData([]);
                }

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1");
            },

            onInvoiceNumberChange: function (oEvent) {
                var enteredValue = oEvent.getParameter('value');
                var oArray = this.getOwnerComponent().getModel("headerModel").getData().value;
                var result = oArray.find(element => element.TO_ATTACHMENT.INVOICE_NO === enteredValue);
                if (result !== undefined) {
                    this.byId("invNo").setValue("");
                    this.byId("invNo").setValueState("Error");
                    this.byId("invNo").setValueStateText("Invoice Number already exists");
                } else {
                    this.byId("invNo").setValueState("None");
                }
            },

            onFileUpload: function (oEvent) {
                
                var oFileUploader = context.byId("id_FileUploader");
                oFileUploader.upload();
            },

            onUploadStart: function (oEvent) {
                
                var oFileUploader = context.byId("id_FileUploader");
                // var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
                //     name: "slug",
                //     value: "1000000137|Invoice1 1.pdf"
                // });
                // oFileUploader.addHeaderParameter(oHeaderParameter);
            },

            onFileUploadComplete: function (oEvent) {
                BusyIndicator.hide();
                that.onBack();

            }
        });
    });
