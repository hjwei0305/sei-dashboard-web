/*
 * @Author: Eason 
 * @Date: 2020-04-09 10:13:12 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-10 13:26:08
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

class EchartBarLine extends PureComponent {

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
            legendData: PropTypes.string,
            xAxisData: PropTypes.string.isRequired,
            yAxisData: PropTypes.string,
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
            xAxisData: [],
            yAxisData: [],
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
        if (timer.interval > 0) {
            this.endTimer();
            this.timer = setInterval(() => {
                this.getData({ timerLoader: true });
            }, timer.interval * 1000 * 60);
        }
    };

    endTimer = () => {
        window.clearInterval(this.timer);
    };

    getData = (p) => {
        const { params = null, timerLoader = false } = p || {};
        const { store, reader } = this.props;
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
                .then((res) => {
                    if (res.success) {
                        const legendData = get(res, reader.legendData, []);
                        const seriesData = get(res, reader.seriesData, []);
                        const xAxisData = get(res, reader.xAxisData, []);
                        const yAxisData = get(res, reader.yAxisData, [{ type: 'value' }]);
                        this.setState({
                            legendData,
                            seriesData,
                            xAxisData,
                            yAxisData
                        });
                    }
                })
                .finally(() => {
                    !timerLoader && this.setState({ loading: false });
                });
        }
    };

    getOption = () => {
        const { legendData, seriesData: seriesOrigin, xAxisData: xAxisOrigin, yAxisData: yAxisOrigin } = this.state;
        const { title, skin } = this.props;
        const { xAxis = {}, yAxis = {} } = skin;
        const xAxisData = xAxisOrigin.map(x => {
            const xObj = { ...x };
            Object.assign(xObj, {
                axisLine: {
                    show: true,
                    ...xAxis.axisLine
                },
                axisPointer: {
                    type: 'shadow'
                },
            });
            if (!xObj.hasOwnProperty('type')) {
                xObj.type = 'category';
            }
            return xObj;
        });
        const yAxisData = yAxisOrigin.map(y => {
            const yObj = { ...y };
            Object.assign(yObj, {
                splitLine: {
                    show: true,
                    lineStyle: {
                        ...yAxis.lineStyle
                    }
                },
                axisLine: {
                    show: true,
                    ...yAxis.axisLine
                }
            });
            if (!yObj.hasOwnProperty('type')) {
                yObj.type = 'value';
            }
            return yObj;
        });
        const seriesData = seriesOrigin.map(s => {
            const sObj = { ...s };
            if (!sObj.hasOwnProperty('type')) {
                sObj.type = 'bar';
            }
            if (get(sObj, 'type') === 'line') {
                sObj.smooth = true;
            }
            return sObj;
        });
        return {
            title: {
                text: title,
                x: 'center',
                ...(skin.title || {})
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            toolbox: {
                feature: {
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                bottom: 4,
                left: 'center',
                data: legendData,
                ...(skin.legend || {})
            },
            xAxis: xAxisData,
            yAxis: yAxisData,
            series: seriesData,
        };
    };

    render() {
        const { loading, xAxisData } = this.state;
        const echartProps = {
            notMerge: false,
            option: this.getOption(),
        };
        return (
            <div className={cls('echart-bar-line', styles["echart-bar-line-box"])}>
                {
                    loading
                        ? <ListLoader />
                        : xAxisData.length > 0
                            ? <ExtEcharts {...echartProps} />
                            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </div>
        );
    }
}

export default EchartBarLine;