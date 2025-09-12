// ==UserScript==
// @name         Letterboxd - Runtime Converter (mins to hours)
// @namespace    https://github.com/ruiribeiro04/letterboxd-time-length-in-hours-userscript
// @version      0.0.1
// @description  Converts movie runtime on Letterboxd from minutes into a more readable hours and minutes format (e.g., 2:03h).
// @author       ruiribeiro04
// @match        https://letterboxd.com/film/*
// @icon         https://letterboxd.com/apple-touch-icon.png
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/ruiribeiro04/letterboxd-time-length-in-hours-userscript/refs/heads/main/src/letterboxd_time_length_minutes_to_hours.user.js
// @downloadURL  https://raw.githubusercontent.com/ruiribeiro04/letterboxd-time-length-in-hours-userscript/refs/heads/main/src/letterboxd_time_length_minutes_to_hours.user.js
// ==/UserScript==


(function() {
    'use strict';

    function convertRuntime() {
        const targetElement = document.querySelector("#film-page-wrapper p.text-footer");

        if (targetElement && targetElement.innerHTML.includes('mins')) {
            const originalHTML = targetElement.innerHTML;
            const regex = /(\d+)(?:&nbsp;|\s)mins/;
            const match = originalHTML.match(regex);

            if (match && match[1]) {
                const totalMinutes = parseInt(match[1], 10);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const formattedMinutes = String(minutes).padStart(2, '0');
                const newDurationFormat = `${hours}:${formattedMinutes}h`;
                targetElement.innerHTML = originalHTML.replace(match[0], "<b>" + newDurationFormat + "</b> (" + match[0] + ")");
                return true;
            }
        }
        return false;
    }

    const observer = new MutationObserver((mutationsList, obs) => {
        if (convertRuntime()) {
            obs.disconnect();
        }
    });

    if (!convertRuntime()) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
