var useMinFile = findQueryString("useMinFile");
var appSourcesRoot = "";

var ampRoot = appSourcesRoot + "../../../";

AMPUtils.loadAllScripts(true, '');

//var amveRoot = appSourcesRoot + "../../../Plugins/Extensions/Editor/";
//var amveSourceList = [
//    "AMVE.min.js"
//];

// Load AMVE sources
var amveRoot = ampRoot + "Plugins/Extensions/Editor/";
var amveSourceList = ["AMVESourceLoader.js"];
AMPUtils.loadAllScripts(amveSourceList, amveRoot);

var amveSampleAppSourcesRoot = "./"
var amveSampleAppSourceList = [
    "amveSampleApp.js"
];

AMPUtils.loadAllScripts(amveSampleAppSourceList, amveSampleAppSourcesRoot);