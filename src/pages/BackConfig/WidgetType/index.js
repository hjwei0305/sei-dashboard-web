import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { isEqual } from 'lodash';
import { Button, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, utils, ExtIcon } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { APP_MODULE_BTN_KEY } = constants;
const { authAction } = utils;

@connect(({ widgetType, loading }) => ({ widgetType, loading }))
class WidgetType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delRowId: null,
      list: [],
    };
  }

  componentDidUpdate(_prevProps, prevState) {
    if (!isEqual(prevState.list, this.props.widgetType.list)) {
      this.setState({
        list: this.props.widgetType.list,
      });
    }
  }

  reloadData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetType/queryList',
    });
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetType/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetType/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetType/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'widgetType/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        delRowId: record.id,
      },
      () => {
        dispatch({
          type: 'widgetType/del',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delRowId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetType/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['widgetType/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  render() {
    const { widgetType, loading } = this.props;
    const { list } = this.state;
    const { showModal, rowData } = widgetType;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            {authAction(
              <ExtIcon
                key={APP_MODULE_BTN_KEY.EDIT}
                className="edit"
                onClick={() => this.edit(record)}
                type="edit"
                ignore="true"
                antd
              />,
            )}
            <Popconfirm
              key={APP_MODULE_BTN_KEY.DELETE}
              placement="topLeft"
              title={formatMessage({
                id: 'global.delete.confirm',
                defaultMessage: '确定要删除吗？提示：删除后不可恢复',
              })}
              onConfirm={() => this.del(record)}
            >
              {this.renderDelBtn(record)}
            </Popconfirm>
          </span>
        ),
      },
      {
        title: '图标',
        dataIndex: 'iconType',
        width: 80,
        required: true,
        align: 'center',
        className: 'icon',
        render: text => {
          if (text) {
            return <ExtIcon type={text} style={{ fontSize: 24 }} />;
          }
        },
      },
      {
        title: formatMessage({ id: 'global.code', defaultMessage: '代码' }),
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: formatMessage({ id: 'global.name', defaultMessage: '名称' }),
        dataIndex: 'name',
        width: 220,
        required: true,
      },
      {
        title: formatMessage({ id: 'global.description', defaultMessage: '描述' }),
        dataIndex: 'description',
        width: 320,
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['widgetType/save'],
    };
    const toolBarProps = {
      left: (
        <Fragment>
          {authAction(
            <Button key={APP_MODULE_BTN_KEY.CREATE} type="primary" onClick={this.add} ignore="true">
              <FormattedMessage id="global.add" defaultMessage="新建" />
            </Button>,
          )}
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </Fragment>
      ),
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable
          bordered={false}
          loading={loading.effects['widgetType/queryList']}
          toolBar={toolBarProps}
          columns={columns}
          dataSource={list}
        />
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default WidgetType;
