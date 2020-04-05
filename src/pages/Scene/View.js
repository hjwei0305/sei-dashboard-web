/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:08 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-05 16:17:30
 */
import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import moment from 'moment';
import { isEqual, omit } from 'lodash';
import { Divider } from 'antd';
import { ExtIcon, ScrollBar, PortalPanel, ListLoader } from 'suid';
import { Widgets } from '../../components';
import { constants } from '../../utils';
import WidgetAssets from './components/WidgetAssets';
import Settings from './components/Settings';
import styles from './View.less';

const { EchartPie, EchartBarLine } = Widgets;
const { COMPONENT_TYPE } = constants;
const duration = 10000;

@connect(({ scene, loading }) => ({ scene, loading }))
class SceneView extends Component {

    static autoSaveTimer = null;

    constructor(props) {
        super(props);
        this.state = {
            loadingWidgetId: null,
        };
    }

    componentDidMount() {
        this.getSceneData();
    }

    componentWillUnmount() {
        this.endAutoSaveTimer();
    }

    componentDidUpdate(preProps) {
        const { scene } = this.props;
        const { theme } = scene;
        if (!isEqual(preProps.scene.theme, theme)) {
            this.reRenderWidgets();
        }
        if (!isEqual(preProps.scene.currentScene, scene.currentScene)) {
            this.getSceneData();
        }
    }

    startAutoSaveTimer = () => {
        this.endAutoSaveTimer();
        this.autoSaveTimer = setInterval(this.handlerSceneConfigSave, duration);
    };

    endAutoSaveTimer = () => {
        clearInterval(this.autoSaveTimer);
    };

    getSceneData = () => {
        const { dispatch, scene } = this.props;
        const { currentScene } = scene;
        if (currentScene) {
            dispatch({
                type: 'scene/getSceneById',
                payload: {
                    id: currentScene.id,
                },
                getWidget: this.getWidget,
            });
        }
    };

    reRenderWidgets = () => {
        const { scene, dispatch } = this.props;
        const { widgetRenderData, layouts, } = scene;
        const widgets = [];
        widgetRenderData.forEach(w => {
            const layoutKeys = Object.keys(layouts);
            let layout = null;
            if (layoutKeys.length > 0) {
                const tmps = layouts[layoutKeys[0]].filter(l => l.i === w.id);
                if (tmps.length > 0) {
                    layout = tmps[0];
                }
            }
            const cmp = this.getWidget(w, layout);
            if (cmp) {
                widgets.push(cmp);
            }
        });
        dispatch({
            type: 'scene/updateState',
            payload: {
                widgets,
                layouts,
                widgetRenderData,
            }
        });
    };

    handlerAddWidgetAssets = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'scene/getWidgetAssets',
        });
        dispatch({
            type: 'scene/updateState',
            payload: {
                showWidgetAssets: true,
            }
        });
    };

    handlerCloseWidgetAssets = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'scene/updateState',
            payload: {
                showWidgetAssets: false,
            }
        });
    };

    handlerShowSettings = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'scene/updateState',
            payload: {
                showSettings: true,
            }
        });
    };

    handlerCloseSettings = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'scene/updateState',
            payload: {
                showSettings: false,
            }
        });
    };

    getWidget = (widget, layout) => {
        const { scene } = this.props;
        const { theme: { echart } } = scene;
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
            switch (component.type) {
                case COMPONENT_TYPE.ECHART_PIE:
                    return {
                        id: widget.id,
                        widget: <EchartPie {...omit(component.props, ['title'])} skin={echart} />,
                        closable: true,
                        title: component.props.title,
                        layout: defaultLayout,
                    };
                case COMPONENT_TYPE.ECHART_BAR_LINE:
                    return {
                        id: widget.id,
                        widget: <EchartBarLine {...omit(component.props, ['title'])} skin={echart} />,
                        closable: true,
                        title: component.props.title,
                        layout: defaultLayout,
                    };
                default:
                    return null;
            }
        }
        return null;
    };

    handlerAddWidget = (widget) => {
        const { dispatch } = this.props;
        this.setState({ loadingWidgetId: widget.id });
        dispatch({
            type: 'scene/getWidgetInstanceById',
            payload: {
                id: widget.id,
            },
            getWidget: this.getWidget,
            startAutoSaveTimer: this.startAutoSaveTimer,
        });
    };

    onLayoutChange = (layout, layouts) => {
        const { dispatch, scene } = this.props;
        const { widgets } = scene;
        widgets.forEach(widget => {
            const lt = layout.filter(l => l.i === widget.id);
            if (lt.length === 1) {
                widget.layout = lt[0];
            }
        });
        dispatch({
            type: 'scene/updateState',
            payload: {
                widgets,
                layouts,
            }
        });
        this.startAutoSaveTimer();
    };

    handlerClose = (id) => {
        const { dispatch, scene } = this.props;
        const { widgets: originWidgets, widgetRenderData: originWidgetAssets } = scene;
        const widgets = originWidgets.filter(w => w.id !== id);
        const widgetRenderData = originWidgetAssets.filter(w => w.id !== id);
        dispatch({
            type: 'scene/updateState',
            payload: {
                widgets,
                widgetRenderData,
            }
        });
        this.startAutoSaveTimer();
    };

    handlerSceneConfigSave = () => {
        const { dispatch, scene } = this.props;
        const { currentScene, theme, layouts, widgetRenderData } = scene;
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
            }
        });
    };

    renderLasterUpdateDateTime = () => {
        const { scene, loading } = this.props;
        const { currentScene, lastEditorName, lastEditedDate } = scene;
        const configSaving = loading.effects['scene/saveSceneConfig'];
        let duration = '';
        if (currentScene) {
            const end = moment(Date.now());
            const start = moment(lastEditedDate);
            duration = start.from(end);
            return (
                <>
                    {
                        configSaving
                            ?
                            <>
                                <ExtIcon
                                    type='loading'
                                    className='action-item'
                                    antd
                                />
                                <span className='tool-desc'>保存中...</span>
                            </>
                            :
                            <>
                                <ExtIcon
                                    type="save"
                                    className='action-item'
                                    onClick={this.handlerSceneConfigSave}
                                    tooltip={{ title: '保存场景配置' }}
                                    antd
                                />
                                <span className='tool-desc'>{`${lastEditorName}于 ${duration} 更新`}</span>
                            </>
                    }
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
                <span className="header-sub-title"style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>场景组件实例配置</span>
            </>
        )
    };

    render() {
        const { loadingWidgetId } = this.state;
        const { scene, loading, onToggle, collapsed } = this.props;
        const { widgets, layouts, widgetAssetList, showWidgetAssets, showSettings, theme: { primarySkin } } = scene;
        const portalPanelProps = {
            widgets,
            layouts,
            rowHeight: 100,
            onLayoutChange: this.onLayoutChange,
            preventCollision: true,
            draggableHandle: '.panel-header-title',
            compactType: null,
            margin: [4, 4],
            onClose: this.handlerClose,
        };
        const loadingWidgetAssets = loading.effects['scene/getWidgetAssets'];
        const loadingWidgetInstance = loading.effects['scene/getWidgetInstanceById'];
        const doneKeys = widgets.map(w => w.id);
        const widgetAssetsProps = {
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
        const sceneDataLoading = loading.effects['scene/getSceneById'];
        return (
            <div className={cls(styles['scene-view-box'])}>
                {
                    sceneDataLoading
                        ? <ListLoader />
                        : <div className={cls('portal-body', primarySkin)}>
                            <div className="action-tool-bar">
                                <div>
                                    {this.renderTitle()}
                                    {
                                        onToggle
                                            ? <ExtIcon
                                                type={collapsed ? 'menu-unfold' : 'menu-fold'}
                                                className='action-item'
                                                onClick={onToggle}
                                                tooltip={{ title: collapsed ? '显示场景列表' : '隐藏场景列表' }}
                                                antd
                                            />
                                            : null
                                    }
                                    <Divider type='vertical' />
                                    {
                                        this.renderLasterUpdateDateTime()
                                    }
                                </div>
                                <div className='right-tool-box'>
                                    <ExtIcon
                                        type="medicine-box"
                                        className='action-item primary'
                                        spin={loadingWidgetAssets}
                                        onClick={this.handlerAddWidgetAssets}
                                        tooltip={{ title: '添加组件' }}
                                        antd
                                    />
                                    <Divider type='vertical' />
                                    <ExtIcon
                                        type="setting"
                                        className="action-item"
                                        tooltip={{ title: '看板设置' }}
                                        onClick={this.handlerShowSettings}
                                        antd
                                    />
                                </div>
                            </div>
                            <div className="portal-box">
                                <ScrollBar>
                                    <PortalPanel {...portalPanelProps} />
                                </ScrollBar>
                            </div>
                            <WidgetAssets {...widgetAssetsProps} />
                            <Settings {...settingsProps} />
                        </div>
                }
            </div>
        );
    }
}
export default SceneView;