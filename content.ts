import "./content.css"

export const config = {
  matches: [
    "https://store.steampowered.com/app/*",
    "https://store.steampowered.com/agecheck/app/*"
  ]
}

const CHIP_ATTR = "data-steamlib-chip"
const CHIP_CLASS = "goodlib-chip"
const CHIPS_WRAP_ATTR = "data-steamlib-chip-wrap"
const GOG_ENABLED_KEY = "gogEnabled"
const GOG_GAMES_ENABLED_KEY = "gogGamesEnabled"
const FITGIRL_ENABLED_KEY = "fitgirlEnabled"
const DODI_ENABLED_KEY = "dodiEnabled"
const BYXATAB_ENABLED_KEY = "byxatabEnabled"
const STEAMRIP_ENABLED_KEY = "steamripEnabled"
const OVA_GAMES_ENABLED_KEY = "ovaGamesEnabled"

const steamTitleSelectors = [
  "#appHubAppName",
  ".apphub_AppName",
  "div.apphub_AppName"
]

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

const getGogSearchQuery = (query: string) =>
  normalizeText(query.replace(/[™®©]/g, " ").replace(/[’]/g, "'"))

const getGameTitle = (): HTMLElement | null => {
  for (const selector of steamTitleSelectors) {
    const nodes = document.querySelectorAll(selector)
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index]
      if (!(node instanceof HTMLElement)) continue
      const text = normalizeText(node.textContent ?? "")
      if (text.length === 0) continue
      if (node.offsetParent === null) continue
      return node
    }
  }

  return null
}

const getCleanGameTitle = (title: HTMLElement): string => {
  const clone = title.cloneNode(true) as HTMLElement
  const injectedWrap = clone.querySelector(`[${CHIPS_WRAP_ATTR}]`)
  if (injectedWrap) {
    injectedWrap.remove()
  }

  return normalizeText(clone.textContent ?? "")
}

const removeChip = () => {
  const chips = document.querySelectorAll(`[${CHIP_ATTR}]`)
  chips.forEach((chip) => chip.remove())

  const wrap = document.querySelector(`[${CHIPS_WRAP_ATTR}]`)
  if (wrap && wrap.childElementCount === 0) {
    wrap.remove()
  }
}

type SourceKey =
  | "gog"
  | "goggames"
  | "fitgirl"
  | "dodi"
  | "byxatab"
  | "steamrip"
  | "ovagames"

const sourceKeys: SourceKey[] = [
  "gog",
  "goggames",
  "fitgirl",
  "dodi",
  "byxatab",
  "steamrip",
  "ovagames"
]

const sourceMeta: Record<
  SourceKey,
  { glyph: string; label: string; storageKey: string }
> = {
  gog: {
    label: "GOG",
    glyph: "G",
    storageKey: GOG_ENABLED_KEY
  },
  goggames: {
    label: "GOG Games",
    glyph: "GG",
    storageKey: GOG_GAMES_ENABLED_KEY
  },
  fitgirl: {
    label: "FitGirl",
    glyph: "FG",
    storageKey: FITGIRL_ENABLED_KEY
  },

  dodi: { 
    label: "DODI", 
    glyph: "D", 
    storageKey: DODI_ENABLED_KEY },
  byxatab: {
    label: "ByXatab",
    glyph: "BX",
    storageKey: BYXATAB_ENABLED_KEY
  },
  steamrip: {
    label: "SteamRIP",
    glyph: "SR",
    storageKey: STEAMRIP_ENABLED_KEY
  },
  ovagames: {
    label: "OVA Games",
    glyph: "OVA",
    storageKey: OVA_GAMES_ENABLED_KEY
  }
}

const defaultEnabledBySource: Record<SourceKey, boolean> = {
  gog: true,
  goggames: false,
  fitgirl: false,
  dodi: false,
  byxatab: false,
  steamrip: false,
  ovagames: false
}

const buildSourceUrl = (source: SourceKey, query: string) => {
  const encoded = encodeURIComponent(query)

  if (source === "gog") {
    const gogQuery = encodeURIComponent(getGogSearchQuery(query))
    return `https://www.gog.com/en/games?query=${gogQuery}&order=desc:score`
  }

  if (source === "goggames") {
    const gogGamesQuery = encodeURIComponent(getGogSearchQuery(query))
    return `https://gog-games.to/?search=${gogGamesQuery}`
  }

  if (source === "dodi") {
    return `https://dodi-repacks.site/?s=${encoded}`
  }

  if (source === "byxatab") {
    return `https://byxatab.com/index.php?do=search&subaction=search&story=${encoded}`
  }

  if (source === "steamrip") {
    return `https://steamrip.com/?s=${encoded}`
  }

  if (source === "ovagames") {
    return `https://www.ovagames.com/?s=${encoded}`
  }

  return `https://fitgirl-repacks.site/?s=${encoded}`
}

const makeChip = (source: SourceKey, searchQuery: string) => {
  const chip = document.createElement("span")
  chip.setAttribute(CHIP_ATTR, source)
  chip.className = `${CHIP_CLASS} ${CHIP_CLASS}--${source}`
  chip.setAttribute("data-search-query", searchQuery)

  const glyph = sourceMeta[source].glyph
  const glyphClass =
    glyph.length > 1 ? "goodlib-chip-glyph goodlib-chip-glyph--wide" : "goodlib-chip-glyph"

  const icon = document.createElement("span")
  icon.className = "goodlib-chip-icon"

  const glyphNode = document.createElement("span")
  glyphNode.className = glyphClass
  glyphNode.textContent = glyph
  icon.appendChild(glyphNode)

  const label = document.createElement("span")
  label.className = "goodlib-chip-label"
  label.textContent = sourceMeta[source].label

  chip.replaceChildren(icon, label)
  chip.addEventListener("click", () => {
    const query = chip.getAttribute("data-search-query") ?? searchQuery
    window.open(buildSourceUrl(source, query), "_blank", "noopener,noreferrer")
  })

  return chip
}

const injectChips = (enabledBySource: Record<SourceKey, boolean>) => {
  const title = getGameTitle()
  if (!title) return

  const gameTitle = getCleanGameTitle(title)
  if (!gameTitle) return

  let wrap = title.querySelector(`[${CHIPS_WRAP_ATTR}]`)
  if (!(wrap instanceof HTMLElement)) {
    wrap = document.createElement("span")
    wrap.setAttribute(CHIPS_WRAP_ATTR, "true")
    wrap.className = "goodlib-chip-wrap"
    title.appendChild(wrap)
  }

  const orderedChips: HTMLElement[] = []

  for (const source of sourceKeys) {
    let chip = wrap.querySelector(`[${CHIP_ATTR}="${source}"]`)
    if (!(chip instanceof HTMLElement) && enabledBySource[source]) {
      chip = makeChip(source, gameTitle)
    }

    if (chip instanceof HTMLElement && enabledBySource[source]) {
      chip.setAttribute("data-search-query", gameTitle)
      orderedChips.push(chip)
    }
  }

  const currentOrder = Array.from(wrap.children).filter(
    (node) => node instanceof HTMLElement && node.hasAttribute(CHIP_ATTR)
  )

  const needsReorder =
    currentOrder.length !== orderedChips.length ||
    currentOrder.some((node, index) => node !== orderedChips[index])

  if (needsReorder) {
    wrap.replaceChildren(...orderedChips)
  }
}

const enabledBySource: Record<SourceKey, boolean> = { ...defaultEnabledBySource }

const syncChipToState = () => {
  if (sourceKeys.every((source) => !enabledBySource[source])) {
    removeChip()
    return
  }

  injectChips(enabledBySource)
}

const initializeEnabledState = () => {
  chrome.storage.sync.get(
    sourceKeys.map((source) => sourceMeta[source].storageKey),
    (result) => {
      for (const source of sourceKeys) {
        const storedValue = result[sourceMeta[source].storageKey]
        enabledBySource[source] =
          typeof storedValue === "boolean"
            ? storedValue
            : defaultEnabledBySource[source]
      }

      syncChipToState()
    }
  )
}

let injectTimeout: ReturnType<typeof setTimeout> | null = null
let lastUrl = window.location.href

const handleDomChange = () => {
  if (sourceKeys.every((source) => !enabledBySource[source])) {
    return
  }

  if (injectTimeout) {
    clearTimeout(injectTimeout)
  }

  injectTimeout = setTimeout(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href
      removeChip()
    }
    injectChips(enabledBySource)
  }, 120)
}

const startObservers = () => {
  if (!(document.body instanceof HTMLElement)) {
    return
  }

  const observer = new MutationObserver(handleDomChange)
  observer.observe(document.body, { childList: true, subtree: true })

  setInterval(() => {
    if (lastUrl !== window.location.href) {
      handleDomChange()
    }
  }, 500)
}

initializeEnabledState()

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      startObservers()
      handleDomChange()
    },
    { once: true }
  )
} else {
  startObservers()
  handleDomChange()
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return

  for (const source of sourceKeys) {
    const change = changes[sourceMeta[source].storageKey]
    if (!change) {
      continue
    }

    enabledBySource[source] =
      typeof change.newValue === "boolean"
        ? change.newValue
        : defaultEnabledBySource[source]
  }

  syncChipToState()
})
