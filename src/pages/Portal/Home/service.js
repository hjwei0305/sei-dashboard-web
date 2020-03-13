import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { LOCAL_PATH } = constants;


export async function getWidgetAssets() {
    const url = `${LOCAL_PATH}/local/widgetData.json`;
    return request({
        url,
        method: "GET"
    });
}