/*
 * @Author: Eason
 * @Date: 2020-04-07 09:01:14
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:37:45
 */
import { startsWith, trim } from 'lodash';
import constants from './constants';
import * as userUtils from './user';

const getHashCode = (len = 6) => {
  let str = '';
  const arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  for (let i = 0; i < len; i += 1) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
};

const formartUrl = originUrl => {
  let url = trim(originUrl);
  if (startsWith(url, 'http')) {
    return url;
  }
  url = startsWith(url, '/') ? url.substr(1) : url;
  return `/${url}`;
};

export { formartUrl, constants, userUtils, getHashCode };
