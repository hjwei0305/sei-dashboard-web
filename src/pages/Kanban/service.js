import { utils } from 'suid';
import { constants } from '../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 
 * 根据代码获取实例应用场景
 * @code 场景代码
 */
export async function getSceneByCode(params) {
    const url = `${SERVER_PATH}/sei-dashboard/scene/findByCode`;
    return request({
        url,
        method: "GET",
        params,
    });
}

/** 
 * 获取平台首页实例应用场景
 */
export async function getSceneHome() {
    const url = `${SERVER_PATH}/sei-dashboard/scene/getSceneHome`;
    return request({
        url,
        method: "GET",
    });
}