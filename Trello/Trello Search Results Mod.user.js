// ==UserScript==
// @name         Trello Search Results Mod
// @namespace    http://aggrippino.com
// @version      0.1
// @description  Minor modifications to the Trello search results page
// @author       Vince Aggrippino
// @match        https://trello.com/search*
// @grant        GM_addStyle
// ==/UserScript==

const title_prefix = `Trlo: `;

/** CSS Tweaks */
function cssTweaks() {
    const css = `
        /** Make the results the same width as the browser window. */
        .search-results-view {
            max-width: 100vw;
        }

        /** Make the header elements smaller so more fits on the screen. */
        .body-search-page .header-search {
            margin: 0 auto;
        }

        .search-results-section-header {
            margin-bottom: 0;
        }

        /** Search Box Size / position */
        [data-desktop-id=header],
        [data-desktop-id=header] > div > div {
            height: 40px;
            min-height: 40px !important;
            max-height: 40px !important;
        }

        .body-search-page .header-search {
            width: 60vw;
            height: 36px;
            max-width: none;
            position: fixed;
            top: 2px;
            left: 50%;
            transform: translateX(-50%);
        }

        .body-search-page .header-search input.header-search-input {
            height: 36px;
            margin: 0 auto;
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
        }

        .body-search-page .header-search .header-search-icon {
            top: 50%;
            transform: translateY(-50%);
        }

        /** Card Numbers */
        body {
            counter-reset: card;
            --card-counter-size: 2rem;
        }

        .search-result-card {
            padding-left: var(--card-counter-size);
            position: relative;
        }

        .search-result-card-hover-target {
            left: var(--card-counter-size);
        }

        .search-result-card::before {
            counter-increment: card;
            content: counter(card) '. ';
            display: block;
            width: var(--card-counter-size);
            height: var(--card-counter-size);
            overflow: hidden;
            position: absolute;
            top: 0;
            left: 0;
        }

        .search-result-card-container {
            left: var(--card-counter-size);
        }

        .cover-thumbnail-link {
            text-decoration: none;
            position: absolute;
            top: 2rem;
            left: 0;
            width: 2rem;
            height: 2rem;
        }

        .cover-thumbnail-link img {
            width: 2rem;
            height: 2rem;
            object-fit: cover;
        }
    `;

    const style = GM_addStyle(css);
}

/**
 * titleShowSearch
 *
 * Show the current search terms in the page title. */
function titleShowSearch() {
    let search_box = document.querySelector(`#content .header-search-input`);

    const go = () => {
        const setTitle = () => { document.title = title_prefix + search_box.value };
        setTitle();
        let timeout_id;
        search_box.addEventListener(`keypress`, () => {
            clearTimeout(timeout_id);
            setTimeout(setTitle, 500);
        });
    }

    // The page is built with JavaScript after the load event, so the needed
    // elements may not be there yet.
    let interval;
    if (!search_box) {
        interval = setInterval(() => {
            search_box = document.querySelector(`#content .header-search-input`);
            if (search_box) {
                clearInterval(interval);
                go();
            }
        }, 500);
    } else {
        go();
    }
}

/**
 * cardCount
 *
 * Show the current card count in the heading of the search results. */
function cardCount() {
    let card_list = document.querySelector(`.search-results-section.js-card-results .js-list`);
    let results_header_text = document.querySelector(`.search-results-section:not(.hide) .search-results-section-header h4`);

    const go = () => {
        const card_count = document.createElement(`span`);
        card_count.classList.add(`card_count`);

        const setCount = () => {
            const cards = card_list.querySelectorAll(`.search-result-card`);
            card_count.innerText = `${cards.length} Cards`;
            results_header_text.innerHTML = `${card_count.outerHTML}`;
        }

        setCount();

        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(setCount, 500);
        });

        observer.observe(card_list, {childList: true, subtree: true});
    }

    let interval;
    if (!card_list || !results_header_text) {
        interval = setInterval(() => {
            card_list = document.querySelector(`.search-results-section.js-card-results .js-list`);
            results_header_text = document.querySelector(`.search-results-section:not(.hide) .search-results-section-header h4`);

            if (card_list && results_header_text) {
                clearInterval(interval);
                go();
            }
        }, 500);
    } else {
        go();
    }
}

/**
 * showAllCards
 *
 * Repeatedly click "Show more cards..." until there aren't any more cards. */
function showAllCards() {
    let results_section_header = document.querySelector(`.search-results-section:not(.hide) .search-results-section-header`);

    const addElements = () => {
        // Add the button
        const show_all_cards = document.createElement(`button`);
        show_all_cards.appendChild(document.createTextNode(`Show All Cards`));
        results_section_header.appendChild(show_all_cards);

        // Add a loading icon
        const spinner = document.createElement(`span`);
        spinner.classList.add(`spinner`, `small`);
        spinner.style.display = `none`;
        results_section_header.appendChild(spinner);

        const go = () => {
            const show_more_cards = document.querySelector(`.js-show-more-cards`);
            const loading_indicator = document.querySelector(`.js-loading-cards`);
            show_all_cards.disabled = true;
            spinner.style.display = `inline-block`;

            let interval_id;
            interval_id = setInterval(() => {
                const show_more_cards_is_hidden = show_more_cards.classList.contains(`hide`);
                const loading_indicator_is_hidden = loading_indicator.classList.contains(`hide`);
                const no_more_cards = show_more_cards_is_hidden && loading_indicator_is_hidden;
                const still_loading = show_more_cards_is_hidden && !loading_indicator_is_hidden;

                if (no_more_cards) {
                    show_all_cards.disabled = false;
                    clearInterval(interval_id);
                    spinner.style.display = `none`;
                    return;
                }

                if (!still_loading) {
                    show_more_cards.click();
                }
            }, 500);
        };
        show_all_cards.addEventListener(`click`, go);
    }

    if (!results_section_header) {
        let interval;
        interval = setInterval(() => {
            results_section_header = document.querySelector(`.search-results-section:not(.hide) .search-results-section-header`);
            if (results_section_header) {
                clearInterval(interval);
                addElements();
            }
        }, 500);
    } else {
        addElements();
    }
}

function cardCoverThumbnails() {
    let card_list = document.querySelector(`.search-results-section.js-card-results .js-list`);

    const go = () => {
        const createThumbnails = () => {
            const cards = card_list.querySelectorAll(`.search-result-card`);
            cards.forEach((card) => {
                const card_cover = card.querySelector(`.list-card-cover`);
                if (card_cover && card_cover.classList.contains(`is-covered`)) {
                    const background_image = card_cover.style.backgroundImage;
                    const image_url = background_image.slice(5, -2);

                    const thumbnail_link = document.createElement(`a`);
                    thumbnail_link.classList.add(`cover-thumbnail-link`);
                    thumbnail_link.setAttribute(`href`, image_url);
                    thumbnail_link.setAttribute(`target`, `_blank`);

                    const thumbnail = new Image();
                    thumbnail.src = image_url;
                    thumbnail.setAttribute(`alt`, `thumbnail`);

                    thumbnail_link.appendChild(thumbnail);

                    card.appendChild(thumbnail_link);
                    card_cover.remove();
                }
            });
        };

        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(createThumbnails, 500);
        });

        observer.observe(card_list, {childList: true, subtree: true});
    }

    let interval;
    if (!card_list) {
        interval = setInterval(() => {
            card_list = document.querySelector(`.search-results-section.js-card-results .js-list`);

            if (card_list) {
                clearInterval(interval);
                go();
            }
        }, 500);
    } else {
        go();
    }
}

cssTweaks();

window.addEventListener(`load`, () => {
    titleShowSearch();
    cardCount();
    showAllCards();
    cardCoverThumbnails();
});