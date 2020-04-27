/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:33
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:33:37
 */

import { formatMessage } from 'umi-plugin-react/locale';
import { message } from 'antd';
import { utils } from 'suid';
import {
  getSceneList,
  saveScene,
  delScene,
  saveSceneConfig,
  getWidgetAssets,
  getWidgetInstanceById,
} from '../service';

const { pathMatchRegexp, dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'scene',

  state: {
    widgetAssetList: [],
    lastEditedDate: null,
    lastEditorName: '',
    sceneData: [],
    currentScene: '',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/scene/home', location.pathname)) {
          dispatch({
            type: 'getSceneList',
          });
        }
      });
    },
  },
  effects: {
    *getSceneList({ payload }, { call, put }) {
      const re = yield call(getSceneList, payload);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            sceneData: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *saveScene({ payload, callback }, { call }) {
      const re = yield call(saveScene, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *saveSceneConfig({ payload, callback }, { call, put }) {
      const re = yield call(saveSceneConfig, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            lastEditedDate: Date.now(),
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *delScene({ payload, callback }, { call }) {
      const re = yield call(delScene, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *getWidgetAssets({ payload }, { call, put }) {
      const re = yield call(getWidgetAssets, payload);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            widgetAssetList: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *getWidgetInstanceById({ payload, successCallback }, { call }) {
      const re = yield call(getWidgetInstanceById, payload);
      if (re.success) {
        successCallback(re.data);
      } else {
        message.error(re.message);
      }
    },
  },
});
