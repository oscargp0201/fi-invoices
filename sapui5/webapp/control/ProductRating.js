sap.ui.define([
    'sap/ui/core/Control',
    'sap/m/RatingIndicator',
    'sap/m/Label',
    'sap/m/Button'
],
    function (Control, RatingIndicator, Label, Button) {
        'use strict';
        return Control.extend("logaligroup.SAPUI5.control.ProductRating", {
            metadata: {
                properties: {
                    value: { type: "float", defaultValue: 0 }
                },
                aggregations: {
                    _rating: {
                        type: "sap.m.RatingIndicator",
                        multiple: false,
                        visibility: "hidden"
                    },
                    _label: {
                        type: "sap.m.Label",
                        multiple: false,
                        visibility: "hidden"
                    },
                    _button: {
                        type: "sap.m.Button",
                        multiple: false,
                        visibility: "hidden"
                    }
                },
                events: {
                    change: {
                        parameters: {
                            value : {type: "int"}
                        }
                    }
                }

            },
            init: function () {
                this.setAggregation("_rating", new RatingIndicator({
                    value: this.getValue(),
                    iconSize: "2rem",
                    visualMode: "Half",
                    liveChange: this._onRate.bind(this)
                }));
                this.setAggregation("_label", new Label( {
                    text: "{i18n>productRatingLabelInitial}"
                }).addStyleClass("sapUiSmallMargin"));
                this.setAggregation("_button", new Button({
                    text: "{i18n>productRatingButton}",
                    press:  this._onSubmit.bind(this)
                }).addStyleClass("sapUiTinyMarginTopButtom"));
            },
            _onRate: function(oEvent){
                const OResourceBundle = this.getModel("i18n").getResourceBundle();
                const fValue = oEvent.getParameter("value");
                this.setProperty("value", fValue, true);
                this.setAggregation("_label").setText(OResourceBundle.getText("productRatingLabelIndicator", [fValue, oEvent.getSource().getMaxValue()]));
                this.setAggregation("_label").setDesign("Bold");
            },
            _onSubmit: function(oEvent){
                const oResourceBundle = this.getModel("i18n").getResourceBundle();
                this.getAggregation("_rating").setEnabled(false);
                this.getAggregation("_label").setText(oResourceBundle.getText("productRatingLabelFinal"));
                this.getAggregation("_button").setEnabled(false);
                this.fireEvent("change", {
                    value: this.getValue()
                });
            },

            setValue: function(fValue) {
                this.setProperty("value", fValue, true);
                this.getAggregation("_rating").setValue(fValue);
            },

            reset: function() {
                const OResourceBundle = this.getModel("i18n").getResourceBundle();
                this.setValue(0);
                this.getAggregation("_rating").setEnabled(true);
                this.getAggregation("_button").setEnabled(true);
                this.getAggregation("_label").setText(OResourceBundle.getText("productRatingLabelInitial"));
                this.getAggregation("_label").setDesign("Standard");    
            },

            renderer: function(oRm , oControl) {
                oRm.openStart("div", oControl);
                oRm.class("productRating");
                oRm.openEnd();
                oRm.renderControl(oControl.getAggregation("_rating"));
                oRm.renderControl(oControl.getAggregation("_label"));
                oRm.renderControl(oControl.getAggregation("_button"));
                oRm.close("div");
            }
            
        });
    });