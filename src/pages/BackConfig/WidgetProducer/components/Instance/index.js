import React, { Component, Fragment } from "react";
import { connect } from "dva";
import cls from "classnames";
import { formatMessage, FormattedMessage } from "umi-plugin-react/locale";
import { Popconfirm, Button, Card } from 'antd'
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import InstanceConfig from './InstanceConifg';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ widgetInstance, widgetGroup, loading }) => ({ widgetInstance, widgetGroup, loading }))
class FeaturePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            delRowId: null,
        };
    }

    static pageTableRef;

    reloadData = () => {
        if (this.pageTableRef) {
            this.pageTableRef.remoteDataRefresh();
        }
    };

    add = _ => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/updateState",
            payload: {
                showFormModal: true,
                currentWidgetInstance: null
            }
        });
    };

    edit = currentWidgetInstance => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/updateState",
            payload: {
                showFormModal: true,
                currentWidgetInstance,
            }
        });
    };

    showWidgetInstanceConfig = currentWidgetInstance => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/updateState",
            payload: {
                showFeatureItem: true,
                currentWidgetInstance,
            }
        });
    };

    save = data => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/saveWidgetInstance",
            payload: {
                ...data
            },
            callback: res => {
                if (res.success) {
                    this.reloadData();
                }
            }
        });
    };

    del = record => {
        const { dispatch } = this.props;
        this.setState({
            delRowId: record.id
        }, _ => {
            dispatch({
                type: "widgetInstance/delWidgetInstance",
                payload: {
                    id: record.id
                },
                callback: res => {
                    if (res.success) {
                        this.setState({
                            delRowId: null
                        });
                        this.reloadData();
                    }
                }
            });
        });
    };

    add = _ => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/updateState",
            payload: {
                showFormModal: true,
                currentWidgetInstance: null
            }
        });
    };

    closeWidgetinstanceConfigModal = _ => {
        const { dispatch } = this.props;
        dispatch({
            type: "widgetInstance/updateState",
            payload: {
                showFormModal: false,
                currentWidgetInstance: null
            }
        });
    };

    renderDelBtn = (row) => {
        const { loading } = this.props;
        const { delRowId } = this.state;
        if (loading.effects["widgetInstance/delWidgetInstance"] && delRowId === row.id) {
            return <ExtIcon className="del-loading" type="loading" antd />
        }
        return <ExtIcon className="del" type="delete" antd />;
    };

    renderTitle = () => {
        const { widgetGroup } = this.props;
        const { currentWidgetGroup } = widgetGroup;
        return (
            <>
                {`${currentWidgetGroup.name}`}
                <span style={{ fontSize: 14, color: "#999", marginLeft: 8 }}>仪表组件实例管理</span>
            </>
        )
    };

    render() {
        const { widgetGroup } = this.props;
        const { currentWidgetGroup } = widgetGroup;
        const columns = [
            {
                title: formatMessage({ id: "global.operation", defaultMessage: "操作" }),
                key: "operation",
                width: 120,
                align: "center",
                dataIndex: "id",
                className: "action",
                required: true,
                render: (text, record) => (
                    <span className={cls("action-box")}>
                        <ExtIcon
                            className="edit"
                            onClick={_ => this.edit(record)}
                            type="edit"
                            antd
                        />
                        <Popconfirm
                            placement="topLeft"
                            title={formatMessage({ id: "global.delete.confirm", defaultMessage: "确定要删除吗?" })}
                            onConfirm={_ => this.del(record)}
                        >
                            {
                                this.renderDelBtn(record)
                            }
                        </Popconfirm>
                    </span>
                )
            },
            {
                title: formatMessage({ id: "global.code", defaultMessage: "代码" }),
                dataIndex: "code",
                width: 200,
                optional: true,
            },
            {
                title: formatMessage({ id: "global.name", defaultMessage: "名称" }),
                dataIndex: "name",
                width: 220,
                required: true,
            },
        ];
        const toolBarProps = {
            left: (
                <Fragment>
                    <Button
                        type="primary"
                        onClick={this.add}
                    >
                        <FormattedMessage id="global.add" defaultMessage="新建" />
                    </Button>
                    <Button onClick={this.reloadData}>
                        <FormattedMessage id="global.refresh" defaultMessage="刷新" />
                    </Button>
                </Fragment>
            )
        };
        const extTableProps = {
            bordered: false,
            toolBar: toolBarProps,
            columns,
            cascadeParams: { widgetGroupId: currentWidgetGroup ? currentWidgetGroup.id : null },
            onTableRef: ref => this.pageTableRef = ref,
            store: {
                url: `${SERVER_PATH}/sei-dashborad/widgetInstance/findByWidgetGroup`
            }
        };
        const instanceConfigProps = {
            currentWidgetGroup,
        };
        return (
            <div className={cls(styles['widget-instance-box'])}>
                <Card
                    title={this.renderTitle()}
                    bordered={false}
                >
                    <ExtTable {...extTableProps} />
                </Card>
                <InstanceConfig {...instanceConfigProps} />
            </div>
        )
    }
}

export default FeaturePage;