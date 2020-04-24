/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:33 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-23 13:27:06
 */

import { message } from "antd";
import { utils } from 'suid';
import { constants } from '../../../utils';
import { getWidgetInstanceById, getSceneById } from "../service";

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const { ECHART } = constants
const defaultSkin = 'light';

export default modelExtend(model, {
    namespace: "dashboard",

    state: {
        widgetAssetList: [],
        showWidgetAssets: false,
        showSettings: false,
        widgets: [],
        layouts: {},
        widgetRenderData: [],
        templateAssetList: [],
        theme: {
            primarySkin: defaultSkin,
            echart: ECHART[defaultSkin],
        }
    },
    effects: {
        * getSceneById({ payload, getWidget }, { call, put }) {
            const re = yield call(getSceneById, payload);
            if (re.success) {
                const { lastEditedDate, lastEditorName, config, instanceDtos } = re.data;
                let layouts = {};
                let theme = {
                    primarySkin: defaultSkin,
                    echart: ECHART[defaultSkin],
                };
                if (config) {
                    const configData = JSON.parse(config);
                    layouts = configData.layouts;
                    theme = configData.theme;
                }
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
                yield put({
                    type: "scene/updateState",
                    payload: {
                        lastEditedDate,
                        lastEditorName,
                    }
                });
            } else {
                message.error(re.message);
            }
        },
        * getWidgetInstanceById({ payload, getWidget, startAutoSaveTimer }, { call, select, put }) {
            const { widgets: originWidgets, widgetRenderData } = yield select(sel => sel.dashboard);
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
