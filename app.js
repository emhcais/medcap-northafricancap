(() => {
  "use strict";

  const PAGE_SIZE = 40;
  const state = {
    data: null,
    map: null,
    markerLayer: null,
    recordsById: new Map(),
    selectedPeriods: new Set(),
    search: "",
    view: "all",
    minYear: 1600,
    maxYear: 1699,
    visibleLimit: PAGE_SIZE,
    activeMarkerKey: null,
  };

  const els = {};
  const byId = (id) => document.getElementById(id);

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cacheElements() {
    ["search-input", "year-min", "year-max", "year-output", "period-options",
      "period-summary", "result-list", "result-count", "status-message", "load-more",
      "reset-button", "record-dialog", "record-content", "guide-button", "guide-dialog"]
      .forEach((id) => { els[id] = byId(id); });
  }

  function initializeMap() {
    state.map = L.map("map", { zoomControl: true, minZoom: 2, worldCopyJump: true })
      .setView([38, 20], 4);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(state.map);
    state.markerLayer = L.layerGroup().addTo(state.map);
  }

  function buildPeriodOptions() {
    const periods = Object.entries(state.data.stats.papalPeriods)
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" }));
    periods.forEach(([name]) => state.selectedPeriods.add(name));

    const all = document.createElement("label");
    all.className = "period-all";
    all.innerHTML = '<input type="checkbox" value="__all" checked><span>All periods</span>';
    els["period-options"].appendChild(all);

    periods.forEach(([name, count]) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = name;
      input.checked = true;
      const span = document.createElement("span");
      span.textContent = `${name} (${count})`;
      label.append(input, span);
      els["period-options"].appendChild(label);
    });
  }

  function selectedPeriodInputs() {
    return [...els["period-options"].querySelectorAll('input:not([value="__all"])')];
  }

  function syncPeriodState(changed) {
    const allInput = els["period-options"].querySelector('input[value="__all"]');
    const items = selectedPeriodInputs();
    if (changed.value === "__all") {
      items.forEach((input) => { input.checked = changed.checked; });
    } else {
      allInput.checked = items.every((input) => input.checked);
      allInput.indeterminate = !allInput.checked && items.some((input) => input.checked);
    }
    state.selectedPeriods = new Set(items.filter((input) => input.checked).map((input) => input.value));
    if (state.selectedPeriods.size === items.length) {
      els["period-summary"].textContent = "All periods";
    } else if (state.selectedPeriods.size === 0) {
      els["period-summary"].textContent = "None selected";
    } else {
      els["period-summary"].textContent = `${state.selectedPeriods.size} selected`;
    }
  }

  function registerEvents() {
    els["search-input"].addEventListener("input", (event) => {
      state.search = normalize(event.target.value);
      state.activeMarkerKey = null;
      state.visibleLimit = PAGE_SIZE;
      render();
    });

    [els["year-min"], els["year-max"]].forEach((input) => {
      input.addEventListener("input", () => {
        let min = Number(els["year-min"].value);
        let max = Number(els["year-max"].value);
        if (min > max) {
          if (input === els["year-min"]) max = min;
          else min = max;
        }
        state.minYear = min;
        state.maxYear = max;
        els["year-min"].value = min;
        els["year-max"].value = max;
        els["year-output"].value = `${min}–${max}`;
        state.activeMarkerKey = null;
        state.visibleLimit = PAGE_SIZE;
        render();
      });
    });

    document.querySelectorAll('input[name="view"]').forEach((input) => {
      input.addEventListener("change", (event) => {
        state.view = event.target.value;
        state.activeMarkerKey = null;
        state.visibleLimit = PAGE_SIZE;
        render();
      });
    });

    els["period-options"].addEventListener("change", (event) => {
      if (event.target.matches('input[type="checkbox"]')) {
        syncPeriodState(event.target);
        state.activeMarkerKey = null;
        state.visibleLimit = PAGE_SIZE;
        render();
      }
    });

    els["reset-button"].addEventListener("click", resetFilters);
    els["load-more"].addEventListener("click", () => {
      state.visibleLimit += PAGE_SIZE;
      renderResults(filteredRecords());
    });
    els["guide-button"].addEventListener("click", () => els["guide-dialog"].showModal());

    els["result-list"].addEventListener("click", (event) => {
      const card = event.target.closest("[data-record-id]");
      if (card) openRecord(card.dataset.recordId);
    });
  }

  function resetFilters() {
    state.search = "";
    state.view = "all";
    state.minYear = state.data.meta.yearMin;
    state.maxYear = state.data.meta.yearMax;
    state.activeMarkerKey = null;
    state.visibleLimit = PAGE_SIZE;
    els["search-input"].value = "";
    els["year-min"].value = state.minYear;
    els["year-max"].value = state.maxYear;
    els["year-output"].value = `${state.minYear}–${state.maxYear}`;
    document.querySelector('input[name="view"][value="all"]').checked = true;
    selectedPeriodInputs().forEach((input) => { input.checked = true; });
    const all = els["period-options"].querySelector('input[value="__all"]');
    all.checked = true;
    all.indeterminate = false;
    state.selectedPeriods = new Set(selectedPeriodInputs().map((input) => input.value));
    els["period-summary"].textContent = "All periods";
    state.map.setView([38, 20], 4);
    render();
  }

  function filteredRecords() {
    const markerIds = state.activeMarkerKey
      ? new Set(state.data.markers.find((marker) => marker.key === state.activeMarkerKey)?.recordIds || [])
      : null;
    return state.data.records.filter((record) => {
      if (record.dateYear < state.minYear || record.dateYear > state.maxYear) return false;
      if (!state.selectedPeriods.has(record.papalPeriod)) return false;
      if (state.view === "mapped" && !record.isMapped) return false;
      if (state.view === "none" && record.hasOrigin) return false;
      if (markerIds && !markerIds.has(record.id)) return false;
      if (state.search) {
        const haystack = normalize([
          record.originalName, record.baptismalName, record.placeOfOrigin,
          record.modernPlace, record.papalPeriod, record.age, record.dateDisplay,
        ].join(" "));
        if (!haystack.includes(state.search)) return false;
      }
      return true;
    });
  }

  function recordCard(record) {
    const dateSuffix = record.dateBasis === "inherited" ? " (inherited)" : "";
    return `
      <button class="record-card" type="button" data-record-id="${escapeHtml(record.id)}" aria-label="Open record for ${escapeHtml(record.originalName)} and ${escapeHtml(record.baptismalName)}">
        <span class="name-pair">
          <span class="name-block"><small>Original name</small><strong>${escapeHtml(record.originalName)}</strong></span>
          <span class="name-block"><small>Baptismal name</small><strong>${escapeHtml(record.baptismalName)}</strong></span>
        </span>
        <span class="record-meta">
          <span>${escapeHtml(record.placeOfOriginDisplay)}</span>
          <span>${escapeHtml(record.dateDisplay)}${dateSuffix}</span>
          <span>${escapeHtml(record.papalPeriod)}${record.papalPeriodBasis === "inferred_from_date" ? " (inferred)" : ""}</span>
        </span>
      </button>`;
  }

  function renderResults(records) {
    const visible = records.slice(0, state.visibleLimit);
    els["result-list"].innerHTML = visible.map(recordCard).join("");
    els["result-count"].textContent = `${records.length} of ${state.data.meta.recordCount}`;
    els["load-more"].hidden = visible.length >= records.length;
    els["load-more"].textContent = `Show more records (${records.length - visible.length} remaining)`;

    const mappedCount = records.filter((record) => record.isMapped).length;
    const unresolved = records.filter((record) => record.hasOrigin && !record.isMapped).length;
    const noOrigin = records.filter((record) => !record.hasOrigin).length;
    let status = `${mappedCount} have reviewed map points`;
    if (unresolved) status += `; ${unresolved} recorded origins await place review`;
    if (noOrigin) status += `; ${noOrigin} have no recorded origin`;
    if (state.activeMarkerKey) status += ". A map-origin selection is active; Reset Filters clears it";
    els["status-message"].textContent = `${status}.`;

    if (!records.length) {
      els["result-list"].innerHTML = '<p class="empty-state">No records match these filters. Try widening the date range or resetting filters.</p>';
    }
  }

  function markerKey(record) {
    return record.isMapped ? `${Number(record.latitude).toFixed(4)},${Number(record.longitude).toFixed(4)}` : null;
  }

  function renderMap(records) {
    state.markerLayer.clearLayers();
    const groups = new Map();
    records.filter((record) => record.isMapped).forEach((record) => {
      const key = markerKey(record);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    });

    groups.forEach((group, key) => {
      const first = group[0];
      const labels = [...new Set(group.map((record) => record.placeOfOrigin))];
      const modern = [...new Set(group.map((record) => record.modernPlace).filter(Boolean))];
      const region = group.some((record) => ["region", "island"].includes(record.locationType));
      const radius = Math.min(18, 6 + Math.log2(group.length + 1) * 2.4);
      const marker = L.circleMarker([first.latitude, first.longitude], {
        radius,
        color: "#fffdf8",
        weight: 2,
        fillColor: region ? "#243f3a" : "#a34a32",
        fillOpacity: .9,
      });
      marker.bindTooltip(`${labels.join(" / ")} · ${group.length} record${group.length === 1 ? "" : "s"}`);
      marker.bindPopup(`
        <h3>${escapeHtml(labels.join(" / "))}${modern.length ? ` (${escapeHtml(modern.join(" / "))})` : ""}</h3>
        <p><strong>${group.length}</strong> matching record${group.length === 1 ? "" : "s"}</p>
        <p>${region ? "Generalized regional or island point" : "Reviewed place point"}</p>
        <button class="popup-button" type="button" onclick="window.showRecordsAt('${escapeHtml(key)}')">Show these records</button>`);
      marker.addTo(state.markerLayer);
    });
  }

  function render() {
    const records = filteredRecords();
    renderResults(records);
    renderMap(records);
  }

  function evidenceNote(record, field) {
    if (field === "date") {
      const flag = record.dateBasis === "inherited"
        ? '<span class="method-flag">Inherited date</span>'
        : '<span class="method-flag">Explicit date</span>';
      const notes = [record.dateBasis === "inherited"
        ? "The source cell is blank. This display and the filter inherit the preceding explicit date; the original cell remains blank in the derived CSV."
        : "The date is written on this source row."];
      if (record.datePrecision === "year") {
        notes.push("Only a year is supplied. January 1 is used internally for sorting; the public display preserves year-level precision.");
      }
      return `${flag}<span class="evidence-note">${notes.map(escapeHtml).join(" ")}</span>`;
    }
    if (field === "papal") {
      if (record.papalPeriodBasis === "inferred_from_date") {
        return '<span class="method-flag">Inferred period</span><span class="evidence-note">The source places this person under Tableau annexe rather than a papal heading. Clement VIII is assigned from the 1600 effective date and remains marked as an inference.</span>';
      }
      return '<span class="method-flag">Source section</span><span class="evidence-note">The bold papal heading applies to subsequent people until the next heading.</span>';
    }
    return "";
  }

  function placeNote(record) {
    if (!record.hasOrigin) return '<span class="evidence-note">No place of origin is recorded; no map point is created.</span>';
    if (!record.isMapped) return '<span class="evidence-note">A historical origin is recorded, but its identification is unresolved or ambiguous; it is intentionally left off the map.</span>';
    if (["region", "island"].includes(record.locationType)) return '<span class="evidence-note">The map point is a generalized regional or island reference, not a precise birthplace.</span>';
    return record.modernPlace && normalize(record.modernPlace) !== normalize(record.placeOfOrigin)
      ? '<span class="evidence-note">Historical wording appears first; the modern reference name is supplied in parentheses for orientation.</span>'
      : "";
  }

  function openRecord(id) {
    const record = state.recordsById.get(id);
    if (!record) return;
    els["record-content"].innerHTML = `
      <div class="record-title">
        <p class="kicker">Historical record · ${escapeHtml(record.id)}</p>
        <h2 id="record-dialog-title">${escapeHtml(record.originalName)}</h2>
        <p class="baptismal">${escapeHtml(record.baptismalName)}</p>
      </div>
      <dl class="record-grid">
        <dt>Original Name</dt><dd>${escapeHtml(record.originalName)}</dd>
        <dt>Baptismal Name</dt><dd>${escapeHtml(record.baptismalName)}</dd>
        <dt>Place of Origin</dt><dd>${escapeHtml(record.placeOfOriginDisplay)}${placeNote(record)}</dd>
        <dt>Age</dt><dd>${escapeHtml(record.age)}</dd>
        <dt>Date</dt><dd>${escapeHtml(record.dateDisplay)}${evidenceNote(record, "date")}</dd>
        <dt>Papal Period</dt><dd>${escapeHtml(record.papalPeriod)}${evidenceNote(record, "papal")}</dd>
      </dl>`;
    els["record-dialog"].showModal();
  }

  window.showRecordsAt = (key) => {
    state.activeMarkerKey = key;
    state.visibleLimit = PAGE_SIZE;
    render();
    els["results-heading"].focus();
  };

  async function start() {
    cacheElements();
    initializeMap();
    try {
      const response = await fetch("data/app-data.json");
      if (!response.ok) throw new Error(`Data request failed (${response.status})`);
      state.data = await response.json();
      state.minYear = state.data.meta.yearMin;
      state.maxYear = state.data.meta.yearMax;
      state.data.records.forEach((record) => state.recordsById.set(record.id, record));
      els["year-min"].min = els["year-max"].min = state.minYear;
      els["year-min"].max = els["year-max"].max = state.maxYear;
      els["year-min"].value = state.minYear;
      els["year-max"].value = state.maxYear;
      els["year-output"].value = `${state.minYear}–${state.maxYear}`;
      buildPeriodOptions();
      registerEvents();
      render();
    } catch (error) {
      console.error(error);
      els["status-message"].textContent = "The map data could not be loaded. Open this project through a web server or GitHub Pages; the complete CSV remains available from the header.";
      els["result-count"].textContent = "Data unavailable";
    }
  }

  document.addEventListener("DOMContentLoaded", start);
})();
