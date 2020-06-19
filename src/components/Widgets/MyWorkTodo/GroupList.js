/*
 * @Author: Eason
 * @Date: 2020-06-19 10:27:33
 * @Last Modified by:   Eason
 * @Last Modified time: 2020-06-19 10:27:33
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get, isEqual, toUpper } from 'lodash';
import moment from 'moment';
import { Tooltip, Button } from 'antd';
import { utils, ListLoader, ListCard } from 'suid';
import { formartUrl, taskColor, constants } from '@/utils';
import SortView from './SortView';

const { request, eventBus, getUUID } = utils;
const { FLOW_TODO_SORT } = constants;

class GroupList extends PureComponent {
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

  static sortType;

  static lookMoreViewId;

  constructor(props) {
    super(props);
    this.sortType = FLOW_TODO_SORT.ASC;
    this.state = {
      loading: false,
      dataSource: [],
    };
  }

  componentDidMount() {
    this.lookMoreViewId = getUUID();
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
    const params = {
      modelId: get(groupItem, 'businessModeId', null),
      recordCount: maxCount,
      searchOrders: [{ property: 'createdDate', direction: toUpper(this.sortType) }],
    };
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

  handlerSelect = (keys, items) => {
    if (keys.length === 1) {
      let url = '';
      const item = items[0];
      if (item.taskFormUrl.includes('?')) {
        url = `${item.taskFormUrl}&taskId=${item.id}&instanceId=${item.flowInstanceId}&id=${item.flowInstanceBusinessId}`;
      } else {
        url = `${item.taskFormUrl}?taskId=${item.id}&instanceId=${item.flowInstanceId}&id=${item.flowInstanceBusinessId}`;
      }
      this.tabOpen({
        id: item.id,
        title: `${item.taskName}-${item.flowInstanceBusinessCode}`,
        url,
      });
    }
  };

  handlerSort = sortTpe => {
    this.sortType = sortTpe;
    this.getData();
  };

  handlerLookMore = () => {
    const { groupItem } = this.props;
    const currentViewTypeId = get(groupItem, 'businessModeId', null);
    this.tabOpen({
      id: this.lookMoreViewId,
      title: '更多待办事项',
      url: `/sei-flow-task-web/task/workTodo?currentViewTypeId=${currentViewTypeId}`,
    });
  };

  renderItemExtra = item => {
    return (
      <Tooltip
        title={
          <>
            <span>待办到达时间</span>
            <br />
            <span style={{ fontSize: 12 }}>
              {moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </>
        }
      >
        <span className="extra" style={{ color: taskColor(item.createdDate) }}>
          {moment(item.createdDate).fromNow()}
        </span>
      </Tooltip>
    );
  };

  renderItemTitle = item => {
    const title = item.businessModelRemark;
    return <span title={title}>{title}</span>;
  };

  renderItemDescrption = item => {
    return item.flowInstanceBusinessCode;
  };

  renderCustomTool = () => {
    const { maxCount } = this.props;
    return (
      <>
        <div className="left-tool-box">
          <div className="sub-title">{`前 ${maxCount} 项`}</div>
          <Button type="link" onClick={this.handlerLookMore}>
            查看更多...
          </Button>
        </div>
        <div className="right-tool-box">
          <SortView sortTpe={this.sortType} onSort={this.handlerSort} />
        </div>
      </>
    );
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
