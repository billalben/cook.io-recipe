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

export const cardQueries = [
  ["field", "uri"],
  ["field", "label"],
  ["field", "image"],
  ["field", "totalTime"],
];

export const $skeletonCard = `
  <div class="card skeleton-card">
    <div class="skeleton card-banner"></div>
    <div class="card-body">
      <div class="skeleton card-title"></div>
      <div class="skeleton card-text"></div>
    </div>
  </div>`;
