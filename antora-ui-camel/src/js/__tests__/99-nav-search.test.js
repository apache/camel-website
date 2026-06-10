'use strict'

/**
 * Unit tests for 99-nav-search.js
 *
 * Tests the tokenize helper and the nav search filtering logic.
 */

// --- Helper extracted from 99-nav-search.js ---
function tokenize (c) {
  return '.*' + c + '.*'
}

function buildSearchRegex (value) {
  const tokens = value.split('')
  return new RegExp(tokens.map(tokenize).join(''), 'i')
}

// --- Tests ---
describe('nav-search: tokenize', () => {
  test('wraps character in .* wildcards', () => {
    expect(tokenize('a')).toBe('.*a.*')
  })

  test('works with special regex characters', () => {
    expect(tokenize('.')).toBe('.*..*')
  })
})

describe('nav-search: buildSearchRegex', () => {
  test('empty string matches everything', () => {
    const regex = buildSearchRegex('')
    expect(regex.test('anything')).toBe(true)
    expect(regex.test('')).toBe(true)
  })

  test('single character matches text containing it (case-insensitive)', () => {
    const regex = buildSearchRegex('c')
    expect(regex.test('Camel')).toBe(true)
    expect(regex.test('dog')).toBe(false)
  })

  test('multi-character fuzzy matches correctly', () => {
    const regex = buildSearchRegex('cam')
    expect(regex.test('camel')).toBe(true)
    expect(regex.test('CAMEL Framework')).toBe(true)
    expect(regex.test('dogs')).toBe(false)
  })
})

describe('nav-search: DOM filtering', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="nav-panel-menu">
        <input class="search" type="text" />
        <ul>
          <li><a class="nav-link" href="#">Camel Core</a></li>
          <li><a class="nav-link" href="#">Camel Kafka</a></li>
          <li><a class="nav-link" href="#">Apache Spark</a></li>
        </ul>
      </div>
    `
  })

  test('nav search input exists in DOM', () => {
    const navSearch = document.querySelector('.nav-panel-menu input.search')
    expect(navSearch).not.toBeNull()
  })

  test('nav links are present in DOM', () => {
    const navLinks = document.querySelectorAll('.nav-link')
    expect(navLinks.length).toBe(3)
  })

  test('filtering adds "filtered" class to non-matching links', () => {
    const navLinks = document.querySelectorAll('.nav-link')
    const term = buildSearchRegex('kafka')
    for (let i = 0; i < navLinks.length; i++) {
      const text = navLinks[i].textContent
      if (!term.test(text)) {
        navLinks[i].classList.add('filtered')
      } else {
        navLinks[i].classList.remove('filtered')
      }
    }
    expect(navLinks[0].classList.contains('filtered')).toBe(true)  // Camel Core
    expect(navLinks[1].classList.contains('filtered')).toBe(false) // Camel Kafka
    expect(navLinks[2].classList.contains('filtered')).toBe(true)  // Apache Spark
  })

  test('clearing search removes "filtered" class from all links', () => {
    const navLinks = document.querySelectorAll('.nav-link')
    // First filter
    navLinks.forEach((link) => link.classList.add('filtered'))
    // Then clear
    const term = buildSearchRegex('')
    navLinks.forEach((link) => {
      if (term.test(link.textContent)) link.classList.remove('filtered')
    })
    navLinks.forEach((link) => {
      expect(link.classList.contains('filtered')).toBe(false)
    })
  })
})
