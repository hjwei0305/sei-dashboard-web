/*
 * @Author: Eason
 * @Date: 2020-03-20 14:52:21
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:31:56
 */
import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import copy from 'copy-to-clipboard';
import { formatMessage } from 'umi-plugin-react/locale';
import { Layout, Input, Popconfirm, Empty, message, Tag } from 'antd';
import { ExtIcon, ListCard } from 'suid';
import empty from '@/assets/item_empty.svg';
import { constants } from '../../utils';
import SceneAdd from './components/SceneForm/Add';
import SceneEdit from './components/SceneForm/Edit';
import SceneView from './View';
import ScreenView from './Screen';
import styles from './index.less';

const { Search } = Input;
const { Sider, Content } = Layout;
const { APP_BASE, SCENE_TYPE } = constants;

@connect(({ scene, loading }) => ({ scene, loading }))
class SceneHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      delSceneId: null,
    };
  }

  saveScene = (data, handlerPopoverHide) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'scene/saveScene',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'scene/getSceneList',
          });
          handlerPopoverHide && handlerPopoverHide();
        }
      },
    });
  };

  delScene = (data, e) => {
    e && e.stopPropagation();
    const { dispatch } = this.props;
    this.setState(
      {
        delSceneId: data.id,
      },
      () => {
        dispatch({
          type: 'scene/delScene',
          payload: {
            id: data.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delSceneId: null,
              });
              dispatch({
                type: 'scene/getSceneList',
              });
            }
          },
        });
      },
    );
  };

  handlerSceneSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentScene = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'scene/updateState',
      payload: {
        currentScene,
      },
    });
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerSearch = () => {
    this.listCardRef.handlerSearch();
  };

  handlerListToggle = () => {
    const { collapsed } = this.state;
    this.setState(
      {
        collapsed: !collapsed,
      },
      () => {
        setTimeout(() => {
          const resize = new Event('resize');
          window.dispatchEvent(resize);
        }, 200);
      },
    );
  };

  getScenePath = item => {
    switch (item.sceneCategory) {
      case SCENE_TYPE.DASHBOARD:
      case SCENE_TYPE.HOME:
        return `${APP_BASE}/scene/kanban/${item.code}`;
      case SCENE_TYPE.SCREEN:
        return `${APP_BASE}/scene/screenView/${item.code}`;
      default:
    }
  };

  handlerCopy = router => {
    copy(router);
    message.success(`${router} 已复制到剪贴板`);
  };

  renderCustomTool = () => {
    return (
      <>
        <Search
          placeholder="输入代码、名称关键字查询"
          onChange={e => this.handlerSearchChange(e.target.value)}
          onSearch={this.handlerSearch}
          onPressEnter={this.handlerSearch}
          style={{ width: '100%' }}
        />
      </>
    );
  };

  renderTitle = item => {
    if (item.home) {
      return (
        <>
          {item.name}
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {formatMessage({ id: 'global.isHome', defaultMessage: '平台仪表盘' })}
          </Tag>
        </>
      );
    }
    return item.name;
  };

  renderItemAction = item => {
    const { loading } = this.props;
    const { delSceneId } = this.state;
    const saving = loading.effects['scene/saveScene'];
    return (
      <>
        <div className="tool-action" onClick={e => e.stopPropagation()}>
          <ExtIcon
            className={cls('action-item')}
            type="copy"
            tooltip={{ title: '复制访问路由' }}
            antd
            onClick={() => this.handlerCopy(this.getScenePath(item))}
          />
          <SceneEdit saving={saving} saveScene={this.saveScene} editData={item} />
          <Popconfirm
            title={formatMessage({ id: 'global.delete.confirm', defaultMessage: '确定要删除吗?' })}
            onConfirm={e => this.delScene(item, e)}
          >
            {loading.effects['scene/delScene'] && delSceneId === item.id ? (
              <ExtIcon className={cls('del', 'action-item')} type="loading" antd />
            ) : (
              <ExtIcon className={cls('del', 'action-item')} type="delete" antd />
            )}
          </Popconfirm>
        </div>
      </>
    );
  };

  renderScene = () => {
    const { collapsed } = this.state;
    const { scene } = this.props;
    const { currentScene } = scene;
    const sceneProps = {
      onToggle: this.handlerListToggle,
      collapsed,
    };
    if (currentScene) {
      switch (currentScene.sceneCategory) {
        case SCENE_TYPE.DASHBOARD:
        case SCENE_TYPE.HOME:
          return <SceneView {...sceneProps} />;
        case SCENE_TYPE.SCREEN:
          return <ScreenView {...sceneProps} />;
        default:
      }
    }
    return null;
  };

  render() {
    const { collapsed } = this.state;
    const { scene, loading } = this.props;
    const { currentScene, sceneData } = scene;
    const listLoading = loading.effects['scene/getSceneList'];
    const saving = loading.effects['scene/saveScene'];
    const selectedKeys = currentScene ? [currentScene.id] : [];
    const listCardProps = {
      className: 'left-content',
      title: '场景列表',
      showSearch: false,
      loading: listLoading,
      selectedKeys,
      dataSource: sceneData,
      onSelectChange: this.handlerSceneSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      extra: <SceneAdd saving={saving} saveScene={this.saveScene} />,
      itemField: {
        title: this.renderTitle,
        description: item => item.code,
      },
      itemTool: this.renderItemAction,
    };
    return (
      <Layout className={cls(styles['scene-home-box'])}>
        <Sider
          width={280}
          theme="light"
          collapsible
          trigger={null}
          collapsedWidth={0}
          collapsed={collapsed}
        >
          <ListCard {...listCardProps} />
        </Sider>
        <Content>
          {currentScene ? (
            this.renderScene()
          ) : (
            <div className="blank-empty">
              <Empty image={empty} description="可选择左边列表项进行相应的操作" />
            </div>
          )}
        </Content>
      </Layout>
    );
  }
}

export default SceneHome;
