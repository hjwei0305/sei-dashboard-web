import React from 'react';
import Particles from 'react-particles-js';
import styles from './index.less';

const params = {
    simple: {
        "particles": {
            "number": {
                "value": 20,
            },
            "size": {
                "value": 3,
            }
        },
        "interactivity": {
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                }
            }
        }
    },
    bubbles: {
        "particles": {
            "number": {
                "value": 20,
                "density": {
                    "enable": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "speed": 4,
                    "size_min": 0.3
                }
            },
            "line_linked": {
                "enable": false
            },
            "move": {
                "random": true,
                "speed": 1,
                "direction": "top",
                "out_mode": "out"
            }
        },
        "interactivity": {
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "bubble"
                },
                "onclick": {
                    "enable": true,
                    "mode": "repulse"
                }
            },
            "modes": {
                "bubble": {
                    "distance": 250,
                    "duration": 2,
                    "size": 0,
                    "opacity": 0
                },
                "repulse": {
                    "distance": 400,
                    "duration": 4
                }
            }
        }
    },
    snow: {
        "particles": {
            "number": {
                "value": 160,
                "density": {
                    "enable": false
                }
            },
            "size": {
                "value": 10,
                "random": true
            },
            "move": {
                "direction": "bottom",
                "out_mode": "out"
            },
            "line_linked": {
                "enable": false
            }
        },
        "interactivity": {
            "events": {
                "onclick": {
                    "enable": true,
                    "mode": "remove"
                }
            },
            "modes": {
                "remove": {
                    "particles_nb": 10
                }
            }
        }
    },
    nightSky: {
        "particles": {
            "number": {
                "value": 60,
                "density": {
                    "enable": true,
                    "value_area": 1500
                }
            },
            "line_linked": {
                "enable": true,
                "opacity": 0.02
            },
            "move": {
                "direction": "right",
                "speed": 0.05
            },
            "size": {
                "value": 1
            },
            "opacity": {
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.05
                }
            }
        },
        "interactivity": {
            "events": {
                "onclick": {
                    "enable": true,
                    "mode": "push"
                }
            },
            "modes": {
                "push": {
                    "particles_nb": 1
                }
            }
        },
        "retina_detect": true
    }
};

const Particle = ({ effectType = 'bubbles' }) => {
    return (
        <div className={styles['particle-box']}>
            <Particles params={params[effectType]} />
        </div>
    )
}
export default Particle;