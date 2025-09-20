// Helper functions for managing SplitText to prevent duplicates
export function isAlreadySplit(element) {
  // Check if element has split text markers
  return element.querySelector(".char, .word, .line") !== null ||
         element.dataset.splitTextProcessed === "true";
}

export function markAsSplit(element) {
  element.dataset.splitTextProcessed = "true";
}

export function markAsUnsplit(element) {
  element.dataset.splitTextProcessed = "false";
}

export function safeSplitText(element, options = {}) {
  if (isAlreadySplit(element)) {
    console.warn("Element already split, skipping:", element);
    return null;
  }

  const split = new SplitText(element, options);
  markAsSplit(element);
  return split;
}