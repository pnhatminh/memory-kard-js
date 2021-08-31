let size = 4
let gameStarted = false
let first, second
let move = 0
let lockboard = true
let numberOfPairsLeft = 0
let totalTime = 0
let timeInterval

const configGame = document.createElement("div")
configGame.innerHTML = `
    <select id="size-select" onchange="onSizeSelected(this.value)">
        <option value="2">4 x 4</option>
        <option value="8">8 x 8</option>
        <option value="12">12 x 12</option>
    </select>
    <button id="start-button" onclick="onStartButtonClicked()">Start the game</button>
`

function createMemoryCard() {
    const container = document.getElementById("container")
    const section = document.createElement("section")

    const totalMove = document.createElement("span")
    totalMove.setAttribute("id", "totalMove")
    totalMove.innerHTML = `Total move(s): 0`

    section.appendChild(totalMove)
    section.setAttribute("id", "memory-game")
    section.style.maxWidth = `${size * 85}px`

    const timer = document.createElement("span")
    timer.setAttribute("id", "timer")
    section.appendChild(timer)
    timer.style.visibility = "hidden"

    const numberOfBoardPairs = size * size / 2
    numberOfPairsLeft = numberOfBoardPairs

    if (section) {
        let valueMap = new Map()
        for (let i = 1; i <= numberOfBoardPairs; i++) {
            valueMap.set(i, 2)
        }
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let value = this.getRandomInt(1, numberOfBoardPairs)
                while (valueMap.get(value) == 0) {
                    value = this.getRandomInt(1, numberOfBoardPairs)
                }
                const memoryCard = document.createElement("div")
                memoryCard.classList.add("memory-card", "front-face")
                memoryCard.setAttribute("value", value)
                memoryCard.setAttribute("clicked", false)
                memoryCard.innerHTML += value
                memoryCard.onclick = function () {
                    const memoryCardClickedEvent = new CustomEvent("memoryCardClickedEvent", {
                        detail: {
                            memoryCard
                        }
                    })
                    document.dispatchEvent(memoryCardClickedEvent)
                }
                section.appendChild(memoryCard)
                valueMap.set(value, valueMap.get(value) - 1)
            }
        }
    }
    const warning = document.createElement("h3")
    warning.setAttribute("id", "warning")
    warning.innerHTML = "Choose a pair"
    section.appendChild(warning)
    container.appendChild(section)
    const memoryCards = document.getElementsByClassName("memory-card")
    setTimeout(() => {
        for (let item of memoryCards) {
            item.style.animationName = "unflipCard"
            item.style.animationDuration = "1s"
            item.style.backgroundColor = "black"
        }
        lockboard = false
        timer.style.visibility = "visible"
        timeInterval = setInterval(function () {
            totalTime++
            document.getElementById("timer").innerHTML = displayTimer(totalTime)
        }, 1000);
    }, 5000)
}

function onSizeSelected(value) {
    size = parseInt(value)
}

function onStartButtonClicked() {
    document.dispatchEvent(new Event('startGame'))
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function displayTimer(value) {
    let minutes = Math.floor(value / 60)
    let seconds = value - minutes * 60
    return `Total time: ${displayTimerDigit(minutes)}:${displayTimerDigit(seconds)}`
}

function displayTimerDigit(value) {
    return value < 10 ? `0${value}` : `${value}`
}

document.addEventListener('startGame', () => {
    gameStarted = true
    lockboard = true
    move = 0
    totalTime = 0
    const sizeSelection = document.getElementById("size-select")
    const startButton = document.getElementById("start-button")
    const finishingDiv = document.getElementById("finishingDiv")
    sizeSelection.remove()
    startButton.remove()
    if (finishingDiv) finishingDiv.remove()
    this.gameStarted = true
    this.createMemoryCard()
})

document.addEventListener('finishGame', () => {
    clearInterval(timeInterval)
    const container = document.getElementById("container")
    const totalTime = document.getElementById("timer")
    const totalMove = document.getElementById("totalMove")
    const finishingDiv = document.createElement("finishingDiv")
    finishingDiv.setAttribute("id", "finishingDiv")
    const congratulations = document.createElement("h1")
    congratulations.innerHTML = "Congratulations! You've finished the game"
    finishingDiv.appendChild(congratulations)
    finishingDiv.appendChild(totalTime)
    finishingDiv.appendChild(totalMove)
    const section = document.getElementById("memory-game")
    section.remove()
    gameStarted = false
    container.appendChild(finishingDiv)
    container.appendChild(configGame)
})

document.addEventListener('memoryCardClickedEvent', (event) => {
    const memoryCard = event.detail.memoryCard
    if (JSON.parse(memoryCard.getAttribute("currentlyComparing"))) return
    if (lockboard) return
    memoryCard.style.animationName = "flipCard"
    memoryCard.style.animationDuration = "1s"
    memoryCard.style.backgroundColor = "transparent"
    move += 1
    const totalMove = document.getElementById("totalMove")
    totalMove.innerHTML = `Total move(s): ${move}`
    if (!first) {
        memoryCard.setAttribute("currentlyComparing", true)
        first = memoryCard
    }
    else {
        lockboard = true
        const warning = document.getElementById("warning")
        setTimeout(() => {
            second = memoryCard
            first.setAttribute("currentlyComparing", false)
            second.setAttribute("currentlyComparing", false)
            if (first.getAttribute("value") === second.getAttribute("value")) {
                warning.style.color = "green"
                warning.innerHTML = "Matched"
                numberOfPairsLeft--
                first.style.visibility = "hidden"
                second.style.visibility = "hidden"
                first.style.animationName = "disappears"
                first.style.animationDuration = "0.5s"
                second.style.animationName = "disappears"
                second.style.animationDuration = "0.5s"
            } else {
                warning.style.color = "red"
                warning.innerHTML = "Unmatched"
                first.style.animationName = "unflipCard"
                first.style.backgroundColor = "black"
                second.style.animationDuration = "1s"
                second.style.backgroundColor = "black"
            }
            first.style.animationName = "unflipCard"
            second.style.animationDuration = "1s"
            first = null
            second = null
            lockboard = false
            if (numberOfPairsLeft == 0) {
                const finishEvent = new Event("finishGame")
                document.dispatchEvent(finishEvent)
            }
        }, 1500)
        warning.style.color = "black"
        warning.innerHTML = "Choose a pair"
    }
})
