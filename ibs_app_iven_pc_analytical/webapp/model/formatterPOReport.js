//Same for both PO Report Buyer and PO Report
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
			} else if (sValue === "ASN/IBD Created") {
				return "Information";
			} else if (sValue === "04") {
				return "Success";
			} else if (sValue === "05") {
				return "Error";
			}	
		},
		formatStateText: function (sValue) {
			if (sValue === "02") {
				return "Partially Confirmed by Vendor";
			} else if (sValue === "01") {
				return "Pending with Vendor";
			} else if (sValue === "03") {
				return "Pending with Buyer";
			} else if (sValue === "04") {
				return "Completed";
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
				return "Confirmed by Vendor";
			} else if (sValue === "01") {
				return "Pending with Vendor";
			} else if (sValue === "03") {
				return "Rejected by Vendor";
			}  else if (sValue === "04") {
				return "Change Requested by Vendor";
			} else if (sValue === "05") {
				return "Deleted by Vendor";
			} else if (sValue === "06") {
				return "Partially Confirmed by Vendor";
			} else if (sValue === "07") {
				return "Cont. Key Missing";
			} else if (sValue === "08") {
				return "Returned Good/Service";
			}
		},
		formatAcckey: function (sValue) {
			if (sValue === "D") {
				return "Service";
			} else if (sValue === "") {
				return "Material";
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
	}
});