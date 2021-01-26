// ==UserScript==
// @name         Discord Markdown Lists
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Better implementation of Markdown Lists for Discord
// @author       You
// @match        https://discord.com/channels/783261981943136266/795424152768741386
// @grant        none
// ==/UserScript==

window.addEventListener(`load`, () => {
    const target = document.getElementById(`app-mount`);
    const config = {
        childList: true,
        subtree: true,
    };

    function mutation_handler(mutations, observer) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.className && node.className.indexOf(`message-`) !== -1) {
                        console.log(node);
                        const message_content = node.querySelector(`[class^=contents-] div`);
                        console.log(message_content.innerText);
                    }
                });
            }
        }
    }

    const observer = new MutationObserver(mutation_handler);

    observer.observe(target, config);
});