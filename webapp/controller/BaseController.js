sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller) {
    "use strict";

    return Controller.extend("train.sdelosreyes.managebooking.controller.BaseController", {

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },


        geti18nText: function (sText, aParam) {
            if (!this._oI18n) {
                this._oI18n = this.getOwnerComponent().getModel("i18n");
            }
            return this._oI18n.getResourceBundle().getText(sText, aParam);
        },

        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.close();
                this.getView().removeDependent(this._oDialog);
                this._oDialog = undefined;
                this._oDialog.destroy(true);
            }
        },

        getAppData: function (sPath) {
            let oProperty = $.extend({}, this._oAppModel.getProperty(sPath));
            return oProperty;
        },


        fnDateToString: function (oDate) {
            let sDate = "",
                iMonth = oDate.getUTCMonth() + 1,
                iDay = oDate.getUTCDate();

            sDate = oDate.getUTCFullYear().toString() + "-";
            sDate += (iMonth < 10 ? "0" + iMonth.toString() : iMonth.toString()) + "-";
            sDate += iDay < 10 ? "0" + iDay.toString() : iDay.toString()

            return sDate + "T00:00:00";
        },

        convertToUTC: function (sDate) {
            if (sDate) {
                var dTemp = new Date(sDate);
                var dUTC = Date.UTC(dTemp.getFullYear(), dTemp.getMonth(), dTemp.getDate());
                return new Date(dUTC);
            }
            return sDate;
        },

        formatDatePK: function (sDate) {
          let dDate = new Date(sDate);
          let iOffset = -(dDate.getTimezoneOffset()/60);
          dDate.setHours(iOffset);

          return dDate;
        }

    });
});