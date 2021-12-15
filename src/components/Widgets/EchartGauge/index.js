/*
 * @Author: Eason
 * @Date: 2020-04-09 10:13:17
 * @Last Modified by: Eason
 * @Last Modified time: 2021-12-15 18:21:47
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { utils, ListLoader, ExtEcharts } from 'suid';
import { formartUrl } from '../../../utils';
import styles from './index.less';

const { request } = utils;

class EchartGauge extends PureComponent {
  static timer = null;

  static propTypes = {
    title: PropTypes.string,
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
    overwriteOption: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
  };

  static defaultProps = {
    title: '标题',
    timer: {
      interval: 0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: { amount: 0, percent: '' },
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
    if (this.timer) {
      window.clearInterval(this.timer);
    }
  };

  getData = p => {
    const { params = null, timerLoader = false } = p || {};
    const { store, reader } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'get';
    if (!timerLoader) {
      this.setState({ loading: true });
    }
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
            const data = get(res, reader.data, null) || null;
            this.setState({
              data,
            });
          }
        })
        .finally(() => {
          if (!timerLoader) {
            this.setState({ loading: false });
          }
        });
    }
  };

  getOption = () => {
    const { title, overwriteOption } = this.props;
    const { data } = this.state;
    if (overwriteOption) {
      return overwriteOption({ data });
    }
    return {
      color: ['#068ef0'],
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false,
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              borderWidth: 100,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10,
            },
          },
          axisLine: {
            lineStyle: {
              width: 40,
            },
          },
          splitLine: {
            show: false,
            distance: 0,
            length: 10,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
            distance: 50,
          },
          data: {
            value: data || 0,
            name: title,
            title: {
              offsetCenter: ['0%', '10%'],
            },
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '-10%'],
            },
          },
          title: {
            fontSize: 30,
          },
          detail: {
            width: 50,
            height: 40,
            fontSize: 60,
            color: 'auto',
            formatter: '98',
          },
        },
      ],
    };
  };

  renderGauge = () => {
    const echartProps = {
      notMerge: false,
      option: this.getOption(),
    };
    return <ExtEcharts {...echartProps} />;
  };

  render() {
    const { loading } = this.state;
    const { style, className } = this.props;
    return (
      <div className={cls('echart-gauge', styles['echart-gauge-box'], className)} style={style}>
        {loading ? <ListLoader /> : this.renderGauge()}
      </div>
    );
  }
}

export default EchartGauge;
