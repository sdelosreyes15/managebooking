sap.ui.define([
    "train/sdelosreyes/managebooking/controller/BaseController",
    "train/sdelosreyes/managebooking/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller, formatter, JSONModel, Filter, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("train.sdelosreyes.managebooking.controller.BookingList", {
        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("BookingList").attachPatternMatched(this._onPatternMatch, this);
            this._oDataModel = this.getOwnerComponent().getModel();
            this._oAppModel = this.getOwnerComponent().getModel("appData");
            this._bFlag = true;
        },

        _onPatternMatch: function () {
            this.fnGetBookingList();
        },
        fnGetBookingList: function () {
            let that = this;
            this.getView().byId("idBookingTbl").setBusy(true);
            this._oDataModel.read("/FlightBooksSet", {
                success: function (oData) {
                    that._oBooking = new JSONModel(oData.results);
                    that.getView().setModel(that._oBooking, "bookings");
                    that.onSearchFlightList();
                    that.getView().byId("idBookingTbl").setBusy(false);

                    if (that._bFlag) {
                        that._bFlag = false;
                        that.getUniqueFlight(oData.results);
                    }
                },
                error: function (oError) {

                }
            });
        },

        getUniqueFlight: function (oData) {
            let aUnique = [];

            for (let a = 0; a < oData.length; a++) {
                if (!aUnique.includes(oData[a].Connid)) {
                    aUnique.push(oData[a].Connid);
                }
            }

            aUnique.sort();
            this._oAppModel.setProperty("/flight", aUnique);
        },

        onClearFilter: function () {
            this._oAppModel.setProperty("/filter/airline", []);
            this._oAppModel.setProperty("/filter/flight", []);
            this._oAppModel.setProperty("/filter/bookingId", null);
            this._oAppModel.setProperty("/filter/flightdate", null);
            this._oAppModel.setProperty("/filter/passName", null);
            this.onSearchFlightList();
        },

        onSearchFlightList: function () {
            let oTable = this.getView().byId("idBookingTbl"),
                oFilters = this._oAppModel.getProperty("/filter"),
                aTempFilter = [],
                aFinalFilter = [];

            if (oFilters.airline.length > 0) {
                let aCarrid = [];
                for (let a = 0; a < oFilters.airline.length; a++) {
                    aCarrid.push(new Filter("Carrid", "Contains", oFilters.airline[a]));
                }
                aTempFilter.push(new Filter(aCarrid, false));
            }
            
            if (oFilters.flight.length > 0) {
                let aConnid = [];
                for (let a = 0; a < oFilters.flight.length; a++) {
                    aConnid.push(new Filter("Connid", "Contains", oFilters.flight[a]));
                }
                aTempFilter.push(new Filter(aConnid, false));
            }
         

            if (oFilters.bookingId) {
                aTempFilter.push(new Filter("Bookid", "Contains", oFilters.bookingId));
            }

            if (oFilters.passName) {
                aTempFilter.push(new Filter("Passname", "Contains", oFilters.passName));
            }

            if (oFilters.flightdate) {
                aTempFilter.push(new Filter("Fldate", "EQ", this.convertToUTC(oFilters.flightdate)));
            }


            if (aTempFilter.length > 0) {
                aFinalFilter = new Filter(aTempFilter, true);
            }

            let oBinding = oTable.getBinding("rows");
            oBinding.filter(aFinalFilter);

            this._oAppModel.setProperty("/filter/count", oBinding.getLength());

        },

        onPressAboutApp: function () {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("train.sdelosreyes.managebooking.view.fragment.ApplicationInformation", this);
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },

        onPressEdit: function (oEvent) {
            let sPath = oEvent.getSource().getBindingContext("bookings").sPath;
            let oBooking = this.getView().getModel("bookings").getProperty(sPath);
            let sDate = this.fnDateToString(oBooking.Fldate);

            this.getRouter().navTo("BookingDetails", {
                "action": "update",
                "airline": oBooking.Carrid,
                "flight": oBooking.Connid,
                "date": sDate,
                "bookid": oBooking.Bookid
            });
        },

        onPressNew: function () {
            this.getRouter().navTo("BookingDetails", {
                "action": "create"
            });
        },

        onPressDelete: function (oEvent) {
            let sProperty = oEvent.getSource().getBindingContext("bookings").sPath;
            let oData = this._oBooking.getProperty(sProperty);
            let sPath = "/FlightBooksSet" + oData.__metadata.uri.split("FlightBooksSet")[1];
            let that = this;

            MessageBox.confirm("Are you sure you want to delete Booking " + oData.Bookid + "?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {

                    if (sAction === "OK") {
                        that._oDataModel.remove(sPath, {
                            success: function (oData) {
                                MessageToast.show("Booking successfully deleted!");
                                that.fnGetBookingList();
                            },
                            error: function () {
                                MessageToast.show("Error in deleting booking!");
                            }
                        })
                    }
                }
            });
        }
    });
});