// ==UserScript==
// @name         Letterboxd - Runtime Converter (mins to hours)
// @namespace    https://github.com/ruiribeiro04/letterboxd-time-length-in-hours-userscript
// @version      0.2.0
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

    // ========================================
    // SETTINGS
    // ========================================
    const SELECTOR = 'p.text-footer';
    const MINUTES_PER_HOUR = 60;

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Converts total minutes to the hours:minutes format
     */
    function convertMinutesToHours(totalMinutes) {
        const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
        const minutes = totalMinutes % MINUTES_PER_HOUR;
        const formattedMinutes = String(minutes).padStart(2, '0');
        return `${hours}:${formattedMinutes}`;
    }

    /**
     * Processes the runtime element
     */
    function processRuntimeElement(element) {
        const originalHTML = element.innerHTML;
        
        // Regex to match: 189&nbsp;mins or 189 mins
        const regex = /(\d+)(?:&nbsp;|\s)mins/;
        const match = originalHTML.match(regex);

        if (!match) {
            return false;
        }

        const totalMinutes = parseInt(match[1], 10);
        const convertedFormat = convertMinutesToHours(totalMinutes);
        const newDurationHTML = `<strong>${convertedFormat}h</strong>`;
        
        // Replace it, keeping the original in parentheses
        const updatedHTML = originalHTML.replace(
            match[0], 
            `${newDurationHTML} (${match[0]})`
        );

        element.innerHTML = updatedHTML;
        return true;
    }

    /**
     * Find and convert the runtime element
     */
    function convertRuntime() {
        const element = document.querySelector(SELECTOR);
        
        if (!element) {
            return false;
        }

        // Check to see if it has already been converted (to avoid duplication)
        if (element.innerHTML.includes('<strong>') && element.innerHTML.includes('h</strong>')) {
            return true; // Already converted
        }

        return processRuntimeElement(element);
    }

    // ========================================
    // OBSERVER
    // ========================================

    function observeDOM() {
        const observer = new MutationObserver((mutations, obs) => {
            if (convertRuntime()) {
                obs.disconnect();
            }
        });

        const targetNode = document.querySelector('#film-page-wrapper') || document.body;
        
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function init() {
        if (!convertRuntime()) {
            observeDOM();
        }
    }

    init();
})();
