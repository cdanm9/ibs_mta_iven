sap.ui.define([
    
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/FilterType',
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function(Controller,Filter,FilterOperator,FilterType,JSONModel) {
    'use strict';

    return Controller.extend('com.ibs.ibsappivenpostatusreportfe.ext.controller.Comment', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.ibspl.iven.ivenpostatusreport.ext.Comment
         */
        	onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
				oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
				this.sCurrentBindingPath = "";
				var oAttachmentModel = new JSONModel();
				var timelineModel = new JSONModel();
				this.getView().setModel(oAttachmentModel, "oUIModel");
				this.getView().setModel(timelineModel, "tData");
        	},
        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf com.ibspl.iven.ivenpostatusreport.ext.Comment
         */
        //	onBeforeRendering: function() {
        //
        //	},
        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf com.ibspl.iven.ivenpostatusreport.ext.Comment
         */
        //	onAfterRendering: function() {
        //
        //	},
        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.ibspl.iven.ivenpostatusreport.ext.Comment
         */
        //	onExit: function() {
        //
        //	}
    //     onClickActionHeaderSet1: function (oEvent) {
    //         debugger;
    //     },
    //     onInit: function () {
    //         debugger;
    //         this._getLoginDetails();
    //     },
    
    // onAfterRendering:function(){
    //         this._getLoginDetails();
    // },
    
    
    //     _getLoginDetails: function () {
    //         var sLoginId, sLoginType;
    
            
    //             var that = this;
    
    //         var oDataModel = that.getOwnerComponent().getModel();
    //         $.get("/services/userapi/attributes").done(function (results) {
    
    //             sLoginId = results.login_name;
    //             sLoginType = results.user_type;
    //             oDataModel.setHeaders({
    //                 "loginid": sLoginId,
    //                 "logintype": sLoginType
    //             });
    //                 // oDataModel.setDefaultCountMode("None");
    //                 // 	that.setModel(oDataModel);
    //                 // 	sap.ui.getCore().setModel(oDataModel, "oDataModel");
    
    //                     // Intialize Router
    //                     //that.getRouter().initialize();
    //         }.bind(this));
    //     }


    _onObjectMatched: function (oEvent) {
        debugger
        this.sCurrentBindingPath = this.getOwnerComponent().getRouter("HeaderSet").oHashChanger.hash.split("/")[0];
        var aFilters = [];
        var aFilterComment = [];
        var oAttachmentModel = this.getView().getModel("oUIModel");
        var timelineModel = this.getView().getModel("tData");
        var sFilterValue = parseInt(this.sCurrentBindingPath.match(/\d+/), 10).toString();
        aFilters.push(new Filter("ObjectId", FilterOperator.EQ, sFilterValue));
        aFilterComment.push(new Filter("PoNumber", FilterOperator.EQ, sFilterValue));
        var ODataModel = this.getView().getModel();


        ODataModel.read("/CommentSet", {
            filters: aFilterComment,
            success: function (Data) {
                debugger;
                timelineModel.setData(Data);
                timelineModel.refresh(true);
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
    }



    });
});
