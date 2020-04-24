/*
 * @Author: Eason 
 * @Date: 2020-04-09 10:13:17 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-24 17:04:20
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get, isNaN } from 'lodash';
import { Row, Col, Statistic, Card, Empty } from 'antd'
import { utils, ListLoader, ExtIcon } from 'suid';
import { formartUrl } from '../../../utils';
import styles from './index.less'

const { request } = utils;

class StatisticGrid extends PureComponent {

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
        style: PropTypes.object,
        className: PropTypes.string,
        itemRender: PropTypes.func,
        dataSplit: PropTypes.bool,
    };

    static defaultProps = {
        title: '',
        dataSplit: false,
        timer: {
            interval: 0
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
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
                        const data = get(res, reader.data, []) || [];
                        this.setState({
                            data,
                        });
                    }
                })
                .finally(() => {
                    !timerLoader && this.setState({ loading: false });
                });
        }
    };

    renderDataSplit = (item, index) => {
        const { title, value = 0 } = item;
        const data = isNaN(value) ? '0' : value || '0';
        return (
            <div className="item-box">
                <div className="title" key={`t_${index}`}>{title}</div>
                <div className="value" key={`v_${index}`}>
                    {
                        data.toString().split("").map((n, idx) => {
                            return (
                                <span key={`s_${idx}`} className='split-item'>
                                    {n}
                                </span>
                            )
                        })
                    }
                </div>
            </div>
        )
    };

    render() {
        const { data, loading } = this.state;
        const { skin = {}, style, className, itemRender, dataSplit } = this.props;
        const cols = data.length > 0 ? 24 / data.length : 0;
        return (
            <div className={cls('statistic-grid', styles["statistic-grid-box"], className)} style={style}>
                {
                    loading
                        ? <ListLoader />
                        : data.length > 0
                            ? <Row gutter={16} className={skin}>
                                {
                                    data.map((item, index) => {
                                        const { title, value = 0, precision = 2, iconType, color, percent = false } = item;
                                        const statisticProps = {
                                            title,
                                            value,
                                            precision,
                                            valueStyle: color ? { color } : null,
                                            prefix: iconType ? <ExtIcon type={iconType} antd /> : null,
                                            suffix: percent ? '%' : '',
                                        };
                                        return (
                                            <Col span={cols} key={index}>
                                                <Card bordered={false} className={{ 'split': dataSplit }}>
                                                    {
                                                        itemRender
                                                            ? itemRender(item, index)
                                                            : dataSplit ? this.renderDataSplit(item, index) : <Statistic {...statisticProps} />
                                                    }
                                                </Card>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </div>
        );
    }
}

export default StatisticGrid;