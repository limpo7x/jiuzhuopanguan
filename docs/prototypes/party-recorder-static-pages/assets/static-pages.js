(function () {
  var search = document.getElementById('pageSearch')
  if (search) {
    search.addEventListener('input', function () {
      var keyword = search.value.trim().toLowerCase()
      document.querySelectorAll('[data-title][data-route]').forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-route') || '',
          item.getAttribute('data-status') || '',
          item.textContent || ''
        ].join(' ').toLowerCase()
        item.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1)
      })
    })
  }

  document.querySelectorAll('.route-link-missing').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault()
    })
  })
})()
