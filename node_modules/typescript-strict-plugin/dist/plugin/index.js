"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strictFiles_1 = require("./strictFiles");
const utils_1 = require("./utils");
const init = () => {
    function create(info) {
        const proxy = utils_1.setupProxy(info);
        utils_1.log(info, 'Plugin initialized');
        proxy.getSemanticDiagnostics = function (fileName) {
            const strictFile = new strictFiles_1.StrictFileChecker(info).isFileStrict(fileName);
            if (strictFile) {
                utils_1.turnOnStrictMode(info, info.project.getCompilerOptions());
            }
            else {
                utils_1.turnOffStrictMode(info, info.project.getCompilerOptions());
            }
            return info.languageService.getSemanticDiagnostics(fileName);
        };
        return proxy;
    }
    return { create };
};
module.exports = init;
