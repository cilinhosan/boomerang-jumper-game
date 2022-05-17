import Phaser from "phaser";
import playerImage from "../assets/patchouli invisible dots.png";
import groundImage from "../assets/blue green background.png";
import projectileImage from "../assets/touhou green shiny ball bullet.png";
import backgroundImage from "../assets/purple moon house background.png";
import enemyImage from "../assets/red UFO.png";


class InGameScene extends Phaser.Scene {
    constructor() {
        super({key: "InGameScene"});
        //instance variables
        this.player;
        this.keyW;
        this.keyS;
        this.keyD;
        this.platform;
        this.score = 0;
        this.scoreText;
        this.boomerangGroup;
        this.playerDeadFlag = false;
        this.delayCount = 0;
        this.enemiesOnScreen = 0;
        this.maxEnemies = 10;
        this.enemiesAtFront = 0;
        this.maxEnemiesAtFront = 3;
        this.enemyFrontSpawnDelayCount = 60;
        this.enemyBackSpawnDelayCount = 60;
        this.restartGameFlag = false;
    }

    preload() {
        this.load.image('sky', backgroundImage);
        this.load.image('ground', groundImage)
        this.load.image('player', playerImage);
        this.load.image('boomerang', projectileImage);

        this.load.image('enemy', enemyImage)

    }
    
    create() {
        //background
        let skyBackground = this.add.sprite(400, 300, 'sky');
        skyBackground.setDisplaySize(800, 600)
        
        //don't forget the refreshbody at the end to sync image with physics body
        this.platform = this.physics.add.staticImage(355, 400, 'ground');
        this.platform.setDisplayOrigin(0, 0);
        this.platform.setDisplaySize(100, 200).refreshBody();

        //player settings
        this.player = this.physics.add.sprite(407, 350, 'player');
        this.player.displayWidth = 40;
        this.player.displayHeight = 40;
        this.player.setGravityY(1500);

        //inputs
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        //score
        this.scoreText = this.add.text(400, 16, '0', { fontSize: '32px', fill: '#ffffff' });

        // player collider with platform
        this.physics.add.collider(this.player, this.platform);

        //create walls for boomerang bounce
        this.endPoint1 = this.physics.add.staticImage(700, 175);
        this.endPoint1.setSize(10, 400);
        this.endPoint2 = this.physics.add.staticImage(100, 175);
        this.endPoint2.setSize(10, 400);
        
        //create Boomerang physics object group
        this.boomerangGroup = this.physics.add.group();
            //don't set a key here because: "Docs: Settings for this group. If key is set,
            //Phaser.GameObjects.Group#createMultiple is also called with these settings.", this means
            //that you'll get an object at the 0,0 (top left) of the screen once you create the group
        
        
        //this.boomerangGroup.defaultKey = "boomerang";

        //move to object method and use this to follow a pathfollower, or go with what is in the example

        this.enemyGroup = this.physics.add.group();

        this.physics.add.overlap(this.enemyGroup, this.boomerangGroup, (boomerang, enemy) => {
            boomerang.destroy();
            enemy.destroy();
            this.increaseScore();
        });
        /*
        this.physics.add.overlap(this.enemyGroup, this.player, (enemy, player) => {
            enemy.destroy();
            this.removeLife();
        });
        */
    }

    update() {

        this.calculateEnemySpawn();

        //delay counter for boomerang spawn
        if(this.delayCount > 0) {
            this.delayCount = this.delayCount - 1;
        }

        if (this.keyW.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-850);
        }

        if(this.keyD.isDown) {//Have to do: change isDown to something that only activates once
            if(!this.playerDeadFlag) {
                //check for delay
                if(this.delayCount === 0){
                    this.spawnBoomerang();
                    this.delayCount = 40;
                }
            }
        }

    }

    restartGame(){
        this.score = 0;

        this.restartGameFlag = false;
        //reset game state

        this.playerDeadFlag = false;
        this.scene.start("MenuScreenScene");

    }

    spawnBoomerang() {
        let vector2 = this.player.getCenter();
        //spawn boomerang on the right of player
        /*
        let boomerangInstance = this.boomerangGroup.get(vector2.x + 50, vector2.y);
    
        //check if boomerangInstance is not null, it can be if you set a limit on how many boomerangs are on the screen
        if(boomerangInstance) {
            //run the boomerang's spawn fucntion which works in the place of what would happen at a constructor
            boomerangInstance.spawn(vector2.x, vector2.y);
            

        }
        */
        let boomerangInstance = this.boomerangGroup.get(vector2.x + 60, vector2.y, 'boomerang');
        boomerangInstance.setSize(15, 15)

        boomerangInstance.setVelocityX(300);

        //if hit player then kill him
        this.physics.add.overlap(boomerangInstance, this.player, () => {
            this.removeLife();
            boomerangInstance.destroy();
        });
        
        boomerangInstance.setVelocityX(300);

        //bounce off invisible wall front
        this.physics.add.overlap(boomerangInstance, this.endPoint1, () => {
            boomerangInstance.setVelocityX(-350);
        });

        //bounce off invisible wall back
        this.physics.add.overlap(boomerangInstance, this.endPoint2, () => {
            boomerangInstance.setVelocityX(350);
        });

        //destroy boomerang when touches enemy
        this.physics.add.overlap(boomerangInstance, this.enemyGroup, () => {
            this.destroyBoomerangInstance(boomerangInstance);
        });

        //move to object method and use this to follow a pathfollower, or go with what is in the example

        //destroy enemy

    }

    removeLife(){
        this.player.disableBody(true, true);
        //set this to true when lifes are over
        this.playerDeadFlag = true;
        this.restartGameFlag = true;
        this.restartGame();

    }

    increaseScore(){
        this.score++;
        this.scoreText.setText(this.score);
    }

    calculateEnemySpawn(){

        let enemyBack;
        let enemyFront;

        this.enemySpawnSideFlag = 0;//front = 0 | back = 1


        if(this.enemyFrontSpawnDelayCount >= 0) {
            this.enemyFrontSpawnDelayCount = this.enemyFrontSpawnDelayCount - 1;
        }

        if(this.enemyBackSpawnDelayCount >= 0) {
            this.enemyBackSpawnDelayCount = this.enemyBackSpawnDelayCount - 1;
        }

        if((this.enemyFrontSpawnDelayCount < 0) && this.enemySpawnSideFlag === 0){

            //calculate random Y axis spawn location
            let randomY = this.randomIntFromInterval(200, 400);

            enemyFront = this.enemyGroup.get(740, randomY, 'enemy');
            this.enemySpawnSideFlag = 1;//switch to back
            if(enemyFront){
                enemyFront.setVelocityX(-125);
                enemyFront.setSize(50, 50);
            }
            this.enemyFrontSpawnDelayCount = 200;
        }

        if((this.enemyBackSpawnDelayCount < 0) && this.enemySpawnSideFlag === 1){
            let randomY = this.randomIntFromInterval(200, 400);

            enemyBack = this.enemyGroup.get(100, randomY, 'enemy');
            this.enemySpawnSideFlag = 0;//switch to front
            if(enemyBack) {
                enemyBack.setVelocityX(125);
                enemyBack.setSize(50, 50);
            }
            this.enemyBackSpawnDelayCount = 200;
        }
        
        if(enemyFront) {
            this.physics.add.overlap(enemyFront, this.player, () => {
                this.removeLife();
                enemyFront.destroy();
            });
        }

        if(enemyBack){
            this.physics.add.overlap(enemyBack, this.player, () => {
                this.removeLife();
                enemyBack.destroy();
            });
        }
    }

    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

export default InGameScene;