import { utils, message } from 'suid';
import { getSceneByCode } from './service';

const { pathMatchRegexp, dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'screenView',

  state: {
    currentScreenTemplate: '',
    globalConfig: {},
    templateConfig: {},
    instanceDtos: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/scene/screenView/:code', location.pathname);
        if (match) {
          dispatch({
            type: 'getScene',
            payload: {
              code: match[1],
              home: false,
            },
          });
        }
      });
    },
  },
  effects: {
    *getScene({ payload }, { call, put }) {
      const { code } = payload;
      const re = yield call(getSceneByCode, { code });
      if (re.success) {
        let currentScreenTemplate = '';
        let instanceDtos = [];
        let templateConfig = {};
        let globalConfig = {};
        const { config, instanceDtos: originInstanceDtos } = re.data || {
          config: null,
          instanceDtos: [],
        };
        if (config) {
          const configData = JSON.parse(config);
          const {
            screenTemplate,
            templateConfig: originTemplateConfig,
            globalConfig: originGlobalConfig,
          } = configData;
          currentScreenTemplate = screenTemplate;
          instanceDtos = originInstanceDtos;
          templateConfig = originTemplateConfig;
          globalConfig = originGlobalConfig;
        }
        yield put({
          type: 'updateState',
          payload: {
            currentScreenTemplate,
            globalConfig,
            instanceDtos,
            templateConfig,
          },
        });
      } else {
        message.error(re.message);
      }
    },
  },
});
