/*
 * @Author: Eason
 * @Date: 2020-04-09 10:13:17
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:10:56
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { Empty } from 'antd';
import { ExtEcharts, utils, ListLoader } from 'suid';
import { formartUrl } from '../../../utils';
import styles from './index.less';

const { request } = utils;

class EchartPie extends PureComponent {
  static timer = null;

  static propTypes = {
    title: PropTypes.string,
    timer: PropTypes.shape({
      interval: PropTypes.number,
    }),
    summary: PropTypes.shape({
      show: PropTypes.bool,
      title: PropTypes.string,
      data: PropTypes.string,
    }),
    store: PropTypes.shape({
      type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
      url: PropTypes.string,
    }).isRequired,
    seriesName: PropTypes.string.isRequired,
    reader: PropTypes.shape({
      legendData: PropTypes.string.isRequired,
      seriesData: PropTypes.string.isRequired,
    }).isRequired,
    theme: PropTypes.object,
    overwriteOption: PropTypes.func,
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
      legendData: [],
      seriesData: [],
      summaryData: 0,
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
    const { store, reader, summary } = this.props;
    const { url, type } = store || {};
    const methodType = type || 'GET';
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
            const legendData = get(res, reader.legendData, []) || [];
            const seriesData = get(res, reader.seriesData, []) || [];
            let summaryData = 0;
            if (summary && summary.show) {
              summaryData = get(res, summary.data, 0) || 0;
            }
            this.setState({
              legendData,
              seriesData,
              summaryData,
            });
          }
        })
        .finally(() => {
          !timerLoader && this.setState({ loading: false });
        });
    }
  };

  getOption = () => {
    const { legendData, seriesData } = this.state;
    const { title, seriesName, skin = {} } = this.props;
    const { overwriteOption } = this.props;
    if (overwriteOption) {
      return overwriteOption({ legendData, seriesData });
    }
    return {
      title: {
        text: title,
        x: 'center',
        ...(skin.title || {}),
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true },
        },
      },
      legend: {
        bottom: 4,
        left: 'center',
        data: legendData,
        ...(skin.legend || {}),
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a}<br/>{b}:{c}({d}%)',
      },
      series: [
        {
          name: seriesName,
          type: 'pie',
          radius: '65%',
          center: ['50%', '50%'],
          selectedMode: 'single',
          data: seriesData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  renderSummary = () => {
    const { summary } = this.props;
    const { summaryData } = this.state;
    if (summary && summary.show) {
      return (
        <div className="summary-box">
          <span className="title">{summary.title}</span>
          <span className="value">{summaryData}</span>
        </div>
      );
    }
    return null;
  };

  renderChart = () => {
    const { seriesData } = this.state;
    const { theme, summary } = this.props;
    const echartProps = {
      theme,
      option: this.getOption(),
      className: summary && summary.show ? 'summary' : '',
    };
    return (
      <>
        {seriesData.length > 0 ? (
          <>
            {this.renderSummary()}
            <ExtEcharts {...echartProps} />
          </>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </>
    );
  };

  render() {
    const { loading } = this.state;
    const { style, className } = this.props;
    return (
      <div className={cls('echart-pie', styles['echart-pie-box'], className)} style={style}>
        {loading ? <ListLoader /> : this.renderChart()}
      </div>
    );
  }
}

export default EchartPie;
