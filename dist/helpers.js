"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateError = exports.getTranslationLanguage = exports.getTranslationValue = exports.getTranslationKey = void 0;
/**
 * Get translation key from `<trans-unit>` node of `XLIFF` file
 *
 * @param {Element} element - `<trans-unit>` node
 * @return {String} translation key
 */
exports.getTranslationKey = (element) => {
    const node = element.attributes[0];
    const regex = /\//gi;
    const replaceTo = '_';
    if (!node || !node.nodeValue) {
        return 'Something wrong with input file, the key should be in translation';
    }
    return node.nodeValue.replace(regex, replaceTo);
};
/**
 * Get translation value from `<target>` node of `XLIFF` file
 *
 * @param {Element} element - `<target>` node
 * @return {String} translation value
 */
exports.getTranslationValue = (element) => {
    const node = element.childNodes[0];
    if (!node || !node.nodeValue) {
        return 'Not translated yet';
    }
    return node.nodeValue;
};
/**
 *
 */
exports.getTranslationLanguage = (element) => {
    const node = element.attributes[2]; // de
    if (!node || !node.nodeValue) {
        return 'Something wrong with input file, the key should be in translation';
    }
    return node.nodeValue;
};
/**
 * Generate error message as:
 *    ```bash
 *    Error: Something went wrong
 *    Usage: node ./cli.js ./input.xlf ./output.json
 *    ```
 *
 * @param {Error} error
 */
exports.generateError = (error) => {
    return `\n\x1b[31mError:\t${error.message}\x1b[0m\nUsage:\t${error.usage}\n\n`;
};
