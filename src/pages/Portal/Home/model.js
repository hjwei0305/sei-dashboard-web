import { getWidgetInstanceList } from "./service";
import { message } from "antd";
import { utils } from 'suid';
import { constants } from '../../../utils';

const { dvaModel, storage } = utils;
const { modelExtend, model } = dvaModel;
const { ECHART } = constants
const defaultSkin = storage.localStorage.get("primarySkin") || 'light';

export default modelExtend(model, {
    namespace: "portalHome",

    state: {
        widgetData: [],
        showWidgetAssets: false,
        showSettings: false,
        theme: {
            primarySkin: defaultSkin,
            echart: ECHART[defaultSkin],
        }
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
