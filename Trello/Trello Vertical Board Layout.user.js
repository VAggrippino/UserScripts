// ==UserScript==
// @name         Trello Vertical Board Layout
// @namespace    https://aggrippino.com
// @version      0.1
// @description  Display Trello boards in a structured vertical layout
// @author       Vince Aggrippino
// @match        https://trello.com/b/*
// @grant        GM_addStyle
// ==/UserScript==

function setVerticalStyle() {
    const css = `
        #board {
            --list-margin: 4px;
            --min-list-width: 16rem;
            --min-list-height: 50vh;
            --max-list-height: 60vh;

            display: flex;
            flex-wrap: wrap;
            overflow: auto;
            margin-bottom: 0;
        }

        #trello-root .board-wrapper .board-canvas .u-fancy-scrollbar::-webkit-scrollbar,
        #trello-root .board-wrapper .board-canvas .u-fancy-scrollbar::-webkit-scrollbar-track,
        #trello-root .board-wrapper .board-canvas .u-fancy-scrollbar::-webkit-scrollbar-track-piece {
            background-color: silver;
        }

        #trello-root .board-wrapper .board-canvas .u-fancy-scrollbar::-webkit-scrollbar-thumb {
            background-color: gray;
        }

        .list-wrapper {
            margin-top: 0;
            margin-right: var(--list-margin);
            margin-bottom: var(--list-margin);
            margin-left: var(--list-margin);
            height: auto;
            max-height: var(--max-list-height);
            flex: 1 0 var(--min-list-width);
        }

        .list-wrapper.js-add-list {
            align-self: flex-start;
        }

        .list-wrapper .list .list-card {
            max-width: none;
        }
    `;

    const style = GM_addStyle(css);
}

/**
 * Add blank .list-wrapper elements to allow the lists in
 * the last row to wrap properly. */
let blank_lists_added = false;
function addBlankLists() {
    if (blank_lists_added) return;

    const board = document.getElementById(`board`);
    for (let i = 1; i <= 10; i++) {
        const blank = document.createElement(`div`);
        blank.classList.add(`list-wrapper`);
        board.appendChild(blank);
    }
    blank_lists_added = true;
}

window.addEventListener(`load`, () => {
    setVerticalStyle();

    // Add some blank lists after the page stops changing
    // for at least a second.
    let timeout_id;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout_id);
        timeout_id = setTimeout(addBlankLists, 1000);
    });
    observer.observe(document.body, {childList: true, subtree: true});
});