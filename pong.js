let pongOn = false

function startPong() {
    pongOn = true
    const c = document.getElementById("canvas")
    const ctx = c.getContext("2d")

    const PW = 12
    const PH = 100
    const BR = 8
    const SPD = 10
    const AI = 5
    const WIN = 7

    let W = window.innerWidth
    let H = window.innerHeight
    let py = H / 2 - PH / 2
    let ay = H / 2 - PH / 2
    let bx = W / 2
    let by = H / 2
    let vx = SPD
    let vy = SPD * (Math.random() - 0.5)
    let ps = 0
    let as = 0

    function reset() {
        W = window.innerWidth
        H = window.innerHeight
        bx = W / 2
        by = H / 2
        vx = Math.random() > 0.5 ? SPD : -SPD
        vy = SPD * (Math.random() - 0.5)
    }

    function draw() {
        if (!pongOn) return
        c.width = window.innerWidth
        c.height = window.innerHeight
        W = c.width
        H = c.height

        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, W, H)

        ctx.setLineDash([8, 12])
        ctx.strokeStyle = "#1e1e1e"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(W / 2, 0)
        ctx.lineTo(W / 2, H)
        ctx.stroke()
        ctx.setLineDash([])

        if (hand.detected) {
            const ty = hand.palmY * H - PH / 2
            py += (ty - py) * 0.2
        }
        py = Math.max(0, Math.min(H - PH, py))

        const ac = ay + PH / 2
        ay += Math.min(AI, Math.max(-AI, (by - ac) * 0.1))
        ay = Math.max(0, Math.min(H - PH, ay))

        bx += vx
        by += vy

        if (by <= BR || by >= H - BR) vy = -vy

        if (bx - BR <= 30 + PW && by >= py && by <= py + PH && vx < 0) {
            vx = Math.abs(vx) * 1.05
            vy = ((by - (py + PH / 2)) / (PH / 2)) * SPD
        }

        if (bx + BR >= W - 30 - PW && by >= ay && by <= ay + PH && vx > 0) {
            vx = -Math.abs(vx) * 1.05
            vy = ((by - (ay + PH / 2)) / (PH / 2)) * SPD
        }

        vx = Math.max(-18, Math.min(18, vx))
        vy = Math.max(-14, Math.min(14, vy))

        if (bx < 0) { as++; reset() }
        if (bx > W) { ps++; reset() }

        ctx.fillStyle = "#00d2d2"
        ctx.beginPath()
        ctx.roundRect(30, py, PW, PH, 4)
        ctx.fill()

        ctx.fillStyle = "#ff8c00"
        ctx.beginPath()
        ctx.roundRect(W - 30 - PW, ay, PW, PH, 4)
        ctx.fill()

        ctx.fillStyle = "#f0f0f0"
        ctx.beginPath()
        ctx.arc(bx, by, BR, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = "bold 64px Courier New"
        ctx.fillStyle = "#00d2d2"
        ctx.fillText(ps, W / 2 - 110, 80)
        ctx.fillStyle = "#ff8c00"
        ctx.fillText(as, W / 2 + 60, 80)

        if (ps >= WIN || as >= WIN) {
            const msg = ps >= WIN ? "YOU WIN" : "AI WINS"
            const col = ps >= WIN ? "#32e664" : "#e63c3c"
            ctx.fillStyle = "rgba(0,0,0,0.7)"
            ctx.fillRect(0, 0, W, H)
            ctx.fillStyle = col
            ctx.font = "bold 80px Courier New"
            ctx.textAlign = "center"
            ctx.fillText(msg, W / 2, H / 2 - 20)
            ctx.fillStyle = "#444"
            ctx.font = "16px Courier New"
            ctx.fillText("CLICK [ ESC ] TO RETURN", W / 2, H / 2 + 40)
            ctx.textAlign = "left"
            pongOn = false
            return
        }

        requestAnimationFrame(draw)
    }

    draw()
}

function stopPong() {
    pongOn = false
}
