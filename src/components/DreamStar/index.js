import React from 'react';
import { constants } from '../../utils';

const { LOCAL_PATH } = constants;
const DreamStar = () => {
  return (
    <div className="canvas-an" style={{ opacity: '0.2' }}>
      <iframe
        title="dynamic-point"
        frameBorder="0"
        src={`${LOCAL_PATH}/ani/index.html`}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
export default DreamStar;
