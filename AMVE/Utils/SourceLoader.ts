module AMPUtils{
    'use strict';

    var projectRoot = projectRoot || '../';

    export function loadAllScripts(scriptsArr: string[], projectRootPath: string): void {
        
        // Allow overriding the default project root
        projectRoot = projectRootPath || projectRoot;

        for (var i = 0; i < scriptsArr.length; i++) {
            // Using document.write because that's the easiest way to avoid triggering
            // asynchrnous script loading
            if(scriptsArr[i].indexOf('http:') !== -1) {
                document.write("<script src='" + scriptsArr[i] + "'><\/script>");
            }
            else {
                document.write("<script src='" + projectRoot + scriptsArr[i] + "'><\/script>");
            }
        }
    }
} 