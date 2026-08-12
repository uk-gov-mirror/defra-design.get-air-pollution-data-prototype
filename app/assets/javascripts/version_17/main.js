//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.querySelector('button.govuk-button--secondary');
  const submitButton = document.querySelector('button.govuk-button:not(.govuk-button--secondary)');
  const table = document.getElementById('pollutant-table');
  const tableBody = table.querySelector('tbody');
  let count = 0;
  const addedPollutants = new Set(); // Track unique values

  // 🔁 Helper function to update button text
  function updateAddButtonText() {
    if (tableBody.children.length > 0) {
      addButton.textContent = 'Add another pollutant';
    } else {
      addButton.textContent = 'Add pollutant';
    }
  }

  // 1. Restore any previously stored pollutants
  const stored = sessionStorage.getItem('selectedPollutants');
  if (stored) {
    const pollutants = JSON.parse(stored);

    pollutants.forEach((value) => {
      count++;
      addedPollutants.add(value.toLowerCase());

      const row = document.createElement('tr');
      row.className = 'govuk-table__row';

      const headerCell = document.createElement('th');
      headerCell.scope = 'row';
      headerCell.className = 'govuk-table__header';
      headerCell.textContent = `Pollutant ${count}`;

      const valueCell = document.createElement('td');
      valueCell.className = 'govuk-table__cell';
      valueCell.textContent = value;

      const actionCell = document.createElement('td');
      actionCell.className = 'govuk-table__cell';

      const removeLink = document.createElement('a');
      removeLink.href = '#';
      removeLink.className = 'govuk-link';
      removeLink.textContent = 'Remove';

      removeLink.addEventListener('click', function (e) {
        e.preventDefault();
        row.remove();
        addedPollutants.delete(value.toLowerCase());
        if (tableBody.children.length === 0) {
          table.hidden = true;
          count = 0;
        }
        updateAddButtonText(); // ✅ Update text after removal
      });

      actionCell.appendChild(removeLink);
      row.appendChild(headerCell);
      row.appendChild(valueCell);
      row.appendChild(actionCell);
      tableBody.appendChild(row);

      table.hidden = false;
    });

    updateAddButtonText(); // ✅ Update button text after restoring pollutants
  }

  // 2. Add new pollutant with duplicate check
  addButton.addEventListener('click', function (e) {
    e.preventDefault();

    const input = document.querySelector('#my-autocomplete');
    if (!input) return;

    const value = input.value.trim();
    if (!value) {
      alert('Please select a pollutant.');
      return;
    }

    const lowerValue = value.toLowerCase();
    if (addedPollutants.has(lowerValue)) {
      const errorSummary = document.getElementById('duplicate-error');
      if (errorSummary) {
        errorSummary.hidden = false;
        errorSummary.focus();
        errorSummary.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    count++;
    addedPollutants.add(lowerValue);

    if (table.hidden) table.hidden = false;

    const row = document.createElement('tr');
    row.className = 'govuk-table__row';

    const headerCell = document.createElement('th');
    headerCell.scope = 'row';
    headerCell.className = 'govuk-table__header';
    headerCell.textContent = `Pollutant ${count}`;

    const valueCell = document.createElement('td');
    valueCell.className = 'govuk-table__cell';
    valueCell.textContent = value;

    const actionCell = document.createElement('td');
    actionCell.className = 'govuk-table__cell';

    const removeLink = document.createElement('a');
    removeLink.href = '#';
    removeLink.className = 'govuk-link';
    removeLink.textContent = 'Remove';

    removeLink.addEventListener('click', function (e) {
      e.preventDefault();
      row.remove();
      addedPollutants.delete(lowerValue);
      if (tableBody.children.length === 0) {
        table.hidden = true;
        count = 0;
      }
      updateAddButtonText(); // ✅ Update text after removal
    });

    actionCell.appendChild(removeLink);
    row.appendChild(headerCell);
    row.appendChild(valueCell);
    row.appendChild(actionCell);
    tableBody.appendChild(row);

    input.value = '';

    const errorSummary = document.getElementById('duplicate-error');
    if (errorSummary) {
      errorSummary.hidden = true;
    }

    updateAddButtonText(); // ✅ Update text after adding
  });

  // 3. Submit and save to sessionStorage
  submitButton.addEventListener('click', function (e) {
    e.preventDefault();

    let pollutants = [];

    if (!table.hidden && tableBody.children.length > 0) {
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const name = row.querySelector('td').textContent.trim();
        pollutants.push(name);
      });
    } else {
      const input = document.querySelector('#my-autocomplete');
      if (input && input.value.trim()) {
        pollutants.push(input.value.trim());
      }
    }

    sessionStorage.setItem('selectedPollutants', JSON.stringify(pollutants));
    window.location.href = 'create-pollutant.html';
  });
});
