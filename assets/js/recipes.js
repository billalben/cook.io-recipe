"use strict";

import { fetchData } from "./api.js";
import { $skeletonCard, cardQueries } from "./global.js";
import { getTime } from "./module.js";

/**
 * Accordion
 */

const $accordions = document.querySelectorAll("[data-accordion]");

const initAccordion = function ($element) {
  const $button = $element.querySelector("[data-accordion-btn]");

  let isExpanded = false;
  $button.addEventListener("click", function () {
    isExpanded = !isExpanded;
    this.setAttribute("aria-expanded", isExpanded);
  });
};

// for (const $accordion of $accordions) initAccordion($accordion);
$accordions.forEach(initAccordion);

/**
 * Filter bar toggle for mobile screen
 */

const $filterBar = document.querySelector("[data-filter-bar]");
const $filterTogglers = document.querySelectorAll("[data-filter-toggler]");
const $overlay = document.querySelector("[data-overlay]");

const toggleFilterBar = () => {
  $filterBar.classList.toggle("active");
  $overlay.classList.toggle("active");
  document.body.style.overflow =
    document.body.style.overflow === "hidden" ? "visible" : "hidden";
};

addEventOnElements($filterTogglers, "click", toggleFilterBar);

/**
 * Filter submit and clear
 */

const $filterSubmit = document.querySelector("[data-filter-submit]");
const $filterClear = document.querySelector("[data-filter-clear]");
const $filterSearch = document.querySelector("input[type='search']");

const getCheckedCheckboxes = () => $filterBar.querySelectorAll("input:checked");

const buildFilterQueries = () => {
  const $filterCheckBoxes = getCheckedCheckboxes();
  const queries = [];

  if ($filterSearch.value) queries.push(["q", $filterSearch.value]);

  if ($filterCheckBoxes.length) {
    for (const checkbox of $filterCheckBoxes) {
      const key = checkbox.parentElement.parentElement.dataset.filter;
      queries.push([key, checkbox.value]);
    }
  }

  return queries;
};

const updateLocationWithQueries = (queries) => {
  window.location = queries.length
    ? `?${queries.map((query) => query.join("=")).join("&")}`
    : "/recipes.html";
};

$filterSubmit.addEventListener("click", () => {
  const queries = buildFilterQueries();
  updateLocationWithQueries(queries);
});

$filterSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    $filterSubmit.click();
  }
});

$filterClear.addEventListener("click", () => {
  const $filterCheckBoxes = getCheckedCheckboxes();

  $filterCheckBoxes?.forEach((checkbox) => (checkbox.checked = false));
  $filterSearch.value &&= "";
});

const queryStr = window.location.search.slice(1);
const queries = queryStr && queryStr.split("&").map((i) => i.split("="));

const $filterCount = document.querySelector("[data-filter-count]");

if (queries.length) {
  $filterCount.style.display = "block";
  $filterCount.innerHTML = queries.length;
} else {
  $filterCount.style.display = "none";
}

queryStr &&
  queryStr.split("&").map((i) => {
    if (i.split("=")[0] === "q") {
      $filterBar.querySelector("input[type='search']").value = i
        .split("=")[1]
        .replace(/20%/g, " ");
    } else {
      $filterBar.querySelector(
        `[value="${i.split("=")[1].replace(/20%/g, " ")}"]`
      ).checked = true;
    }
  });

const $filterBtn = document.querySelector("[data-filter-btn]");

window.addEventListener("scroll", () => {
  $filterBtn.classList[window.scrollY >= 120 ? "add" : "remove"]("active");
});
