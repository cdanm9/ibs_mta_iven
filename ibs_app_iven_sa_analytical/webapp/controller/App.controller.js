sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/base/security/URLListValidator"  
    ],  
    function(BaseController,Fragment,Filter,JSONModel,MessageBox,MessageToast,URLListValidator) {   
      "use strict";
      let that,localStorage;
      return BaseController.extend("com.ibs.ibsappivensaanalytical.controller.App", {
        onInit: function() {  
          that=this
          that.oDataModel = this.getOwnerComponent().getModel("checkServiceAvailibilty")    
          that.oDataAppSaInfoModel = this.getOwnerComponent().getModel("appSaInfo")    
          that.idNavigationList=this.getView().byId("idNavigationList");
          URLListValidator.add("https", "ibs-portal-dev.launchpad.cfapps.us10.hana.ondemand.com", undefined, "/8526cdcb-5c31-4934-a365-72dce07a9b8d.ibs_bs_iven_po.comibsibsappiveninvoicepaymentrpt-0.0.1/index.html");
          URLListValidator.add("https", "ibs-portal-dev.launchpad.cfapps.us10.hana.ondemand.com");
          URLListValidator.add(undefined, "ibs-portal-dev.launchpad.cfapps.us10.hana.ondemand.com");
          
          
          let oAppDetails = {    
            UserFullName:"",    
            UserInitials:"",      
            AppList: []  
          };
          let oAppInfoModel = new JSONModel(oAppDetails);
          that.getOwnerComponent().setModel(oAppInfoModel,"appInfo")  

          this.oView = this.getView();
          this.oMyAvatar = this.oView.byId("myAvatar");
          this._oPopover = Fragment.load({
            id: this.oView.getId(),   
            name: "com.ibs.ibsappivensaanalytical.view.fragments.UserPopover",    
            controller: this
          }).then(function(oPopover) {
            this.oMyAvatar.addDependent(oPopover);      
            this._oPopover = oPopover;
          }.bind(this));
          jQuery.sap.require("jquery.sap.storage");
          localStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);  
          this.handleRouteMatched();     

          that._getAppInfo();
          that._getUserID();
          that._navigationListItem();

        },
        _navigationListItem:function(oEvent){      

          that.idNavigationList.onAfterRendering = function () {
            sap.tnt.NavigationList.prototype.onAfterRendering.apply(this, arguments);
            that.idNavigationList.getItems().forEach(function (oItem) {
                if (oItem.getItems && oItem.getItems().length > 0) {
                    var iRowCount = 0;
                    oItem.getItems().forEach(function (oSubItem) {  
                      oSubItem.$().css("background-color", "cornflowerblue");  
                    });
                }
            });
          };   
        },
        _getUserID:function(){
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          that.appModulePath = jQuery.sap.getModulePath(appPath);
          var attr = that.appModulePath + "/user-api/attributes";
  
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
                that._sFLetter = data.firstname[0];
                that._sSLetter = data.lastname[0];
                that._sInitials=that._sFLetter+that._sSLetter
                that._sFullName=data.firstname + " " + data.lastname  
                that.getOwnerComponent().getModel("appInfo").setProperty("/UserInitials",that._sInitials)  
                that.getOwnerComponent().getModel("appInfo").setProperty("/UserFullName",that._sFullName)     
                that._sUserID = data.email.toLowerCase().trim();
                that._sCode = data.name;
  
                var oModel = new JSONModel({
                  userId: that._sUserID,
                  userName: that._sUserName,
                  code: that._sCode         
                });
                that.getOwnerComponent().setModel(oModel, "userAttriJson");   
              },
              error: function (oError) {
                MessageBox.error("Error while reading User Attributes");
              }
            });
          });    
        },
        _getAppInfo:  function(){
          let sBindingFnPath="/getAllAppInfo(...)"
          let oAppODataPath =  that.oDataAppSaInfoModel.bindContext(sBindingFnPath);   
          oAppODataPath.execute().then(function (exec) {           
            let oAppInfoData = oAppODataPath.getBoundContext().getObject();
            
            let i=0;
            for(i in oAppInfoData.value){
              if(oAppInfoData.value[i].APP_TYPE=='APP'||oAppInfoData.value[i].APP_TYPE=='LNK'||oAppInfoData.value[i].APP_TYPE=='PLG'){
                oAppInfoData.value[i].APP_URL=oAppInfoData.value[i].TO_SUBAPPINFO[0].S_APP_URL
                oAppInfoData.value[i].TO_SUBAPPINFO=[]
              }else  
                oAppInfoData.value[i].APP_URL=null          
            } 
            that.oAppPlugin=oAppInfoData.value.filter(function(oAppInfo){
              return oAppInfo.APP_TYPE=='PLG'  
            })      
            oAppInfoData.value=oAppInfoData.value.filter(function(oAppInfo){
              return oAppInfo.APP_TYPE!='PLG'    
            })
                
            that.oAppInfoDetails=oAppInfoData?.value
            that.getOwnerComponent().getModel("appInfo").setProperty("/AppList",oAppInfoData?.value)  
          }.bind(this), function (oError) { 
            MessageBox.error("Failed to read "+sBindingFnPath+" function");
          });           
        },
        handleRouteMatched: function (oEvent) {       
          
          // debugger
          var that = this;
          var oCloud = true;  
          var oPremise = true;       
          // var url = that.appModulePath + "/odata/v4/addtional-process/checkServiceAvailability(cloudSrv=" + oCloud + ",onPremiseSrv=" + oPremise + ")";
          var ContextBinding = that.oDataModel.bindContext("/checkServiceAvailability(...)");               
          ContextBinding.setParameter("cloudSrv", oCloud) 
          ContextBinding.setParameter("onPremiseSrv", oPremise) 
          ContextBinding.execute().then( 
            function () {    
              var data = ContextBinding.getBoundContext().getObject();   
              const { cloudSrv, onPremiseSrv } = data?.value[0];
              if ((oCloud && cloudSrv) || (oPremise && onPremiseSrv)) {
                var oAppViewModel=new JSONModel(that.oAppInfoDetails[0]);   
                that.getOwnerComponent().setModel(oAppViewModel,"alAppView");    
                that.getOwnerComponent().getRouter().navTo("iVenMaster");            
              } else {   
                sap.ui.core.UIComponent.getRouterFor(that).navTo("RouteServiceMsg");   
              }   
          }.bind(this), function (oError) { 
            sap.ui.core.UIComponent.getRouterFor(that).navTo("RouteServiceMsg");
          });       

          var oUserMenuData = {
            userListMenu: [      
                { icon: "sap-icon://customer", title: "Simulate User Login", type: "Active" },      
                { icon: "sap-icon://settings", title: "Manage Site", type: "Active" },         
                { icon: "sap-icon://log", title: "Sign Out", type: "Active" }      
            ]
          };
          var oUserListModel = new JSONModel(oUserMenuData);              
          this.getView().setModel(oUserListModel,"uLMenu");
        },
        onLogout:function(oEvent){      
          // sap.m.URLHelper.redirect("https://9da603b4trial.launchpad.cfapps.us10.hana.ondemand.com/a22d66b3-3e78-4e57-ba53-762df11839fe.comibsibsappivensaanalytical.comibsibsappivensaanalytical-0.0.1/logout-page.html", false); 
          sap.m.URLHelper.redirect("/logout-page.html", false);                
        },
        onSideNavButtonPress: function() {
          var oToolPage = this.getView().byId("toolPage");
          var bSideExpanded = oToolPage.getSideExpanded();
          oToolPage.setSideExpanded(!oToolPage.getSideExpanded());   
        },     
        onItemSelect: function(oEvent){
          debugger
          var oItem=oEvent.getParameter("item")
          var oBindingContext=oItem.getBindingContext("appInfo")
          var oObject=oBindingContext.getObject()
          var oAppViewModel=new JSONModel(oObject)   
          that.getOwnerComponent().setModel(oAppViewModel,"alAppView");
          if(oEvent?.getParameter("item")?.getItems()?.length)
            this.getOwnerComponent().getRouter().navTo("iVenMaster");   
          else
            this.getOwnerComponent().getRouter().navTo("iVenMaster");
        },
        onPress: function(oEvent) {
          var oEventSource = oEvent.getSource(),
          bActive;           
    
          if (bActive) {
            this._oPopover.close();
          } else {
            this._oPopover.openBy(oEventSource);
          }
        },
        //User Simulation Start
        onListItemPress: function (oEvent) {     
          let oSource=oEvent.getSource()
          let sTitle=oSource.getProperty("title")
          if(sTitle=='Simulate User Login')
            that._openLoginFragment()
          else if(sTitle=='Sign Out'){
            // sap.m.URLHelper.redirect("/logoff.html", false);         
            sap.m.URLHelper.redirect("/do/logout", false);        
          }else if(sTitle=='Manage Site'){   
            let oAppViewModel=new JSONModel(that.oAppPlugin[0]);        
            that.getOwnerComponent().setModel(oAppViewModel,"alAppView");    
            that.getOwnerComponent().getRouter().navTo("iVenMaster");
          }

        },
        _openLoginFragment:function(){
          if (!that.oDialog) {
            Fragment.load({
                id: that.getView().getId(), 
                name: "com.ibs.ibsappivensaanalytical.view.fragments.loginDialog", 
                controller: that
            }).then(function (oDialog) {   
                that.oDialog = oDialog;
                that.getView().addDependent(that.oDialog); 
                that.oDialog.open();
            }.bind(that));
          } else {  
              that.oDialog.open();
          }
        },

        onClosePress: function () {
          this.oDialog.close();
        },

        onLoginIdChange: function (oEvent) {
          this.eventInput = oEvent.getParameter("value");
        },

        onLoginTypeChange: function (oEvent) {
          this.selEvent = oEvent.getParameter("selectedItem").getKey();
        },

        onSubmitPress: function () {  
            if (!this.eventInput || !this.selEvent) {
                MessageToast.show("Please fill all the required fields");
                return;
            }

            var data = {
                "Collection": [{
                    "id": this.eventInput,
                    "type": this.selEvent
                }]
            };

            var oModel = new JSONModel();
            oModel.setData(data);
            sap.ui.getCore().setModel(oModel);

            var oData = oModel.getData();
            localStorage.put("mySessionData", oData);                
            MessageToast.show("User login details saved.");               
            this.oDialog.close();
        },

        onClearPress: function () {
          var oModel = new JSONModel({});
          this.oDialog.setModel(oModel);
          localStorage.clear();
        },

        onDialogClose: function () {
          this.oDialog.destroy(); // Destroy dialog after close
          this.oDialog = null; // Reset dialog reference
        }
        //User Simulation End
      });
    }
  );
  