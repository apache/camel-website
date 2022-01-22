/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const RESOURCEID_RX = /[^$]*\$json\/(.*)\.json/

const SPECIAL_CHARS = /[<>&]/g

const REPLACEMENTS = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
}

module.exports = {
  alias: (name, aliases) => {
    for (expr of (aliases || '').split(',')) {
      const {pattern, alias} = splitOnce(expr)
      const re = new RegExp(pattern, 'i')
      if (re.test(name)) {
        return alias
      }
    }
    return ''
  },

  boldLink: (text, idPrefix, suffix = '') => {
    const idText = `_${idPrefix}_${text.split('.').join('_')}`
    text = suffix ? `*${text}* (${suffix})` : `*${text}*`
    return  `[[${idText}]]\nxref:#${idText}['',role=anchor]${text}`
  },

  description: (value) => {
    try {
      return module.exports.strong(value, 'Autowired')
        + module.exports.strong(value, 'Required')
        + module.exports.strong(value, 'Deprecated')
        + (value.description ? module.exports.escapeAttributes(value.description) + (value.description.endsWith('.') ? '' : '.') : '')
        + (value.deprecatedNote ? `\n\nNOTE: ${value.deprecatedNote}` : '')
        + (value.enum ? `${['\n\nEnum values:\n'].concat(value.enum).join('\n* ')}` : '')
    } catch (e) {
      console.log('error', e)
      return e.msg()
    }
  },

  escapeAttributes: (text) => {
    return text ? text.split('{').join('\\{') : text
  },

  extractSBName: (resourceid) => {
    const m =resourceid.match(RESOURCEID_RX)
    return m ? m[1] : 'no match'
  },

  formatSignature: (signature) => {
    return signature.split('$').join('.') + ';'
  },

  javaSimpleName: (name) => {
    return name.split(/<.*>/).join('').split('.').pop()
  },

  pascalCase: (input) => {
    return input ?
      input.split('-').map((segment) => {
        return segment.length ?
          segment.charAt(0).toUpperCase() + segment.slice(1) :
          segment
      }).join('') :
      input
  },

  producerConsumerLong: (consumerOnly, producerOnly) => {
    if (consumerOnly) return 'Only consumer is supported'
    if (producerOnly) return 'Only producer is supported'
    return 'Both producer and consumer are supported'
  },

  //Presumably temporary until asciidoctor-jsonpath can do this
  //used from camel-kafka-connector template.
  scSubs: (string) => string.replace(SPECIAL_CHARS, (m) => REPLACEMENTS[m]),

  starterArtifactId: (data) => {
    return data['starter-artifactid'] ? data['starter-artifactid'] : `${data.artifactid}-starter`
  },

  strong: (data, text) => {
    return trueEnough(data[text.toLowerCase()]) ? `*${text}* ` : ''
  },

  valueAsString: (value) => {
    return value === undefined ? '' : `${value}`
  },

//  Compatibility table support
  camelRef: (version, docVersion) => (docVersion === 'none') ? version : `xref:${docVersion}@components:ROOT:index.adoc[${version}]`,

  ckRef: (version, docVersion) => (docVersion === 'none') ? version : `xref:${docVersion}@camel-k:ROOT:index.adoc[${version}]`,

  ckcRef: (version, docVersion) => (docVersion === 'none') ? version : `xref:${docVersion}@camel-kafka-connector:ROOT:index.adoc[${version}]`,

  kameletsRef: (version, docVersion) => (docVersion === 'none') ? version : `xref:${docVersion}@camel-kamelets:ROOT:index.adoc[${version}]`,

  camelQuarkusRef: (version, docVersion) => (docVersion === 'none') ? version : `xref:${docVersion}@camel-quarkus:ROOT:index.adoc[${version}]`,

// External dependency links for compatibility tables
  graalvmRef: (version, docVersion) => `https://www.graalvm.org/${docVersion}/docs/[${version}]`,

  kafkaRef: (version, docVersion) => `https://kafka.apache.org/${docVersion}/documentation.html[${version}]`,

  quarkusRef: (version) => `https://quarkus.io/guides[${version}]`,

  //Sorts next, then versions descending
  sortCompatibilityItems: (items) => items.sort((t1, t2) => {
    const v1 = t1['page-component-version']
    const v2 = t2['page-component-version']
    if (v1 === v2) return 0
    if ((v1 === 'next') || !v2) return -1
    if ((v2 === 'next') || !v1) return 1
    const v1s = v1.split('.').map((t) => Number(t))
    const v2s = v2.split('.').map((t) => Number(t))
    let i
    for (i = 0; i < v1s.length; i++) {
      if (i === v2s.length) return -1
      if (v1s[i] !== v2s[i]) return v2s[i] - v1s[i] // could be a problem with NaN?
    }
    return 1
  })
}

function trueEnough (value) {
  return (value === true) || (value === 'true')
}

function splitOnce (querySpec, token = '=') {
  const index = querySpec.indexOf(token)
  const pattern = querySpec.substring(0, index).trim()
  const alias = querySpec.substring(index + 1).trim()
  return { pattern, alias }
}
