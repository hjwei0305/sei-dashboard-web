/*
 * @Author: Eason
 * @Date: 2020-04-09 10:13:17
 * @Last Modified by: Eason
 * @Last Modified time: 2020-06-09 09:48:21
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import Slider from 'react-slick';
import { utils, ListLoader, ExtIcon } from 'suid';
import { formartUrl } from '../../../utils';
import GroupList from './GroupList';
import styles from './index.less';

const { request } = utils;

const NextArrow = props => {
  const { className, style, onClick } = props;
  return (
    <ExtIcon
      type="right"
      className={className}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
      antd
    />
  );
};

const PrevArrow = props => {
  const { className, style, onClick } = props;
  return (
    <ExtIcon
      type="left"
      className={className}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
      antd
    />
  );
};

class MyWorkTodo extends PureComponent {
  static timer = null;

  static groupSliderRef = null;

  static propTypes = {
    title: PropTypes.string,
    timer: PropTypes.shape({
      interval: PropTypes.number,
    }),
    group: PropTypes.shape({
      maxCount: PropTypes.number.isRequired,
      store: PropTypes.shape({
        type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
        url: PropTypes.string,
      }).isRequired,
      reader: PropTypes.shape({
        data: PropTypes.string.isRequired,
      }).isRequired,
    }),
    groupList: PropTypes.shape({
      maxCount: PropTypes.number.isRequired,
      store: PropTypes.shape({
        type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
        url: PropTypes.string,
      }).isRequired,
      reader: PropTypes.shape({
        data: PropTypes.string.isRequired,
      }).isRequired,
    }),
    style: PropTypes.object,
    className: PropTypes.string,
  };

  static defaultProps = {
    title: '',
    timer: {
      interval: 0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      groupData: [],
      groupSlider: null,
      selectItemIndex: 0,
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
    const { params = null, timerLoader = false } = p || {};
    const { group } = this.props;
    const { store, reader } = group;
    const { url, type } = store || {};
    const methodType = type || 'get';
    !timerLoader && this.setState({ loading: true });
    const requestOptions = {
      method: methodType,
      url: formartUrl(url),
      headers: { neverCancel: true },
    };
    if (params) {
      if (methodType.toLocaleLowerCase() === 'get') {
        requestOptions.params = params;
      } else {
        requestOptions.data = params;
      }
    }
    if (url) {
      request(requestOptions)
        .then(res => {
          if (res.success) {
            const groupData = get(res, reader.data, []) || [];
            this.setState({
              groupData,
            });
          }
        })
        .finally(() => {
          !timerLoader && this.setState({ loading: false });
        });
    }
  };

  handlerGroupSliderRef = ref => {
    if (ref && ref.innerSlider) {
      this.groupSliderRef = ref;
    }
    this.setState({
      groupSlider: this.groupSliderRef,
    });
  };

  handlerGroupSelect = index => {
    const { groupSlider } = this.state;
    groupSlider.slickGoTo(index);
    this.setState({
      selectItemIndex: index,
    });
  };

  renderMyWorkTodo = () => {
    const { groupData, selectItemIndex } = this.state;
    const { groupList, group } = this.props;
    const carouselGroupProps = {
      dots: false,
      infinite: false,
      slidesToShow: group.maxCount,
      swipeToSlide: true,
      nextArrow: <NextArrow className="next-arrow" />,
      prevArrow: <PrevArrow className="prev-arrow" />,
    };
    const { store, reader, maxCount } = groupList;
    const currentGroupItem = groupData.length > 0 ? groupData[selectItemIndex] : null;
    const groupListProps = {
      store,
      reader,
      maxCount,
      groupItem: currentGroupItem,
    };
    return (
      <>
        <div className="group-todo">
          <Slider ref={this.handlerGroupSliderRef} {...carouselGroupProps}>
            {groupData.map((item, index) => {
              return (
                <div
                  className={cls('todo-type-item', { select: selectItemIndex === index })}
                  key={`group_${item.businessModeId}`}
                  onClick={() => this.handlerGroupSelect(index)}
                >
                  <div className="total">{item.count}</div>
                  <div className="title">{item.businessModelName}</div>
                  <div className="arrow-line" />
                </div>
              );
            })}
          </Slider>
        </div>
        <div className="group-list-todo">
          <GroupList {...groupListProps} />
        </div>
      </>
    );
  };

  render() {
    const { loading } = this.state;
    const { style, className } = this.props;
    return (
      <div className={cls('my-work-todo', styles['my-work-todo-box'], className)} style={style}>
        {loading ? <ListLoader /> : this.renderMyWorkTodo()}
      </div>
    );
  }
}

export default MyWorkTodo;
