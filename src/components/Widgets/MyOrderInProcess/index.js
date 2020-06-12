import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import moment from 'moment';
import { Button, message, Modal } from 'antd';
import { utils, ListLoader, ListCard, ExtIcon } from 'suid';
import { formartUrl, constants } from '@/utils';
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

  getData = () => {
    const { store, reader, maxCount } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'get';
    const params = { recordCount: maxCount };
    const requestOptions = {
      method: methodType,
      url: formartUrl(url),
      headers: { neverCancel: true },
    };
    this.setState({ loading: true });
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
          this.setState({ loading: false });
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

  renderItemExtra = item => {
    return <span className="extra">{moment(item.actEndTime).format('YYYY-MM-DD HH:mm')}</span>;
  };

  renderItemTitle = item => {
    return item.businessModelRemark;
  };

  renderItemDescrption = item => {
    return item.businessCode;
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
      title: `单据详情-${doneItem.businessCode}`,
      url,
    });
  };

  renderflowRevokeConfirmContent = doneItem => {
    return (
      <>
        确定要终止单号为
        <span style={{ color: 'rgba(0,0,0,0.65)', margin: '0 8px', fontWeight: 700 }}>
          {doneItem.businessCode}
        </span>
        的单据吗?
      </>
    );
  };

  flowEndConfirm = doneItem => {
    this.confirmModal = Modal.confirm({
      title: '终止审批确认',
      content: this.renderflowRevokeConfirmContent(doneItem),
      icon: <ExtIcon type="exclamation-circle" antd />,
      okText: '确定',
      cancelText: '取消',
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
        <div className="sub-title">{`我的在办单据 (Top ${maxCount})`}</div>
        <Button type="link">查看全部</Button>
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
        extra: this.renderItemExtra,
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
