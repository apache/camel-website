function responsiveTables() {
  this.process((doc, output) => {
    return output.replace(/<table/g, '<div class="table-wrapper"><table').replace(/<\/table>/g, '</table></div>')
  })
}

module.exports.register = (registry, context) => {
  registry.postprocessor(responsiveTables)
}
