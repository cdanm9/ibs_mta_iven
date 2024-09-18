sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast"  
    ],  
    function(BaseController,Fragment,Filter,JSONModel,MessageBox,MessageToast) {   
      "use strict";
      let that,localStorage;
      return BaseController.extend("com.ibs.ibsappivenpcanalytical.controller.App", {
        onInit: function() {  
          that=this
          that.oDataModel = this.getOwnerComponent().getModel("checkServiceAvailibilty") 

          this.oView = this.getView();
          this.oMyAvatar = this.oView.byId("myAvatar");
          this._oPopover = Fragment.load({
            id: this.oView.getId(),   
            name: "com.ibs.ibsappivenpcanalytical.view.fragments.UserPopover",    
            controller: this
          }).then(function(oPopover) {
            this.oMyAvatar.addDependent(oPopover);      
            this._oPopover = oPopover;
          }.bind(this));
          jQuery.sap.require("jquery.sap.storage");
          localStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);  
          this.handleRouteMatched();      
          that._getUserID();
          that._getRoleCollections();

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
        _getRoleCollections:function(){
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          that.appModulePath = jQuery.sap.getModulePath(appPath);
          var attr = that.appModulePath + "/sap/rest/authorization/v2/rolecollections";      
  
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
              
                // that._sUserName = data.firstname;
                // that._sFLetter = data.firstname[0];
                // that._sSLetter = data.lastname[0];
                // that._sInitials=that._sFLetter+that._sSLetter
                // that._sFullName=data.firstname + " " + data.lastname  
                // that.getOwnerComponent().getModel("appInfo").setProperty("/UserInitials",that._sInitials)  
                // that.getOwnerComponent().getModel("appInfo").setProperty("/UserFullName",that._sFullName)     
                // that._sUserID = data.email.toLowerCase().trim();
                // that._sCode = data.name;
  
                var oModel = new JSONModel({
                  // userId: that._sUserID,
                  // userName: that._sUserName,
                  // code: that._sCode         
                });
                that.getOwnerComponent().setModel(oModel, "roleCollectionJson");   
              },
              error: function (oError) {
                MessageBox.error("Error while reading Role Collections");
              }
            });
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
                sap.ui.core.UIComponent.getRouterFor(that).navTo("Page1");       
              } else {   
                sap.ui.core.UIComponent.getRouterFor(that).navTo("RouteServiceMsg");   
              }   
          }.bind(this), function (oError) { 
            sap.ui.core.UIComponent.getRouterFor(that).navTo("RouteServiceMsg");
          });   

          var oUserMenuData = {
            userListMenu: [      
                // { icon: "sap-icon://sys-find", title: "App Finder", type: "Active" },
                // { icon: "sap-icon://action-settings", title: "Settings", type: "Active" },
                { icon: "sap-icon://customer", title: "Simulate User Login", type: "Active" },
                // { icon: "sap-icon://hint", title: "About", type: "Active" },         
                { icon: "sap-icon://log", title: "Sign Out", type: "Active" }      
            ]
          };
          var oUserListModel = new JSONModel(oUserMenuData);              
          this.getView().setModel(oUserListModel,"uLMenu");
        },
        onLogout:function(oEvent){   
          // sap.m.URLHelper.redirect("https://9da603b4trial.launchpad.cfapps.us10.hana.ondemand.com/a22d66b3-3e78-4e57-ba53-762df11839fe.comibsibsappivenpcanalytical.comibsibsappivenpcanalytical-0.0.1/logout-page.html", false); 
          sap.m.URLHelper.redirect("/logout-page.html", false);                
        },
        onItemSelect: function(oEvent){
          debugger
          var userSelected = oEvent.getParameter("item").getKey();       
          // var userSelected = oEvent.mParameters.item.mProperties.key;      
          this.getOwnerComponent().getRouter().navTo(userSelected);
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
        onPopoverClose: function () {
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
          }
                                    
            // sap.m.URLHelper.redirect("https://9da603b4trial.launchpad.cfapps.us10.hana.ondemand.com/a22d66b3-3e78-4e57-ba53-762df11839fe.comibsibsappivenpcanalytical.comibsibsappivenpcanalytical-0.0.1/logout-page.html", false);                
                         
            // sap.m.URLHelper.redirect("https://9da603b4trial.authentication.us10.hana.ondemand.com/login", false);                   
            // sap.m.URLHelper.redirect("https://account.sap.com/core/SAMLProxyPage.html?apiKey=3_8nyT5U5bgmcYd76h25LbEmWhqOWeM39-36YxT90-TFTHoCC5AWQbqzABxbwJMaxU&mode=logout&samlContext=eu1_184876214373_486aa0f9-87e9-473f-b7c4-5bc55245c0ec", false);                   
        },
        _openLoginFragment:function(){
          if (!that.oDialog) {
            Fragment.load({
                id: that.getView().getId(), 
                name: "com.ibs.ibsappivenpcanalytical.view.fragments.loginDialog", 
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
  