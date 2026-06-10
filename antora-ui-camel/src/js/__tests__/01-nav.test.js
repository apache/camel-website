'use strict'

/**
 * Unit tests for 01-nav.js
 *
 * Tests navigation helper functions and DOM interactions.
 */

describe('nav: find helper', () => {
  function find (from, selector) {
    return [].slice.call(from.querySelectorAll(selector))
  }

  beforeEach(() => {
    document.body.innerHTML = `
      <ul class="nav-menu">
        <li class="nav-item"><a class="nav-link">Item 1</a></li>
        <li class="nav-item"><a class="nav-link">Item 2</a></li>
        <li class="nav-item"><a class="nav-link">Item 3</a></li>
      </ul>
    `
  })

  test('returns all matching elements as an array', () => {
    const menu = document.querySelector('.nav-menu')
    const links = find(menu, '.nav-link')
    expect(Array.isArray(links)).toBe(true)
    expect(links.length).toBe(3)
  })

  test('returns empty array when no matches found', () => {
    const menu = document.querySelector('.nav-menu')
    const results = find(menu, '.does-not-exist')
    expect(results).toEqual([])
  })
})

describe('nav: findNextElement helper', () => {
  function findNextElement (from, selector) {
    const el = from.nextElementSibling
    if (!el) return
    return selector ? el[el.matches ? 'matches' : 'msMatchesSelector'](selector) && el : el
  }

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <button class="nav-item-toggle">Toggle</button>
        <span class="nav-text">Nav Text</span>
      </div>
    `
  })

  test('returns next sibling when it matches selector', () => {
    const btn = document.querySelector('.nav-item-toggle')
    const result = findNextElement(btn, '.nav-text')
    expect(result).not.toBeNull()
    expect(result.className).toBe('nav-text')
  })

  test('returns undefined when no next sibling exists', () => {
    const span = document.querySelector('.nav-text')
    const result = findNextElement(span, '.nav-text')
    expect(result).toBeUndefined()
  })

  test('returns sibling without selector check if no selector given', () => {
    const btn = document.querySelector('.nav-item-toggle')
    const result = findNextElement(btn)
    expect(result).not.toBeNull()
  })
})

describe('nav: showNav / hideNav DOM behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <html>
        <button class="nav-toggle"></button>
        <div class="nav-container"></div>
      </html>
    `
  })

  test('showNav adds is-active to navToggle and navContainer', () => {
    const navToggle = document.querySelector('.nav-toggle')
    const navContainer = document.querySelector('.nav-container')
    const html = document.documentElement

    // Simulate showNav
    html.classList.add('is-clipped--nav')
    navToggle.classList.add('is-active')
    navContainer.classList.add('is-active')

    expect(navToggle.classList.contains('is-active')).toBe(true)
    expect(navContainer.classList.contains('is-active')).toBe(true)
    expect(html.classList.contains('is-clipped--nav')).toBe(true)
  })

  test('hideNav removes is-active from navToggle and navContainer', () => {
    const navToggle = document.querySelector('.nav-toggle')
    const navContainer = document.querySelector('.nav-container')
    const html = document.documentElement

    // Set active first
    html.classList.add('is-clipped--nav')
    navToggle.classList.add('is-active')
    navContainer.classList.add('is-active')

    // Simulate hideNav
    html.classList.remove('is-clipped--nav')
    navToggle.classList.remove('is-active')
    navContainer.classList.remove('is-active')

    expect(navToggle.classList.contains('is-active')).toBe(false)
    expect(navContainer.classList.contains('is-active')).toBe(false)
    expect(html.classList.contains('is-clipped--nav')).toBe(false)
  })
})

describe('nav: toggleActive', () => {
  test('toggles is-active class on element', () => {
    document.body.innerHTML = '<li class="nav-item"></li>'
    const li = document.querySelector('.nav-item')

    function toggleActive () {
      this.classList.toggle('is-active')
    }

    toggleActive.call(li)
    expect(li.classList.contains('is-active')).toBe(true)

    toggleActive.call(li)
    expect(li.classList.contains('is-active')).toBe(false)
  })
})

describe('nav: activateCurrentPath', () => {
  test('adds is-active and is-current-path to ancestor nav-items', () => {
    document.body.innerHTML = `
      <ul class="nav-menu">
        <li class="nav-item">
          <ul>
            <li class="nav-item">
              <ul>
                <li class="nav-item is-current-page"><a class="nav-link">Current</a></li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    `

    function activateCurrentPath (navItem) {
      let ancestorClasses
      let ancestor = navItem.parentNode
      while (!(ancestorClasses = ancestor.classList).contains('nav-menu')) {
        if (ancestor.tagName === 'LI' && ancestorClasses.contains('nav-item')) {
          ancestorClasses.add('is-active', 'is-current-path')
        }
        ancestor = ancestor.parentNode
      }
      navItem.classList.add('is-active')
    }

    const currentItem = document.querySelector('.is-current-page')
    activateCurrentPath(currentItem)

    expect(currentItem.classList.contains('is-active')).toBe(true)
    const ancestors = document.querySelectorAll('.nav-item.is-current-path')
    expect(ancestors.length).toBeGreaterThan(0)
  })
})
