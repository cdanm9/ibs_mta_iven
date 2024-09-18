sap.ui.define(function () {     
	"use strict";

	return {
		formatState: function (sValue) {
			if (sValue === "02") {
				return "Information";
			} else if (sValue === "01") {
				return "Warning";
			} else if (sValue === "03") {
				return "None";
			} else if (sValue === "Acknowledged") {
				return "Success";
			} else if (sValue === "Change Requested") {
				return "Error";
			} else if (sValue === "05") {
				return "Error";
			} else if (sValue === "Confirmation not required") {
				return "Error";
			} else if (sValue === "Confirmation Required") {
				return "Success";
			} else if (sValue === "Partially Confirmed") {
				return "Warning";
			} else {
				return "Information";
			}			
		},
		formatStateText: function (sValue) {
			if (sValue === "02") {
				return "Partially Confirmed by Supplier";
			} else if (sValue === "01") {
				return "Pending with Supplier";
			} else if (sValue === "03") {
				return "Pending with Buyer";
			} else if (sValue === "Acknowledged") {
				return "Acknowledged";
			} else if (sValue === "Change Requested") {
				return "Change Requested";
			} else if (sValue === "05") {
				return "Returned Good/Service";
			}
		},
		formatDueDays: function (sValue) {
			var currentDate = new Date();
			var diffTime = Math.abs(currentDate - sValue);
			var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays-1;
		},
		formatDueDaysState: function (sValue) {
			var currentDate = new Date();
			var diffTime = Math.abs(currentDate - sValue);
			var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			if (diffDays > 5) {
				return "Error";
			} else {
				return "Success";
			}
		},
		formatDate: function (sValue) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			var currentDate = new Date(sValue);
			return dateFormat.format(currentDate);
		},
		formatDate1: function (oDate) {
			if (oDate) {
				var date = oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4);
	
				var DateInstance = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
				return dateFormat.format(DateInstance);
			}
			return "";
	    },
		formatDueDaysIcon: function (sValue) {
			var currentDate = new Date();
			var diffTime = Math.abs(currentDate - sValue);
			var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			if (diffDays > 5) {
				return "sap-icon://alert";
			} else {
				return "sap-icon://sys-enter-2";
			}
		},
		formatAmount: function (sValue) {
			return Number(sValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		// formatDate: function (sValue) {
		// 	return Number(sValue).toString().replace(/\B(?=(\d{2})+(?!\d))/gi, "-");
		// },
		formatState1: function (sValue) {
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
		formatStateText1: function (sValue) {
			if (sValue === "02") {
				return "Confirmed by Supplier";
			} else if (sValue === "01") {
				return "Pending with Supplier";
			} else if (sValue === "03") {
				return "Rejected by Supplier";
			}  else if (sValue === "04") {
				return "Change Requested by Supplier";
			} else if (sValue === "05") {
				return "Deleted by Supplier";
			} else if (sValue === "06") {
				return "Partially Confirmed by Supplier";
			} else if (sValue === "07") {
				return "Cont. Not Required";
			} else if (sValue === "08") {
				return "Returned Good/Service";
			}
		},
		formatAcckey: function (sValue) {
			if (sValue === "D") {
				return "Service";
			} else if (sValue === "") {
				return "Material";
		    } else if (sValue === "A") {
				return "Asset";
		  }
      },
      formatStateCmt: function (sValue) {
			if (sValue === "Message") {
				return "Information";
			} else if (sValue === "Accept") {
				return "Success";
			} else if (sValue === "Reject") {
				return "Error";
			}
		},
		formatFieldEnable: function (sValue) {
			if (sValue === "") {
				return false;
			} else if (sValue === "Confirmation not required") {
				return false;
			} else {
				return true;
			}
		}
	}
});