let snakeOn = false

function startSnake() {
    snakeOn = true
    const c = document.getElementById("canvas")
    const ctx = c.getContext("2d")

    const CELL = 28
    let W = window.innerWidth
    let H = window.innerHeight
    let COLS = Math.floor(W / CELL)
    let ROWS = Math.floor(H / CELL)

    let body = []
    let dir = { x: 1, y: 0 }
    let nextDir = { x: 1, y: 0 }
    let food = null
    let score = 0
    let stepTimer = 0
    let stepRate = 5
    let dead = false
    let grow = 0

    function reset() {
        W = window.innerWidth
        H = window.innerHeight
        COLS = Math.floor(W / CELL)
        ROWS = Math.floor(H / CELL)
        const cx = Math.floor(COLS / 2)
        const cy = Math.floor(ROWS / 2)
        body = [{ x: cx, y: cy }, { x: cx-1, y: cy }, { x: cx-2, y: cy }]
        dir = { x: 1, y: 0 }
        nextDir = { x: 1, y: 0 }
        score = 0
        grow = 0
        dead = false
        stepRate = 5
        spawnFood()
    }

    function spawnFood() {
        const taken = new Set(body.map(b => b.x + "," + b.y))
        let fx, fy
        do {
            fx = Math.floor(Math.random() * (COLS - 2)) + 1
            fy = Math.floor(Math.random() * (ROWS - 2)) + 1
        } while (taken.has(fx + "," + fy))
        const colors = ["#e63c3c", "#ff8c00", "#32e664", "#a03ce6", "#e6c83c"]
        const pts = [1, 2, 1, 3, 2]
        const i = Math.floor(Math.random() * colors.length)
        food = { x: fx, y: fy, color: colors[i], pts: pts[i] }
    }

    reset()

    function draw() {
        if (!snakeOn) return
        c.width = window.innerWidth
        c.height = window.innerHeight
        W = c.width
        H = c.height

        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, W, H)

        for (let x = 0; x < W; x += CELL) {
            ctx.strokeStyle = "#111"
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, H)
            ctx.stroke()
        }
        for (let y = 0; y < H; y += CELL) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(W, y)
            ctx.stroke()
        }

        if (hand.detected && body.length > 0) {
            const fx = (1 - hand.indexX) * W
            const fy = hand.indexY * H
            const headX = body[0].x * CELL + CELL / 2
            const headY = body[0].y * CELL + CELL / 2
            const dx = fx - headX
            const dy = fy - headY
            const dist = Math.sqrt(dx*dx + dy*dy)
            if (dist > CELL * 3) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 }
                    if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 }
                } else {
                    if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 }
                    if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 }
                }
            }
        }

        document.addEventListener("keydown", e => {
            if (e.key === "ArrowRight" && dir.x !== -1) nextDir = { x: 1, y: 0 }
            if (e.key === "ArrowLeft" && dir.x !== 1) nextDir = { x: -1, y: 0 }
            if (e.key === "ArrowDown" && dir.y !== -1) nextDir = { x: 0, y: 1 }
            if (e.key === "ArrowUp" && dir.y !== 1) nextDir = { x: 0, y: -1 }
        }, { once: false })

        stepTimer++
        if (stepTimer >= stepRate) {
            stepTimer = 0
            dir = nextDir
            const head = { x: body[0].x + dir.x, y: body[0].y + dir.y }
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
                dead = true
            } else if (body.some(b => b.x === head.x && b.y === head.y)) {
                dead = true
            } else {
                body.unshift(head)
                if (head.x === food.x && head.y === food.y) {
                    score += food.pts
                    grow += 3
                    spawnFood()
                    stepRate = Math.max(4, stepRate - 0.3)
                }
                if (grow > 0) grow--
                else body.pop()
            }
        }

        const pulse = 1 + 0.12 * Math.sin(Date.now() / 150)
        const fr = Math.floor(CELL * 0.38 * pulse)
        ctx.fillStyle = food.color
        ctx.beginPath()
        ctx.arc(food.x * CELL + CELL/2, food.y * CELL + CELL/2, fr, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(food.x * CELL + CELL/2, food.y * CELL + CELL/2, fr * 0.35, 0, Math.PI * 2)
        ctx.fill()

        body.forEach((seg, i) => {
            const t = i / Math.max(body.length - 1, 1)
            const r = Math.floor(40 * (1-t) + 120 * t)
            const g = Math.floor(220 * (1-t) + 255 * t)
            const b = Math.floor(80 * (1-t) + 80 * t)
            ctx.fillStyle = `rgb(${r},${g},${b})`
            const pad = i === 0 ? 2 : 4
            ctx.beginPath()
            ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad*2, CELL - pad*2, 4)
            ctx.fill()
        })

        if (body.length > 0) {
            const head = body[0]
            const ex = head.x * CELL + CELL/2 + dir.y * 5
            const ey = head.y * CELL + CELL/2 - dir.x * 5
            ctx.fillStyle = "#000"
            ctx.beginPath()
            ctx.arc(ex + dir.x * 3, ey + dir.y * 3, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(ex - dir.y * 3, ey + dir.x * 3, 3, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.fillStyle = "#fff"
        ctx.font = "bold 28px Courier New"
        ctx.fillText(score, 24, 44)

        if (dead) {
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
            ctx.fillText("[ ESC ] TO RETURN  ///  [ R ] RESTART", W / 2, H / 2 + 80)
            ctx.textAlign = "left"
            document.addEventListener("keydown", e => {
                if (e.key === "r" || e.key === "R") {
                    reset()
                    snakeOn = true
                    draw()
                }
            }, { once: true })
            snakeOn = false
            return
        }

        requestAnimationFrame(draw)
    }

    draw()
}

function stopSnake() {
    snakeOn = false
}