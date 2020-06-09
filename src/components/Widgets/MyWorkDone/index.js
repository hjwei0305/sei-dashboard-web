import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import moment from 'moment';
import { Button } from 'antd';
import { utils, ListLoader, ListCard } from 'suid';
import { formartUrl } from '../../../utils';
import styles from './index.less';

const { request, eventBus } = utils;

class MyWorkDone extends PureComponent {
  static timer = null;

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
    const { groupItem } = this.props;
    if (window.top !== window.self) {
      eventBus.emit('openTab', {
        id: item.id,
        title: groupItem.businessModeName,
        url: item.featureUrl,
      });
    } else {
      window.open(item.featureUrl, groupItem.businessModeName);
    }
  };

  renderItemExtra = item => {
    return <span className="extra">{moment(item.actEndTime).format('YYYY-MM-DD HH:mm')}</span>;
  };

  renderItemTitle = item => {
    return item.businessModelRemark;
  };

  renderItemDescrption = item => {
    return item.flowInstanceBusinessCode;
  };

  renderCustomTool = () => {
    const { maxCount } = this.props;
    return (
      <>
        <div className="sub-title">{`最近办理前 ${maxCount} 项工作`}</div>
        <Button type="link">查看全部</Button>
      </>
    );
  };

  renderWorkTodoList = () => {
    const { dataSource } = this.state;
    const listCardProps = {
      dataSource,
      onSelectChange: this.handlerSelect,
      showSearch: false,
      showArrow: false,
      pagination: false,
      itemField: {
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
      <div className={cls(styles['my-work-done-list'])}>
        {loading ? <ListLoader /> : this.renderWorkTodoList()}
      </div>
    );
  }
}

export default MyWorkDone;
