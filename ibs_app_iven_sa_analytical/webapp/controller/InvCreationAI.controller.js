sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, JSONModel, formatter) {
        "use strict";
        var context = null;
        var oModel;
        var myJSONModel,appModulePath;
        return Controller.extend("com.ibs.ibsappivensaanalytical.controller.InvCreationAI", {  
            formatter: formatter,

            onInit: function () {
                context = this;
                oModel = context.getOwnerComponent().getModel("oDataModelInvCreationAI");   
                var oRouter = sap.ui.core.UIComponent.getRouterFor(context);
                context._readfile();
            },

            onNav: function(){
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    oRouter.navTo("Details");
            },

            onCreate: function(){
                var that = this;
                if (!that.filterfrag) {
                    that.filterfrag = sap.ui.xmlfragment("com.ibs.ibsappivensaanalytical.view.fragments.uploadFile", that);      
                    that.getView().addDependent(that.filterfrag);
                }
                that.filterfrag.open();
            },

            closeDialog: function () {
                var that = this;
                that.filterfrag.close();
                that.filterfrag.destroy();
                that.filterfrag = null;
            },

            handleUploadPress: function(oEvent){
                const oFileUploader = sap.ui.getCore().byId("fileUploader");
                //const oUploadedFile = oFileUploader.oFileUpload.files[0];
                var sbfileDetails = oFileUploader.oFileUpload.files[0];

			var filesize = sbfileDetails.size;
			var fileSizeInBytes = filesize;
			// Convert the bytes to Kilobytes (1 KB = 1024 Bytes)
			var fileSizeInKB = fileSizeInBytes / 1024;
			// Convert the KB to MegaBytes (1 MB = 1024 KBytes)
			var fileSizeInMB = fileSizeInKB / 1024;
				
				this.sbfileUploadArr = [];
				if (sbfileDetails.lenghth != 0) {
					// for (var i in sbfileDetails) {
						var mimeDet = sbfileDetails.type,
							fileName = sbfileDetails.name;
						this.sbfileName = fileName;
						// Calling method....
						this.sbBase64conversionMethod(mimeDet, fileName, sbfileDetails);
					// }
				} else {
					this.sbfileUploadArr = [];
				}
			

            },

            sbBase64conversionMethod: function (fileMime, fileName, fileDetails) {
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
                            context.sbbase64ConversionRes = btoa(binary);
                            context.sbfileUploadArr.push({
                                "MimeType": fileMime,
                                "FileName": fileName,
                                "Content": context.sbbase64ConversionRes,
                            });
                        };
                        reader.readAsArrayBuffer(fileData);
                    };
                }
                var reader = new FileReader();
                reader.onload = function (readerEvt) {
                    var binaryString = readerEvt.target.result;
                    context.sbbase64ConversionRes = btoa(binaryString);
                    context.sbfileUploadArr = [];
                    context.sbfileUploadArr.push({
                        "MimeType": fileMime,
                        "FileName": fileName,
                        "Content": context.sbbase64ConversionRes,
                    });
                    context._sbgetUploadedFiles();
                };
                reader.readAsBinaryString(fileDetails);
            },

            _sbgetUploadedFiles: function () {
                if (this.sbfileUploadArr.length != 0) {
                    //for (var fdata in this.sbfileUploadArr) {
                        if (this.sbfileUploadArr.Content === "") {
                            MessageBox.warning("Upload Failed - File is empty", {
                                icon: MessageBox.Icon.WARNING,
                                title: "WARNING",
                                actions: sap.m.MessageBox.Action.OK,
                                emphasizedAction: sap.m.MessageBox.Action.OK
                            });
                            context.sbfileUploadArr = [];
                            return;
                        }
                        this.sbAttachmentArr = {
                            "FILE_NAME": this.sbfileUploadArr[0].FileName,
                            "FILE_MIMETYPE": this.sbfileUploadArr[0].MimeType,
                            "FILE_CONTENT": this.sbfileUploadArr[0].Content,
                        };
                        this._hanaPosting(this.sbAttachmentArr);
                    //}
                }
                //this.sbfileUploadArr = [];
            },


            _hanaPosting: function(filedetails){
                var that = this;
                const myUniversallyUniqueID = globalThis.crypto.randomUUID();
            //    console.log(myUniversallyUniqueID);
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);
                var path = appModulePath +  "/DOC_INFO_EXT/XSJS/DOC_INFO_EXT.xsjs?ACTION=CREATE";
                var payload = {
                    "VALUE": {
                        "DOC_ATTACHMENT": [
                            {
                                "FILE_ID": myUniversallyUniqueID,
                                "FILE_CONTENT": filedetails.FILE_CONTENT,
                                "FILE_MIME_TYPE": filedetails.FILE_MIMETYPE,
                                "FILE_NAME": filedetails.FILE_NAME,
                                "INSTANCE_UID":"",
                                "STATUS":"PENDING"
                            }
                        ]
                    }
                }
                var data = JSON.stringify(payload);
				sap.ui.core.BusyIndicator.show();
				$.ajax({
					url: path,
					type: 'POST',
					data: data,
					contentType: 'application/json',
					success: function (oData, responce) {
						sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Posted Successfully.");
                        that.filterfrag.close();
                        that.filterfrag.destroy();
                        that.filterfrag = null;
						that._readfile();
					},
					error: function (error) {
						sap.ui.core.BusyIndicator.hide();
						
							MessageBox.error("Error occured while posting data.");
						

					}
				});
            },

            _readfile: function(){
                // debugger;
                sap.ui.core.BusyIndicator.show();
			myJSONModel = new JSONModel();
			var sEntity = "/ATTACHMENT";

            oModel.read(sEntity, {
				success: function (Data) {
                    sap.ui.core.BusyIndicator.hide();
					myJSONModel.setData(Data);
					context.getView().setModel(myJSONModel, "fileDetails");
				},
				error: function (error) {
                    sap.ui.core.BusyIndicator.hide();
					context.getView().setBusy(false);
					MessageBox.error(error.responseText);

				}
			});
            }
        });
    });



