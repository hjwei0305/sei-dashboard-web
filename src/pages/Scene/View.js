/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:08
 * @Last Modified by: Eason
 * @Last Modified time: 2020-06-09 10:56:02
 */
import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import moment from 'moment';
import { isEqual, omit, toLower, set } from 'lodash';
import { Divider, Empty } from 'antd';
import { ExtIcon, ScrollBar, PortalPanel, ListLoader, HottedKey } from 'suid';
import empty from '@/assets/page_empty.svg';
import { Widgets } from '../../components';
import { constants } from '../../utils';
import WidgetAssetSelect from './components/WidgetAssetSelect';
import Settings from './components/Settings';
import styles from './View.less';

const { GlobalHotKeys } = HottedKey;
const { EchartPie, EchartBarLine, StatisticGrid, MyWorkTodo, MyWorkDone } = Widgets;
const { COMPONENT_TYPE } = constants;
const duration = 10000;

@connect(({ scene, dashboard, loading }) => ({ scene, dashboard, loading }))
class SceneView extends Component {
  static autoSaveTimer = null;

  constructor(props) {
    super(props);
    this.state = {
      loadingWidgetId: null,
    };
  }

  componentDidMount() {
    this.getSceneDashboardData();
  }

  componentDidUpdate(preProps) {
    const { dashboard, scene } = this.props;
    const { theme } = dashboard;
    if (!isEqual(preProps.dashboard.theme, theme)) {
      this.reRenderWidgets();
    }
    if (!isEqual(preProps.scene.currentScene, scene.currentScene)) {
      this.getSceneDashboardData();
    }
  }

  componentWillUnmount() {
    this.endAutoSaveTimer();
  }

  startAutoSaveTimer = () => {
    this.endAutoSaveTimer();
    this.autoSaveTimer = setInterval(this.handlerSceneConfigSave, duration);
  };

  endAutoSaveTimer = () => {
    this.autoSaveTimer && clearInterval(this.autoSaveTimer);
  };

  getSceneDashboardData = () => {
    const { dispatch, scene } = this.props;
    const { currentScene } = scene;
    if (currentScene) {
      dispatch({
        type: 'dashboard/getSceneById',
        payload: {
          id: currentScene.id,
        },
        getWidget: this.getWidget,
      });
    }
  };

  reRenderWidgets = () => {
    const { dashboard, dispatch } = this.props;
    const { widgetRenderData, layouts } = dashboard;
    const widgets = [];
    widgetRenderData.forEach(w => {
      const layoutKeys = Object.keys(layouts);
      let layout = null;
      if (layoutKeys.length > 0) {
        const tmps = layouts[layoutKeys[0]].filter(l => l.i === w.id);
        if (tmps.length > 0) {
          [layout] = tmps;
        }
      }
      const cmp = this.getWidget(w, layout);
      if (cmp) {
        widgets.push(cmp);
      }
    });
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        widgets,
        layouts,
        widgetRenderData,
      },
    });
  };

  handlerAddWidgetAssets = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'scene/getWidgetAssets',
    });
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        showWidgetAssets: true,
      },
    });
  };

  handlerCloseWidgetAssets = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        showWidgetAssets: false,
      },
    });
  };

  handlerShowSettings = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        showSettings: true,
      },
    });
  };

  handlerCloseSettings = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        showSettings: false,
      },
    });
  };

  getWidget = (widget, layout) => {
    const { dashboard } = this.props;
    const {
      theme: { echart, primarySkin },
    } = dashboard;
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
      const props = {
        id: widget.id,
        closable: true,
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
        default:
          return null;
      }
    }
    return null;
  };

  handlerAddWidget = widget => {
    const { dispatch } = this.props;
    this.setState({ loadingWidgetId: widget.id });
    dispatch({
      type: 'dashboard/getWidgetInstanceById',
      payload: {
        id: widget.id,
      },
      getWidget: this.getWidget,
      startAutoSaveTimer: this.startAutoSaveTimer,
    });
  };

  onLayoutChange = (layout, layouts) => {
    const { dispatch, dashboard } = this.props;
    const { widgets, layouts: originLayouts } = dashboard;
    widgets.forEach(widget => {
      const lt = layout.filter(l => l.i === widget.id);
      if (lt.length === 1) {
        const [tmpLayout] = lt;
        set(widget, 'layout', tmpLayout);
      }
    });
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        widgets,
        layouts,
      },
    });
    if (!isEqual(layouts, originLayouts)) {
      this.startAutoSaveTimer();
    }
  };

  handlerClose = id => {
    const { dispatch, dashboard } = this.props;
    const { widgets: originWidgets, widgetRenderData: originWidgetAssets } = dashboard;
    const widgets = originWidgets.filter(w => w.id !== id);
    const widgetRenderData = originWidgetAssets.filter(w => w.id !== id);
    dispatch({
      type: 'dashboard/updateState',
      payload: {
        widgets,
        widgetRenderData,
      },
    });
    this.startAutoSaveTimer();
  };

  handlerSceneConfigSave = () => {
    const { dispatch, scene, dashboard } = this.props;
    const { currentScene } = scene;
    const { theme, layouts, widgetRenderData } = dashboard;
    const config = {
      layouts,
      theme,
    };
    dispatch({
      type: 'scene/saveSceneConfig',
      payload: {
        id: currentScene.id,
        config: JSON.stringify(config),
        widgetInstanceIds: JSON.stringify(widgetRenderData.map(w => w.id)),
      },
      callback: () => {
        this.endAutoSaveTimer();
      },
    });
  };

  getActionTooltip = (title, shortcutTitle) => {
    return {
      overlayClassName: 'tip',
      placement: 'bottom',
      title: (
        <>
          {title}
          <br />
          <span style={{ fontSize: 12 }}>{shortcutTitle}</span>
        </>
      ),
    };
  };

  renderLasterUpdateDateTime = () => {
    const { scene, loading } = this.props;
    const { currentScene, lastEditorName, lastEditedDate } = scene;
    const configSaving = loading.effects['scene/saveSceneConfig'];
    let tmpDuration = '';
    if (currentScene) {
      const end = moment(Date.now());
      const start = moment(lastEditedDate);
      tmpDuration = start.from(end);
      return (
        <>
          {configSaving ? (
            <>
              <ExtIcon type="loading" className="action-item" antd />
              <span className="tool-desc">保存中...</span>
            </>
          ) : (
            <>
              <ExtIcon
                type="save"
                className="action-item"
                onClick={this.handlerSceneConfigSave}
                tooltip={this.getActionTooltip('保存场景配置', '快捷键 Ctrl + S')}
                antd
              />
              <span className="tool-desc">{`${lastEditorName}于 ${tmpDuration} 更新`}</span>
            </>
          )}
        </>
      );
    }
    return duration;
  };

  renderTitle = () => {
    const { scene } = this.props;
    const { currentScene } = scene;
    return (
      <>
        <span className="header-title"> {currentScene.name}</span>
        <span className="header-sub-title">场景组件实例配置</span>
      </>
    );
  };

  render() {
    const { loadingWidgetId } = this.state;
    const { dashboard, loading, onToggle, collapsed, scene } = this.props;
    const {
      widgets,
      layouts,
      showWidgetAssets,
      showSettings,
      theme: { primarySkin },
    } = dashboard;
    const { widgetAssetList } = scene;
    const portalPanelProps = {
      widgets,
      layouts,
      rowHeight: 30,
      onLayoutChange: this.onLayoutChange,
      preventCollision: true,
      draggableHandle: '.panel-header-title',
      compactType: null,
      margin: [4, 4],
      onClose: this.handlerClose,
    };
    const loadingWidgetAssets = loading.effects['dashboard/getWidgetAssets'];
    const loadingWidgetInstance = loading.effects['dashboard/getWidgetInstanceById'];
    const doneKeys = widgets.map(w => w.id);
    const widgetAssetSelectProps = {
      widgetAssetList,
      loading: loadingWidgetAssets,
      loadingWidgetInstance,
      loadingWidgetId,
      showWidgetAssets,
      doneKeys,
      onAddWidget: this.handlerAddWidget,
      onPanelAssetsClose: this.handlerCloseWidgetAssets,
    };
    const settingsProps = {
      showSettings,
      triggerSaveConfig: this.startAutoSaveTimer,
      onSettingsClose: this.handlerCloseSettings,
    };
    const sceneDataLoading = loading.effects['dashboard/getSceneById'];
    const keyMap = {
      SAVE: 'ctrl+s',
      Add_WIDGET: 'ctrl+a',
      COLLAPSED: 'alt+c',
      SETTING: 'alt+s',
    };
    const handlers = {
      SAVE: this.handlerSceneConfigSave,
      COLLAPSED: onToggle || null,
      Add_WIDGET: this.handlerAddWidgetAssets,
      SETTING: this.handlerShowSettings,
    };
    return (
      <>
        <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
          <div className={cls(styles['scene-view-box'])}>
            {sceneDataLoading ? (
              <ListLoader />
            ) : (
              <div className={cls('portal-body', primarySkin)}>
                <div className="action-tool-bar">
                  <div>
                    {this.renderTitle()}
                    {onToggle ? (
                      <ExtIcon
                        type={collapsed ? 'menu-unfold' : 'menu-fold'}
                        className="action-item"
                        onClick={onToggle}
                        tooltip={this.getActionTooltip(
                          collapsed ? '显示场景列表' : '隐藏场景列表',
                          '快捷键 Alt + C',
                        )}
                        antd
                      />
                    ) : null}
                    <Divider type="vertical" />
                    {this.renderLasterUpdateDateTime()}
                  </div>
                  <div className="right-tool-box">
                    <ExtIcon
                      type="plus"
                      className="action-item primary"
                      spin={loadingWidgetAssets}
                      onClick={this.handlerAddWidgetAssets}
                      tooltip={this.getActionTooltip('添加组件', '快捷键 Ctrl + A')}
                      antd
                    />
                    <Divider type="vertical" />
                    <ExtIcon
                      type="setting"
                      className="action-item"
                      onClick={this.handlerShowSettings}
                      tooltip={this.getActionTooltip('看板设置', '快捷键 Alt + S')}
                      antd
                    />
                  </div>
                </div>
                <div className="portal-box">
                  <ScrollBar>
                    {widgets.length > 0 ? (
                      <PortalPanel {...portalPanelProps} />
                    ) : (
                      <div className="blank-empty">
                        <Empty
                          image={empty}
                          description="暂时没有组件，可使用Ctrl + A快捷键添加组件"
                        />
                      </div>
                    )}
                  </ScrollBar>
                </div>
                <WidgetAssetSelect {...widgetAssetSelectProps} />
                <Settings {...settingsProps} />
              </div>
            )}
          </div>
        </GlobalHotKeys>
      </>
    );
  }
}
export default SceneView;
