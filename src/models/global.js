import router from "umi/router";
import { stringify } from "qs";
import { message } from "antd";
import { utils } from 'suid';
import { userUtils, constants as localConstants } from '@/utils';
import { login, getAuthorizedFeatures, } from "@/services/api";

const {
  setCurrentAuth,
  setCurrentPolicy,
  setSessionId,
  setCurrentUser,
} = userUtils;

const { constants, storage } = utils;
const { CONST_GLOBAL } = constants;
const { LOGIN_STATUS } = localConstants;

const locale = storage.sessionStorage.get(CONST_GLOBAL.CURRENT_LOCALE) || 'zh-CN';

export default {
  namespace: "global",
  state: {
    showTenant: false,
    locationPathName: "/",
    locationQuery: {},
    locale: locale,
  },
  subscriptions: {
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: "updateState",
          payload: {
            locationPathName: location.pathname,
            locationQuery: location.query
          }
        });
      });
    }
  },
  effects: {
    * redirectLogin({ payload }, { call, put, select }) {
      const global = yield select(_ => _.global);
      const { locationPathName, locationQuery } = global;
      let location = locationPathName;
      if (location.indexOf("/user/login") !== -1) {
        location = locationQuery.from || "/";
      }
      router.replace({
        pathname: "/user/login",
        search: stringify({
          from: location
        })
      });
    },
    * login({ payload }, { call, put, select }) {
      const global = yield select(_ => _.global);
      const { locationQuery } = global;
      const res = yield call(login, payload);
      const { success, data, message: msg } = res || {};
      const { loginStatus, authorityPolicy, sessionId, userId } = data || {};
      message.destroy();
      storage.sessionStorage.clear();
      if (success) {
        switch (loginStatus) {
          case LOGIN_STATUS.SUCCESS:
            message.success("登录成功");
            setCurrentUser(data);
            setSessionId(sessionId);
            setCurrentPolicy(authorityPolicy);
            const authData = yield call(getAuthorizedFeatures, userId);
            if (authData.success) {
              setCurrentAuth(authData.data);
            }
            const { from } = locationQuery;
            if (from && from.indexOf("/user/login") === -1) {
              if (from === "/") {
                router.push("/dashboard");
              }
              else {
                router.push(from);
              }
            } else {
              router.push("/");
            }
            break;
          case LOGIN_STATUS.MULTI_TENANT:
            message.warning("需要输入租户账号");
            yield put({
              type: "updateState",
              payload: {
                ...global,
                showTenant: true,
              }
            });
            break;
          case LOGIN_STATUS.CAPTCHA_ERROR:
            message.error("验证码错误");
            break;
          case LOGIN_STATUS.FROZEN:
            message.error("账号被冻结");
            break;
          case LOGIN_STATUS.LOCKED:
            message.error("账号被锁定");
            break;
          case LOGIN_STATUS.FAILURE:
            message.error("账号或密码错误");
            break;
          default:
            message.error(msg || "登录失败");
        }
      } else {
        message.error(msg || "登录失败");
      }
    },
    * changeLocale({ payload }, { put, select }) {
      const { locale } = payload;
      const { locationQuery } = yield select(_ => _.global);
      storage.sessionStorage.set(CONST_GLOBAL.CURRENT_LOCALE, locale);
      yield put({
        type: 'updateState',
        payload: {
          locale
        }
      });
      router.replace({
        pathname: "/user/login",
        search: stringify({
          from: locationQuery.from
        })
      });
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
