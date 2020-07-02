/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:33
 * @Last Modified by: Eason
 * @Last Modified time: 2020-07-02 11:16:06
 */
import React from 'react';
import { omit, toLower, get } from 'lodash';
import { formatMessage } from 'umi-plugin-react/locale';
import { message } from 'antd';
import { utils } from 'suid';
import { Widgets } from '../../components';
import { constants, userUtils } from '../../utils';
import { getWidgetInstanceById, getSceneHome, getWidgetAssets, saveSceneConfig } from './service';

const { pathMatchRegexp, dvaModel, storage } = utils;
const { modelExtend, model } = dvaModel;
const { ECHART, AUTH_POLICY } = constants;
const currentUser = userUtils.getCurrentUser();
console.log(currentUser);
const {
  EchartPie,
  EchartBarLine,
  StatisticGrid,
  MyWorkTodo,
  MyWorkDone,
  MyOrderInProcess,
  MyFavoriteMenu,
} = Widgets;
const { COMPONENT_TYPE } = constants;
const defaultSkin = storage.localStorage.get('primarySkin') || 'light';

const getWidget = (widget, layout, theme) => {
  const { primarySkin, echart } = theme;
  if (widget.renderConfig) {
    const renderConfig = JSON.parse(widget.renderConfig);
    const { component } = renderConfig;
    const defaultLayout = layout || {
      w: 4,
      h: 4,
      x: 0,
      y: 0,
      i: widget.id,
    };
    let allowClose = widget.personalUse;
    if (
      currentUser.authorityPolicy === AUTH_POLICY.TENANT_ADMIN ||
      currentUser.authorityPolicy === AUTH_POLICY.ADMIN
    ) {
      allowClose = true;
    }
    const props = {
      id: widget.id,
      closable: allowClose,
      title: component.props.title,
      layout: defaultLayout,
      className: toLower(component.type),
    };
    const showHeader = get(component, 'props.showTitle', false);
    switch (component.type) {
      case COMPONENT_TYPE.ECHART_PIE:
        return {
          widget: <EchartPie {...omit(component.props, ['title'])} skin={echart} />,
          ...props,
        };
      case COMPONENT_TYPE.ECHART_BAR_LINE:
        return {
          widget: <EchartBarLine {...omit(component.props, ['title'])} skin={echart} />,
          ...props,
        };
      case COMPONENT_TYPE.STATISTIC_GRID:
        return {
          widget: <StatisticGrid id={props.id} {...component.props} skin={primarySkin} />,
          showHeader,
          ...props,
        };
      case COMPONENT_TYPE.MY_WORK_TODO:
        return {
          widget: <MyWorkTodo {...omit(component.props, ['title'])} skin={primarySkin} />,
          ...props,
        };
      case COMPONENT_TYPE.MY_WORK_DONE:
        return {
          widget: <MyWorkDone {...omit(component.props, ['title'])} skin={primarySkin} />,
          ...props,
        };
      case COMPONENT_TYPE.MY_ORDER_IN_PROCESS:
        return {
          widget: <MyOrderInProcess {...omit(component.props, ['title'])} skin={primarySkin} />,
          ...props,
        };
      case COMPONENT_TYPE.MY_FAVORITE_MENU:
        return {
          widget: <MyFavoriteMenu {...omit(component.props, ['title'])} skin={primarySkin} />,
          ...props,
        };
      default:
        return null;
    }
  }
  return null;
};

export default modelExtend(model, {
  namespace: 'myHome',

  state: {
    lastEditedDate: null,
    widgetAssetList: [],
    showWidgetAssets: false,
    widgets: [],
    layouts: {},
    homeSceneId: null,
    widgetRenderData: [],
    theme: {
      primarySkin: defaultSkin,
      echart: ECHART[defaultSkin],
    },
  },
  subscriptions: {
    setupMyHome({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/scene/myHome', location.pathname);
        if (match) {
          dispatch({
            type: 'getSceneHome',
          });
        }
      });
    },
  },
  effects: {
    *getSceneHome(_, { call, put }) {
      const re = yield call(getSceneHome);
      if (re.success) {
        const { lastEditedDate, config, instanceDtos, id } = re.data || {
          config: null,
          instanceDtos: [],
        };
        const layouts = {};
        const theme = {
          primarySkin: defaultSkin,
          echart: ECHART[defaultSkin],
        };
        if (config) {
          const configData = JSON.parse(config);
          Object.assign(layouts, configData.layouts || {});
          Object.assign(theme, configData.theme || {});
        }
        const widgets = [];
        instanceDtos.forEach(w => {
          const layoutKeys = Object.keys(layouts);
          let layout = null;
          if (layoutKeys.length > 0) {
            const tmps = layouts[layoutKeys[0]].filter(l => l.i === w.id);
            if (tmps.length > 0) {
              [layout] = tmps;
            }
          }
          const cmp = getWidget(w, layout, theme);
          if (cmp) {
            widgets.push(cmp);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            widgets,
            layouts,
            theme,
            widgetRenderData: instanceDtos,
            lastEditedDate,
            homeSceneId: id,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *saveSceneConfig({ payload, callback }, { call, put }) {
      const re = yield call(saveSceneConfig, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            lastEditedDate: Date.now(),
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *getWidgetInstanceById({ payload, getWidgetCmp, startAutoSaveTimer }, { call, select, put }) {
      const { widgets: originWidgets, widgetRenderData } = yield select(sel => sel.myHome);
      const re = yield call(getWidgetInstanceById, payload);
      if (re.success) {
        const widgets = [...originWidgets];
        const widgetInstance = re.data;
        const cmp = getWidgetCmp(widgetInstance);
        if (cmp) {
          widgets.push(cmp);
          widgetRenderData.push(widgetInstance);
          yield put({
            type: 'updateState',
            payload: {
              widgets,
              widgetRenderData,
            },
          });
          startAutoSaveTimer();
        }
      } else {
        message.error(re.message);
      }
    },
    *getWidgetAssets({ payload }, { call, put }) {
      const re = yield call(getWidgetAssets, payload);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            widgetAssetList: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
  },
});
