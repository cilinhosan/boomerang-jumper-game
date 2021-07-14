import Phaser from "phaser";

class MenuScreenScene extends Phaser.Scene {
    constructor() {
        super({key: "MenuScreenScene"});

    }

    create() {
        this.add.text(20, 20, "Click to Play!");

        this.input.on('pointerdown', () => {
            this.scene.start('InGameScene');
        }, this);
    }
}

export default MenuScreenScene;