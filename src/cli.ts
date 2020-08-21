/**
 * Inspired by https://github.com/kolodziejczakM/xliff_to_json_converter
 */

import { DOMParser } from 'xmldom';
import fs from 'fs';
import { generateError, getTranslationKey, getTranslationValue, Error, getTranslationLanguage } from './helpers';
import { zipObject } from 'lodash';

const inputFile = process.argv[2];
let language = '';

type TranslationNodes = {
  translationUnits: HTMLCollectionOf<Element>;
  translationTargets: HTMLCollectionOf<Element>;
  translationLanguages: HTMLCollectionOf<Element>;
};
type File = string | number | Buffer | URL;

/**
 * Writes a JSON file as `translation.<lang>.json`
 *
 * @param inputFile
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
  // TODO: probably we should use another cli parameter to be more flexible
  const fileName = `./translation.${language}.json`;

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
 * @return {HTMLCollectionOf<Element>} translationUnits, translationTargets
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

  language = languageArray[0];
  const content = zipObject(keysArray, valuesArray);

  return JSON.stringify(content, null, 2);
};

main(inputFile);
