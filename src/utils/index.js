import constants from './constants';
import { utils } from 'suid'
import { endsWith, startsWith } from 'lodash'
import * as userUtils from './user';


const { storage, constants: suidConstants } = utils;

const getCurrentUserContext = () => {
  const userContext = storage.sessionStorage.get(suidConstants.CONST_GLOBAL.CURRENT_USER) || null;
  return userContext;

};

const getHashCode = (len = 6) => {
  let str = "";
  const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  for (let i = 0; i < len; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

const formartUrl = (originUrl) => {
  if (startsWith(originUrl, 'http')) {
    return originUrl;
  }
  const url = startsWith(originUrl, '/') ? originUrl.substr(1) : originUrl;
  return `/${url}`;
}

export {
  formartUrl,
  constants,
  userUtils,
  getCurrentUserContext,
  getHashCode,
};
