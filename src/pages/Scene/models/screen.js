/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:33
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:34:15
 */

import { message } from 'antd';
import { utils } from 'suid';
import { getSceneById, getScreenTemplateList, getScreenTemplateConfig } from '../service';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'screen',

  state: {
    currentScreenTemplate: '',
    showScreenTemplateAssets: false,
    showTemplateConfig: false,
    templateAssetList: [],
    globalConfig: {},
    templateConfig: {},
    instanceDtos: [],
  },
  effects: {
    *getSceneById({ payload }, { call, put }) {
      const re = yield call(getSceneById, payload);
      if (re.success) {
        const { lastEditedDate, lastEditorName, config, instanceDtos } = re.data;
        let currentScreenTemplate = '';
        let templateConfig = {};
        const globalConfig = {};
        if (config) {
          const configData = JSON.parse(config);
          currentScreenTemplate = configData.screenTemplate;
          Object.assign(globalConfig, configData.globalConfig);
          if (configData.templateConfig) {
            Object.assign(templateConfig, configData.templateConfig);
          } else {
            const resTemplateConfig = yield call(getScreenTemplateConfig, currentScreenTemplate);
            templateConfig = resTemplateConfig.data;
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            currentScreenTemplate,
            globalConfig,
            templateConfig,
            instanceDtos,
          },
        });
        yield put({
          type: 'scene/updateState',
          payload: {
            lastEditedDate,
            lastEditorName,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *getScreenTemplateList({ payload }, { call, put }) {
      const re = yield call(getScreenTemplateList, payload);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            showScreenTemplateAssets: true,
            templateAssetList: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *getScreenTemplateConfig({ payload }, { call, put }) {
      const re = yield call(getScreenTemplateConfig, payload.template);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            showTemplateConfig: true,
            templateConfig: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
  },
});
