// ==UserScript==
// @name         Letterboxd - Runtime Converter (mins to hours)
// @namespace    https://github.com/ruiribeiro04/letterboxd-time-length-in-hours-userscript
// @version      0.1.0
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
    // CONSTANTS
    // ========================================
    const CONFIG = {
        SELECTOR: '#film-page-wrapper p.text-footer',
        MINUTES_PER_HOUR: 60,
        MINUTE_PATTERNS: ['mins', 'min', 'minutes', 'minute'],
        MAX_OBSERVER_TIMEOUT: 10000, // 10 seconds
        LOG_PREFIX: '[Letterboxd Runtime Converter]'
    };

    const REGEX_PATTERN = new RegExp(
        `(\\d+)(?:&nbsp;|\\s)(${CONFIG.MINUTE_PATTERNS.join('|')})`,
        'i'
    );

    // ========================================
    // UTILITY FUNCTIONS (Pure Functions - SRP)
    // ========================================

    /**
     * Converte minutos totais para formato horas:minutos
     * @param {number} totalMinutes - Total de minutos
     * @returns {string} Formato "H:MM"
     */
    function convertMinutesToHours(totalMinutes) {
        if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
            throw new Error('Invalid minutes value');
        }

        const hours = Math.floor(totalMinutes / CONFIG.MINUTES_PER_HOUR);
        const minutes = totalMinutes % CONFIG.MINUTES_PER_HOUR;
        const formattedMinutes = String(minutes).padStart(2, '0');

        return `${hours}:${formattedMinutes}`;
    }

    /**
     * Extrai minutos de uma string
     * @param {string} text - Texto contendo informação de duração
     * @returns {number|null} Minutos extraídos ou null
     */
    function extractMinutes(text) {
        const match = text.match(REGEX_PATTERN);
        return match && match[1] ? parseInt(match[1], 10) : null;
    }

    /**
     * Formata o novo texto com duração convertida
     * @param {string} originalText - Texto original
     * @param {number} minutes - Minutos originais
     * @param {string} convertedFormat - Formato convertido
     * @returns {string} Novo texto formatado
     */
    function formatConvertedText(originalText, minutes, convertedFormat) {
        const originalDuration = `${minutes} mins`;
        const newDuration = `<strong>${convertedFormat}h</strong>`;
        const replacement = `${newDuration} (${originalDuration})`;
        
        return originalText.replace(new RegExp(`${minutes}\\s+mins`, 'i'), replacement);
    }

    // ========================================
    // DOM MANIPULATION (Single Responsibility)
    // ========================================

    /**
     * Encontra e converte o elemento de runtime
     * @returns {boolean} True se conversão foi bem-sucedida
     */
    function convertRuntime() {
        try {
            const element = document.querySelector(CONFIG.SELECTOR);
            
            if (!element) {
                log('Element not found', 'warn');
                return false;
            }

            const originalText = element.innerHTML;
            const minutes = extractMinutes(originalText);

            if (!minutes) {
                log('No minutes pattern found in text', 'info');
                return false;
            }

            const convertedFormat = convertMinutesToHours(minutes);
            const newText = formatConvertedText(originalText, minutes, convertedFormat);

            if (originalText !== newText) {
                element.innerHTML = newText;
                log(`Converted ${minutes} mins to ${convertedFormat}h`, 'success');
                return true;
            }

            return false;
        } catch (error) {
            log(`Error converting runtime: ${error.message}`, 'error');
            return false;
        }
    }

    // ========================================
    // OBSERVER PATTERN
    // ========================================

    /**
     * Observa mudanças no DOM até encontrar o elemento
     */
    function observeDOM() {
        const startTime = Date.now();
        
        const observer = new MutationObserver((mutations, obs) => {
            if (convertRuntime()) {
                obs.disconnect();
                return;
            }

            // Timeout safety
            if (Date.now() - startTime > CONFIG.MAX_OBSERVER_TIMEOUT) {
                obs.disconnect();
                log('Observer timeout reached', 'warn');
            }
        });

        // Otimização: observar apenas o wrapper, não todo o body
        const targetNode = document.querySelector('#film-page-wrapper') || document.body;
        
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });

        log('Observer started', 'info');
    }

    // ========================================
    // LOGGING UTILITY
    // ========================================

    /**
     * Log com diferentes níveis
     * @param {string} message - Mensagem de log
     * @param {'info'|'warn'|'error'|'success'} level - Nível do log
     */
    function log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `${CONFIG.LOG_PREFIX} [${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (level === 'error') {
            console.error(logMessage);
        } else if (level === 'warn') {
            console.warn(logMessage);
        } else {
            console.log(logMessage);
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function init() {
        log('Script initialized', 'info');
        
        if (!convertRuntime()) {
            observeDOM();
        }
    }

    // Entry point
    init();
})();
