/*
 * @Author: Eason
 * @Date: 2020-02-21 18:03:16
 * @Last Modified by: Eason
 * @Last Modified time: 2021-11-17 15:30:57
 */
import { formatMessage } from 'umi-plugin-react/locale';
import { base } from '../../public/app.config.json';

/** 服务接口基地址，默认是当前站点的域名地址 */
const BASE_DOMAIN = '/';

/** 网关地址 */
const GATEWAY = 'api-gateway';

/**
 * 非生产环境下是使用mocker开发，还是与真实后台开发或联调
 * 注：
 *    yarn start 使用mocker
 *    yarn start:no-mock使用真实后台开发或联调
 */
const getServerPath = () => {
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.MOCK === 'yes') {
      return '/mocker.api';
    }
    return '/api-gateway';
  }
  return `${BASE_DOMAIN}${GATEWAY}`;
};

/** 项目的站点基地址 */
const APP_BASE = base;

/** 站点的地址，用于获取本站点的静态资源如json文件，xls数据导入模板等等 */
const LOCAL_PATH = process.env.NODE_ENV !== 'production' ? '..' : `../${APP_BASE}`;

const SERVER_PATH = getServerPath();

const LOGIN_STATUS = {
  SUCCESS: 'success',
  MULTI_TENANT: 'multiTenant',
  CAPTCHA_ERROR: 'captchaError',
  FROZEN: 'frozen',
  LOCKED: 'locked',
  FAILURE: 'failure',
};

/** 业务模块功能项示例 */
const APP_MODULE_BTN_KEY = {
  CREATE: `${APP_BASE}_CREATE`,
  EDIT: `${APP_BASE}_EDIT`,
  DELETE: `${APP_BASE}_DELETE`,
};

/** 组件类型 */
const COMPONENT_TYPE = {
  ECHART_PIE: 'EchartPie',
  ECHART_BAR_LINE: 'EchartBarLine',
  STATISTIC_GRID: 'StatisticGrid',
  MY_WORK_TODO: 'MyWorkTodo',
  MY_WORK_DONE: 'MyWorkDone',
  MY_ORDER_IN_PROCESS: 'MyOrderInProcess',
  MY_FAVORITE_MENU: 'MyFavoriteMenu',
};

/** 场景类型 */
const SCENE_TYPE = {
  DASHBOARD: 'DASHBOARD',
  HOME: 'HOME',
  SCREEN: 'SCREEN',
};

/** 大屏模板类型 */
const SCREEN_TEMPLATE = {
  TECH_BLUE: 'TechBlue',
};

/** 大屏背景动效 */
const ANIMATE_EFFECT = {
  DREAM_START: {
    key: 'dream-star',
    title: formatMessage({ id: 'dashboard_000000', defaultMessage: '梦幻星空' }),
  },
};

/** 操作枚举 */
const USER_ACTION = {
  VIEW_ORDER: 'View_Order',
  FLOW_HISTORY: 'Flow_History',
  FLOW_REVOKE: 'Flow_Revoke',
  FLOW_END: 'Flow_End',
};

/** 流程状态枚举 */
const FLOW_STATUS = {
  COMPLETED: 'COMPLETED',
};

/** 待办排序枚举 */
const FLOW_TODO_SORT = {
  ASC: 'asc',
  DESC: 'desc',
};

/** 待办本地存储 */
const FLOW_TODO_LOCAL_STORAGE = {
  groupKey: '2bcce3b7-c7c5-4a5e-af85-ba216ab3409b',
  sortTypeKey: 'b7ba1005-85b8-45e9-b788-90babfe5c112',
};

/** 权限类型 */
const AUTH_POLICY = {
  USER: 'NormalUser',
  TENANT_ADMIN: 'TenantAdmin',
  ADMIN: 'GlobalAdmin',
};

/** Echart Skin */
const ECHART = {
  light: {
    title: {
      textStyle: {
        color: '#333',
      },
    },
    legend: {
      textStyle: {
        color: '#333',
      },
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    yAxis: {
      lineStyle: {
        color: ['#eee'],
        type: 'solid',
      },
      axisLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
  },
  darkgrey: {
    title: {
      textStyle: {
        color: '#999',
      },
    },
    legend: {
      textStyle: {
        color: '#d7d9da',
      },
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: '#d7d9da',
        },
      },
    },
    yAxis: {
      lineStyle: {
        color: ['#333'],
        type: 'solid',
      },
      axisLine: {
        lineStyle: {
          color: '#d7d9da',
        },
      },
    },
  },
  darkblue: {
    title: {
      textStyle: {
        color: '#999',
      },
    },
    legend: {
      textStyle: {
        color: '#d7d9da',
      },
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: '#6595ce',
        },
      },
    },
    yAxis: {
      lineStyle: {
        color: ['#445b7e'],
        type: 'solid',
      },
      axisLine: {
        lineStyle: {
          color: '#6595ce',
        },
      },
    },
  },
};

const PRIORITY = {
  '1': { lang: { id: 'dashboard_000001', defaultMessage: '驳回' }, color: 'magenta' },
  '2': { lang: { id: 'dashboard_000002', defaultMessage: '撤回' }, color: 'volcano' },
  '3': { lang: { id: 'dashboard_000003', defaultMessage: '加急' }, color: 'red' },
};

const WARNINGSTATUS = {
  normal: { lang: { id: 'dashboard_000004', defaultMessage: '正常' }, color: 'green' },
  warning: { lang: { id: 'dashboard_000005', defaultMessage: '预警' }, color: 'volcano' },
  timeout: { lang: { id: 'dashboard_000006', defaultMessage: '超时' }, color: 'red' },
};

export default {
  SCENE_TYPE,
  APP_BASE,
  LOCAL_PATH,
  SERVER_PATH,
  APP_MODULE_BTN_KEY,
  LOGIN_STATUS,
  COMPONENT_TYPE,
  ECHART,
  SCREEN_TEMPLATE,
  ANIMATE_EFFECT,
  USER_ACTION,
  FLOW_STATUS,
  FLOW_TODO_SORT,
  FLOW_TODO_LOCAL_STORAGE,
  AUTH_POLICY,
  PRIORITY,
  WARNINGSTATUS,
};
