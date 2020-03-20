import React, { PureComponent, Suspense } from "react";
import cls from 'classnames';
import { isEqual } from 'lodash'
import { connect } from "dva";
import { Drawer, Button, Avatar } from "antd";
import { ScrollBar, ExtIcon, ListLoader } from 'suid';
import { ColorSelect } from '../../../../../../components'
import WidgetSelect from '../../WidgetSelect';
import { constants } from '../../../../../../utils'
import styles from "./index.less";

const EchartPie = React.lazy(() => import("./Forms/EchartPie"));
const EchartBarLine = React.lazy(() => import("./Forms/EchartBarLine"));

const { COMPONENT_TYPE } = constants;

@connect(({ widgetInstance, loading }) => ({ widgetInstance, loading }))
class InstanceConfig extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            color: "",
            showShadow: false,
            currentWidget: null,
        }
    }

    componentDidUpdate(prevProps) {
        const { widgetInstance } = this.props;
        const { showFormModal, currentWidgetInstance } = widgetInstance;
        if (!isEqual(prevProps.widgetInstance.showFormModal, showFormModal) && showFormModal === true) {
            let currentWidget = null;
            let color = "";
            if (currentWidgetInstance) {
                const { component } = currentWidgetInstance;
                currentWidget = {
                    name: component.name,
                    code: component.type,
                    iconType: component.icon.type,
                    remark: component.remark,
                };
                color = component.icon.color;
            }
            this.setState({ currentWidget, color });
            this.getWidgetList();
        }
    };

    getWidgetList = () => {
        const { dispatch } = this.props
        dispatch({
            type: "widgetInstance/getWidgetList",
        });
    };

    save = (data, handlerPopoverHide) => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/saveWidgetInstance",
            payload: {
                ...data
            },
            callback: res => {
                if (res.success) {
                    handlerPopoverHide && handlerPopoverHide();
                    this.reloadFeatrueData();
                }
            }
        });
    };

    handlerClose = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/updateState",
            payload: {
                showFormModal: false,
                currentWidgetInstance: null,
            }
        });
    };

    handlerWidgetChnage = (currentWidget) => {
        this.setState({ currentWidget });
    };

    handlerColorChange = (color) => {
        this.setState({ color });
    };

    renderTitle = () => {
        const { widgetInstance } = this.props;
        const { currentWidgetInstance } = widgetInstance;
        if (currentWidgetInstance) {
            return '编辑仪表组件实例';
        }
        return '新建仪表组件实例';
    };

    renderForm = () => {
        const { currentWidget } = this.state;
        const { widgetInstance } = this.props;
        const { currentWidgetInstance } = widgetInstance;
        const formProps = {
            widget: currentWidget,
            formData: currentWidgetInstance,
        }
        if (currentWidget) {
            switch (currentWidget.code) {
                case COMPONENT_TYPE.ECHART_PIE:
                    return (
                        <Suspense fallback={<ListLoader />}>
                            <EchartPie {...formProps} />
                        </Suspense>
                    );
                case COMPONENT_TYPE.ECHART_BAR_LINE:
                    return (
                        <Suspense fallback={<ListLoader />}>
                            <EchartBarLine {...formProps} />
                        </Suspense>
                    );
                default:
            }
        }
    };

    handerScrollDown = () => {
        this.setState({ showShadow: true })
    };

    handerYReachStart = () => {
        this.setState({ showShadow: false })
    };

    render() {
        const { widgetInstance, loading } = this.props;
        const { showFormModal, widgetData } = widgetInstance;
        const { color, currentWidget, showShadow } = this.state;
        const widgetDataLoading = loading.effects['widgetInstance/getWidgetList'];
        const headerStyle = {
            boxShadow: showShadow ? ' 0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
        };
        return (
            <Drawer
                width={480}
                getContainer={false}
                placement="right"
                visible={showFormModal}
                destroyOnClose
                title={this.renderTitle()}
                headerStyle={headerStyle}
                className={cls(styles['widget-instance-config-box'])}
                onClose={this.handlerClose}
                style={{ position: 'absolute' }}
            >
                <div className="form-body">
                    <ScrollBar
                        onYReachStart={this.handerYReachStart}
                        onScrollDown={this.handerScrollDown}
                    >
                        <div className='box-item'>
                            <div className='title'>组件信息</div>
                            <div className="widget-box horizontal">
                                <div className="row-start widget-icon">
                                    <ColorSelect
                                        onChange={this.handlerColorChange}
                                        color={color}
                                        triggerStyle={{ fontSize: '2.4rem' }}
                                    >
                                        {
                                            currentWidget
                                                ? <ExtIcon
                                                    type={currentWidget.iconType}
                                                    style={{ color, fontSize: 64 }}
                                                    antd
                                                />
                                                : <Avatar
                                                    shape="square"
                                                    size={64}
                                                    icon="question"
                                                    style={{ color }}
                                                />
                                        }
                                    </ColorSelect>
                                </div>
                                <div className="tool-box">
                                    <WidgetSelect
                                        dataSource={widgetData}
                                        widget={currentWidget}
                                        onChange={this.handlerWidgetChnage}
                                        loading={widgetDataLoading}
                                    />
                                    <div className="desc">{currentWidget ? currentWidget.remark : '请选择组件类型!'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="box-item">
                            {this.renderForm()}
                        </div>
                    </ScrollBar>
                </div>
                <div className="footer-tool-box">
                    <Button type="primary">
                        保存
                    </Button>
                </div>
            </Drawer>
        )
    }
}

export default InstanceConfig;