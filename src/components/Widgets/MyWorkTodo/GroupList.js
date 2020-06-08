import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get, isEqual } from 'lodash';
import moment from 'moment';
import { Tooltip, Button } from 'antd';
import { utils, ListLoader, ListCard } from 'suid';
import { formartUrl } from '../../../utils';

const { request } = utils;

class GroupList extends PureComponent {
  static loaded;

  static propTypes = {
    maxCount: PropTypes.number,
    groupItem: PropTypes.object,
    store: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }).isRequired,
    reader: PropTypes.shape({
      data: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.loaded = false;
    this.state = {
      loading: false,
      dataSource: [],
    };
  }

  componentDidMount() {
    const { groupItem } = this.props;
    if (groupItem) {
      this.getData();
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.groupItem, this.props.groupItem)) {
      this.getData();
    }
  }

  getData = () => {
    const { store, reader, groupItem, maxCount } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'get';
    const params = { modelId: get(groupItem, 'businessModeId', null), recordCount: maxCount };
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
            this.loaded = true;
          }
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  };

  tabOpen = item => {
    const data = { tabAction: 'open', item };
    if (window.top !== window.self) {
      window.top.postMessage(data, '*');
    } else {
      window.open(item.featureUrl, item.name);
    }
  };

  handlerSelect = (keys, items) => {
    if (keys.length === 1) {
      let url = '';
      const item = items[0];
      if (item.taskFormUrl.includes('?')) {
        url = `${item.taskFormUrl}&taskId=${item.id}&instanceId=${item.flowInstanceId}&id=${item.flowInstanceBusinessId}`;
      } else {
        url = `${item.taskFormUrl}?taskId=${item.id}&instanceId=${item.flowInstanceId}&id=${item.flowInstanceBusinessId}`;
      }
      this.tabOpen({ id: item.id, name: item.flowName, featureUrl: url });
    }
  };

  renderItemExtra = item => {
    return (
      <Tooltip title={moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}>
        <span className="extra">{moment(item.createdDate).fromNow()}</span>
      </Tooltip>
    );
  };

  renderItemTitle = item => {
    return item.businessModelRemark;
  };

  renderItemDescrption = item => {
    return item.flowInstanceBusinessCode;
  };

  renderCustomTool = () => {
    const { groupItem, maxCount } = this.props;
    const groupItemCount = get(groupItem, 'count', 0);
    const { dataSource } = this.state;
    if (groupItemCount > dataSource.length) {
      return (
        <>
          <div className="sub-title">{`Top ${maxCount}`}</div>
          <Button type="link">查看全部</Button>
        </>
      );
    }
    return null;
  };

  renderWorkTodoList = () => {
    const { dataSource } = this.state;
    const listCardProps = {
      dataSource,
      onSelectChange: this.handlerSelect,
      showSearch: false,
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
    const { loading, dataSource } = this.state;
    const { groupItem } = this.props;
    const groupItemCount = get(groupItem, 'count', 0);
    return (
      <div className={cls('my-work-todo-list', { 'has-more': groupItemCount > dataSource.length })}>
        {loading ? <ListLoader /> : this.renderWorkTodoList()}
      </div>
    );
  }
}

export default GroupList;
