const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary {
    static width = 40
    static height = 40
    constructor({ position, image }) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw() {
        context.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player {
    constructor({ position, velocity, image }) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.rotation = 0
        this.powered = false;
        this.image = image
    }

    draw() {
        context.save()
        context.translate(this.position.x, this.position.y)
        context.rotate(this.rotation)
        context.translate(-this.position.x, -this.position.y)
        context.drawImage(this.powered ? createImage('./img/chadpowered.png') : this.image, this.position.x - 30, this.position.y - 40)
        context.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Enemy {
    static speed = 2
    constructor({ position, velocity, image, invincible }) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
        this.image = image
        this.invincible = invincible
    }

    draw() {
        context.drawImage(this.scared && !this.invincible ? createImage('./img/witchscared.png') : this.image, this.position.x - 30, this.position.y - 40)
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Pellet {
    constructor({ position }) {
        this.position = position
        this.radius = 3
    }

    draw() {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = 'orange'
        context.fill()
        context.closePath()
    }
}

class PowerUp {
    constructor({ position, image }) {
        this.position = position
        this.radius = 8
        this.image = image
    }

    draw() {
        context.drawImage(this.image, this.position.x - 20, this.position.y - 20)
    }
}

const pellets = []
const boundaries = []
const powerUps = []
const enemies = [
    new Enemy({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Enemy.speed,
            y: 0
        },
        image: createImage('./img/witch.png'),
        invincible: false

    }),
    new Enemy({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3 + Boundary.height / 2
        },
        velocity: {
            x: Enemy.speed,
            y: 0
        },
        image: createImage('./img/witch.png'),
        invincible: false
    }),
    new Enemy({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3 + Boundary.height / 2
        },
        velocity: {
            x: Enemy.speed,
            y: 0
        },
        image: createImage('./img/witch.png'),
        invincible: false
    })
]
const player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    },
    image: createImage('./img/chad.png')
})
const keys = {
    up: {
        pressed: false
    },
    left: {
        pressed: false
    },
    down: {
        pressed: false
    },
    right: {
        pressed: false
    }
}

let lastKey = ''
let score = 0

const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', 'p', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', 'p', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', 'p', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', 'p', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

//const symbols = ['-', '|','1','2','3','4','b','[',']','_','^','+','5','6','7','8','.','p'];

map.forEach((row, i) => {
    row.forEach((symbol, j) => {

        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/pipeHorizontal.png')
                    })
                )
                break
            case '|':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/pipeVertical.png')
                    })
                )
                break
            case '1':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/pipeCorner1.png')
                    })
                )
                break
            case '2':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/pipeCorner2.png')
                    })
                )
                break
            case '3':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/pipeCorner3.png')
                    })
                )
                break
            case '4':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/pipeCorner4.png')
                    })
                )
                break
            case 'b':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/block.png')
                    })
                )
                break
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capLeft.png')
                    })
                )
                break
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capRight.png')
                    })
                )
                break
            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capBottom.png')
                    })
                )
                break
            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capTop.png')
                    })
                )
                break
            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/pipeCross.png')
                    })
                )
                break
            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./img/pipeConnectorTop.png')
                    })
                )
                break
            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./img/pipeConnectorRight.png')
                    })
                )
                break
            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./img/pipeConnectorBottom.png')
                    })
                )
                break
            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/pipeConnectorLeft.png')
                    })
                )
                break
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break

            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        },
                        image: createImage('./img/scroll.png')
                    })
                )
                break
        }
    })
})

function circleCollidesWithRectangle({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <=
        rectangle.position.y + rectangle.height + padding &&
        circle.position.x + circle.radius + circle.velocity.x >=
        rectangle.position.x - padding &&
        circle.position.y + circle.radius + circle.velocity.y >=
        rectangle.position.y - padding &&
        circle.position.x - circle.radius + circle.velocity.x <=
        rectangle.position.x + rectangle.width + padding
    )
}

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    context.clearRect(0, 0, canvas.width, canvas.height)

    if (keys.up.pressed && (lastKey === 'w' || lastKey === 'ArrowUp')) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: 0,
                            y: -2
                        }
                    },
                    rectangle: boundary
                })
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -2
            }
        }
    } else if (keys.left.pressed && (lastKey === 'a' || lastKey === 'ArrowLeft')) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: -2,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = -2
            }
        }
    } else if (keys.down.pressed && (lastKey === 's' || lastKey === 'ArrowDown')) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: 0,
                            y: 2
                        }
                    },
                    rectangle: boundary
                })
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = 2
            }
        }
    } else if (keys.right.pressed && (lastKey === 'd' || lastKey === 'ArrowRight')) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: 2,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = 2
            }
        }
    }

    // detect collision between enemy and player
    for (let i = enemies.length - 1; 0 <= i; i--) {
        const enemy = enemies[i]
        // ghost touches player
        if (
            Math.hypot(
                enemy.position.x - player.position.x,
                enemy.position.y - player.position.y
            ) <
            enemy.radius + player.radius
        ) {
            if (enemy.scared && !enemy.invincible) {
                enemies.splice(i, 1)
                if (enemies.length == 0) {
                    enemies.push(
                        new Enemy({
                            position: {
                                x: Boundary.width * 6 + Boundary.width / 2,
                                y: Boundary.height + Boundary.height / 2
                            },
                            velocity: {
                                x: Enemy.speed,
                                y: 0
                            },
                            image: createImage('./img/boss.png'),
                            invincible: true

                        }))
                }
            } else {
                cancelAnimationFrame(animationId)
                console.log('you lose')
				document.getElementById('myAudio').pause()
            }
        }
    }

    // win condition goes here
    if (pellets.length === 0) {
        console.log('you win')
        cancelAnimationFrame(animationId)
    }

    // power ups go
    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i]
        powerUp.draw()

        // player collides with powerup
        if (
            Math.hypot(
                powerUp.position.x - player.position.x,
                powerUp.position.y - player.position.y
            ) <
            powerUp.radius + player.radius
        ) {
            powerUps.splice(i, 1)

            // make enemy scared
            enemies.forEach((enemy) => {
                enemy.scared = true
                player.powered = true
                setTimeout(() => {
                    enemy.scared = false
                    player.powered = false
                }, 5000)
            })
        }
    }

    // touch pellets here
    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()

        if (
            Math.hypot(
                pellet.position.x - player.position.x,
                pellet.position.y - player.position.y
            ) <
            pellet.radius + player.radius
        ) {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
        }
    }

    boundaries.forEach((boundary) => {
        boundary.draw()

        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
        ) {
            player.velocity.x = 0
            player.velocity.y = 0
        }
    })
    player.update()

    enemies.forEach((enemy) => {
        enemy.update()

        const collisions = []
        boundaries.forEach((boundary) => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...enemy,
                        velocity: {
                            x: enemy.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('right')
            }

            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...enemy,
                        velocity: {
                            x: -enemy.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('left')
            }

            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...enemy,
                        velocity: {
                            x: 0,
                            y: -enemy.speed
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('up')
            }

            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...enemy,
                        velocity: {
                            x: 0,
                            y: enemy.speed
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('down')
            }
        })

        if (collisions.length > enemy.prevCollisions.length)
            enemy.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(enemy.prevCollisions)) {

            if (enemy.velocity.x > 0) enemy.prevCollisions.push('right')
            else if (enemy.velocity.x < 0) enemy.prevCollisions.push('left')
            else if (enemy.velocity.y < 0) enemy.prevCollisions.push('up')
            else if (enemy.velocity.y > 0) enemy.prevCollisions.push('down')

            const pathways = enemy.prevCollisions.filter((collision) => {
                return !collisions.includes(collision)
            })


            const direction = pathways[Math.floor(Math.random() * pathways.length)]



            switch (direction) {
                case 'down':
                    enemy.velocity.y = enemy.speed
                    enemy.velocity.x = 0
                    break

                case 'up':
                    enemy.velocity.y = -enemy.speed
                    enemy.velocity.x = 0
                    break

                case 'right':
                    enemy.velocity.y = 0
                    enemy.velocity.x = enemy.speed
                    break

                case 'left':
                    enemy.velocity.y = 0
                    enemy.velocity.x = -enemy.speed
                    break
            }

            enemy.prevCollisions = []
        }

    })

    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
} // end of animate()
document.getElementById('myAudio').pause();
document.getElementById("pad").style.display = "none";
document.getElementById("scoreDis").style.display = "none";
document.getElementById("muted").style.display = "none";
document.getElementById("play").addEventListener("click", function () {
	document.getElementById("pad").style.display = "flex";
	
    document.getElementById("play").style.display = "none";
	document.getElementById("center").style.display = "none";
    document.getElementById("scoreDis").style.display = "block";
    document.getElementById('myAudio').play();
	document.getElementById("muted").style.display = "flex";
    animate();
});

document.getElementById("muted").addEventListener("click", function(){
	document.getElementById('myAudio').muted = true;
});



addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
        case 'ArrowUp':
            keys.up.pressed = true
            break
        case 'a':
        case 'ArrowLeft':
            keys.left.pressed = true
            break
        case 's':
        case 'ArrowDown':
            keys.down.pressed = true
            break
        case 'd':
        case 'ArrowRight':
            keys.right.pressed = true
            break
    }
    lastKey = key

})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
        case 'ArrowUp':
            keys.up.pressed = false
            break
        case 'a':
        case 'ArrowLeft':
            keys.left.pressed = false
            break
        case 's':
        case 'ArrowDown':
            keys.down.pressed = false
            break
        case 'd':
        case 'ArrowRight':
            keys.right.pressed = false
            break
    }
})

