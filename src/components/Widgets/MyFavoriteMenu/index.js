import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { Row, Col, Popconfirm, Empty } from 'antd';
import { utils, ListLoader, ExtIcon, ScrollBar } from 'suid';
import { formartUrl } from '@/utils';
import styles from './index.less';

const { request, eventBus, formatMsg } = utils;

const adapterMenus = tree => {
  const {
    id,
    children,
    rootId,
    rootName,
    name: title,
    menuUrl: url,
    namePath: urlPath,
    iconCls: iconType,
    iconFileData: appBase64ImgStr,
  } = tree;
  return { id, title, url, urlPath, children, iconType, rootId, rootName, appBase64ImgStr };
};

class MyFavoriteMenu extends PureComponent {
  static timer = null;

  static scrollBarRef;

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
      removeId: null,
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
    const { store, reader } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'get';
    const requestOptions = {
      method: methodType,
      url: formartUrl(url),
      headers: { neverCancel: true },
    };
    !timerLoader && this.setState({ loading: true });
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
          this.scrollBarRef && this.scrollBarRef.updateScroll();
          !timerLoader && this.setState({ loading: false });
        });
    }
  };

  tabOpen = item => {
    if (window.top !== window.self) {
      const tabMenu = adapterMenus(item);
      eventBus.emit('openTab', tabMenu);
    } else {
      window.open(item.menuUrl, item.name);
    }
  };

  handlerClose = menuItem => {
    const { menuRemoveStore } = this.props;
    const { url, type } = menuRemoveStore || {};
    const methodType = type || 'get';
    const requestOptions = {
      method: methodType,
      url: formatMsg(formartUrl(url), { menuId: menuItem.id }),
    };
    this.setState({ removeId: menuItem.id });
    if (url) {
      request(requestOptions)
        .then(res => {
          if (res.success) {
            this.getData();
          }
        })
        .finally(() => {
          this.setState({ removeId: null });
        });
    }
  };

  renderMenuList = () => {
    const { dataSource, removeId } = this.state;
    return (
      <Row>
        {dataSource.length === 0 ? (
          <Empty
            image={<ExtIcon type="empty-data" className="empty-data" />}
            description="暂无收藏数据"
          />
        ) : (
          dataSource.map(menuItem => {
            return (
              <Col span={12} key={menuItem.id} className="menu-item">
                <span className="menu-content" onClick={() => this.tabOpen(menuItem)}>
                  {menuItem.name}
                </span>
                {removeId && menuItem.id === removeId ? (
                  <ExtIcon type="loading" className="menu-btn" antd />
                ) : (
                  <Popconfirm
                    title="确定要移除收藏吗?"
                    onConfirm={() => this.handlerClose(menuItem)}
                  >
                    <ExtIcon type="close" className="menu-btn btn-remove" antd />
                  </Popconfirm>
                )}
              </Col>
            );
          })
        )}
      </Row>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <div className={cls(styles['my-favorite-menu-list'])}>
        <ScrollBar
          ref={ref => {
            this.scrollBarRef = ref;
          }}
        >
          {loading ? <ListLoader /> : this.renderMenuList()}
        </ScrollBar>
      </div>
    );
  }
}

export default MyFavoriteMenu;
