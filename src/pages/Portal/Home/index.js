/*
 * @Author: Eason 
 * @Date: 2020-03-20 14:52:21 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-03-20 15:35:30
 */
import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import { PortalPanel, ScrollBar, utils, ExtIcon } from 'suid';
import WidgetAssets from './components/WidgetAssets';
import { Widgets } from '../../../components';
import { constants } from '../../../utils';
import styles from './index.less';

const { EchartPie, EchartBarLine } = Widgets;
const { storage } = utils;
const { COMPONENT_TYPE } = constants;

@connect(({ portalHome, loading }) => ({ portalHome, loading }))
class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widgets: [],
            widgetRenderData: [],
            layouts: {},
        };
    }

    componentDidMount() {
        this.initWidgets();
    }

    initWidgets = () => {
        const { widgetRenderData = [], layouts = {} } = storage.localStorage.get('demo-portal') || {};
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
        this.setState({ widgets, layouts, widgetRenderData });
    };

    handlerAddWidgetAssets = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'portalHome/getWidgetAssets',
        });
        dispatch({
            type: 'portalHome/updateState',
            payload: {
                showWidgetAssets: true,
            }
        });
    };

    handlerCloseWidgetAssets = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'portalHome/updateState',
            payload: {
                showWidgetAssets: false,
            }
        });
    };

    getWidget = (widget, layout) => {
        const { component } = widget;
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
                    widget: <EchartPie {...component.props} />,
                    closable: true,
                    layout: defaultLayout,
                };
            case COMPONENT_TYPE.ECHART_BAR_LINE:
                return {
                    id: widget.id,
                    widget: <EchartBarLine {...component.props} />,
                    closable: true,
                    layout: defaultLayout,
                };
            default:
                return null;
        }
    };

    handlerAddWidget = (widget) => {
        const { widgets: originWidgets, layouts, widgetRenderData } = this.state;
        const widgets = [...originWidgets];
        const cmp = this.getWidget(widget);
        if (cmp) {
            widgets.push(cmp);
            this.setState({
                widgets
            }, () => {
                widgetRenderData.push(widget);
                storage.localStorage.set('demo-portal', { layouts, widgetRenderData });
            });
        }
    };

    onLayoutChange = (layout, layouts) => {
        const { widgets, widgetRenderData } = this.state;
        widgets.forEach(widget => {
            const lt = layout.filter(l => l.i === widget.id);
            if (lt.length === 1) {
                widget.layout = lt[0];
            }
        });
        this.setState({
            widgets,
            layouts,
        }, () => {
            storage.localStorage.set('demo-portal', { layouts, widgetRenderData });
        });
    };

    handlerClose = (id) => {
        const { widgets: originWidgets, layouts, widgetRenderData: originWidgetData } = this.state;
        const widgets = originWidgets.filter(w => w.id !== id);
        const widgetRenderData = originWidgetData.filter(w => w.id !== id);
        this.setState({ widgets, widgetRenderData }, () => {
            storage.localStorage.set('demo-portal', { layouts, widgetRenderData });
        });
    };

    render() {
        const { widgets, layouts } = this.state;
        const { portalHome, loading } = this.props;
        const { widgetData, showWidgetAssets } = portalHome;
        const portalPanelProps = {
            widgets,
            layouts,
            rowHeight: 100,
            draggableHandle: '.panel-header',
            onLayoutChange: this.onLayoutChange,
            preventCollision: true,
            verticalCompact: false,
            margin: [4, 4],
            onClose: this.handlerClose,
        };
        const loadingWidgetAssets = loading.effects['portalHome/getWidgetAssets'];
        const doneKeys = widgets.map(w => w.id);
        const widgetAssetsProps = {
            widgetData,
            loading: loadingWidgetAssets,
            showWidgetAssets,
            doneKeys,
            onAddWidget: this.handlerAddWidget,
            onPanelAssetsClose: this.handlerCloseWidgetAssets,
        };
        return (
            <div className={cls(styles['portal-home-box'])}>
                <div className="action-tool-bar">
                    <ExtIcon type="plus" className='action-item primary' spin={loadingWidgetAssets} onClick={this.handlerAddWidgetAssets} tooltip={{ title: '添加组件' }} antd />
                    <ExtIcon type="skin" className="action-item" antd />
                </div>
                <div className="portal-box">
                    <ScrollBar>
                        <PortalPanel {...portalPanelProps} />
                    </ScrollBar>
                </div>
                <WidgetAssets {...widgetAssetsProps} />
            </div>
        )
    }
}

export default Home;