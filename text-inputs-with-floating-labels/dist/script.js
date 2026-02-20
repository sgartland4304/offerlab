/* ── Floating label logic (original) ── */

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

  // float the label if inside a .floating-input wrapper
  var wrapper = el.closest('.floating-input');
  if (wrapper) {
    var label = wrapper.querySelector('.floating-label');
    if (label) handleInput(el, label);
  }
}

/* ── SVG for the location pin icon ── */

var locationPinSVG =
  '<svg class="autocomplete-dropdown-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/>' +
  '</svg>';

/* ── Google Places Autocomplete (custom dropdown) ── */

var autocompleteService;
var placesService;
var sessionToken;
var addressInput;
var dropdown;
var wrapper;
var debounceTimer;
var activeIndex = -1;

function initAutocomplete() {
  autocompleteService = new google.maps.places.AutocompleteService();
  placesService = new google.maps.places.PlacesService(
    document.createElement('div')
  );
  sessionToken = new google.maps.places.AutocompleteSessionToken();

  addressInput = document.getElementById('address-input');
  dropdown = document.getElementById('autocomplete-dropdown');
  wrapper = document.getElementById('address-autocomplete-wrapper');

  // Prevent the browser's own autocomplete from competing
  addressInput.setAttribute('autocomplete', 'none');
  addressInput.setAttribute('role', 'combobox');
  addressInput.setAttribute('aria-autocomplete', 'list');
  addressInput.setAttribute('aria-expanded', 'false');
  addressInput.setAttribute('aria-owns', 'autocomplete-dropdown');
  dropdown.setAttribute('role', 'listbox');

  addressInput.addEventListener('input', onAddressInput);
  addressInput.addEventListener('keydown', onKeyDown);
  addressInput.addEventListener('focus', function () {
    if (addressInput.value.length > 0) {
      fetchPredictions(addressInput.value);
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('mousedown', function (e) {
    if (!wrapper.contains(e.target)) {
      closeDropdown();
    }
  });

  // Initialise floating labels after DOM ready
  initFloatingLabels();
}

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

function fetchPredictions(query) {
  var countrySelect = document.getElementById('country-select');
  var country = countrySelect ? countrySelect.value : 'US';

  autocompleteService.getPlacePredictions(
    {
      input: query,
      types: ['address'],
      componentRestrictions: { country: country },
      sessionToken: sessionToken,
    },
    function (predictions, status) {
      if (
        status !== google.maps.places.PlacesServiceStatus.OK ||
        !predictions
      ) {
        closeDropdown();
        return;
      }
      renderPredictions(predictions);
    }
  );
}

function renderPredictions(predictions) {
  dropdown.innerHTML = '';
  activeIndex = -1;

  predictions.forEach(function (prediction, idx) {
    var item = document.createElement('div');
    item.className = 'autocomplete-dropdown-item';
    item.setAttribute('role', 'option');
    item.setAttribute('data-place-id', prediction.place_id);
    item.setAttribute('data-index', idx);

    // Bold the matched substrings
    var mainText = prediction.structured_formatting.main_text;
    var mainMatches =
      prediction.structured_formatting.main_text_matched_substrings || [];
    var secondaryText =
      prediction.structured_formatting.secondary_text || '';

    item.innerHTML =
      locationPinSVG +
      '<div class="autocomplete-dropdown-item-text">' +
        '<span class="autocomplete-dropdown-item-main">' +
          boldMatches(mainText, mainMatches) +
        '</span>' +
        (secondaryText
          ? '<span class="autocomplete-dropdown-item-secondary">' +
            escapeHTML(secondaryText) +
            '</span>'
          : '') +
      '</div>';

    item.addEventListener('mousedown', function (e) {
      e.preventDefault(); // prevent blur on input
      selectPrediction(prediction);
    });

    dropdown.appendChild(item);
  });

  openDropdown();
}

function boldMatches(text, matches) {
  if (!matches || matches.length === 0) return escapeHTML(text);

  var result = '';
  var lastEnd = 0;

  // Sort by offset
  matches = matches.slice().sort(function (a, b) {
    return a.offset - b.offset;
  });

  matches.forEach(function (m) {
    // un-matched segment before this match
    if (m.offset > lastEnd) {
      result += escapeHTML(text.substring(lastEnd, m.offset));
    }
    // matched segment
    result +=
      '<span class="matched">' +
      escapeHTML(text.substring(m.offset, m.offset + m.length)) +
      '</span>';
    lastEnd = m.offset + m.length;
  });

  // trailing un-matched
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

function selectPrediction(prediction) {
  // Fill the address input with the main text right away
  addressInput.value =
    prediction.structured_formatting.main_text;

  // Float the label
  var label = wrapper.querySelector('.floating-label');
  if (label) floatLabel(label);

  closeDropdown();

  // Fetch full place details to autofill the rest of the form
  placesService.getDetails(
    {
      placeId: prediction.place_id,
      fields: ['address_components'],
      sessionToken: sessionToken,
    },
    function (place, status) {
      // Get a fresh session token for next search
      sessionToken = new google.maps.places.AutocompleteSessionToken();

      if (
        status !== google.maps.places.PlacesServiceStatus.OK ||
        !place
      ) {
        return;
      }

      fillForm(place.address_components);
    }
  );
}

function fillForm(components) {
  var streetNumber = '';
  var route = '';
  var city = '';
  var stateShort = '';
  var zip = '';
  var countryShort = '';

  components.forEach(function (c) {
    var types = c.types;
    if (types.indexOf('street_number') !== -1) {
      streetNumber = c.long_name;
    } else if (types.indexOf('route') !== -1) {
      route = c.long_name;
    } else if (types.indexOf('locality') !== -1) {
      city = c.long_name;
    } else if (
      types.indexOf('sublocality_level_1') !== -1 &&
      !city
    ) {
      city = c.long_name;
    } else if (
      types.indexOf('administrative_area_level_1') !== -1
    ) {
      stateShort = c.short_name;
    } else if (types.indexOf('postal_code') !== -1) {
      zip = c.long_name;
    } else if (types.indexOf('country') !== -1) {
      countryShort = c.short_name;
    }
  });

  // Address (street number + route)
  var fullStreet = (streetNumber + ' ' + route).trim();
  if (fullStreet) {
    setFieldValue('address-input', fullStreet);
  }

  // City
  setFieldValue('city', city);

  // State (select dropdown)
  var stateSelect = document.getElementById('state-select');
  if (stateSelect && stateShort) {
    stateSelect.value = stateShort;
  }

  // ZIP code
  setFieldValue('zip-code', zip);

  // Country (select dropdown)
  var countrySelect = document.getElementById('country-select');
  if (countrySelect && countryShort) {
    countrySelect.value = countryShort;
  }
}

/* ── Dropdown open/close helpers ── */

function openDropdown() {
  dropdown.classList.add('visible');
  wrapper.classList.add('dropdown-open');
  addressInput.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
  dropdown.classList.remove('visible');
  wrapper.classList.remove('dropdown-open');
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
      items[activeIndex].dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
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

/* ── Fallback: if the API script hasn't loaded, still init labels ── */
window.onload = function () {
  if (typeof google === 'undefined') {
    initFloatingLabels();
  }
};