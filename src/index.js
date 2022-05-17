import Phaser from "phaser";
import MenuScreenScene from './MenuScreenScene';
import InGameScene from './InGameScene';

const config = {
    type: Phaser.AUTO,

    scale: {
        width: 800,
        height: 600,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [MenuScreenScene, InGameScene]
};

const game = new Phaser.Game(config);