// ==UserScript==
// @name         Discord Unwrap Code Blocks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Don't wrap long lines in code blocks.
// @author       Vince Aggrippino
// @match        https://discord.com/*
// @grant        none
// ==/UserScript==

window.addEventListener(`load`, () => {
    const css = `
        [class^="markup-"] pre code.hljs {
            white-space: pre;
        }

        [class^="scrollbarGhostHairline-"]::-webkit-scrollbar {
            height: 8px;
        }
    `;

    const head = document.getElementsByTagName(`head`)[0];
    const style = document.createElement(`style`);
    style.innerText = css;
    head.appendChild(style);
});
