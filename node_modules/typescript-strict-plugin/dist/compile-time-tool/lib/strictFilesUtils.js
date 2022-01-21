"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterFilesWithStrictComment = exports.getStrictFilePaths = exports.isFileOnStrictPath = void 0;
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const typescript = __importStar(require("./typescript"));
const constants_1 = require("../../common/constants");
const utils_1 = require("../../common/utils");
const COMMENT_START = '//';
const getAbsolutePath = (projectRootPath, filePath) => {
    if (path_1.isAbsolute(filePath))
        return filePath;
    return path_1.resolve(projectRootPath, filePath);
};
const isFileOnStrictPath = (currentFilePath, pathToStrictFiles) => {
    const absolutePathToStrictFiles = getAbsolutePath(process.cwd(), pathToStrictFiles);
    return utils_1.getPosixFilePath(currentFilePath).startsWith(utils_1.getPosixFilePath(absolutePathToStrictFiles));
};
exports.isFileOnStrictPath = isFileOnStrictPath;
const getStrictFilePaths = async () => {
    var _a, _b, _c;
    const tscConfigRaw = await typescript.showConfig();
    const tscConfig = JSON.parse(tscConfigRaw);
    const plugins = (_a = tscConfig === null || tscConfig === void 0 ? void 0 : tscConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.plugins;
    return (_c = (_b = plugins === null || plugins === void 0 ? void 0 : plugins.find((plugin) => plugin.name === constants_1.PLUGIN_NAME)) === null || _b === void 0 ? void 0 : _b.paths) !== null && _c !== void 0 ? _c : [];
};
exports.getStrictFilePaths = getStrictFilePaths;
const filterFilesWithStrictComment = (filesCheckedByTS) => {
    return filesCheckedByTS.filter((fileName) => {
        const allLines = fs_1.default.readFileSync(fileName).toString().split('\n');
        const comments = allLines.filter((line) => line.startsWith(COMMENT_START));
        return comments.some((comment) => Array.from(comment)
            .filter((char) => char !== '/')
            .join('')
            .trim()
            .startsWith(constants_1.TS_STRICT_COMMENT));
    });
};
exports.filterFilesWithStrictComment = filterFilesWithStrictComment;
