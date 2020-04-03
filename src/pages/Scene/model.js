/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:33 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-03 21:09:08
 */

import { formatMessage } from "umi-plugin-react/locale";
import { message } from "antd";
import { utils } from 'suid';
import { constants } from '../../utils';
import { getSceneList, saveScene, delScene, getWidgetAssets, getWidgetInstanceById, saveSceneConfig, getSceneById } from "./service";

const { pathMatchRegexp, dvaModel, storage } = utils;
const { modelExtend, model } = dvaModel;
const { ECHART } = constants
const defaultSkin = storage.localStorage.get("primarySkin") || 'light';

export default modelExtend(model, {
    namespace: "scene",

    state: {
        lastEditedDate: null,
        sceneData: [],
        currentSceneId: '',
        currentSceneData: '',
        widgetData: [],
        showWidgetAssets: false,
        showSettings: false,
        theme: {
            primarySkin: defaultSkin,
            echart: ECHART[defaultSkin],
        }
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(location => {
                if (pathMatchRegexp("/scene/home", location.pathname)) {
                    dispatch({
                        type: "getSceneList"
                    });
                }
            });
        }
    },
    effects: {
        * getSceneList({ payload }, { call, put }) {
            const re = yield call(getSceneList, payload);
            if (re.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        sceneData: re.data,
                    }
                });
            } else {
                message.error(re.message);
            }
        },
        * getSceneById({ payload }, { call, put }) {
            const re = yield call(getSceneById, payload);
            if (re.success) {
                const currentSceneData = re.data;
                yield put({
                    type: "updateState",
                    payload: {
                        currentSceneData,
                        lastEditedDate: currentSceneData.lastEditedDate,
                    }
                });
            } else {
                message.error(re.message);
            }
        },
        * saveScene({ payload, callback }, { call }) {
            const re = yield call(saveScene, payload);
            message.destroy();
            if (re.success) {
                message.success(formatMessage({ id: "global.save-success", defaultMessage: "保存成功" }));
            } else {
                message.error(re.message);
            }
            if (callback && callback instanceof Function) {
                callback(re);
            }
        },
        * saveSceneConfig({ payload, callback }, { call, put }) {
            const re = yield call(saveSceneConfig, payload);
            message.destroy();
            if (re.success) {
                message.success(formatMessage({ id: "global.save-success", defaultMessage: "保存成功" }));
                yield put({
                    type: "updateState",
                    payload: {
                        lastEditedDate: Date.now(),
                    }
                });
            } else {
                message.error(re.message);
            }
            if (callback && callback instanceof Function) {
                callback(re);
            }
        },
        * delScene({ payload, callback }, { call }) {
            const re = yield call(delScene, payload);
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
        * getWidgetAssets({ payload }, { call, put }) {
            const re = yield call(getWidgetAssets, payload);
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
        * getWidgetInstanceById({ payload, callback }, { call, put }) {
            const re = yield call(getWidgetInstanceById, payload);
            if (!re.success) {
                message.error(re.message);
            }
            if (callback && callback instanceof Function) {
                callback(re);
            }
        },
    }
});
