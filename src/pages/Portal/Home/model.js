import { getWidgetInstanceList } from "./service";
import { message } from "antd";
import { utils } from 'suid';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
    namespace: "portalHome",

    state: {
        widgetData: [],
        showWidgetAssets: false,
    },
    effects: {
        * getWidgetAssets({ payload }, { call, put }) {
            const re = yield call(getWidgetInstanceList, payload);
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
