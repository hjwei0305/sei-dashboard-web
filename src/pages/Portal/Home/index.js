import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import { Button } from 'antd';
import { PortalPanel, ScrollBar, utils } from 'suid';
import WidgetAssets from './components/WidgetAssets';
import { EchartPie } from '../../../components';
import { constants } from '../../../utils';
import styles from './index.less';

const { storage } = utils;
const { COMPONENT_TYPE } = constants;

// const layouts = {
//     lg: [
//         { w: 3, h: 1, x: 0, y: 0, i: '1' },
//         { w: 3, h: 1, x: 3, y: 0, i: '2' },
//         { w: 4, h: 2, x: 6, y: 0, i: '3' },
//         { w: 6, h: 1, x: 0, y: 1, i: '4' },
//     ],
//     md: [
//         { w: 3, h: 1, x: 0, y: 0, i: '1' },
//         { w: 3, h: 1, x: 3, y: 0, i: '2' },
//         { w: 4, h: 2, x: 6, y: 0, i: '3' },
//         { w: 6, h: 1, x: 0, y: 1, i: '4' },
//     ],
//     sm: [
//         { w: 3, h: 1, x: 0, y: 0, i: '1' },
//         { w: 3, h: 1, x: 3, y: 0, i: '2' },
//         { w: 6, h: 2, x: 0, y: 0, i: '3' },
//         { w: 6, h: 1, x: 0, y: 1, i: '4' },
//     ],
// };

@connect(({ portalHome, loading }) => ({ portalHome, loading }))
class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widgets: [],
        };
    }

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

    handlerAddWidget = (widget) => {
        const { widgets: originWidgets } = this.state;
        const { component } = widget;
        const widgets = [...originWidgets];
        switch (component.type) {
            case COMPONENT_TYPE.ECHART_PIE:
                widgets.push({
                    id: widget.id,
                    widget: <EchartPie {...component.props} />,
                    closable: true,
                    layout: {
                        w: 4,
                        h: 4,
                        x: 0,
                        y: 0,
                        i: widget.id,
                    },
                });
                break;
            default:
        }
        this.setState({
            widgets
        });
    };

    onLayoutChange = (layout, layouts) => {
        console.log(layouts);
        const { widgets } = this.state;
        widgets.forEach(widget => {
            const lt = layout.filter(l => l.i === widget.id);
            if (lt.length === 1) {
                widget.layout = lt[0];
            }
        });
        this.setState({
            widgets,
        }, () => {
            storage.localStorage.set('demo-portal', layouts);
        });
    };

    render() {
        const { widgets } = this.state;
        const { portalHome, loading } = this.props;
        const { widgetData, showWidgetAssets } = portalHome;
        const layoutsData = storage.localStorage.get('demo-portal') || {};
        const portalPanelProps = {
            widgets,
            layouts: layoutsData,
            rowHeight: 100,
            onLayoutChange: this.onLayoutChange,
            preventCollision: true,
            verticalCompact: false,
            margin: [4, 4],
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
                    <Button
                        icon="plus"
                        type="primary"
                        loading={loadingWidgetAssets}
                        onClick={this.handlerAddWidgetAssets}
                    >
                        添加组件
                    </Button>
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