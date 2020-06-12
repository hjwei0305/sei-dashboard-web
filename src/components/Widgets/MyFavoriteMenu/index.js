import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { Row, Col } from 'antd';
import { utils, ListLoader } from 'suid';
import { formartUrl } from '@/utils';
import styles from './index.less';

const { request, eventBus } = utils;

class MyFavoriteMenu extends PureComponent {
  static timer = null;

  static propTypes = {
    timer: PropTypes.shape({
      interval: PropTypes.number,
    }),
    store: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }).isRequired,
    reader: PropTypes.shape({
      data: PropTypes.string.isRequired,
    }).isRequired,
    menuRemoveStore: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }),
  };

  static defaultProps = {
    menuRemoveStore: {
      type: 'POST',
      url: '/api-gateway/sei-basic/userMenu/removeMenu/{menuId}',
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
    const { store, reader } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'get';
    const requestOptions = {
      method: methodType,
      url: formartUrl(url),
      headers: { neverCancel: true },
    };
    this.setState({ loading: true });
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

  renderMenuList = () => {
    const { dataSource } = this.state;
    return (
      <Row gutter={16} style={{ padding: 10 }}>
        {dataSource.map(menuItem => {
          return (
            <Col span={12} key={menuItem.id} className="menu-item">
              {menuItem.name}
            </Col>
          );
        })}
      </Row>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <div className={cls(styles['my-favorite-menu-list'])}>
        {loading ? <ListLoader /> : this.renderMenuList()}
      </div>
    );
  }
}

export default MyFavoriteMenu;
