// ==UserScript==
// @name         Trello Search Filters
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Trello filters
// @author       You
// @match        https://trello.com/search*
// @grant        none
// ==/UserScript==

/** Filter field styles */
const style = document.createElement(`style`);
style.innerText = `
    .filter_dropdown {
        display: inline-flex;
        align-items: center;
        margin-left: 1em;
    }

    .filter_dropdown select {
        margin-left: 0.5em;
        width: 10em;
    }
`;
document.getElementsByTagName(`head`)[0].appendChild(style);

/**
 * createDropdown
 *
 * Create a filter dropdown
 *
 * @param {String} label_text - The label to show before the dropdown
 * @param {Array} values - a list of values to use for the options
 * @param {Function} handler - event handler for the change event
 * @param {String} css_class - additional class to use for the dropdown
 *
 */
function createDropdown(label_text, values, handler, css_class) {
    const dropdown = document.createElement(`select`);

    // Blank option to show everything
    const blank_option = document.createElement(`option`);
    blank_option.value = ``;
    blank_option.appendChild(document.createTextNode(`--`));
    dropdown.appendChild(blank_option);

    values.forEach((value) => {
        const option = document.createElement(`option`);
        option.value = value;
        option.appendChild(document.createTextNode(value));
        dropdown.appendChild(option);
    });

    dropdown.addEventListener(`change`, handler);

    const label = document.createElement(`label`);
    label.appendChild(document.createTextNode(label_text));
    label.appendChild(dropdown);
    label.classList.add(`filter_dropdown`);

    const results_header = document.querySelector(`.search-results-section-header.u-clearfix h4`);
    results_header.parentNode.appendChild(label);
}

/**
 * labelFilter
 * @param {Object} event - The change event from the dropdown
 */
function labelFilter(event) {
    const selected = event.target.value;
    const cards = document.querySelectorAll(`.search-result-card`);

    cards.forEach((card) => {
        if (selected === ``) {
            card.style.display = `block`;
        } else {
            const card_labels = Array.from(card.querySelectorAll(`.card-label`));
            const included_labels = card_labels.map(label => selected.textContent);

            if ( included_labels.indexOf(selected) === -1 ) {
                card.style.display = `none`;
            } else {
                card.style.display = `block`;
            }
        }
    });
}

/**
 * labelFilterDropdown
 *
 * Build the labelFilter dropdown
 */
function labelFilterDropdown() {
    const labels = Array.from(document.querySelectorAll(`.label-text`));
    const label_values = [...new Set(labels.map(label => label.textContent))];
    const css_class = `label_filter`;
    createDropdown(`Label Filter: `, label_values, labelFilter, css_class);
}

/**
 * listFilter
 *
 * @param {Object} event - The change event object from the list filter
 */
function listFilter(event) {
    const selected = event.target.value;
    const cards = document.querySelectorAll(`.search-result-card`);

    cards.forEach((card) => {
        if (selected === ``) {
            card.style.display = `block`;
        } else {
            const card_list = card.querySelector(`.u-bottom.quiet strong`).textContent;
            if (selected !== card_list) {
                card.style.display = `none`;
            } else {
                card.style.display = `block`;
            }
        }
    });
}

/**
 * listFilterDropdown
 *
 * Build the list filter dropdown
 */
function listFilterDropdown() {
    const locations = Array.from(document.querySelectorAll(`.u-bottom.quiet`));
    const list_values = [...new Set(locations.map(location => location.querySelector(`strong`).textContent))];
    const css_class = `list_filter`;
    createDropdown(`List Filter: `, list_values, listFilter, css_class);
}

/**
 * boardFilter
 *
 * @param {Object} event - The change event object from the board filter
 */
function boardFilter(event) {
    const selected = event.target.value;
    const cards = document.querySelectorAll(`.search-result-card`);

    cards.forEach((card) => {
        if (selected === ``) {
            card.style.display = `block`;
        } else {
            const card_board = card.querySelector(`.u-bottom.quiet strong:nth-of-type(2)`).textContent;
            if (selected !== card_board) {
                card.style.display = `none`;
            } else {
                card.style.display = `block`;
            }
        }
    });
}

/**
 * boardFilterDropdown
 *
 * Build the list filter dropdown
 */
function boardFilterDropdown() {
    const locations = Array.from(document.querySelectorAll(`.u-bottom.quiet`));
    const board_values = [...new Set(locations.map(location => location.querySelector(`strong:nth-of-type(2)`).textContent))];
    const css_class = `board_filter`
    createDropdown(`Board Filter: `, board_values, boardFilter, css_class);
}

/**
 * addFilters
 *
 * Add filter dropdowns
 */
let timeout;
function addFilters() {
    if (timeout) return;

    timeout = setTimeout(() => {
        // Remove the old dropdowns
        const results_header = document.querySelector(`.search-results-section-header.u-clearfix h4`);
        const dropdowns = results_header.parentNode.querySelectorAll(`.filter_dropdown`);
        dropdowns.forEach(dropdown => dropdown.remove());

        labelFilterDropdown();
        listFilterDropdown();
        boardFilterDropdown();

        timeout = undefined;
    }, 1000);
}

window.addEventListener(`load`, () => {
    const observer_config = {
        childList: true,
        subtree: true,
    };

    const resultsChangeHandler = function(mutations, observer) {
        mutations.forEach((mutation) => {
            //addFilters();
            if (mutation.addedNodes.length > 0) {
                const new_cards = Array.from(mutation.addedNodes).some(node => node.classList.contains(`list-card-details`));
                if (new_cards) {
                    //addFilters();
                    console.log(`got new cards!`);
                }
            }
        });
    };

    const observer = new MutationObserver(resultsChangeHandler);
    observer.observe(document.querySelector(`.search-results-view`), observer_config);
});