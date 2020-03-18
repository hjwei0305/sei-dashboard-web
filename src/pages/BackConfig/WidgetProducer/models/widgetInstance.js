import { delWidgetInstance, saveWidgetInstance, getWidgetList } from "../service";
import { message } from "antd";
import { formatMessage } from "umi-plugin-react/locale";
import { utils } from 'suid';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: "widgetInstance",

  state: {
    listData: [],
    currentWidgetInstance: null,
    showFormModal: false,
    widgetData: [],
  },
  effects: {
    * saveWidgetInstance({ payload, callback }, { call, put }) {
      const re = yield call(saveWidgetInstance, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: "global.save-success", defaultMessage: "保存成功" }));
        yield put({
          type: "updateState",
          payload: {
            showFormModal: false
          }
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    * delWidgetInstance({ payload, callback }, { call }) {
      const re = yield call(delWidgetInstance, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: "global.delete-success", defaultMessage: "删除成功" }));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    * getWidgetList({ payload }, { call, put }) {
      const re = yield call(getWidgetList, payload);
      if (re.success) {
        yield put({
          type: "updateState",
          payload: {
            widgetData: re.data
          }
        });
      } else {
        message.error(re.message);
      }
    },
  }
});
