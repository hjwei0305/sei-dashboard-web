import constants from './constants';
import { utils } from 'suid'
import * as userUtils from './user';


const { storage, constants: suidConstants } = utils;

const getCurrentUserContext = () => {
  const userContext = storage.sessionStorage.get(suidConstants.CONST_GLOBAL.CURRENT_USER) || null;
  return userContext;

};

export {
  constants,
  userUtils,
  getCurrentUserContext,
};
