sap.ui.define([], function () {
    "use strict";

    var formatterObj = {
        getStatus: function (sValue) {
            //  debugger;
            if (sValue == "PENDING") {
                return "Warning";

            } else if (sValue == "PROCESSED") {
                return "Information";

            } else if (sValue == "APPROVE") {
                return "Success";
            }
            else if (sValue == "REJECT") {
                return "Error";
            } else {
                return "None";
            }
        },

        formatterAmount: function (num) {
            if (num === undefined || num === '' || num === null) {
                return "NA";
            } else {
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    pattern: "#,##,##0.00"
                });
                return oNumberFormat.format(num) + " INR";
            }
        },

        formatDate: function (inputDateString) {
            if (inputDateString === null || inputDateString === '' || inputDateString === undefined) {
                return "NA";
            } else {
                var inputDate = new Date(inputDateString);
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd.MM.yyyy"
                });
                return dateFormat.format(inputDate);
            }
            // if (!inputDateString) {
            //     return "";
            // }

        },

        getDate: function (sDate) {
            var oDate = new Date(sDate);
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.YYYY" });
            var dateFormatted = dateFormat.format(oDate);
            return dateFormatted;
        },

        getDataNullValue: function (sValue) {
            if (sValue === null || sValue === '' || sValue === undefined) {
                return "NA";
            } else {
                return sValue;
            }
        },

        SAPNumberVisibility: function (sapNo) {
            if (sapNo === null || sapNo === '' || sapNo === undefined) {
                return false;
            } else {
                return true;
            }
        }
    };
    return formatterObj;
});