/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:43 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-03 21:06:50
 */


import { utils } from 'suid';
import { constants } from '../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 获取所有的场景*/
export async function getSceneList(params) {
    const url = `${SERVER_PATH}/sei-dashboard/scene/findAll`;
    return request({
        url,
        method: "GET",
        params,
    });
}

/** 保存场景基本信息*/
export async function saveScene(data) {
    const url = `${SERVER_PATH}/sei-dashboard/scene/saveScene`;
    return request({
        url,
        method: "POST",
        data,
    });
}

/** 保存场景配置信息*/
export async function saveSceneConfig(data) {
    const url = `${SERVER_PATH}/sei-dashboard/scene/saveConfig`;
    return request({
        url,
        method: "POST",
        data,
    });
}

/** 删除场景*/
export async function delScene(params) {
    const url = `${SERVER_PATH}/sei-dashboard/scene/delete/${params.id}`;
    return request({
        url,
        method: "DELETE",
    });
}

/** 
 * 根据场景Id获取一个场景
 * @id 场景Id
*/
export async function getSceneById(params) {
    const url = `${SERVER_PATH}/sei-dashboard/scene/findOne`;
    return request({
        url,
        method: "GET",
        params,
    });
}

/** 获取组件实例资源 */
export async function getWidgetAssets() {
    const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/getWidgetInstanceTrees`;
    return request({
        url,
        method: "GET"
    });
}

/** 
 * 根据组件实例id获取组件实例 
 * @id 组件实例id
 */
export async function getWidgetInstanceById(params) {
    const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/findOne`;
    return request({
        url,
        method: "GET",
        params,
    });
}
