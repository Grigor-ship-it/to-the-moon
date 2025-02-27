import Phaser from "phaser";
import preloadAssets from "./helpers/preloadAssets";
import {
  checkAsteroidPos,
  enemyPos,
  checkEnemyPos,
  checkCoinPos,
} from "./helpers/position";
import { spawnCoins } from "./helpers/powerups";
import { shoot, enemyShoot } from "./helpers/shoot";
import {
  setEnemyCollision,
  setAsteroidCollision,
  collisionDestroy,
} from "./helpers/collision";
import { scoreIncreaseAsteroid } from "./helpers/score";
// const rp = require('request-promise');
import Button from "./helpers/button";
import addPhysics from "./helpers/addPhysics";
import { fighterGenerator } from "./helpers/fighters";
// import { createGroup } from "./helpers/groups";

export default class Main extends Phaser.Scene {
  constructor(props) {
    super("Main");
    this.props = props;

  }

  init(data) {
    const self = this;
    console.log(data);
    self.playerTwoScore = 0;
    this.playerScore = 0;
    this.playerLives = 100;
    this.invincibility = false;
    this.continiuosShot = false;
    this.disableShot = false;
    this.disableMovement = false;
    this.finishLine = -20000;
    this.playerChoice = data.player;
    this.playerTwoChoice = data.playertwo;
    this.respawnTimer = 1000;
  }

  //Preload all assets to load files from asset folder
  preload() {
    preloadAssets(this);
  }

  //After loading assets create() will generate asset instances in game
  create() {
    const self = this;
    //width and height from canvas for easy manipulations

    console.log(this.props.socket);

    let { width, height } = this.sys.game.canvas;
    //sets background image
    this.add.image(400, 300, "background");
    this.background = this.add
      .tileSprite(0, 0, 0, 0, "background")
      .setOrigin(0);

    this.finishLineMoon = this.add
      .image(width / 2, -750, "finishLineMoon")
      .setOrigin(0.5)
      .setScale(1.5);
    this.finishLineMoon.visible = false;

    this.progressBar2 = this.add.graphics({ x: 700, y: 280 });
    this.progressBox2 = this.add.graphics({ x: 700, y: 280 });
    this.progressBox2.fillStyle(0x222222, 0.8);
    this.progressBox2.fillRect(245, 270, 40, -310);
    this.add.image(965, 235, "progressMoon").setScale(0.1);

    //sets player and player physics

    this.player = this.physics.add.sprite(
      width/2,
      height,
      `${this.playerChoice}`
    );
    this.player.setCollideWorldBounds(true, 1, 1);
    this.player.setDrag(200, 200);

    const playerTwo = this.physics.add.sprite(
      width / 2 + 15,
      height,
      `${this.playerTwoChoice}`
    );
    playerTwo.setCollideWorldBounds(true, 1, 1);
    playerTwo.setDrag(200, 200);

    this.enemy = this.physics.add.sprite(500, 0, "enemyshooter");
    this.enemy.setVelocityX(Phaser.Math.Between(-100, 100));
    this.enemy.setVelocityY(Phaser.Math.Between(100, 150));
    this.enemy.body.enable = false;
    this.enemy.visible = false;
    this.halfwayPoint = (-(this.finishLine / (3 * 30)) / 4) * 1000;
    this.time.addEvent({
      delay: 30000,
      callback: () => {
        this.enemy.body.enable = true;
        this.enemy.visible = true;
      },
      callbackScope: this,
      loop: false,
    });

    this.enemy.setVelocityX(Phaser.Math.Between(-100, 100));
    this.enemy.setVelocityY(Phaser.Math.Between(100, 150));
    
    this.enemies = this.physics.add.group({
      key: "seceagle",      
      frameQuantity: 1,
      scale: 0.1,
      immovable: true,
      // repeat: Math.ceil(2 * (this.progress + 1)),
      setXY: {
        x: Math.floor(Math.random() * 800),
        y: 50,
        stepX: Phaser.Math.Between(10, 750),
        stepY: Phaser.Math.Between(15, 300),
        
      },
    });
  
    

    this.time.addEvent({
      delay: -this.finishLine / 2,
      callback: () => {
        this.enemies.createMultiple({
          key: "seceagle",
          repeat: 2,
          setXY: {
            x: Math.floor(Math.random() * 800),
            y: 0,
            stepX: Phaser.Math.Between(10, 750),
            stepY: Phaser.Math.Between(15, 30),
          },
        });
        this.enemies.setVelocityX(Phaser.Math.Between(-100, 100));
        this.enemies.setVelocityY(Phaser.Math.Between(100, 150));
      },
      callbackScope: this,
      loop: false,
    });

    //creates asteroid group and sets asteroid physics
    this.asteroids = this.physics.add.group({
      key: "asteroid",
      frameQuantity: 2,
      // repeat: 2,
      setCircle: 300,
      immovable: true,
      setXY: {
        x: Math.floor(Math.random() * 800),
        y: 0,
        stepX: Phaser.Math.Between(10, 750),
        stepY: Phaser.Math.Between(15, 300),
      },
    });

    //creates bitcoin group and sets asteroid physics
    this.bitcoin = this.physics.add.group({
      key: "bitcoin",
      frameQuantity: 1,
      immovable: true,
      setXY: {
        x: Math.floor(Math.random() * 800),
        y: 0,
        stepX: Phaser.Math.Between(10, 750),
        stepY: Phaser.Math.Between(15, 300),
      },
    });

    this.ethereum = this.physics.add.group({
      key: "ethereum",
      frameQuantity: 1,
      immovable: true,
      setXY: {
        x: Math.floor(Math.random() * 800),
        y: 0,
        stepX: Phaser.Math.Between(10, 750),
        stepY: Phaser.Math.Between(15, 300),
      },
    });

    this.litecoin = this.physics.add.group({
      key: "litecoin",
      frameQuantity: 1,
      immovable: true,
      setXY: {
        x: Math.floor(Math.random() * 800),
        y: 0,
        stepX: Phaser.Math.Between(10, 750),
        stepY: Phaser.Math.Between(15, 300),
      },
    });

    this.dogecoin = this.physics.add.group({
      key: "dogecoin",
      frameQuantity: 1,
      immovable: true,
      setXY: {
        x: Math.floor(Math.random() * 800),
        y: 0,
        stepX: Phaser.Math.Between(10, 750),
        stepY: Phaser.Math.Between(15, 300),
      },
    });

    if (this.bitcoin) {
      console.log("bitcoin spawn");
      spawnCoins(this.bitcoin, "bitcoin", 80, this);
    }
    if (this.ethereum) {
      spawnCoins(this.ethereum, "ethereum", 40, this);
    }
    if (this.litecoin) {
      spawnCoins(this.litecoin, "litecoin", 20, this);
    }
    if (this.dogecoin) {
      spawnCoins(this.dogecoin, "dogecoin", 10, this);
    }

    // add physics overlaps
    addPhysics(this);
    //playertwo score
    this.blueScoreText = this.add.text(5, 40, "", {
      fontSize: "24px",
      fill: "#FFFF00",
    });

    this.props.socket.on("redirectScore", function (data) {
      console.log(data);
      self.playerTwoScore = data
      self.blueScoreText.setText("Player Two score:" + data);
    });
    //Overhead score and lives text
    const textStyle = {
      fontSize: 24,
      color: "#FFFF00",
    };
    this.playerScoreLabel = this.add.text(
      5,
      5,
      `Your Score:${this.playerScore}`,
      textStyle
    );
    this.playerLifeLabel = this.add.text(
      5,
      65,
      `Lives: ${this.playerLives}`,
      textStyle
    );

    const pause = new Button(width - 30, 10, 0.8, "Pause", this, () => {
      this.props.socket.emit("pause", "pause screen");
      this.scene.launch("Pause");
      this.scene.pause();
    });

    this.props.socket.on("pauseScreen", function (data) {
      console.log(data);
      self.scene.launch("Pause");
      self.scene.pause();
    });
    //Creates music file to play in background and plays it
    // this.music = this.sound.add("audioSound", { volume: 0.9, loop: true });
    // this.music.play();

    //keybindings
    this.cursors = this.input.keyboard.createCursorKeys();

    this.key = this.input.keyboard.on("keydown-SPACE", shoot, this);

    setAsteroidCollision(this.asteroids);
    if (this.bitcoin) {
      setAsteroidCollision(this.bitcoin);
    }
    console.log(this.ethereum);
    if (this.ethereum) {
      setAsteroidCollision(this.ethereum);
    }
    if (this.litecoin) {
      setAsteroidCollision(this.litecoin);
    }
    if (this.dogecoin) {
      setAsteroidCollision(this.dogecoin);
    }
    setEnemyCollision(this.enemies);

    //Creates explosion animation when asteroids are destroyed.
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 1,
        end: 6,
      }),
      frameRate: 15,
      hideOnComplete: true,
      setCircle: 300,
    });

    this.anims.create({
      key: "sparks",
      frames: this.anims.generateFrameNumbers("sparkle", {
        start: 5,
        end: 8,
      }),
      frameRate: 15,
      hideOnComplete: true,
      setCircle: 300,
    });

    this.anims.create({
      key: "itemSparks",
      frames: this.anims.generateFrameNumbers("sparkle", {
        start: 17,
        end: 20,
      }),
      frameRate: 15,
      hideOnComplete: true,
      setCircle: 300,
    });

    this.time.addEvent({
      delay: 1000,
      callback: enemyShoot,
      callbackScope: this,
      loop: true,
    });

    this.props.socket.on("enemyMovement", function (data) {
      switch (data) {
        case "up":
          playerTwo.y -= 10;

          break;
        case "down":
          playerTwo.y += 10;
          break;
        case "left":
          playerTwo.x -= 10;
          break;
        case "right":
          playerTwo.x += 10;
          break;
      }
    });

    function shoot() {
      if (this.player.body.enable === true) {
        if(!this.disableShot){
        this.props.socket.emit("enemyFire", "Player two is shooting");

        this.laser = this.physics.add
          .image(this.player.x - 2, this.player.y - 40, "laser")
          .setScale(0.25);

        this.laser.setVelocityY(-900);
        this.laserSound = this.sound.add("laserSound", { volume: 0.1 });
        this.laserSound.play();
        this.physics.add.collider(
          this.laser,
          this.asteroids,
          collisionDestroy,
          scoreIncreaseAsteroid,
          this
        );
        this.physics.add.collider(
          this.laser,
          this.enemies,
          collisionDestroy,
          scoreIncreaseAsteroid,
          this
        );
        this.physics.add.collider(
          this.laser,
          this.enemy,
          collisionDestroy,
          scoreIncreaseAsteroid,
          this
        );
        if (this.laser.y > 800) {
          this.laser.destroy();
        }
      }
    }
    }

    function secondPlayerShoot() {
      const laser = self.physics.add
        .image(playerTwo.x - 2, playerTwo.y - 40, "laser")
        .setScale(0.25);
      laser.setVelocityY(-900);
      if (laser.y > 800) {
        laser.destroy();
      }
    }

    this.props.socket.on("enemyShoot", function (data) {
      secondPlayerShoot();
    });
  }

  update() {
    const self = this;

    this.props.socket.emit("score", this.playerScore);
    // self.sprite.data.on('changedata-this.playerScore', console.log(this.playerScore))
    //scrolling background image for infinite loop
    this.background.tilePositionY -= 3;
    this.progress =
      Math.round((this.background.tilePositionY / this.finishLine) * 100) / 100;

    this.progressBar2.fillStyle(0x16cc41, 1);
    this.progressBar2.fillRect(250, 265, 30, -300 * this.progress);

    if (this.continiuosShot) {
      this.time.addEvent({
        delay: 100,
        callback: shoot,
        callbackScope: this,
        loop: false,
      });
    }

    if (
      this.background.tilePositionY < (this.finishLine*0.87)
    ) {
      this.finishLineMoon.visible = true;
      this.finishLineMoon.y += 3;
    }

    //After a certain distance go to the winning screen
    if (this.background.tilePositionY < this.finishLine) {
      if(this.playerScore > self.playerTwoScore) {
      this.props.socket.disconnect();
      this.scene.stop("Main");
      this.scene.start("Win", {
        lives: this.playerLives,
        score: this.playerScore,
      });
    } else {
      this.props.socket.disconnect();
      this.scene.stop("Main");
      this.scene.start("Lose", {
        lives: this.playerLives,
        score: this.playerScore,
    })
  }}

    if (this.playerLives === 0) {
      this.props.socket.disconnect();
      this.scene.stop("Main");
      this.scene.start("Lose", {
        lives: this.playerLives,
        score: this.playerScore,
        // player: this.playerChoice 
      });
    }

    /** @type {Phaser.Phyics.Arcade.StaticBody} */

    //keybinding listeners for player movement
    if (this.cursors.up.isDown && !this.disableMovement) {
      this.player.y -= 10;
      if (this.player.body.enable === true) {
        this.props.socket.emit("playerMovement", "up");

        // collisionObject.setInvincibility(respawnTimer);
        // respawn()
      }
    }
    if (this.cursors.down.isDown && !this.disableMovement) {
      this.player.y += 10;
      if (this.player.body.enable === true) {
        this.props.socket.emit("playerMovement", "down");
      }
    }

    if (this.cursors.left.isDown && !this.disableMovement) {
      this.player.x -= 10;
      if (this.player.body.enable === true) {
        this.props.socket.emit("playerMovement", "left");
      }
    }

    if (this.cursors.right.isDown && !this.disableMovement) {
      this.player.x += 10;
      if (this.player.body.enable === true) {
        this.props.socket.emit("playerMovement", "right");
      }
    }
  

    checkAsteroidPos(this.asteroids, this);
    if (this.bitcoin) {
      checkCoinPos(this.bitcoin, this);
    }
    if (this.litecoin) {
      checkCoinPos(this.litecoin, this);
    }
    if (this.dogecoin) {
      checkCoinPos(this.dogecoin, this);
    }
    if (this.ethereum) {
      checkCoinPos(this.ethereum, this);
    }
    checkEnemyPos(this.enemies, this);
    if (this.enemy.body.enable === true) {
      enemyPos(this.enemy, this);
    }
  }
}
