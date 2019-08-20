/* global $ instantsearch algoliasearch */

// algolia search client
const algoliaClient = algoliasearch(
  'NF2UGSG10Y',
  'cb696d6060df9f04ee84c4f6e15fd3b4'
)

const searchClient = {
  search (requests) {
    if (requests.every(({ params }) => !params.query)) {
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          processingTimeMS: 0,
        })),
      })
    }

    return algoliaClient.search(requests)
  },
}

// custom widget for autocomplete
const autocomplete = instantsearch.connectors.connectAutocomplete(
  ({ indices, refine, widgetParams }, isFirstRendering) => {
    const { container, onSelectChange } = widgetParams

    if (isFirstRendering) {
      container.html('<select id="ais-autocomplete"></select>')

      container.find('select').selectize({
        options: [],
        valueField: 'permalink',
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
      index.results.hits.forEach((hit) => select.selectize.addOption(hit))
      select.selectize.refreshOptions(select.selectize.isOpen)
    })
  }
)

// suggestions instance
const suggestions = instantsearch({
  indexName: 'hugo_camel_website',
  searchClient,
})

// to set number of suggestions to show at a time
suggestions.addWidget(
  instantsearch.widgets.configure({
    hitsPerPage: 5,
  })
)

// to show suggestions
suggestions.addWidget(
  autocomplete({
    container: $('#autocomplete'),
    onSelectChange (value) {
      search.helper.setQuery(value).search()
    },
  })
)

// instant search instance
const search = instantsearch({
  indexName: 'hugo_camel_website',
  searchClient,
})

// to set number of results to show at a time
search.addWidget(
  instantsearch.widgets.configure({
    hitsPerPage: 10,
  })
)

//to show search results
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: `
      {{#query}}
        No results for <q>{{query}}</q>
      {{/query}}
    `,
      item: `
      <article>
        <h1>
          <a href="{{ permalink }}">
            {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
          </a>
        </h1>
      </article>
    `,
    },
  })
)

suggestions.start() // method to actually start the suggestions
search.start() // method to actually start the search
