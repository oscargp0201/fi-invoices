sap.ui.define([
    'sap/ui/core/util/MockServer',
    'sap/ui/model/json/JSONModel',
    'sap/base/util/UriParameters',
    'sap/base/Log'
], function (MockServer, JSONModel, UriParameters, Log) {
    'use strict';
    let oMockServer;
    let _sAppPath = "logaligroup/SAPUI5/";
    let _sJsonFilesPath = _sAppPath + "localService/mockdata";
    let oMockServerInterface = {

        /**
         * @protected
         * @param {object} [oOptionsParameter] init parameters for the mock server
         * @returns {Promise} a promise that is resolved when the mock server has started 
         */

        init: function (oOptionsParameters) {

            let oOptions = oOptionsParameters || {};
            return new Promise(function (fnResolve, fnReject) {
                let sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json");
                let oManifestModel = new JSONModel(sManifestUrl);
                oManifestModel.attachRequestCompleted(function () {

                    let oUriParameters = new UriParameters(window.location.href);
                    let oJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath);
                    let oMainDataSource = oManifestModel.getProperty("/sap.app/dataSources/mainService");
                    let sMetadataUrl = sap.ui.require.toUrl(_sAppPath + oMainDataSource.settings.localUri);
                    let sMockServerUrl = oMainDataSource.uri && new URI(oMainDataSource.uri).absoluteTo(sap.ui.require.toUrl(_sAppPath)).toString();

                    if (!oMockServer) {
                        oMockServer = new MockServer({
                            rootUri: sMockServerUrl
                        });
                    } else {
                        oMockServer.stop();
                    };

                    MockServer.config({
                        autoRespond: true,
                        autoRespondAfter: (oOptions.delay || oUriParameters.get("serverDelay") || 500)
                    });

                    oMockServer.simulate(sMetadataUrl, {
                        sMockdataBaseUrl: oJsonFilesUrl,
                        bGenerateMissingMockData: true
                    });

                    let aRequests = oMockServer.getRequests();

                    // compose an error response for each request
                    var fnResponse = function (iErrCode, sMessage, aRequest) {
                        aRequest.response = function (oXhr) {
                            oXhr.respond(iErrCode, { "Content-Type": "text/plain;charset=utf-8" }, sMessage);
                        };
                    };

                    // simulate metadata errors
                    if (oOptions.metadataError || oUriParameters.get("metadataError")) {
                        aRequests.forEach(function (aEntry) {
                            if (aEntry.path.toString().indexOf("$metadata") > -1) {
                                fnResponse(500, "metadata Error", aEntry);
                            }
                        });
                    }

                    // simulate request errors
                    var sErrorParam = oOptions.errorType || oUriParameters.get("errorType"),
                        iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
                    if (sErrorParam) {
                        aRequests.forEach(function (aEntry) {
                            fnResponse(iErrorCode, sErrorParam, aEntry);
                        });
                    }

                    oMockServer.setRequests(aRequests);
                    oMockServer.start();
                    Log.info("Running the app with the mock data");

                    fnResolve();

                });

                oManifestModel.attachRequestFailed(function () {

                });
            });
        }
    };

    return oMockServerInterface;

});