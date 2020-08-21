/**
 * Inspired by https://github.com/kolodziejczakM/xliff_to_json_converter
 */
import { DOMParser } from 'xmldom';
import fs from 'fs';
import { Error, generateError, getTranslationKey, getTranslationLanguage, getTranslationValue } from './helpers';
import { zipObject } from 'lodash';

/**
 * Common config.
 *    ```
 *    inputFile:      #: de_DE.xlf
 *    outputFileName: #: translation `it produce filename: translation.de.json
 *    language:       #: undefined by default, takes from inputFile
 *    ```
 */
const config = {
  inputFile: process.argv[2],
  outputFileName: process.argv[3] ?? 'translation',
  language: '',
};

type File = string | number | Buffer | URL;

/**
 * All nodes that we need to generate json file.
 */
type TranslationNodes = {
  translationUnits: HTMLCollectionOf<Element>;
  translationTargets: HTMLCollectionOf<Element>;
  translationLanguages: HTMLCollectionOf<Element>;
};

/**
 * Writes a JSON file as `translation.<lang>.json`
 *
 * @param {File} inputFile
 */
const main = (inputFile: File) => {
  const error: Error = {
    message: 'You must specify input file',
    usage: 'node ./cli.js ./de_DE.xlf',
  };

  if (!inputFile) {
    process.stdout.write(generateError(error));
    return;
  }

  fs.readFile(inputFile, (err, xmlContent) => {
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
const createOutputJSON = (content: string) => {
  const fileName = `./${config.outputFileName}.${config.language}.json`;

  fs.writeFile(`${fileName}`, content, err => {
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
 * @return {HTMLCollectionOf<Element>} translationUnits, translationTargets, translationLanguages
 */
const getTranslationNodes = (xmlContent: Buffer) => {
  const inputDoc = new DOMParser().parseFromString(xmlContent.toString());

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
const generateJSONContent = (translationNodes: TranslationNodes) => {
  const { translationUnits, translationTargets, translationLanguages } = translationNodes;

  const keysArray = Array.from(translationUnits).map(unit => getTranslationKey(unit));
  const valuesArray = Array.from(translationTargets).map(target => getTranslationValue(target));
  const languageArray = Array.from(translationLanguages).map(lang => getTranslationLanguage(lang));

  config.language = languageArray[0];
  const content = zipObject(keysArray, valuesArray);

  return JSON.stringify(content, null, 2);
};

main(config.inputFile);
