/* ── Floating label logic ── */

function floatLabel(label) {
  label.className = label.className.replace(' floated', '') + ' floated';
}

function sinkLabel(label) {
  label.className = label.className.replace(' floated', '');
}

function handleInput(input, label) {
  if (input.value.length > 0 || input === document.activeElement) {
    floatLabel(label);
  } else {
    sinkLabel(label);
  }
}

function initFloatingLabels() {
  var containers = document.getElementsByClassName('floating-input');

  for (var i = 0; i < containers.length; i++) {
    var input = containers[i].getElementsByTagName('input')[0];
    var label = containers[i].getElementsByClassName('floating-label')[0];

    if (input && label) {
      handleInput(input, label);

      input.onfocus = function () {
        var thisLabel = this.parentNode.getElementsByClassName('floating-label')[0];
        floatLabel(thisLabel);
      };

      input.onblur = function () {
        var thisLabel = this.parentNode.getElementsByClassName('floating-label')[0];
        handleInput(this, thisLabel);
      };

      input.oninput = function () {
        var thisLabel = this.parentNode.getElementsByClassName('floating-label')[0];
        handleInput(this, thisLabel);
      };
    }
  }
}

/* ── Helper: set a form field value and float its label ── */

function setFieldValue(id, value) {
  var el = document.getElementById(id);
  if (!el) return;
  el.value = value;

  var wrap = el.closest('.floating-input');
  if (wrap) {
    var label = wrap.querySelector('.floating-label');
    if (label) handleInput(el, label);
  }
}

/* ── SVG location pin icon ── */

var PIN_SVG =
  '<svg class="autocomplete-dropdown-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/>' +
  '</svg>';

/* ── Google Places (New) – REST API powered autocomplete ── */

var API_KEY = ''; // extracted at runtime from the <script> tag
var addressInput;
var dropdown;
var wrapperEl;
var debounceTimer;
var activeIndex = -1;
var currentPredictions = [];

function initAutocomplete() {
  // Grab the API key from the data-places-key attribute
  var keyEl = document.querySelector('script[data-places-key]');
  if (keyEl) {
    API_KEY = keyEl.getAttribute('data-places-key');
  }

  if (!API_KEY) {
    console.error('[Places] No API key found in any <script> tag');
  }

  addressInput = document.getElementById('address-input');
  dropdown     = document.getElementById('autocomplete-dropdown');
  wrapperEl    = document.getElementById('address-autocomplete-wrapper');

  if (!addressInput || !dropdown || !wrapperEl) {
    console.error('[Places] Required DOM elements not found');
    return;
  }

  addressInput.setAttribute('autocomplete', 'off');
  addressInput.setAttribute('role', 'combobox');
  addressInput.setAttribute('aria-autocomplete', 'list');
  addressInput.setAttribute('aria-expanded', 'false');
  addressInput.setAttribute('aria-owns', 'autocomplete-dropdown');
  dropdown.setAttribute('role', 'listbox');

  addressInput.addEventListener('input', onAddressInput);
  addressInput.addEventListener('keydown', onKeyDown);
  addressInput.addEventListener('focus', function () {
    if (addressInput.value.length >= 2) {
      fetchPredictions(addressInput.value);
    }
  });

  document.addEventListener('mousedown', function (e) {
    if (!wrapperEl.contains(e.target)) {
      closeDropdown();
    }
  });

  initFloatingLabels();
  console.log('[Places] Autocomplete initialised (REST API, key present: ' + !!API_KEY + ')');
}

/* ── Input handler with debounce ── */

function onAddressInput() {
  var query = addressInput.value;
  clearTimeout(debounceTimer);

  if (query.length < 2) {
    closeDropdown();
    return;
  }

  debounceTimer = setTimeout(function () {
    fetchPredictions(query);
  }, 250);
}

/* ── Fetch predictions from Places API (New) REST endpoint ── */

function fetchPredictions(query) {
  var countrySelect = document.getElementById('country-select');
  var country = countrySelect ? countrySelect.value.toLowerCase() : 'us';

  var body = {
    input: query,
    includedRegionCodes: [country],
    includedPrimaryTypes: ['street_address', 'subpremise', 'premise', 'route']
  };

  fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY
    },
    body: JSON.stringify(body)
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    if (!data.suggestions || data.suggestions.length === 0) {
      closeDropdown();
      return;
    }
    currentPredictions = data.suggestions
      .filter(function (s) { return s.placePrediction; })
      .map(function (s) { return s.placePrediction; });

    renderPredictions(currentPredictions);
  })
  .catch(function (err) {
    console.error('[Places] fetch error', err);
    closeDropdown();
  });
}

/* ── Render the custom dropdown ── */

/* ── Powered by Google logo (inline SVG) ── */

var GOOGLE_LOGO_SVG =
  '<svg width="62" height="12" viewBox="0 0 62 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M7.2 5.98H3.84v1.16h2.22c-.1 1.32-1.2 1.88-2.2 1.88a2.5 2.5 0 0 1-2.54-2.6 2.52 2.52 0 0 1 2.52-2.6 2.4 2.4 0 0 1 1.72.7l.82-.84A3.5 3.5 0 0 0 3.84 2.7a3.68 3.68 0 0 0-3.72 3.74 3.66 3.66 0 0 0 3.74 3.68c1.96 0 3.42-1.34 3.42-3.66 0-.28-.04-.48-.08-.48Z" fill="#4285F4"/>' +
    '<path d="M11.16 5.3c-1.84 0-3.16 1.44-3.16 3.12 0 1.7 1.28 3.18 3.18 3.18s3.16-1.44 3.16-3.16c0-2.1-1.56-3.14-3.18-3.14Zm0 1.12c.9 0 1.9.72 1.9 2.02 0 1.26-.98 2-1.9 2-.98 0-1.9-.76-1.9-2.02 0-1.24.92-2 1.9-2Z" fill="#EA4335"/>' +
    '<path d="M18.56 5.3c-1.84 0-3.16 1.44-3.16 3.12 0 1.7 1.28 3.18 3.18 3.18s3.16-1.44 3.16-3.16c0-2.1-1.56-3.14-3.18-3.14Zm0 1.12c.9 0 1.9.72 1.9 2.02 0 1.26-.98 2-1.9 2-.98 0-1.9-.76-1.9-2.02 0-1.24.92-2 1.9-2Z" fill="#FBBC05"/>' +
    '<path d="M25.86 5.3c-1.72 0-3.04 1.52-3.04 3.14 0 1.9 1.56 3.16 3.02 3.16.9 0 1.38-.36 1.74-.78v.64c0 1.1-.68 1.78-1.68 1.78a1.74 1.74 0 0 1-1.62-1.14l-1.1.46c.42.9 1.34 1.76 2.74 1.76 1.62 0 2.86-1.02 2.86-3.14V5.48h-1.18v.56c-.4-.44-.94-.74-1.74-.74Zm.12 1.12c.84 0 1.78.72 1.78 2.02 0 1.32-.92 2-1.8 2-.96 0-1.82-.78-1.82-2.02 0-1.28.88-2 1.84-2Z" fill="#4285F4"/>' +
    '<path d="M35.46 5.3c-1.68 0-3.1 1.34-3.1 3.14 0 1.88 1.34 3.16 3.26 3.16a3.06 3.06 0 0 0 2.58-1.32l-.98-.66c-.26.4-.7.86-1.6.86-.92 0-1.34-.5-1.62-1l4.46-1.84-.24-.52C39.76 6.3 38.82 5.3 37.1 5.3h-.02c-.54 0-1.1.2-1.62.58Zm.06 1.1c.6 0 1.02.32 1.2.7l-2.98 1.24c-.14-.98.72-1.94 1.78-1.94Z" fill="#EA4335"/>' +
    '<path d="M30.72 11.4h1.26V2.22h-1.26V11.4Z" fill="#34A853"/>' +
  '</svg>';

function renderPredictions(predictions) {
  dropdown.innerHTML = '';
  activeIndex = -1;

  /* ── "Suggestions" subtitle ── */
  var subtitle = document.createElement('div');
  subtitle.className = 'autocomplete-dropdown-subtitle';
  subtitle.textContent = 'Suggestions';
  dropdown.appendChild(subtitle);

  predictions.forEach(function (pred, idx) {
    var mainText      = pred.structuredFormat.mainText.text;
    var mainMatches   = pred.structuredFormat.mainText.matches || [];
    var secondaryText = pred.structuredFormat.secondaryText
                        ? pred.structuredFormat.secondaryText.text
                        : '';

    /* Build single-line: "mainText, secondaryText" */
    var fullText = mainText + (secondaryText ? ', ' + secondaryText : '');

    var item = document.createElement('div');
    item.className = 'autocomplete-dropdown-item';
    item.setAttribute('role', 'option');
    item.setAttribute('data-index', idx);

    item.innerHTML =
      '<span class="autocomplete-dropdown-item-line">' +
        boldMatches(fullText, mainMatches) +
      '</span>';

    item.addEventListener('mousedown', function (e) {
      e.preventDefault();
      selectPrediction(pred);
    });

    dropdown.appendChild(item);
  });

  /* ── "Powered by Google" footer ── */
  var footer = document.createElement('div');
  footer.className = 'autocomplete-dropdown-footer';
  footer.innerHTML =
    '<span class="autocomplete-dropdown-footer-text">powered by </span>' +
    '<span class="autocomplete-dropdown-footer-google">Google</span>';
  dropdown.appendChild(footer);

  openDropdown();
}

/* ── Bold matched portions of text ── */

function boldMatches(text, matches) {
  if (!matches || matches.length === 0) return escapeHTML(text);

  var result = '';
  var lastEnd = 0;

  matches.slice().sort(function (a, b) {
    return (a.startOffset || 0) - (b.startOffset || 0);
  }).forEach(function (m) {
    var start = m.startOffset || 0;
    var end   = m.endOffset   || 0;
    if (start > lastEnd) {
      result += escapeHTML(text.substring(lastEnd, start));
    }
    result += '<span class="matched">' + escapeHTML(text.substring(start, end)) + '</span>';
    lastEnd = end;
  });

  if (lastEnd < text.length) {
    result += escapeHTML(text.substring(lastEnd));
  }
  return result;
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ── Select a prediction → fetch place details → fill form ── */

function selectPrediction(pred) {
  addressInput.value = pred.structuredFormat.mainText.text;
  var label = wrapperEl.querySelector('.floating-label');
  if (label) floatLabel(label);
  closeDropdown();

  // Fetch full place details from Places API (New)
  var placeId = pred.placeId;
  var url = 'https://places.googleapis.com/v1/places/' + placeId;

  fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'addressComponents'
    }
  })
  .then(function (res) { return res.json(); })
  .then(function (place) {
    if (place.addressComponents) {
      fillForm(place.addressComponents);
    }
  })
  .catch(function (err) {
    console.error('[Places] Place details error', err);
  });
}

/* ── Fill the form fields from address components ── */

function fillForm(components) {
  var streetNumber = '';
  var route = '';
  var city = '';
  var stateShort = '';
  var zip = '';
  var countryShort = '';

  components.forEach(function (c) {
    var types = c.types || [];
    var name  = c.longText  || '';
    var short = c.shortText || '';

    if (types.indexOf('street_number') !== -1) {
      streetNumber = name;
    } else if (types.indexOf('route') !== -1) {
      route = name;
    } else if (types.indexOf('locality') !== -1) {
      city = name;
    } else if (types.indexOf('sublocality_level_1') !== -1 && !city) {
      city = name;
    } else if (types.indexOf('administrative_area_level_1') !== -1) {
      stateShort = short;
    } else if (types.indexOf('postal_code') !== -1) {
      zip = name;
    } else if (types.indexOf('country') !== -1) {
      countryShort = short;
    }
  });

  var fullStreet = (streetNumber + ' ' + route).trim();
  if (fullStreet) setFieldValue('address-input', fullStreet);

  setFieldValue('city', city);
  setFieldValue('zip-code', zip);

  var stateSelect = document.getElementById('state-select');
  if (stateSelect && stateShort) stateSelect.value = stateShort;

  var countrySelect = document.getElementById('country-select');
  if (countrySelect && countryShort) countrySelect.value = countryShort;
}

/* ── Dropdown open / close ── */

function openDropdown() {
  dropdown.classList.add('visible');
  wrapperEl.classList.add('dropdown-open');
  addressInput.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
  dropdown.classList.remove('visible');
  wrapperEl.classList.remove('dropdown-open');
  addressInput.setAttribute('aria-expanded', 'false');
  activeIndex = -1;
}

/* ── Keyboard navigation ── */

function onKeyDown(e) {
  var items = dropdown.querySelectorAll('.autocomplete-dropdown-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    updateActiveItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    updateActiveItem(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
}

function updateActiveItem(items) {
  items.forEach(function (item, idx) {
    if (idx === activeIndex) {
      item.classList.add('active');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });
}

/* ── Boot ── */

window.onload = function () {
  initAutocomplete();
};