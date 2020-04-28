/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:08
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-28 15:00:33
 */
import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { isEqual } from 'lodash';
import { Empty } from 'antd';
import { ListLoader, ResizeMe } from 'suid';
import empty from '@/assets/page_empty.svg';
import { ScreenTemplate, DreamStar } from '../../components';
import { constants } from '../../utils';
import styles from './index.less';

const { TechBlue } = ScreenTemplate;
const { SCREEN_TEMPLATE, ANIMATE_EFFECT } = constants;

@ResizeMe()
@connect(({ screenView, loading }) => ({ screenView, loading }))
class ScreenView extends PureComponent {
  static screenBox;

  componentDidMount() {
    document.addEventListener('click', this.setFullScreen, false);
  }

  componentDidUpdate(preProps) {
    if (!isEqual(preProps.size, this.props.size)) {
      this.onResize();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.setFullScreen);
  }

  onResize = () => {
    if (this.screenBox) {
      const html = document.getElementsByTagName('html');
      const element = this.screenBox.parentNode;
      const { width } = getComputedStyle(element);
      const w = parseInt(width, 10);
      // 字体大小算法: 100 * (调试设备宽度 / 设计图宽度)
      html[0].style['font-size'] = `${100 * (w / 1920)}px`;
    }
  };

  setFullScreen = () => {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  };

  getAnimateEffect = () => {
    const {
      screenView: { globalConfig },
    } = this.props;
    const { animateEffect = {} } = globalConfig;
    const { show, type } = animateEffect || {};
    if (show) {
      switch (type) {
        case ANIMATE_EFFECT.DREAM_START.key:
          return <DreamStar />;
        default:
          return null;
      }
    }
    return null;
  };

  renderScreenTemplate = () => {
    const {
      screenView: { currentScreenTemplate, templateConfig, instanceDtos },
    } = this.props;
    const templateProps = {
      templateConfig,
      instanceDtos,
    };
    switch (currentScreenTemplate) {
      case SCREEN_TEMPLATE.TECH_BLUE:
        return (
          <>
            <TechBlue {...templateProps} />
            {this.getAnimateEffect()}
          </>
        );
      default:
        return (
          <div className="blank-empty">
            <Empty image={empty} description="此模板暂时没有实现" />
          </div>
        );
    }
  };

  render() {
    const { loading } = this.props;
    return (
      <>
        <div ref={node => (this.screenBox = node)} className={cls(styles['scene-screen-box'])}>
          {loading.global ? (
            <ListLoader />
          ) : (
            <div className={cls('portal-body')}>
              <div className="portal-box">{this.renderScreenTemplate()}</div>
            </div>
          )}
        </div>
      </>
    );
  }
}
export default ScreenView;
