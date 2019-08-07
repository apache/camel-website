function removeInlineStyle() {
  this.process((doc, output) => {
    return output.replace(/\s*style="[^"]+"\s*/g, '')
  })
}

module.exports.register = (registry, context) => {
  registry.postprocessor(removeInlineStyle)
}
