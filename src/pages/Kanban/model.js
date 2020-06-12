import React from 'react';
import { omit, toLower } from 'lodash';
import { message } from 'antd';
import { utils } from 'suid';
import { Widgets } from '../../components';
import { constants } from '../../utils';
import { getSceneByCode, getSceneHome } from './service';

const { pathMatchRegexp, dvaModel, storage } = utils;
const { modelExtend, model } = dvaModel;
const { ECHART } = constants;
const {
  EchartPie,
  EchartBarLine,
  StatisticGrid,
  MyWorkTodo,
  MyWorkDone,
  MyOrderInProcess,
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
    const closable = false;
    const props = {
      id: widget.id,
      closable,
      title: component.props.title,
      layout: defaultLayout,
      className: toLower(component.type),
    };
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
          widget: <StatisticGrid {...omit(component.props, ['title'])} skin={primarySkin} />,
          showHeader: false,
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
      default:
        return null;
    }
  }
  return null;
};

export default modelExtend(model, {
  namespace: 'kanban',

  state: {
    widgets: [],
    layouts: {},
    widgetRenderData: [],
    theme: {
      primarySkin: defaultSkin,
      echart: ECHART[defaultSkin],
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/scene/kanban/:code', location.pathname);
        if (match) {
          dispatch({
            type: 'getScene',
            payload: {
              code: match[1],
              home: false,
            },
          });
        }
      });
    },
    setupSeiHomeKanban({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/scene/sei/home', location.pathname);
        if (match) {
          dispatch({
            type: 'getScene',
            payload: {
              home: true,
            },
          });
        }
      });
    },
  },
  effects: {
    *getScene({ payload }, { call, put }) {
      const { code = '', home = false } = payload;
      let re;
      if (home) {
        re = yield call(getSceneHome);
      } else {
        re = yield call(getSceneByCode, { code });
      }
      if (re.success) {
        const { config, instanceDtos } = re.data || { config: null, instanceDtos: [] };
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
          },
        });
      } else {
        message.error(re.message);
      }
    },
  },
});
