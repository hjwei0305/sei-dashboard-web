import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 获取看板组列表*/
export async function getWidgetGroupList(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetGroup/findAll`;
  return request({
    url,
    method: "GET",
    params,
  });
}

/** 看板组保存 */
export async function saveWidgetGroup(data) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetGroup/save`;
  return request({
    url,
    method: "POST",
    data,
  });
}

/** 看板组删除 */
export async function delWidgetGroup(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetGroup/delete/${params.id}`;
  return request({
    url,
    method: "DELETE",
  });
}

/** 看板组件实例保存 */
export async function saveWidgetInstance(data) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/save`;
  return request({
    url,
    method: "POST",
    data,
  });
}


/** 
 * 获取单个看板组件实例 
 * @id 实例Id
*/
export async function getWidgetInstanceById(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/findOne`;
  return request({
    url,
    params,
  });
}

/** 看板组件实例删除 */
export async function delWidgetInstance(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/delete/${params.id}`;
  return request({
    url,
    method: "DELETE",
  });
}

/** 获取组件类型列表*/
export async function getWidgetList(params) {
  const url = `${SERVER_PATH}/sei-dashboard/widgetType/findAll`;
  return request({
    url,
    method: "GET",
    params,
  });
}
