"use strict";
/**
 * Inspired by https://github.com/kolodziejczakM/xliff_to_json_converter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmldom_1 = require("xmldom");
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("./helpers");
const lodash_1 = require("lodash");
const inputFile = process.argv[2];
let language = '';
/**
 * Writes a JSON file as `translation.<lang>.json`
 *
 * @param inputFile
 */
const main = (inputFile) => {
    const error = {
        message: 'You must specify input file',
        usage: 'node ./cli.js ./de_DE.xlf',
    };
    if (!inputFile) {
        process.stdout.write(helpers_1.generateError(error));
        return;
    }
    fs_1.default.readFile(inputFile, (err, xmlContent) => {
        if (err) {
            throw err;
        }
        createOutputJSON(generateJSONContent(getTranslationNodes(xmlContent)));
    });
};
/**
 * Write down a generated json content to file.
 *
 * @param {string} content
 */
const createOutputJSON = (content) => {
    // TODO: probably we should use another cli parameter to be more flexible
    const fileName = `./translation.${language}.json`;
    fs_1.default.writeFile(`${fileName}`, content, err => {
        if (err) {
            throw err;
        }
        console.info(`\n\tJSON generated to: ${fileName}\n`);
    });
};
/**
 * Get translation nodes from XLIFF.
 *
 * @param {Buffer} xmlContent
 * @return {HTMLCollectionOf<Element>} translationUnits, translationTargets
 */
const getTranslationNodes = (xmlContent) => {
    const inputDoc = new xmldom_1.DOMParser().parseFromString(xmlContent.toString());
    const translationUnits = inputDoc.getElementsByTagName('trans-unit');
    const translationTargets = inputDoc.getElementsByTagName('target');
    const translationLanguages = inputDoc.getElementsByTagName('file');
    return { translationUnits, translationTargets, translationLanguages };
};
/**
 * Generates JSON content
 *
 * @param {TranslationNodes} translationNodes
 */
const generateJSONContent = (translationNodes) => {
    const { translationUnits, translationTargets, translationLanguages } = translationNodes;
    const keysArray = Array.from(translationUnits).map(unit => helpers_1.getTranslationKey(unit));
    const valuesArray = Array.from(translationTargets).map(target => helpers_1.getTranslationValue(target));
    const languageArray = Array.from(translationLanguages).map(lang => helpers_1.getTranslationLanguage(lang));
    language = languageArray[0];
    const content = lodash_1.zipObject(keysArray, valuesArray);
    return JSON.stringify(content, null, 2);
};
main(inputFile);
