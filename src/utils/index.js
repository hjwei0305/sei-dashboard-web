/*
 * @Author: Eason
 * @Date: 2020-04-07 09:01:14
 * @Last Modified by: Eason
 * @Last Modified time: 2020-06-17 17:55:28
 */
import { startsWith, trim, endsWith } from 'lodash';
import moment from 'moment';
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

const formartUrl = (prefixUrl, suffixUrl) => {
  const originBaseUrl = trim(prefixUrl);
  const originUrl = trim(suffixUrl);
  const baseUrl = endsWith(originBaseUrl, '/')
    ? originBaseUrl.substr(1, originBaseUrl.length - 1)
    : originBaseUrl;

  const subUrl = startsWith(originUrl, '/') ? originUrl.substr(1) : originUrl;
  if (startsWith(baseUrl, 'http') || startsWith(baseUrl, '/')) {
    return subUrl ? `${baseUrl}/${subUrl}` : `${baseUrl}`;
  }
  return subUrl ? `/${baseUrl}/${subUrl}` : `/${baseUrl}`;
};

const taskColor = createdDate => {
  const days = moment().diff(createdDate, 'days');
  if (days <= 1) {
    return '#52c41a';
  }
  if (days <= 30) {
    return '#fa8c16';
  }
  return '#f5222d';
};

export { taskColor, formartUrl, constants, userUtils, getHashCode };
