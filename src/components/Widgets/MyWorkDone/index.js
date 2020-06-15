import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get, trim } from 'lodash';
import moment from 'moment';
import { Button, message, Modal, Input, Alert, Tooltip, Tag } from 'antd';
import { utils, ListLoader, ListCard, ExtIcon, Animate } from 'suid';
import { formartUrl, constants } from '@/utils';
import ExtAction from './ExtAction';
import styles from './index.less';

const { request, eventBus } = utils;
const { USER_ACTION } = constants;
const { TextArea } = Input;

class MyWorkDone extends PureComponent {
  static timer = null;

  static flowRevokeOpinion;

  static showFlowRevokeOpinionValidate;

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
    flowRevokeStore: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }),
  };

  static defaultProps = {
    flowRevokeStore: {
      type: 'POST',
      url: '/api-gateway/flow-service/flowTask/rollBackToHis',
    },
  };

  constructor(props) {
    super(props);
    this.flowRevokeOpinion = '';
    this.showFlowRevokeOpinionValidate = false;
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

  renderItemTitle = item => {
    const title = item.businessModelRemark;
    return <span title={title}>{title}</span>;
  };

  renderItemDescrption = item => {
    return (
      <>
        {item.flowInstanceBusinessCode}
        <Tooltip
          title={
            <>
              <span>处理时间</span>
              <br />
              <span style={{ fontSize: 12 }}>
                {moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </>
          }
        >
          <Tag style={{ marginLeft: 8 }}>{moment(item.actEndTime).fromNow()}</Tag>
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
      case USER_ACTION.FLOW_REVOKE:
        this.flowRevokeConfirm(record);
        break;
      default:
    }
  };

  handlerVierOrder = doneItem => {
    let url = formartUrl(doneItem.webBaseAddressAbsolute, doneItem.flowInstanceLookUrl);
    if (url.indexOf('?') === -1) {
      url = `${url}?id=${doneItem.flowInstanceBusinessId}`;
    } else {
      url = `${url}&id=${doneItem.flowInstanceBusinessId}`;
    }
    this.tabOpen({
      id: doneItem.flowInstanceBusinessId,
      title: `单据详情-${doneItem.flowInstanceBusinessCode}`,
      url,
    });
  };

  handlerOpinionChange = e => {
    this.flowRevokeOpinion = trim(e.target.value);
    if (this.flowRevokeOpinion) {
      this.showFlowRevokeOpinionValidate = false;
    } else {
      this.showFlowRevokeOpinionValidate = true;
    }
  };

  renderflowRevokeConfirmContent = () => {
    const confirmOpin = (
      <TextArea
        style={{ resize: 'none' }}
        autoSize={false}
        rows={4}
        placeholder="请填写撤回的原因"
        onChange={this.handlerOpinionChange}
      />
    );
    let tip = null;
    if (this.showFlowRevokeOpinionValidate === true) {
      tip = (
        <Animate type="shake">
          <Alert type="error" message="请填写你想要撤回的原因" style={{ marginBottom: 8 }} banner />
        </Animate>
      );
    }
    return (
      <>
        {tip}
        {confirmOpin}
      </>
    );
  };

  flowRevokeConfirm = doneItem => {
    this.confirmModal = Modal.confirm({
      title: '撤回确认',
      content: this.renderflowRevokeConfirmContent(),
      icon: <ExtIcon type="exclamation-circle" antd />,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        return new Promise(resolve => {
          if (!this.flowRevokeOpinion) {
            this.showFlowRevokeOpinionValidate = true;
            this.confirmModal.update({
              okButtonProps: { loading: false },
              content: this.renderflowRevokeConfirmContent(),
            });
          } else {
            this.flowRevokeSubmit(doneItem, resolve);
          }
        });
      },
      onCancel: () => {
        this.showFlowRevokeOpinionValidate = false;
        this.confirmModal.destroy();
        this.confirmModal = null;
        this.flowRevokeOpinion = '';
      },
    });
  };

  flowRevokeSubmit = (doneItem, resolve) => {
    const { flowRevokeStore } = this.props;
    const { url, type } = flowRevokeStore || {};
    const methodType = type || 'get';
    const requestOptions = {
      method: methodType,
      url: formartUrl(url),
    };
    if (url) {
      this.showFlowRevokeOpinionValidate = false;
      this.confirmModal.update({
        okButtonProps: { loading: true },
        cancelButtonProps: { disabled: true },
        content: this.renderflowRevokeConfirmContent(),
      });
      const params = { id: doneItem.id, opinion: this.flowRevokeOpinion };
      if (methodType.toLocaleLowerCase() === 'get') {
        requestOptions.params = params;
      } else {
        requestOptions.data = params;
      }
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
        <div className="sub-title">{`前 ${maxCount} 项`}</div>
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

  renderWorkTodoList = () => {
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
      <div className={cls(styles['my-work-done-list'])}>
        {loading ? <ListLoader /> : this.renderWorkTodoList()}
      </div>
    );
  }
}

export default MyWorkDone;
