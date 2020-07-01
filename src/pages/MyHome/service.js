/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:43
 * @Last Modified by: Eason
 * @Last Modified time: 2020-07-01 21:17:47
 */

import { utils } from 'suid';
import { constants } from '../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/**
 * 获取平台首页实例应用场景
 */
export async function getSceneHome() {
  const url = `${SERVER_PATH}/sei-dashboard/scene/getSceneHome`;
  return request({
    url,
    method: 'GET',
  });
}

/** 保存场景配置信息 */
export async function saveSceneConfig(data) {
  const url = `${SERVER_PATH}/sei-dashboard/scene/saveConfig`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 获取组件实例资源 */
export async function getWidgetAssets() {
  const url = `${SERVER_PATH}/sei-dashboard/widgetInstance/getWidgetInstanceTrees`;
  return request({
    url,
    method: 'GET',
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
    method: 'GET',
    params,
  });
}
