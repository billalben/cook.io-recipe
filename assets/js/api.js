"use strict";

// window.ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";
// window.ACCESS_POINT = "localhost:3000/recipe";
window.ACCESS_POINT = "https://my-proxy-server-da7c.onrender.com/recipe";

/**
 *
 * @param {Array} queries Query array
 * @param {Function} successCallback Success callback function
 */

export const fetchData = async function (queries, successCallback) {
  const query = queries
    ?.join("&")
    .replace(/,/g, "=")
    .replace(/ /g, "20%")
    .replace(/\+/g, "2B%");

  const url = `${ACCESS_POINT}?${query ? `&${query}` : ""}`;

  const response = await fetch(url);

  if (response.ok) {
    const data = await response.json();
    successCallback(data);
  }
};
