    spawnCrawler(x, y) {
        const crawler = this.physics.add.sprite(x, y, 'crawler').setScale(2);
        this.enemies.add(crawler);
        crawler.setGravityY(1000);
        crawler.setBounce(0);
        crawler.setVelocityX(55); // CR_SPD
        crawler.setData({ type: 'crawler', hp: 2, maxHp: 2, invTime: 0, spawnX: x, spawnY: y, dir: 1 });
        crawler.body.setSize(12, 10);
        crawler.body.setOffset(2, 6);
    }

    spawnFlyer(x, y) {
        const flyer = this.physics.add.sprite(x, y, 'flyer').setScale(2);
        this.enemies.add(flyer);
        flyer.setGravityY(0);
        flyer.body.allowGravity = false;
        flyer.setData({ type: 'flyer', hp: 2, maxHp: 2, invTime: 0, spawnX: x, spawnY: y, baseY: y, angle: Math.random() * Math.PI * 2 });
        flyer.body.setSize(14, 12);
        flyer.body.setOffset(1, 2);
    }

    spawnBoss(x, y) {
        const boss = this.physics.add.sprite(x, y, 'boss').setScale(2.5);
        this.enemies.add(boss);
        boss.setGravityY(1000); // P_GRAV
        boss.setBounce(0);
        boss.setData({ type: 'boss', hp: 10, maxHp: 10, invTime: 0, spawnX: x, spawnY: y, dir: 1, attackTimer: 0, phase: 'patrol', chaseRange: 250 });
        boss.body.setSize(16, 24);
        boss.body.setOffset(8, 8);
    }

    updateEnemies(time, delta) {
        this.enemies.getChildren().forEach(enemy => {
            const data = enemy.getData();
            if (!data) return;

            // Handle invincibility
            if (time < data.invTime) {
                // blink effect is handled in damageEnemy, but we could add logic here
                return; // Optionally pause enemy AI while taking hit
            } else {
                enemy.clearTint();
            }

            if (data.type === 'crawler') {
                enemy.setVelocityX(55 * data.dir); // CR_SPD
                
                // Edge detection & wall bounce
                let isBlocked = data.dir === 1 ? enemy.body.blocked.right : enemy.body.blocked.left;
                
                let nextX = enemy.x + (data.dir * 16);
                let nextY = enemy.y + 16;
                let tileAhead = this.map.getTileAtWorldXY(nextX, nextY, true, this.cameras.main, 'ground');
                
                if (isBlocked || (enemy.body.blocked.down && (!tileAhead || tileAhead.index === -1))) {
                    data.dir *= -1;
                    enemy.setData('dir', data.dir);
                }
                
                enemy.setFlipX(data.dir === -1);
            } 
            else if (data.type === 'flyer') {
                const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                
                if (distToPlayer < 200) { // FL_RANGE
                    this.physics.moveToObject(enemy, this.player, 80); // FL_SPD
                    data.angle += 0.05;
                    enemy.setVelocityY(enemy.body.velocity.y + Math.sin(data.angle) * 20);
                } else {
                    enemy.setVelocityX(0);
                    data.angle += 0.05;
                    enemy.y = data.baseY + Math.sin(data.angle) * 20;
                    enemy.setVelocityY(0);
                }
                
                enemy.setFlipX(enemy.x > this.player.x);
                enemy.setData('angle', data.angle);
            }
            else if (data.type === 'boss') {
                const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                
                if (data.phase === 'patrol') {
                    enemy.setVelocityX(70 * data.dir); // BOSS_SPD
                    let isBlocked = data.dir === 1 ? enemy.body.blocked.right : enemy.body.blocked.left;
                    if (isBlocked) {
                        data.dir *= -1;
                        enemy.setData('dir', data.dir);
                    }
                    
                    if (distToPlayer < data.chaseRange) {
                        enemy.setData('phase', 'chase');
                    }
                } else if (data.phase === 'chase') {
                    if (distToPlayer > data.chaseRange + 100) {
                        enemy.setData('phase', 'patrol');
                    } else {
                        // Chase player
                        data.dir = enemy.x < this.player.x ? 1 : -1;
                        enemy.setData('dir', data.dir);
                        
                        data.attackTimer -= delta;
                        if (data.attackTimer <= 0) {
                            // Charge attack
                            enemy.setVelocityX(70 * 2.5 * data.dir);
                            data.attackTimer = 2000;
                        } else if (data.attackTimer < 1500) { // Normal chase
                            enemy.setVelocityX(70 * data.dir);
                        } else {
                            // Pausing before charge
                            enemy.setVelocityX(0);
                        }
                    }
                }
                enemy.setFlipX(data.dir === -1);
            }
        });
    }

    updateUI() {
        // Update health masks
        for (let i = 0; i < 5; i++) { // HP_MAX = 5
            if (this.ps.hp > i) {
                this.hpMasks[i].setVisible(true);
            } else {
                this.hpMasks[i].setVisible(false);
            }
        }
        
        // Update soul bar
        const soulWidth = (this.ps.soul / 99) * 98; // SOUL_MAX = 99
        this.tweens.add({
            targets: this.soulBarFg,
            width: soulWidth,
            duration: 100
        });
    }

    update(time, delta) {
        // Hitstop: if active, freeze everything briefly
        if (time < this.hitstopTime) return;
        
        this.gameTime = time;
        this.updatePlayer(time, delta);
        this.updateEnemies(time, delta);
        
        // Check attack collisions if attacking
        if (time < this.ps.atkTime) {
            this.checkAttackCollisions(time);
        }
        
        this.updateUI();
    }
}

class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }
    create() {
        this.cameras.main.setBackgroundColor(0x0a0a18);
        
        // Title text
        this.add.text(480, 180, '空洞骑士', {
            fontSize: '64px', fill: '#e8e8f0', fontFamily: 'serif'
        }).setOrigin(0.5);
        
        this.add.text(480, 250, 'HOLLOW KNIGHT DEMO', {
            fontSize: '20px', fill: '#8888aa', fontFamily: 'monospace'
        }).setOrigin(0.5);
        
        // Controls
        const controls = [
            '方向键 / WASD - 移动',
            'Z / K - 跳跃 (可二段跳)',
            'X / J - 攻击 (可配合方向键)',
            'C / L - 冲刺',
            '↓ + Z (长按) - 治愈 (消耗灵魂)',
        ];
        controls.forEach((text, i) => {
            this.add.text(480, 330 + i * 28, text, {
                fontSize: '14px', fill: '#666688', fontFamily: 'monospace'
            }).setOrigin(0.5);
        });
        
        // Start prompt
        const startText = this.add.text(480, 490, '按任意键开始', {
            fontSize: '18px', fill: '#aaaacc', fontFamily: 'monospace'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        this.input.keyboard.on('keydown', () => {
            this.scene.start('Boot');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [TitleScene, BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
    updatePlayer(time, delta) {
        if (this.ps.dead) return;

        // Timers
        if (time < this.ps.invTime) {
            this.p.visible = Math.floor(time / 100) % 2 === 0;
        } else {
            this.p.visible = true;
        }

        const isGrounded = this.p.body.blocked.down;
        if (isGrounded) {
            this.ps.jumps = 0;
            this.ps.lastGround = time;
        }

        this.ps.wallDir = 0;
        if (this.p.body.blocked.left) this.ps.wallDir = -1;
        if (this.p.body.blocked.right) this.ps.wallDir = 1;

        // Wall slide
        if (this.ps.wallDir !== 0 && !isGrounded && this.p.body.velocity.y > 0) {
            this.p.body.velocity.y = Math.min(this.p.body.velocity.y, 50); // P_WALL_SLIDE
        }

        this.handleMovement(time, delta);
        this.handleJump(time);
        this.handleAttack(time);
        this.handleDash(time);
        this.handleHeal(time);

        // Update flip
        if (this.ps.facing === -1) {
            this.p.setFlipX(true);
        } else {
            this.p.setFlipX(false);
        }
    }

    handleMovement(time, delta) {
        if (time < this.ps.dashTime || time < this.ps.atkTime) return;
        if (this.ps.isHealing) {
            this.p.setVelocityX(0);
            return;
        }

        let left = this.keys.left.isDown || this.keys.a_key.isDown;
        let right = this.keys.right.isDown || this.keys.d.isDown;

        if (left) {
            this.p.setAccelerationX(-1200); // P_ACCEL
            this.ps.facing = -1;
        } else if (right) {
            this.p.setAccelerationX(1200);
            this.ps.facing = 1;
        } else {
            this.p.setAccelerationX(0);
            this.p.setDragX(800); // P_DRAG
        }
        
        // Clamp speed
        if (Math.abs(this.p.body.velocity.x) > 170 && time >= this.ps.dashTime) { // P_SPEED
            this.p.body.velocity.x = Math.sign(this.p.body.velocity.x) * 170;
        }
    }

    handleJump(time) {
        if (this.ps.isHealing || time < this.ps.dashTime) return;

        let jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.k) || Phaser.Input.Keyboard.JustDown(this.keys.space);
        let jumpReleased = Phaser.Input.Keyboard.JustUp(this.keys.jump) || Phaser.Input.Keyboard.JustUp(this.keys.k) || Phaser.Input.Keyboard.JustUp(this.keys.space);

        if (jumpPressed) {
            this.ps.lastJumpPress = time;
        }

        let canCoyote = (time - this.ps.lastGround) < 80; // COYOTE
        let jumpBuffered = (time - this.ps.lastJumpPress) < 100; // JUMP_BUF

        if (jumpBuffered) {
            if (this.ps.wallDir !== 0 && !this.p.body.blocked.down) {
                // Wall jump
                this.p.setVelocity(this.ps.wallDir * -170, -420 * 0.9); // P_JUMP * 0.9
                this.ps.jumps = 1;
                this.ps.lastJumpPress = 0;
            } else if (canCoyote || this.p.body.blocked.down) {
                // First jump
                this.p.setVelocityY(-420); // P_JUMP
                this.ps.jumps = 1;
                this.ps.lastJumpPress = 0;
                this.ps.lastGround = 0;
            } else if (this.ps.jumps > 0 && this.ps.jumps < this.ps.maxJumps) {
                // Double jump
                this.p.setVelocityY(-360); // P_DJUMP
                this.ps.jumps = 2;
                this.ps.lastJumpPress = 0;
            }
        }

        // Variable jump
        if (jumpReleased && this.p.body.velocity.y < 0) {
            this.p.body.velocity.y *= 0.5;
        }
    }

    handleAttack(time) {
        let atkPressed = Phaser.Input.Keyboard.JustDown(this.keys.attack) || Phaser.Input.Keyboard.JustDown(this.keys.j);
        
        // Hide slash fx when attack ends
        if (time >= this.ps.atkTime) {
            this.atkBox.body.enable = false;
            this.slashFx.visible = false;
        }

        if (!atkPressed || time < this.ps.atkTime || time < this.ps.dashTime || this.ps.isHealing) return;

        this.ps.atkTime = time + 250; // ATK_DUR

        let up = this.keys.up.isDown || this.keys.w.isDown;
        let down = this.keys.down.isDown || this.keys.s.isDown;

        if (up) {
            this.ps.atkDir = 'up';
            this.atkBox.setPosition(this.p.x, this.p.y - 44);
            this.slashFx.setPosition(this.p.x, this.p.y - 44);
            this.slashFx.setAngle(-90);
        } else if (down && !this.p.body.blocked.down) {
            this.ps.atkDir = 'down';
            this.atkBox.setPosition(this.p.x, this.p.y + 44);
            this.slashFx.setPosition(this.p.x, this.p.y + 44);
            this.slashFx.setAngle(90);
        } else {
            this.ps.atkDir = this.ps.facing > 0 ? 'right' : 'left';
            this.atkBox.setPosition(this.p.x + (this.ps.facing * 44), this.p.y);
            this.slashFx.setPosition(this.p.x + (this.ps.facing * 44), this.p.y);
            this.slashFx.setAngle(this.ps.facing > 0 ? 0 : 180);
        }

        this.atkBox.body.enable = true;
        this.slashFx.visible = true;
        this.cameras.main.shake(60, 0.003);
    }

    handleDash(time) {
        let dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.dash) || Phaser.Input.Keyboard.JustDown(this.keys.l);

        // Restore gravity after dash
        if (time >= this.ps.dashTime) {
            this.p.body.setAllowGravity(true);
        }

        if (!dashPressed || time < this.ps.dashCD || time < this.ps.dashTime || this.ps.isHealing) return;

        this.ps.dashTime = time + 170; // P_DASH_DUR
        this.ps.dashCD = time + 600; // P_DASH_CD
        this.ps.dashDirX = this.ps.facing * 380; // P_DASH_SPD
        this.ps.dashDirY = 0;

        this.p.setVelocity(this.ps.dashDirX, this.ps.dashDirY);
        this.ps.invTime = Math.max(this.ps.invTime, this.ps.dashTime);
        this.p.body.setAllowGravity(false);

        // Ghosts
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 50, () => {
                let ghost = this.add.sprite(this.p.x, this.p.y, 'player');
                ghost.setTint(0xffffff);
                ghost.setFlipX(this.p.flipX);
                this.tweens.add({
                    targets: ghost,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => ghost.destroy()
                });
            });
        }
    }

    handleHeal(time) {
        let healHeld = this.keys.heal.isDown || this.keys.a_key.isDown;
        let isHealIntent = ((this.keys.down.isDown || this.keys.s.isDown) && healHeld) || healHeld;
        
        let canHeal = isHealIntent && this.p.body.blocked.down && this.ps.soul >= 33 && this.ps.hp < 5 && time >= this.ps.atkTime && time >= this.ps.dashTime;

        if (canHeal && !this.ps.isHealing) {
            this.ps.isHealing = true;
            this.ps.healTime = time + 800; // HEAL_DUR
            this.p.setVelocity(0, 0);
        }

        if (this.ps.isHealing) {
            this.p.setVelocity(0, 0);
            
            // Visual flash
            if (time % 200 < 100) this.p.setTint(0xffffff);
            else this.p.clearTint();

            if (!isHealIntent) {
                this.ps.isHealing = false;
                this.p.clearTint();
            } else if (time >= this.ps.healTime) {
                this.ps.hp += 1;
                this.ps.soul -= 33; // HEAL_COST
                this.ps.isHealing = false;
                this.p.clearTint();
                // Particles
                for(let i=0; i<10; i++) {
                    let p = this.add.rectangle(this.p.x, this.p.y, 4, 4, 0xffffff);
                    this.physics.add.existing(p);
                    p.body.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-100, -20));
                    this.tweens.add({ targets: p, alpha: 0, duration: 500, onComplete: () => p.destroy() });
                }
            }
        }
    }

    hitSpike(player, spike) {
        let knockX = player.x < spike.x ? -250 : 250; // KB
        let knockY = -250;
        this.playerTakeDamage(knockX, knockY);
    }

    hitEnemy(player, enemy) {
        if (this.time.now < this.ps.invTime || this.time.now < this.ps.dashTime) return;
        let knockX = player.x < enemy.x ? -250 : 250;
        let knockY = -250;
        this.playerTakeDamage(knockX, knockY);
    }

    playerTakeDamage(knockX, knockY) {
        if (this.time.now < this.ps.invTime || this.ps.dead) return;
        this.ps.hp -= 1;
        this.ps.invTime = this.time.now + 1200; // INV_DUR
        this.p.setVelocity(knockX, knockY);
        this.cameras.main.shake(200, 0.01);
        
        // Flash red
        this.p.setTint(0xff0000);
        this.time.delayedCall(150, () => this.p.clearTint());

        // Cancel healing
        this.ps.isHealing = false;

        // Hit particles
        for(let i=0; i<8; i++) {
            let p = this.add.rectangle(this.p.x, this.p.y, 4, 4, 0xff0000);
            this.physics.add.existing(p);
            p.body.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
            this.tweens.add({ targets: p, alpha: 0, duration: 400, onComplete: () => p.destroy() });
        }

        if (this.ps.hp <= 0) {
            this.playerDie();
        }
    }

    playerDie() {
        this.ps.dead = true;
        this.p.alpha = 0.3;
        this.cameras.main.fadeOut(500);
        
        this.time.delayedCall(1500, () => {
            this.p.setPosition(this.ps.spawnX, this.ps.spawnY);
            this.ps.hp = 5; // P_MAX_HP
            this.ps.soul = 0;
            this.ps.dead = false;
            this.p.alpha = 1;
            this.p.setVelocity(0, 0);
            this.cameras.main.fadeIn(500);
        });
    }

    checkAttackCollisions(time) {
        if (time < this.ps.atkTime && this.atkBox.body.enable) {
            this.enemies.getChildren().forEach(enemy => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.atkBox.getBounds(), enemy.getBounds())) {
                    if (enemy.getData('invTime') && time < enemy.getData('invTime')) return;
                    
                    this.damageEnemy(enemy, 1);
                    this.ps.soul = Math.min(99, this.ps.soul + 11); // SOUL_MAX, SOUL_HIT
                    
                    // Hitstop (simulated by setting a hitstop time which would be checked in update, but here we just pause physics briefly)
                    this.physics.world.isPaused = true;
                    this.time.delayedCall(40, () => { this.physics.world.isPaused = false; });

                    if (this.ps.atkDir === 'down') {
                        this.p.setVelocityY(-350); // POGO_VEL
                        this.ps.jumps = 1; // refresh double jump
                    }

                    // Knockback enemy
                    let knockX = enemy.x > this.p.x ? 150 : -150;
                    if (enemy.body) enemy.body.setVelocityX(knockX);

                    this.cameras.main.shake(50, 0.005);
                    
                    // Particles
                    for(let i=0; i<5; i++) {
                        let p = this.add.rectangle(enemy.x, enemy.y, 4, 4, 0xffffff);
                        this.physics.add.existing(p);
                        p.body.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
                        this.tweens.add({ targets: p, alpha: 0, duration: 300, onComplete: () => p.destroy() });
                    }
                }
            });
        }
    }

    damageEnemy(enemy, dmg) {
        let hp = enemy.getData('hp') - dmg;
        enemy.setData('hp', hp);
        enemy.setData('invTime', this.time.now + 300);
        
        enemy.setTint(0xffffff);
        this.time.delayedCall(100, () => { if (enemy.active) enemy.clearTint(); });

        if (hp <= 0) {
            this.tweens.add({
                targets: enemy,
                scaleX: 0,
                scaleY: 0,
                duration: 200,
                onComplete: () => {
                    // Death particles
                    for(let i=0; i<10; i++) {
                        let p = this.add.rectangle(enemy.x, enemy.y, 6, 6, 0x000000);
                        this.physics.add.existing(p);
                        p.body.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                        this.tweens.add({ targets: p, alpha: 0, duration: 500, onComplete: () => p.destroy() });
                    }
                    enemy.destroy();
                }
            });
        }
    }
