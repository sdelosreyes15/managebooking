sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat"
], function (DateFormat, NumberFormat) {
    "use strict";
    return {

        formatDate: function(sDate){
            if(sDate){
                let oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "MM.dd.YYYY"
                });
                return oDateFormat.format(sDate);
            }
        },
        formatCurrency: function(sCurr){
            if (sCurr) {
                let oFloatFormat = NumberFormat.getFloatInstance({
                    "decimals": 2,
                    "groupingSeparator":",",
                    "decimalSeparator":"."
                });
                return oFloatFormat.format(parseFloat(sCurr));
            }

        },
        formatStateCurrency: function(sCurr){
            if(sCurr){
                let dCurrency = parseFloat(sCurr);
                
                if (dCurrency < 1000){
                    return "Error";
                }else if (dCurrency < 20000){
                    return "Warning";
                }else{
                    return "Success"
                }
            }
         }
    };
});