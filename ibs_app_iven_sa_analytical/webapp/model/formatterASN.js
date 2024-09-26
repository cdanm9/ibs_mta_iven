sap.ui.define([], function () {
	"use strict";

	var formatterObj = {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		formatAmount: function (sValue) {
			return Number(sValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		formatStatusText: function (sValue) {
			if (sValue === 0) {
				return "Pending";
			} else if (sValue === 1) {
				return "Rejected ";
			} else if (sValue === 2) {
				return "Rejected by Buyer";
			} else if (sValue === 3) {
				return "Confirmed ";
			} else if (sValue === 4) {
				return "PO Changes accepted by Buyer";
			}
		},

		formatState: function (sValue) {
			if (sValue === 3) {
				return "Success";
			} else if (sValue === 5 || sValue === 6) {
				return "Warning";
			} else if (sValue === 13) {
				return "Error";
			} else if (sValue === "Acknowledged") {
				return "Success";
			} else if (sValue === "ASN/IBD Created") {
				return "Information";
			}
		},

		DT2digit: function (n) {
			return n < 10 ? '0' + n : n;
		},
		
		formatState1: function (sValue) {
			if (sValue === "02") {
				return "Information";
			} else if (sValue === "01") {
				return "Warning";
			} else if (sValue === "03") {
				return "None";
			} else if (sValue === "04") {
				return "Success";
			} else if (sValue === "05") {
				return "Error";
			} else if (sValue === "06") {
				return "Success";
			}	
		},
		formatStateText1: function (sValue) {
			if (sValue === "02") {
				return "Partially Delivered ";
			} else if (sValue === "01") {
				return "Pending ";
			} else if (sValue === "03") {
				return "Pending with Buyer";
			} else if (sValue === "04") {
				return "Confirmed ";
			} else if (sValue === "05") {
				return "Returned Good/Service";
			} else if (sValue === "06") {
				return "Submitted ";
			}
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
		formatState2: function (sValue) {
			if (sValue === "02") {
				return "Success";
			} else if (sValue === "01") {
				return "Warning";
			} else if (sValue === "03") {
				return "Error";
			} else if (sValue === "04") {
				return "Information";
			} else if (sValue === "05") {
				return "Error";
			} else if (sValue === "06") {
				return "Information";
			} else if (sValue === "07") {
				return "Warning";
			} else if (sValue === "08") {
				return "Error";
			}
		},
		formatStateText2: function (sValue) {
			if (sValue === "02") {
				return "Confirmed";
			} else if (sValue === "01") {
				return "Pending";
			} else if (sValue === "03") {
				return "Rejected";
			}  else if (sValue === "04") {
				return "Change Requested";
			} else if (sValue === "05") {
				return "Deleted";
			} else if (sValue === "06") {
				return "Partially Delivered";
			} else if (sValue === "07") {
				return "Cont. Key Missing";
			} else if (sValue === "08") {
				return "Returned Good/Service";
			}
		},
		
	};
	return formatterObj;
});