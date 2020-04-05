/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:33 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-05 16:06:10
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
        lastEditorName: '',
        sceneData: [],
        currentScene: '',
        widgetAssetList: [],
        showWidgetAssets: false,
        showSettings: false,
        widgets: [],
        layouts: {},
        widgetRenderData: [],
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
        * getSceneById({ payload, getWidget }, { call, put }) {
            const re = yield call(getSceneById, payload);
            if (re.success) {
                const { lastEditedDate, lastEditorName, config, instanceDtos } = re.data;
                const { layouts, theme } = JSON.parse(config);
                const widgets = [];
                instanceDtos.forEach(w => {
                    const layoutKeys = Object.keys(layouts);
                    let layout = null;
                    if (layoutKeys.length > 0) {
                        const tmps = layouts[layoutKeys[0]].filter(l => l.i === w.id);
                        if (tmps.length > 0) {
                            layout = tmps[0];
                        }
                    }
                    const cmp = getWidget(w, layout);
                    if (cmp) {
                        widgets.push(cmp);
                    }
                });
                yield put({
                    type: "updateState",
                    payload: {
                        widgets,
                        layouts,
                        theme,
                        widgetRenderData: instanceDtos,
                        lastEditedDate,
                        lastEditorName,
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
                        widgetAssetList: re.data
                    }
                });
            } else {
                message.error(re.message);
            }
        },
        * getWidgetInstanceById({ payload, getWidget, startAutoSaveTimer }, { call, select, put }) {
            const { widgets: originWidgets, widgetRenderData } = yield select(sel => sel.scene);
            const re = yield call(getWidgetInstanceById, payload);
            if (re.success) {
                const widgets = [...originWidgets];
                const widgetInstance = re.data;
                const cmp = getWidget(widgetInstance);
                if (cmp) {
                    widgets.push(cmp);
                    widgetRenderData.push(widgetInstance);
                    yield put({
                        type: "updateState",
                        payload: {
                            widgets,
                            widgetRenderData,
                        }
                    });
                    startAutoSaveTimer();
                }
            } else {
                message.error(re.message);
            }
        },
    }
});
