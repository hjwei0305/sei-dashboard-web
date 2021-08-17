import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import moment from 'moment';
import { Button, Modal, Tooltip, Tag } from 'antd';
import { utils, message, ListLoader, ListCard, ExtIcon } from 'suid';
import { formartUrl, constants, taskColor } from '@/utils';
import { formatMessage } from 'umi-plugin-react/locale';
import ExtAction from './ExtAction';
import styles from './index.less';

const { request, eventBus, formatMsg } = utils;
const { USER_ACTION } = constants;

class MyOrderInProcess extends PureComponent {
  static timer = null;

  static confirmModal;

  static propTypes = {
    title: PropTypes.string,
    timer: PropTypes.shape({
      interval: PropTypes.number,
    }),
    maxCount: PropTypes.number,
    store: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }).isRequired,
    reader: PropTypes.shape({
      data: PropTypes.string.isRequired,
    }).isRequired,
    style: PropTypes.object,
    className: PropTypes.string,
    flowEndStore: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }),
  };

  static defaultProps = {
    flowEndStore: {
      type: 'POST',
      url: '/api-gateway/flow-service/flowInstance/end/{instanceId}',
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
    };
  }

  componentDidMount() {
    this.startTimer();
    this.getData();
  }

  componentWillUnmount() {
    this.endTimer();
  }

  startTimer = () => {
    const { timer } = this.props;
    if (timer && timer.interval > 0) {
      this.endTimer();
      this.timer = setInterval(() => {
        this.getData({ timerLoader: true });
      }, timer.interval * 1000 * 60);
    }
  };

  endTimer = () => {
    this.timer && window.clearInterval(this.timer);
  };

  getData = p => {
    const { timerLoader = false } = p || {};
    const { store, reader, maxCount } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'get';
    const params = { recordCount: maxCount };
    const requestOptions = {
      method: methodType,
      url: formartUrl(url),
      headers: { neverCancel: true },
    };
    !timerLoader && this.setState({ loading: true });
    if (methodType.toLocaleLowerCase() === 'get') {
      requestOptions.params = params;
    } else {
      requestOptions.data = params;
    }
    if (url) {
      request(requestOptions)
        .then(res => {
          if (res.success) {
            const dataSource = get(res, reader.data, []) || [];
            this.setState({
              dataSource,
            });
          }
        })
        .finally(() => {
          !timerLoader && this.setState({ loading: false });
        });
    }
  };

  tabOpen = item => {
    if (window.top !== window.self) {
      eventBus.emit('openTab', {
        id: item.id,
        title: item.title,
        url: item.url,
      });
    } else {
      window.open(item.url, item.title);
    }
  };

  handlerLookMore = () => {
    this.tabOpen({
      id: '9e1ba51b-befb-47ce-a4fd-a9e96544c85f',
      title: formatMessage({id: 'dashboard_000214', defaultMessage: '我的单据'}),
      url: `/sei-flow-task-web/task/myOrder`,
    });
  };

  renderItemTitle = item => {
    const title = item.businessModelRemark;
    return <span title={title}>{title}</span>;
  };

  renderItemDescrption = item => {
    return (
      <>
        {item.businessCode}
        <Tooltip
          title={
            <>
              <span>{formatMessage({id: 'dashboard_000215', defaultMessage: '创建时间'})}</span>
              <br />
              <span style={{ fontSize: 12 }}>
                {moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </>
          }
        >
          <Tag style={{ marginLeft: 8 }} color={taskColor(item.createdDate)}>
            {moment(item.createdDate).fromNow()}
          </Tag>
        </Tooltip>
      </>
    );
  };

  handlerAction = (key, record) => {
    switch (key) {
      case USER_ACTION.VIEW_ORDER:
        this.handlerVierOrder(record);
        break;
      case USER_ACTION.FLOW_HISTORY:
        break;
      case USER_ACTION.FLOW_END:
        this.flowEndConfirm(record);
        break;
      default:
    }
  };

  handlerVierOrder = doneItem => {
    let url = formartUrl(doneItem.webBaseAddressAbsolute, doneItem.lookUrl);
    if (url.indexOf('?') === -1) {
      url = `${url}?id=${doneItem.businessId}`;
    } else {
      url = `${url}&id=${doneItem.businessId}`;
    }
    this.tabOpen({
      id: doneItem.businessId,
      title: `{formatMessage({id: 'dashboard_000206', defaultMessage: '单据详情-'})}${doneItem.businessCode}`,
      url,
    });
  };

  renderflowRevokeConfirmContent = doneItem => {
    return (
      <>
        {formatMessage({id: 'dashboard_000216', defaultMessage: '确定要终止单号为'})}
        <span style={{ color: 'rgba(0,0,0,0.65)', margin: '0 8px', fontWeight: 700 }}>
          {doneItem.businessCode}
        </span>
        {formatMessage({id: 'dashboard_000217', defaultMessage: '的单据吗?'})}?
      </>
    );
  };

  flowEndConfirm = doneItem => {
    this.confirmModal = Modal.confirm({
      title: formatMessage({id: 'dashboard_000218', defaultMessage: '终止审批确认'}),
      content: this.renderflowRevokeConfirmContent(doneItem),
      icon: <ExtIcon type="exclamation-circle" antd />,
      okText: formatMessage({id: 'dashboard_000184', defaultMessage: '确定'}),
      cancelText: formatMessage({id: 'dashboard_000210', defaultMessage: '取消'}),
      onOk: () => {
        return new Promise(resolve => {
          this.flowEndSubmit(doneItem, resolve);
        });
      },
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
  };

  flowEndSubmit = (doneItem, resolve) => {
    const { flowEndStore } = this.props;
    const { url, type } = flowEndStore || {};
    const methodType = type || 'get';
    const requestOptions = {
      method: methodType,
      url: formatMsg(formartUrl(url), { instanceId: doneItem.flowInstanceId }),
    };
    if (url) {
      this.confirmModal.update({
        okButtonProps: { loading: true },
        cancelButtonProps: { disabled: true },
      });
      request(requestOptions)
        .then(res => {
          if (res.success) {
            resolve();
            message.success(res.message);
            this.getData();
          } else {
            message.error(res.message);
          }
        })
        .catch(err => {
          message.error(err.message || err);
        })
        .finally(() => {
          this.confirmModal.update({
            okButtonProps: { loading: false },
            cancelButtonProps: { disabled: false },
          });
        });
    }
  };

  renderCustomTool = () => {
    const { maxCount } = this.props;
    return (
      <>
        <div className="sub-title">{`${formatMessage({id: 'dashboard_000202', defaultMessage: '前'})} ${maxCount} ${formatMessage({id: 'dashboard_000140', defaultMessage: '项'})}`}</div>
        <Button type="link" style={{ padding: 0 }} onClick={this.handlerLookMore}>
          {formatMessage({id: 'dashboard_000203', defaultMessage: '查看更多'})}...
        </Button>
      </>
    );
  };

  renderAvatar = avatar => {
    const { item } = avatar;
    const extActionProps = {
      onAction: this.handlerAction,
      doneItem: item,
    };
    return <ExtAction {...extActionProps} />;
  };

  renderOrderList = () => {
    const { dataSource } = this.state;
    const listCardProps = {
      dataSource,
      showSearch: false,
      showArrow: false,
      pagination: false,
      itemField: {
        avatar: this.renderAvatar,
        title: this.renderItemTitle,
        description: this.renderItemDescrption,
      },
      customTool: this.renderCustomTool,
    };
    return <ListCard {...listCardProps} />;
  };

  render() {
    const { loading } = this.state;
    return (
      <div className={cls(styles['my-order-in-process-list'])}>
        {loading ? <ListLoader /> : this.renderOrderList()}
      </div>
    );
  }
}

export default MyOrderInProcess;
