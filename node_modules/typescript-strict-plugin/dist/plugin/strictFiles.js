"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrictFileChecker = void 0;
const path_1 = __importDefault(require("path"));
const constants_1 = require("../common/constants");
const utils_1 = require("../common/utils");
class StrictFileChecker {
    constructor(info) {
        this.info = info;
        this.currentDirectory = info.project.getCurrentDirectory();
    }
    isFileStrict(filePath) {
        const { paths: pathsToTurnOnStrictMode = [] } = this.info.config;
        if (this.isTsStrictCommentPresent(filePath)) {
            return true;
        }
        return pathsToTurnOnStrictMode.some((strictPath) => this.isFileOnPath(filePath, strictPath));
    }
    isFileOnPath(currentFilePath, pathToStrictFiles) {
        const absolutePathToStrictFiles = getAbsolutePath(this.currentDirectory, pathToStrictFiles);
        return utils_1.getPosixFilePath(currentFilePath).startsWith(utils_1.getPosixFilePath(absolutePathToStrictFiles));
    }
    isTsStrictCommentPresent(fileName) {
        const tsStrictComments = this.info.languageService.getTodoComments(fileName, [
            { text: constants_1.TS_STRICT_COMMENT, priority: 0 },
        ]);
        return tsStrictComments.length > 0;
    }
}
exports.StrictFileChecker = StrictFileChecker;
function getAbsolutePath(projectRootPath, filePath) {
    if (path_1.default.isAbsolute(filePath))
        return filePath;
    return path_1.default.resolve(projectRootPath, filePath);
}
