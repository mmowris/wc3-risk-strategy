#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const find_strict_errors_1 = require("./find-strict-errors");
const run = async () => {
    const result = await find_strict_errors_1.findStrictErrors({
        onFoundChangedFiles: (strictFiles) => {
            console.log(`🎯  Found ${chalk_1.default.bold(String(strictFiles.length))} strict files`);
        },
        onCheckFile: (file, hasError) => hasError
            ? console.log(`❌  ${chalk_1.default.bold(file)} failed`)
            : console.log(`✅  ${chalk_1.default.bold(file)} passed`),
    });
    if (result.errors) {
        console.log(`💥  ${result.errors} errors found`);
        process.exit(1);
    }
    else {
        console.log(`🎉  ${chalk_1.default.green('All files passed')}`);
    }
};
run();
