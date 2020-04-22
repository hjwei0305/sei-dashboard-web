/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:33 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-20 17:40:14
 */

import { message } from "antd";
import { utils } from 'suid';
import { getSceneById, getScreenTemplateList } from "../service";

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
    namespace: "screen",

    state: {
        currentScreenTemplate: '',
        showScreenTemplateAssets: false,
        showSettings: false,
        templateAssetList: [],

    },
    effects: {
        * getSceneById({ payload }, { call, put }) {
            const re = yield call(getSceneById, payload);
            if (re.success) {
                const { lastEditedDate, lastEditorName, config } = re.data;
                if (config) {
                    // const configData = JSON.parse(config);
                }
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
        * getScreenTemplateList({ payload }, { call, put }) {
            const re = yield call(getScreenTemplateList, payload);
            if (re.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        templateAssetList: re.data
                    }
                });
            } else {
                message.error(re.message);
            }
        },
    }
});
