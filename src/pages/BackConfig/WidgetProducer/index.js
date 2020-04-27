import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { isEqual } from 'lodash';
import { formatMessage } from 'umi-plugin-react/locale';
import { Row, Col, Input, Empty, Popconfirm } from 'antd';
import { ExtIcon, ListCard } from 'suid';
import empty from '@/assets/item_empty.svg';
import GroupAdd from './components/WidgetGroup/Add';
import GroupEdit from './components/WidgetGroup/Edit';
import Instance from './components/Instance';
import styles from './index.less';

const { Search } = Input;

@connect(({ widgetGroup, loading }) => ({ widgetGroup, loading }))
class Feature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      delGroupId: null,
    };
  }

  componentDidUpdate() {
    const { widgetGroup } = this.props;
    if (!isEqual(this.state.listData, widgetGroup.listData)) {
      const { listData } = widgetGroup;
      this.setState({
        listData,
      });
    }
  }

  reloadFeatureGroupData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetGroup/getWidgetGroupList',
    });
  };

  saveWidgetGroup = (data, handlerPopoverHide) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'widgetGroup/saveWidgetGroup',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'widgetGroup/getWidgetGroupList',
          });
          handlerPopoverHide && handlerPopoverHide();
        }
      },
    });
  };

  delWidgetGroup = (data, e) => {
    e && e.stopPropagation();
    const { dispatch } = this.props;
    this.setState(
      {
        delGroupId: data.id,
      },
      () => {
        dispatch({
          type: 'widgetGroup/delWidgetGroup',
          payload: {
            id: data.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delGroupId: null,
              });
              this.reloadFeatureGroupData();
            }
          },
        });
      },
    );
  };

  handlerGroupSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentWidgetGroup = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'widgetGroup/updateState',
      payload: {
        currentWidgetGroup,
      },
    });
    dispatch({
      type: 'widgetInstance/updateState',
      payload: {
        showFormModal: false,
        currentWidgetInstance: null,
      },
    });
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerSearch = () => {
    this.listCardRef.handlerSearch();
  };

  renderCustomTool = () => {
    return (
      <>
        <Search
          placeholder="输入代码或名称关键字查询"
          onChange={e => this.handlerSearchChange(e.target.value)}
          onSearch={this.handlerSearch}
          onPressEnter={this.handlerSearch}
          style={{ width: '100%' }}
        />
      </>
    );
  };

  renderItemAction = item => {
    const { loading } = this.props;
    const { delGroupId } = this.state;
    const saving = loading.effects['widgetGroup/saveWidgetGroup'];
    return (
      <>
        <div className="tool-action" onClick={e => e.stopPropagation()}>
          <GroupEdit saving={saving} saveWidgetGroup={this.saveWidgetGroup} groupData={item} />
          <Popconfirm
            title={formatMessage({ id: 'global.delete.confirm', defaultMessage: '确定要删除吗?' })}
            onConfirm={e => this.delWidgetGroup(item, e)}
          >
            {loading.effects['widgetGroup/delWidgetGroup'] && delGroupId === item.id ? (
              <ExtIcon className={cls('del', 'action-item')} type="loading" antd />
            ) : (
              <ExtIcon className={cls('del', 'action-item')} type="delete" antd />
            )}
          </Popconfirm>
        </div>
      </>
    );
  };

  renderTitle = item => {
    return (
      <>
        {item.name}
        <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>{item.code}</span>
      </>
    );
  };

  render() {
    const { loading, widgetGroup } = this.props;
    const { currentWidgetGroup } = widgetGroup;
    const { listData } = this.state;
    const saving = loading.effects['widgetGroup/saveWidgetGroup'];
    const listLoading = loading.effects['widgetGroup/getWidgetGroupList'];
    const selectedKeys = currentWidgetGroup ? [currentWidgetGroup.id] : [];
    const featureGroupprops = {
      className: 'left-content',
      title: '看板组',
      showSearch: false,
      loading: listLoading,
      dataSource: listData,
      onSelectChange: this.handlerGroupSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      selectedKeys,
      extra: <GroupAdd saving={saving} saveWidgetGroup={this.saveWidgetGroup} />,
      itemField: {
        title: this.renderTitle,
        description: item => item.appModuleName,
      },
      itemTool: this.renderItemAction,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Row gutter={8} className="auto-height">
          <Col span={6} className="auto-height">
            <ListCard {...featureGroupprops} />
          </Col>
          <Col span={18} className={cls('main-content', 'auto-height')}>
            {currentWidgetGroup ? (
              <Instance />
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="可选择左边列表项进行相应的操作" />
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}
export default Feature;
