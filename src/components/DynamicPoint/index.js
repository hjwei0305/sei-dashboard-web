import React from 'react';
import { constants } from '../../utils';
const { LOCAL_PATH } = constants;
const DynamicPoint = () => {
    return (
        <div className="canvas-an" style={{ opacity: '0.8' }}>
            <iframe title="dynamic-point" frameBorder="0" src={`${LOCAL_PATH}/ani/index.html`} style={{ width: '100%', height: '100%' }} />
        </div>
    )
}
export default DynamicPoint;