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

/**
 * Request recipe and render
 */

const $gridList = document.querySelector("[data-grid-list]");
const $loadMore = document.querySelector("[data-load-more]");
const defaultQueries = [
  ["mealType", "breakfast"],
  ["mealType", "dinner"],
  ["mealType", "lunch"],
  ["mealType", "snack"],
  ["mealType", "teatime"],
  ...cardQueries,
];

$gridList.innerHTML = $skeletonCard.repeat(12);
let nextPageUrl = "";

const renderRecipe = (data) => {
  data.hits.map((item, index) => {
    const {
      recipe: { image, label: title, totalTime: cookingTime, uri },
    } = item;

    const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
    const isSaved = window.localStorage.getItem(`cookio-recipe${recipeId}`);

    const $card = document.createElement("div");
    $card.classList.add("card");
    $card.style.animationDelay = `${100 * index}ms`;

    $card.innerHTML = `
        <figure class="card-media img-holder">
          <img
            src="${image}"
            width="195"
            height="195"
            loading="lazy"
            alt="${title}"
            class="img-cover"
          />
        </figure>
        <div class="card-body">
          <h3 class="title-small">
            <a 
              href="./detail.html?recipe=${recipeId}" 
              class="card-link">
              ${title ?? "Untitled"}
            </a>
          </h3>
          <div class="meta-wrapper">
            <div class="meta-item">
              <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
              <span class="label-medium">${getTime(cookingTime).time || "<1"} 
                ${getTime(cookingTime).timeUnit}</span>
            </div>
            <button class="icon-btn has-state ${
              isSaved ? "saved" : "removed"
            }" aria-label="Add to save recipes"
            onclick="saveRecipe(this, '${recipeId}')">
              <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
              <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
            </button>
          </div>
        </div>
    `;

    $gridList.appendChild($card);
  });
};

let requestedBefore = true;

fetchData(queries || defaultQueries, (data) => {
  const {
    _links: { next },
  } = data;

  nextPageUrl = next?.href;

  $gridList.innerHTML = "";
  requestedBefore = false;

  if (data.hits.length) {
    renderRecipe(data);
  } else {
    $loadMore.innerHTML = `<p class="body-medium info-text">No recipe found</p>`;
  }
});

const CONTAINER_MAX_WIDTH = 1200;
const CONTAINER_MAX_CARD = 6;

window.addEventListener("scroll", async (e) => {
  if (
    $loadMore.getBoundingClientRect().top < innerHeight &&
    !requestedBefore &&
    nextPageUrl
  ) {
    $loadMore.innerHTML = $skeletonCard.repeat(
      Math.round(
        ($loadMore.clientWidth / CONTAINER_MAX_WIDTH) * CONTAINER_MAX_CARD
      )
    );

    requestedBefore = true;

    const response = await fetch(nextPageUrl);
    const data = await response.json();

    const {
      _links: { next },
    } = data;
    nextPageUrl = next?.href;

    renderRecipe(data);
    $loadMore.innerHTML = "";
    requestedBefore = false;
  }

  if (!nextPageUrl) {
    $loadMore.innerHTML = `<p class="body-medium info-text">No more recipes</p>`;
  }
});
