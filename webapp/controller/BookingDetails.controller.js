sap.ui.define([
    "train/sdelosreyes/managebooking/controller/BaseController",
    "train/sdelosreyes/managebooking/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller, formatter, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("train.sdelosreyes.managebooking.controller.BookingDetails", {
            formatter: formatter,
            onInit: function () {
                this.getRouter().getRoute("BookingDetails").attachPatternMatched(this._onPatternMatch, this);
                this._oDataModel = this.getOwnerComponent().getModel();
                this._oDataModel.metadataLoaded();
                this._oAppModel = this.getOwnerComponent().getModel("appData");

            },

            _onPatternMatch: function (oEvent) {
                let oParam = oEvent.getParameters().arguments;
                this.sAction = oParam.action;

                if (oParam.action === "update") {
                    this._sPath = this._oDataModel.createKey("/FlightBooksSet", {
                        "Carrid": oParam.airline,
                        "Connid": oParam.flight,
                        "Fldate": this.formatDatePK(oParam.date),
                        "Bookid": oParam.bookid,
                    });
                    this.fnGetSpecificData();
                    this.fnDisableFields(false);

                } else if (oParam.action === "create") {
                    let oNewBooking = this.getAppData("/table");
                    this.fnDisableFields(true);
                    this.getView().setModel(new JSONModel(oNewBooking), "details");
                }
            },

            onClearForm: function(){
                if(this.sAction==="update"){
                    this.fnGetSpecificData()
                }else if(this.sAction==="create"){
                    let oNewBooking = this.getAppData("/table");
                    this.getView().setModel(new JSONModel(oNewBooking), "details");
                }
            },


            fnDisableFields: function (bFlag) {
                this.getView().byId("cmbAirline").setEditable(bFlag);
                this.getView().byId("cmbFligt").setEditable(bFlag);
                this.getView().byId("inpBook").setEditable(bFlag);
                this.getView().byId("dpFlightdate").setEditable(bFlag);
            },

            fnGetSpecificData: function () {
                let that = this;
                this.getView().setBusy(true);
                this._oDataModel.read(this._sPath, {
                    success: function (oData) {
                        oData.Fldate = formatter.formatDate(oData.Fldate);
                        oData.OrderDate = formatter.formatDate(oData.OrderDate);
                        oData.Passbirth = formatter.formatDate(oData.Passbirth);
                        that.getView().setModel(new JSONModel(oData), "details");
                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        MessageToast.show("Error occured when getting booking details");
                    }

                })
            },

            onNavBack: function () {
                this.getRouter().navTo("BookingList");
            },

            onSaveBooking: function () {
                let oPayload = $.extend({},this.getView().getModel("details").getData()),
                    that = this;
                    oPayload.Fldate = this.formatDatePK(new Date(oPayload.Fldate));
                    oPayload.OrderDate = this.formatDatePK(new Date(oPayload.OrderDate));
                    oPayload.Passbirth = this.formatDatePK(new Date(oPayload.Passbirth));
                    

                if (this.sAction === "create") {
                    this._oDataModel.create("/FlightBooksSet", oPayload, {
                        success: function (oData) {
                            MessageToast.show("Booking successfully saved!");
                            that.fnNavToUpdate(oPayload);
                        },
                        error: function (oError) {
                            MessageToast.show("Error occured when creating data");
                        }
                    });
                }else if(this.sAction === "update"){
                    this._oDataModel.update(this._sPath, oPayload, {
                        success: function (oData) {
                            MessageToast.show("Booking successfully updated!");
                        },
                        error: function (oError) {
                            MessageToast.show("Error occured when updating data");
                        }
                    });
                }
            },

            fnNavToUpdate: function (oData) {
                let sDate = this.fnDateToString(oData.Fldate);

                this.getRouter().navTo("BookingDetails", {
                    "action": "update",
                    "airline": oData.Carrid,
                    "flight": oData.Connid,
                    "date": sDate,
                    "bookid": oData.Bookid
                });
            }

    });
});