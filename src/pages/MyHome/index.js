/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:08
 * @Last Modified by: Eason
 * @Last Modified time: 2020-11-30 14:29:38
 */
import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import moment from 'moment';
import { isEqual, omit, toLower, set } from 'lodash';
import { Layout, Divider, Empty } from 'antd';
import { ExtIcon, ScrollBar, PortalPanel, ListLoader, HottedKey } from 'suid';
import empty from '@/assets/page_empty.svg';
import { Widgets } from '../../components';
import { constants } from '../../utils';
import WidgetAssetSelect from './components/WidgetAssetSelect';
import styles from './index.less';

const { Content } = Layout;

const { GlobalHotKeys } = HottedKey;

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
const duration = 10000;

@connect(({ myHome, loading }) => ({ myHome, loading }))
class SceneMyHome extends Component {
  static autoSaveTimer = null;

  constructor(props) {
    super(props);
    this.state = {
      loadingWidgetId: null,
      fullScreen: false,
    };
  }

  componentDidUpdate(preProps) {
    const { myHome } = this.props;
    const { theme } = myHome;
    if (!isEqual(preProps.myHome.theme, theme)) {
      this.reRenderWidgets();
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

  reRenderWidgets = () => {
    const { myHome, dispatch } = this.props;
    const { widgetRenderData, layouts } = myHome;
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
      const cmp = this.getWidgetCmp(w, layout);
      if (cmp) {
        widgets.push(cmp);
      }
    });
    dispatch({
      type: 'myHome/updateState',
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
      type: 'myHome/getWidgetAssets',
    });
    dispatch({
      type: 'myHome/updateState',
      payload: {
        showWidgetAssets: true,
      },
    });
  };

  handlerCloseWidgetAssets = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'myHome/updateState',
      payload: {
        showWidgetAssets: false,
      },
    });
  };

  getWidgetCmp = (widget, layout) => {
    const { myHome } = this.props;
    const {
      theme: { echart, primarySkin },
    } = myHome;
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
            widget: <StatisticGrid id={props.id} {...component.props} skin={primarySkin} />,
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

  handlerAddWidget = widget => {
    const { dispatch } = this.props;
    this.setState({ loadingWidgetId: widget.id });
    dispatch({
      type: 'myHome/getWidgetInstanceById',
      payload: {
        id: widget.id,
      },
      getWidgetCmp: this.getWidgetCmp,
      startAutoSaveTimer: this.startAutoSaveTimer,
    });
  };

  onLayoutChange = (layout, layouts) => {
    const { dispatch, myHome } = this.props;
    const { widgets, layouts: originLayouts } = myHome;
    widgets.forEach(widget => {
      const lt = layout.filter(l => l.i === widget.id);
      if (lt.length === 1) {
        const [tmpLayout] = lt;
        set(widget, 'layout', tmpLayout);
      }
    });
    dispatch({
      type: 'myHome/updateState',
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
    const { dispatch, myHome } = this.props;
    const { widgets: originWidgets, widgetRenderData: originWidgetAssets } = myHome;
    const widgets = originWidgets.filter(w => w.id !== id);
    const widgetRenderData = originWidgetAssets.filter(w => w.id !== id);
    dispatch({
      type: 'myHome/updateState',
      payload: {
        widgets,
        widgetRenderData,
      },
    });
    this.startAutoSaveTimer();
  };

  handlerSceneConfigSave = () => {
    const { dispatch, myHome } = this.props;
    const { theme, layouts, widgetRenderData, homeSceneId } = myHome;
    const config = {
      layouts,
      theme,
    };
    dispatch({
      type: 'myHome/saveSceneConfig',
      payload: {
        id: homeSceneId,
        config: JSON.stringify(config),
        widgetInstanceIds: JSON.stringify(widgetRenderData.map(w => w.id)),
      },
      callback: () => {
        this.endAutoSaveTimer();
      },
    });
  };

  handlerFullScreen = () => {
    let fullScreen = false;
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
      fullScreen = true;
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    this.setState({ fullScreen });
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
    const { myHome, loading } = this.props;
    const { lastEditedDate } = myHome;
    const configSaving = loading.effects['myHome/saveSceneConfig'];
    const end = moment(Date.now());
    const start = moment(lastEditedDate);
    const tmpDuration = start.from(end);
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
              tooltip={this.getActionTooltip('保存配置', '快捷键 Ctrl + S')}
              antd
            />
            <span className="tool-desc">{` ${tmpDuration} 更新`}</span>
          </>
        )}
      </>
    );
  };

  renderTitle = () => {
    return (
      <>
        <span className="header-title">我的首页</span>
        <span className="header-sub-title">自定义</span>
      </>
    );
  };

  render() {
    const { loadingWidgetId, fullScreen } = this.state;
    const { myHome, loading } = this.props;
    const {
      widgets,
      layouts,
      widgetAssetList,
      showWidgetAssets,
      theme: { primarySkin },
    } = myHome;
    const portalPanelProps = {
      widgets,
      layouts,
      rowHeight: 30,
      onLayoutChange: this.onLayoutChange,
      preventCollision: false,
      draggableHandle: '.panel-header-title',
      compactType: null,
      margin: [8, 8],
      onClose: this.handlerClose,
    };
    const loadingWidgetAssets = loading.effects['myHome/getWidgetAssets'];
    const loadingWidgetInstance = loading.effects['myHome/getWidgetInstanceById'];
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
    const sceneDataLoading = loading.effects['myHome/getSceneHome'];
    const keyMap = {
      SAVE: 'ctrl+s',
      Add_WIDGET: 'ctrl+a',
      FULLSCREEN: 'alt+f',
    };
    const handlers = {
      SAVE: this.handlerSceneConfigSave,
      Add_WIDGET: this.handlerAddWidgetAssets,
      FULLSCREEN: this.handlerFullScreen,
    };
    return (
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        <Layout className={cls(styles['my-scene-home-box'])}>
          <Content>
            {sceneDataLoading ? (
              <ListLoader />
            ) : (
              <div className={cls('portal-body', primarySkin)}>
                <div className="action-tool-bar">
                  <div>
                    {this.renderTitle()}
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
                      type={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
                      className="action-item"
                      onClick={this.handlerFullScreen}
                      tooltip={this.getActionTooltip(
                        fullScreen ? '退出全屏' : '全屏显示',
                        '快捷键 Alt + F',
                      )}
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
              </div>
            )}
          </Content>
        </Layout>
      </GlobalHotKeys>
    );
  }
}
export default SceneMyHome;
