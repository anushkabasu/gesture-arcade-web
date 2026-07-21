let shooterOn = false

function startShooter() {
    shooterOn = true
    const c = document.getElementById("canvas")
    const ctx = c.getContext("2d")

    let W = window.innerWidth
    let H = window.innerHeight

    let sx = W / 2
    let sy = H - 100
    let bullets = []
    let enemies = []
    let particles = []
    let score = 0
    let lives = 3
    let wave = 1
    let pinchWas = false
    let shootCooldown = 0
    let spawnTimer = 999
    let stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.4 + 0.1
    }))

    function spawnEnemy() {
        const types = [
            { r: 18, color: "#e63c3c", hp: 1, spd: 4.0 + wave * 0.4, pts: 10 },
            { r: 24, color: "#ff8c00", hp: 2, spd: 3.0 + wave * 0.3, pts: 20 },
            { r: 30, color: "#a03ce6", hp: 3, spd: 2.0 + wave * 0.2, pts: 40 }
        ]
        const t = types[Math.min(Math.floor(Math.random() * (1 + wave / 3)), 2)]
        enemies.push({
            x: t.r + Math.random() * (W - t.r * 2),
            y: -t.r,
            vx: (Math.random() - 0.5) * 2,
            vy: t.spd,
            r: t.r,
            color: t.color,
            hp: t.hp,
            maxHp: t.hp,
            pts: t.pts,
            angle: 0
        })
    }

    function explode(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2
            const spd = 2 + Math.random() * 5
            particles.push({
                x, y,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                color,
                life: 1
            })
        }
    }

    function draw() {
        if (!shooterOn) return
        c.width = window.innerWidth
        c.height = window.innerHeight
        W = c.width
        H = c.height

        ctx.fillStyle = "#05050f"
        ctx.fillRect(0, 0, W, H)

        stars.forEach(s => {
            s.y += s.speed
            if (s.y > H) { s.y = 0; s.x = Math.random() * W }
            ctx.fillStyle = "#334"
            ctx.beginPath()
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
            ctx.fill()
        })

        if (hand.detected) {
            const tx = hand.palmX * W
            sx += (tx - sx) * 0.2
            sx = Math.max(20, Math.min(W - 20, sx))
            sy = H - 100

            if (hand.pinching && !pinchWas && shootCooldown <= 0) {
                bullets.push({ x: sx - 10, y: sy - 20, vy: -14 })
                bullets.push({ x: sx + 10, y: sy - 20, vy: -14 })
                shootCooldown = 12
            }
            pinchWas = hand.pinching
        }

        shootCooldown--

        spawnTimer++
        if (spawnTimer > Math.max(8, 40 - wave * 3)) {
            spawnEnemy()
            if (Math.random() > 0.5) spawnEnemy()
            spawnTimer = 0
        }

        bullets = bullets.filter(b => {
            b.y += b.vy
            if (b.y < -10) return false

            ctx.fillStyle = "#00d2d2"
            ctx.shadowColor = "#00d2d2"
            ctx.shadowBlur = 6
            ctx.fillRect(b.x - 2, b.y - 8, 4, 16)
            ctx.shadowBlur = 0

            let hit = false
            enemies = enemies.filter(e => {
                if (hit) return true
                const d = Math.sqrt((b.x - e.x)**2 + (b.y - e.y)**2)
                if (d < e.r + 4) {
                    e.hp--
                    hit = true
                    if (e.hp <= 0) {
                        score += e.pts
                        explode(e.x, e.y, e.color)
                        return false
                    }
                }
                return true
            })
            return !hit
        })

        enemies = enemies.filter(e => {
            e.x += e.vx
            e.y += e.vy
            e.angle += 0.03
            if (e.x < e.r || e.x > W - e.r) e.vx *= -1
            if (e.y > H + e.r) {
                lives--
                return false
            }

            const d = Math.sqrt((e.x - sx)**2 + (e.y - sy)**2)
            if (d < e.r + 22) {
                lives--
                explode(sx, sy, "#00d2d2")
                explode(e.x, e.y, e.color)
                if (lives <= 0) {
                    shooterOn = false
                }
                return false
            }

            const sides = e.maxHp === 1 ? 4 : e.maxHp === 2 ? 5 : 6
            ctx.save()
            ctx.translate(e.x, e.y)
            ctx.rotate(e.angle)
            ctx.fillStyle = e.color
            ctx.beginPath()
            for (let i = 0; i < sides; i++) {
                const a = (i / sides) * Math.PI * 2
                i === 0 ? ctx.moveTo(Math.cos(a) * e.r, Math.sin(a) * e.r)
                        : ctx.lineTo(Math.cos(a) * e.r, Math.sin(a) * e.r)
            }
            ctx.closePath()
            ctx.fill()
            if (e.hp < e.maxHp) {
                ctx.fillStyle = "#333"
                ctx.fillRect(-e.r, e.r + 4, e.r * 2, 4)
                ctx.fillStyle = "#32e664"
                ctx.fillRect(-e.r, e.r + 4, (e.hp / e.maxHp) * e.r * 2, 4)
            }
            ctx.restore()
            return true
        })

        particles = particles.filter(p => {
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.15
            p.life -= 0.04
            ctx.globalAlpha = p.life
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
            return p.life > 0
        })

        ctx.save()
        ctx.translate(sx, sy)
        ctx.fillStyle = "#00d2d2"
        ctx.beginPath()
        ctx.moveTo(0, -22)
        ctx.lineTo(18, 18)
        ctx.lineTo(0, 10)
        ctx.lineTo(-18, 18)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = "#005588"
        ctx.beginPath()
        ctx.arc(0, 18, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.fillStyle = "#fff"
        ctx.font = "bold 28px Courier New"
        ctx.fillText(score, 24, 44)
        ctx.fillStyle = "#e63c3c"
        ctx.font = "18px Courier New"
        ctx.fillText("♥".repeat(lives) + "♡".repeat(3 - lives), 24, 72)
        ctx.fillStyle = "#00d2d2"
        ctx.font = "13px Courier New"
        ctx.fillText("WAVE " + wave, W - 90, 44)

        if (enemies.length === 0 && spawnTimer > 60) {
            wave++
            spawnTimer = 0
        }

        if (lives <= 0) {
            ctx.fillStyle = "rgba(0,0,0,0.75)"
            ctx.fillRect(0, 0, W, H)
            ctx.fillStyle = "#e63c3c"
            ctx.font = "bold 80px Courier New"
            ctx.textAlign = "center"
            ctx.fillText("GAME OVER", W / 2, H / 2 - 20)
            ctx.fillStyle = "#fff"
            ctx.font = "24px Courier New"
            ctx.fillText("SCORE: " + score, W / 2, H / 2 + 40)
            ctx.fillStyle = "#444"
            ctx.font = "14px Courier New"
            ctx.fillText("[ ESC ] TO RETURN", W / 2, H / 2 + 80)
            ctx.textAlign = "left"
            shooterOn = false
            return
        }

        requestAnimationFrame(draw)
    }

    draw()
}

function stopShooter() {
    shooterOn = false
}
