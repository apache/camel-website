/* global $ instantsearch algoliasearch */

const searchClient = algoliasearch(
  'NF2UGSG10Y',
  'cb696d6060df9f04ee84c4f6e15fd3b4'
)

const autocomplete = instantsearch.connectors.connectAutocomplete(
  ({ indices, refine, widgetParams }, isFirstRendering) => {
    const { container, onSelectChange } = widgetParams

    if (isFirstRendering) {
      container.html('<select id="ais-autocomplete"></select>')

      container.find('select').selectize({
        options: [],
        valueField: 'title',
        labelField: 'title',
        highlight: false,
        onType: refine,
        onBlur () {
          refine(this.getValue())
        },
        score () {
          return function () {
            return 1
          }
        },
        onChange (value) {
          onSelectChange(value)
          refine(value)
        },
      })

      return
    }

    const [select] = container.find('select')

    indices.forEach((index) => {
      select.selectize.clearOptions()
      index.results.hits.forEach((h) => select.selectize.addOption(h))
      select.selectize.refreshOptions(select.selectize.isOpen)
    })
  }
)

const suggestions = instantsearch({
  indexName: 'Apache Camel-website',
  searchClient,
})

suggestions.addWidget(
  instantsearch.widgets.configure({
    hitsPerPage: 5,
  })
)

suggestions.addWidget(
  autocomplete({
    container: $('#autocomplete'),
    onSelectChange (value) {
      search.helper.setQuery(value).search()
    },
  })
)

const search = instantsearch({
  indexName: 'Apache Camel-website',
  searchClient,
})

search.addWidget(
  instantsearch.widgets.configure({
    hitsPerPage: 10,
  })
)

// search.addWidget(
//   instantsearch.widgets.hits({
//     container: '#hits',
//     templates: {
//       item: `
//         <div>
//           <header class="hit-name">
//             {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
//           </header>
//           <p class="hit-description">
//             {{#helpers.highlight}}{ "attribute": "description" }{{/helpers.highlight}}
//           </p>
//         </div>
//       `,
//     },
//   })
// );

suggestions.start()
search.start()
