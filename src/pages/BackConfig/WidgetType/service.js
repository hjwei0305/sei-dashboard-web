import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 获取组件类型列表 */
export async function getList(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetType/findAll`;
  return request({
    url,
    method: 'GET',
    params,
  });
}

/** 组件类型保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetType/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 组件类型删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetType/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
