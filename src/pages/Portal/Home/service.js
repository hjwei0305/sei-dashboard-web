import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { LOCAL_PATH, SERVER_PATH } = constants;


export async function getWidgetAssets() {
    const url = `${LOCAL_PATH}/local/widgetData.json`;
    return request({
        url,
        method: "GET"
    });
}

/** 获取仪表组列表*/
export async function getWidgetInstanceList(params) {
    const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/findByWidgetGroup`;
    return request({
        url,
        method: "GET",
        params,
    });
}