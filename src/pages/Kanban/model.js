import { message } from "antd";
import { utils } from 'suid';
import { constants } from '../../utils';
import { getSceneByCode } from "./service";

const { pathMatchRegexp, dvaModel, storage } = utils;
const { modelExtend, model } = dvaModel;
const { ECHART } = constants
const defaultSkin = storage.localStorage.get("primarySkin") || 'light';

export default modelExtend(model, {
    namespace: "portalHome",

    state: {
        sceneData: [],
        theme: {
            primarySkin: defaultSkin,
            echart: ECHART[defaultSkin],
        }
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(location => {
                const match = pathMatchRegexp('/scene/kanban/:code', location.pathname);
                if (match) {
                    dispatch({
                        type: "getSceneByCode",
                        payload: {
                            code: match[1],
                        }
                    });
                }
            });
        }
    },
    effects: {
        * getSceneByCode({ payload }, { call, put }) {
            const re = yield call(getSceneByCode, payload);
            if (re.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        sceneData: re.data
                    }
                });
            } else {
                message.error(re.message);
            }
        },
    }
});
