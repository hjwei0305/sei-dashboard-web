import React from 'react';
import cls from 'classnames';
import { ExtIcon } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import { constants } from '@/utils';
import styles from './DynamicEffect.less';

const { ANIMATE_EFFECT } = constants;

const AnimateEffect = ({ effectKey, onChange }) => {
  const effectList = [];
  Object.keys(ANIMATE_EFFECT).forEach(eKey => {
    effectList.push(ANIMATE_EFFECT[eKey]);
  });
  return (
    <div className={cls(styles['effect-box'])}>
      <div className="head-title">
        {formatMessage({ id: 'dashboard_000033', defaultMessage: '动效类型' })}
      </div>
      <div className="effect-body">
        {effectList.map(({ key, lang }) => (
          <div
            key={key}
            className={cls('item', { selected: effectKey === key })}
            onClick={() => onChange && onChange({ key })}
          >
            {formatMessage({ id: lang, defaultMessage: '未定义语言' })}
            <div className="corner">
              <ExtIcon type="selected" style={{ fontSize: 24 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AnimateEffect;
