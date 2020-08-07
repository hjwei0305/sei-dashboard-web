import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { delWidgetGroup, getWidgetGroupList, saveWidgetGroup } from '../service';

const { pathMatchRegexp, dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'widgetGroup',

  state: {
    listData: [],
    currentWidgetGroup: null,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/backConfig/widgetProducer', location.pathname)) {
          dispatch({
            type: 'getWidgetGroupList',
          });
        }
      });
    },
  },
  effects: {
    *getWidgetGroupList({ payload }, { call, put }) {
      const re = yield call(getWidgetGroupList, payload);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            listData: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *saveWidgetGroup({ payload, callback }, { call, put }) {
      const re = yield call(saveWidgetGroup, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            currentWidgetGroup: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *delWidgetGroup({ payload, callback }, { call, put }) {
      const re = yield call(delWidgetGroup, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
        yield put({
          type: 'updateState',
          payload: {
            currentWidgetGroup: null,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
