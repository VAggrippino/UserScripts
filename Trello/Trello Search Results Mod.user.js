// ==UserScript==
// @name         Trello Search Results Mod
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Minor modifications to the Trello search results page
// @author       You
// @match        https://trello.com/search*
// @grant        none
// ==/UserScript==

/**
 * CSS Tweaks
 * A style block is inserted into the stylesheet so that it
 * will take effect before the elements are actually on the
 * page.
 */
const style = document.createElement(`style`);
style.innerText = `
    /* Make the results the same width as the browser window. */
    .search-results-view {
        max-width: 100vw;
    }

    /* Make the header elements smaller so more fits on the screen. */
    .body-search-page .header-search {
        margin: 0 auto;
    }

    .body-search-page .header-search input.header-search-input {
        margin: 0 auto;
        height: auto;
    }

    .body-search-page .header-search .header-search-icon {
        top: 0;
    }

    .search-results-section-header {
        margin-bottom: 0;
    }
`;

document.getElementsByTagName('head')[0].appendChild(style);

/**
 * titleShowSearch
 *
 * Show search terms in the page title.
 *
 * This is done with an interval because Trello doesn't
 * reload the page when changing search terms.
 */
function titleShowSearch() {
    const covers = document.querySelectorAll('.list-card-cover');
    covers.forEach(cover => { cover.style.maxHeight = 0 });

    // Change the page title to show the search terms
    const updateTitle = () => {
        const search_terms = document.querySelector('.header-search-input').value;
        document.title = `${search_terms}`;
    };

    // 10 seconds should be fine. You'd only need to look at
    // the title after you've switched to another tab anyway.
    window.setInterval(updateTitle, 10000);
}

/**
 * cardCount
 *
 * Prefix the results header with the number of cards returned.
 */
function cardCount() {
    const results_header = document.querySelector(`.search-results-section-header.u-clearfix h4`);
    const cards = document.querySelectorAll(`.search-result-card`);
    const card_count = document.createElement(`span`);
    card_count.classList.add(`card_count`);
    card_count.appendChild(document.createTextNode(cards.length));
    results_header.innerHTML = `${card_count.outerHTML} Cards`;
}

/**
 * callTweaks
 *
 * Call the Trello tweak functions.
 */
let timeout;
function callTweaks() {
    if (timeout) return;

    timeout = setTimeout(() => {
        titleShowSearch();
        cardCount();

        timeout = undefined;
    }, 1000);
}



window.addEventListener('load', () => {
    callTweaks();
    const observer_config = {
        childList: true,
        subtree: true,
    };

    const resultsChangeHandler = function(mutations, observer) {
        mutations.forEach((mutation) => {
            callTweaks();
        });
    };

    const observer = new MutationObserver(resultsChangeHandler);
    observer.observe(document.querySelector(`.search-results-view`), observer_config);
});