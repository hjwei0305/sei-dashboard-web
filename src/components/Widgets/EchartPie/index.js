/*
 * @Author: Eason 
 * @Date: 2020-04-09 10:13:17 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-22 09:17:23
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { Empty } from 'antd';
import { ExtEcharts, utils, ListLoader } from 'suid';
import { formartUrl } from '../../../utils';
import styles from './index.less'

const { request } = utils;

class EchartPie extends PureComponent {

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
        seriesName: PropTypes.string.isRequired,
        reader: PropTypes.shape({
            legendData: PropTypes.string.isRequired,
            seriesData: PropTypes.string.isRequired,
        }).isRequired
    };

    static defaultProps = {
        title: '',
        timer: {
            interval: 0
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            legendData: [],
            seriesData: [],
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

    getData = (p) => {
        const { params = null, timerLoader = false } = p || {};
        const { store, reader } = this.props;
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
                .then((res) => {
                    if (res.success) {
                        const legendData = get(res, reader.legendData, []) || [];
                        const seriesData = get(res, reader.seriesData, []) || [];
                        this.setState({
                            legendData,
                            seriesData,
                        });
                    }
                })
                .finally(() => {
                    !timerLoader && this.setState({ loading: false });
                });
        }
    };

    render() {
        const { legendData, seriesData, loading } = this.state;
        const { title, seriesName, skin = {} } = this.props;
        const echartPieProps = {
            option: {
                title: {
                    text: title,
                    x: 'center',
                    ...(skin.title || {}),
                },
                toolbox: {
                    feature: {
                        saveAsImage: { show: true }
                    }
                },
                legend: {
                    bottom: 4,
                    left: 'center',
                    data: legendData,
                    ...(skin.legend || {})
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
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    },
                ],
            },
        };
        return (
            <div className={cls('echart-pie', styles["echart-pie-box"])}>
                {
                    loading
                        ? <ListLoader />
                        : seriesData.length > 0
                            ? <ExtEcharts {...echartPieProps} />
                            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </div>
        );
    }
}

export default EchartPie;