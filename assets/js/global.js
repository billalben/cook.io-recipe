"use strict";

/**
 * Add Events On Multiple Elements
 * @param {NodeList} $elements NodeList
 * @param {string} eventType Event type string
 * @param {Function} callback Callback function
 */

window.addEventOnElements = ($elements, eventType, callback) => {
  for (const $element of $elements)
    $element.addEventListener(eventType, callback);
};
