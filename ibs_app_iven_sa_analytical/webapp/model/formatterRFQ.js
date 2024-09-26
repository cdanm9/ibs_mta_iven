sap.ui.define([], function () {
	"use strict";

	var formatterObj = {
		
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		
		formatState: function (sValue) {
			if (sValue === "01") {
				return "Information";
			} else if (sValue === "02") {
				return "Success";
			} else if (sValue === "03") {
				return "None";
			}
		},
		formatStateText: function (sValue) {
			 if (sValue === "01") {
				return "In Preparation";
			} else if (sValue === "02") {
				return "Submitted";
			} else if (sValue === "03") {
				return "Awarded";
			}
		
		},

		formatAmount: function (sValue) {
			return Number(sValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		DT2digit: function (n) {
			return n < 10 ? '0' + n : n;
		},

		setDateDashFormat: function (val) {
			var day = formatterObj.DT2digit(val.getDate());
			var month = formatterObj.DT2digit(val.getMonth() + 1);
			var year = formatterObj.DT2digit(val.getFullYear());
			var date = year + "-" + month + "-" + day;
			return date;
		},
		setDate: function (val) {
			var day = formatterObj.DT2digit(val.getDate());
			var month = formatterObj.DT2digit(val.getMonth() + 1);
			var year = formatterObj.DT2digit(val.getFullYear());
			var date = day + "." + month + "." + year;
			return date;
		},

		formatDate: function (sValue) {
			if (!sValue) {
				return "";
			} else if (sValue instanceof Date) {

				return formatterObj.setDate(sValue);
			} else {

				var date = parseInt(sValue.match(/\d/g).join(''), 10);
				return formatterObj.setDate(new Date(date));
			}

		},
		netValue: function (value, quantity) {
			return parseInt(value) * parseInt(quantity);
		},
		formatEmail: function (sValue) {
			sValue = sValue.substring(0, sValue.length - 21);
			return sValue;
		},
		 decimal : function(d){
            return parseFloat(d).toFixed(2);// if value is string
        
    }
		
	};
	return formatterObj;
});
