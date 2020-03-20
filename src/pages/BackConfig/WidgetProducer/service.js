import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 获取仪表组列表*/
export async function getWidgetGroupList(params) {
  const url = `${SERVER_PATH}/sei-dashborad/widgetGroup/findAll`;
  return request({
    url,
    method: "GET",
    params,
  });
}

/** 仪表组保存 */
export async function saveWidgetGroup(data) {
  const url = `${SERVER_PATH}/sei-dashborad/widgetGroup/save`;
  return request({
    url,
    method: "POST",
    data,
  });
}

/** 仪表组删除 */
export async function delWidgetGroup(params) {
  const url = `${SERVER_PATH}/sei-dashborad/widgetGroup/delete/${params.id}`;
  return request({
    url,
    method: "DELETE",
  });
}

/** 仪表组件实例保存 */
export async function saveWidgetInstance(data) {
  const url = `${SERVER_PATH}/sei-dashborad/widgetInstance/save`;
  return request({
    url,
    method: "POST",
    data,
  });
}

/** 仪表组件实例删除 */
export async function delWidgetInstance(params) {
  const url = `${SERVER_PATH}/sei-dashborad/widgetInstance/delete/${params.id}`;
  return request({
    url,
    method: "DELETE",
  });
}

/** 获取组件类型列表*/
export async function getWidgetList(params) {
  const url = `${SERVER_PATH}/sei-dashborad/widgetType/findAll`;
  return request({
    url,
    method: "GET",
    params,
  });
}
