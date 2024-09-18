// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
// 	"sap/m/Popover",
// 	"sap/m/Button",
// 	"sap/m/library"
// ],
// function (Controller,JSONModel, Popover, Button, library) {
//     "use strict";
//     var oDatamodel;
//      var oContext;
//     var ButtonType = library.ButtonType,
//     PlacementType = library.PlacementType;

//     return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.Page1", {
//         onInit: function () {

            
//         },

       
//     });
// });

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/format/ChartFormatter"
], function (Controller, ChartFormatter) {
	"use strict";

	return Controller.extend("com.ibs.ibsappivenpcanalytical.controller.Page1", {
		onInit: function () {
			var ProdCat1 = this.getOwnerComponent().getModel("products").getData();
			var prodmodel = new sap.ui.model.json.JSONModel(ProdCat1);
			this.getView().setModel(prodmodel, "products");

			var purchase1 = this.getOwnerComponent().getModel("purchase").getData();
			var purchmodel = new sap.ui.model.json.JSONModel(purchase1);
			this.getView().setModel(purchmodel, "purchase");
			var managed1 = this.getOwnerComponent().getModel("managed").getData();
			var managedmodel = new sap.ui.model.json.JSONModel(managed1);
			this.getView().setModel(managedmodel, "managed");

			var formatPattern = ChartFormatter.DefaultPattern;
			var data = {
				"milk": [{
					"Week": "1",
					"Revenue": "500M",
					"Cost": 100,
					"Consumption": 291191.83
				}, {
					"Week": "2",
					"Revenue": "1B",
					"Cost": 50,
					"Consumption": 304964.8856125
				}, {
					"Week": "3",
					"Revenue": "600",
					"Cost": 150,
					"Consumption": 291191.83

				}, {
					"Week": "4",
					"Revenue": "800",
					"Cost": 100,
					"Consumption": 198268.9597904

				}, {
					"Week": "5",
					"Revenue": "1",
					"Cost": 60,
					"Consumption": 176502

				}]
			};
			this.byId("idVizFrame1").setVizProperties({
				title: {
					visible: true,
					text: "PO Net Amount by Quarter | INR"
				},
				valueAxis: {
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				}
			});
			var jsonmodel = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(jsonmodel);
			var data1 = {
				"milk1": [{
					"Week": "1",
					"Revenue": "1",
					"Cost": 100,
					"Consumption": 291191.83
				}, {
					"Week": "2",
					"Revenue": "800",
					"Cost": 50,
					"Consumption": 304964.8856125
				}, {
					"Week": "2.5",
					"Revenue": "100",
					"Cost": 150,
					"Consumption": 291191.83

				}, {
					"Week": "3",
					"Revenue": "150",
					"Cost": 70,
					"Consumption": 98268.9597904

				}, {
					"Week": "3.5",
					"Revenue": "200",
					"Cost": 60,
					"Consumption": 176502

				}]
			};
			var jsonmodel1 = new sap.ui.model.json.JSONModel(data1);
			this.getView().setModel(jsonmodel1, "dataline");
			/*this.byId("idVizFrame").setVizProperties({
				title: {
					visible: false
				}
			});*/
			this.byId("idVizFrame").setVizProperties({
				plotArea: {
					dataLabel: {

						visible: true,
						hideWhenOverlap: true
					}
				},
				valueAxis: {

					title: {
						visible: true,
						text: "PO Net Amount"
					}
				},
				valueAxis2: {

					title: {
						visible: true,
						text: "Operational Score"
					}
				},
				categoryAxis: {
					title: {
						visible: true,
						text: "Operational Score"
					}
				},
				sizeLegend: {

					title: {
						visible: true
					}
				},
				title: {
					visible: false,
					text: ""
				}
			});
		}
	});
});

