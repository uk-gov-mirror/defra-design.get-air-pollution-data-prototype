//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
})


document.getElementById('filterSubmit').addEventListener('click', function () {
  const selectedValue = document.querySelector('input[name="radius"]:checked').value;

  if (selectedValue === 'filternow') {
    window.location.href = '/version-6/filter-first/filters-completed.html';
  } else if (selectedValue === 'filterlater') {
    window.location.href = '/version-6/no-filter/results-b2-4qa.html';
  }
});
