import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Card, Skeleton } from 'antd';
import { ExtIcon } from 'suid';
import WidgetSelect from './WidgetSelect';
import styles from './WidgetInstance.less';

class WidgetInstance extends Component {

    static propTypes = {
        widgets: PropTypes.object,
        loading: PropTypes.bool,
        onWidgetSelect: PropTypes.func,
        widgetSelectKeys: PropTypes.array,
    };

    static defaultProps = {
        widgets: null,
        loading: false,
    };

    handlerWidgetSelect = (widgetKey, item) => {
        const { onWidgetSelect } = this.props;
        if (onWidgetSelect) {
            onWidgetSelect(widgetKey, item);
        }
    };

    renderAvatar = (widget) => {
        if (widget) {
            const { widgetTypeIconType, iconColor } = widget;
            return (
                <ExtIcon
                    type={widgetTypeIconType}
                    style={{ fontSize: 42, width: 42, height: 42, color: iconColor }}
                />
            )
        }
        return null;
    };

    render() {
        const { widgets, loading, widgetSelectKeys } = this.props;
        const widgetListKeys = Object.keys(widgets);
        const widgetSelectProps = {
            onWidgetSelect: this.handlerWidgetSelect,
            widgetSelectKeys,
        };
        return (
            <div className={cls(styles['widget-instance-box'])}>
                {
                    widgetListKeys.map((key) => {
                        const widget = widgets[key];
                        return (
                            <Card key={key} hoverable>
                                <Skeleton loading={loading} avatar active>
                                    {
                                        widget
                                            ?
                                            <WidgetSelect {...widgetSelectProps} widgetKey={key}>
                                                {
                                                    (triggerWidgetAssetList) => (
                                                        <Card.Meta
                                                            onClick={e => triggerWidgetAssetList(e)}
                                                            avatar={this.renderAvatar(widget)}
                                                            title={get(widget, "name", "")}
                                                            description={get(widget, "description", "")}
                                                        />
                                                    )
                                                }
                                            </WidgetSelect>
                                            : <WidgetSelect {...widgetSelectProps} widgetKey={key} />
                                    }
                                </Skeleton>
                            </Card>
                        )
                    })
                }
            </div>
        )
    }
}

export default WidgetInstance