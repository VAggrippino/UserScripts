// ==UserScript==
// @name         Trello Actual Time
// @resource     name TrelloTime
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show actual times instead of relative times.
// @author       You
// @match        https://trello.com/c/*
// @grant        GM_getResourceText
// ==/UserScript==

/**
 * Show the actual time of a comment instead of relative
 * times like "2 hours ago".
 *
 * This creates a new element and uses an interval because
 * Trello automatically updates the text of the existing
 * link as the time changes and also because it does not
 * reload the page when selecting a different card from a board.
 */
function showRealTimes() {
    const time_links = document.querySelectorAll('a.date');
    time_links.forEach((link) => {
        const title = link.getAttribute('title');
        const link_text = link.innerText;
        if (link_text.indexOf('ago') !== -1 || link_text.indexOf('yesterday') !== -1) {
            const actual_time = document.createElement('SPAN');
            actual_time.classList.add('trello_actual_time');
            actual_time.innerText = `: ${title}`;
            if (link.parentNode.querySelector('.trello_actual_time') === null) {
                link.parentNode.appendChild(actual_time);
            }
        }
    });
}

// 2 seconds inserts the element before the card finishes
// loading and doesn't seem to have a negative impact on performance.
window.setInterval(showRealTimes, 2000);