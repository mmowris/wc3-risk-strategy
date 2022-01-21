"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStrictErrors = void 0;
const ora_1 = __importDefault(require("ora"));
const strictFiles_1 = require("./lib/strictFiles");
const compile_1 = require("./lib/compile");
const path_1 = __importDefault(require("path"));
const findStrictErrors = async (args) => {
    const { onFoundChangedFiles, onCheckFile } = args;
    const strictFilePaths = await waitWithSpinner(strictFiles_1.findStrictFiles, 'Looking for strict files...');
    onFoundChangedFiles(strictFilePaths);
    if (strictFilePaths.length === 0) {
        return { success: true, errors: 0 };
    }
    const tscErrorMap = await waitWithSpinner(compile_1.compile, 'Compiling with strict mode...');
    const errorCount = strictFilePaths.reduce((currentErrorCount, fileName) => {
        var _a;
        const fileErrors = (_a = tscErrorMap.get(path_1.default.resolve(fileName))) !== null && _a !== void 0 ? _a : [];
        const errorCount = fileErrors.length;
        const hasErrors = errorCount > 0;
        onCheckFile(fileName, hasErrors);
        hasErrors && console.log(fileErrors.join('\n'));
        return currentErrorCount + errorCount;
    }, 0);
    return {
        success: errorCount === 0,
        errors: errorCount,
    };
};
exports.findStrictErrors = findStrictErrors;
async function waitWithSpinner(callback, message) {
    const spinner = ora_1.default(message).start();
    const callbackResult = await callback();
    spinner.stop();
    return callbackResult;
}
