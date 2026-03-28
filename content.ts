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
const FITGIRL_ENABLED_KEY = "fitgirlEnabled"
const DODI_ENABLED_KEY = "dodiEnabled"
const BYXATAB_ENABLED_KEY = "byxatabEnabled"
const STEAMRIP_ENABLED_KEY = "steamripEnabled"

const steamTitleSelectors = [
  "#appHubAppName",
  ".apphub_AppName",
  "div.apphub_AppName"
]

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

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

type SourceKey = "fitgirl" | "dodi" | "byxatab" | "steamrip"

const sourceMeta: Record<SourceKey, { label: string; glyph: string }> = {
  fitgirl: { label: "FitGirl", glyph: "FG" },
  dodi: { label: "DODI", glyph: "D" },
  byxatab: { label: "ByXatab", glyph: "BX" },
  steamrip: { label: "SteamRIP", glyph: "SR" }
}

const buildSourceUrl = (source: SourceKey, query: string) => {
  const encoded = encodeURIComponent(query)

  if (source === "dodi") {
    return `https://dodi-repacks.site/?s=${encoded}`
  }

  if (source === "byxatab") {
    return `https://byxatab.com/index.php?do=search&subaction=search&story=${encoded}`
  }

  if (source === "steamrip") {
    return `https://steamrip.com/?s=${encoded}`
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

  let fitgirlChip = wrap.querySelector(`[${CHIP_ATTR}="fitgirl"]`)
  if (!(fitgirlChip instanceof HTMLElement) && enabledBySource.fitgirl) {
    fitgirlChip = makeChip("fitgirl", gameTitle)
  }
  if (fitgirlChip instanceof HTMLElement && enabledBySource.fitgirl) {
    fitgirlChip.setAttribute("data-search-query", gameTitle)
    orderedChips.push(fitgirlChip)
  }

  let dodiChip = wrap.querySelector(`[${CHIP_ATTR}="dodi"]`)
  if (!(dodiChip instanceof HTMLElement) && enabledBySource.dodi) {
    dodiChip = makeChip("dodi", gameTitle)
  }
  if (dodiChip instanceof HTMLElement && enabledBySource.dodi) {
    dodiChip.setAttribute("data-search-query", gameTitle)
    orderedChips.push(dodiChip)
  }

  let byxatabChip = wrap.querySelector(`[${CHIP_ATTR}="byxatab"]`)
  if (!(byxatabChip instanceof HTMLElement) && enabledBySource.byxatab) {
    byxatabChip = makeChip("byxatab", gameTitle)
  }
  if (byxatabChip instanceof HTMLElement && enabledBySource.byxatab) {
    byxatabChip.setAttribute("data-search-query", gameTitle)
    orderedChips.push(byxatabChip)
  }

  let steamripChip = wrap.querySelector(`[${CHIP_ATTR}="steamrip"]`)
  if (!(steamripChip instanceof HTMLElement) && enabledBySource.steamrip) {
    steamripChip = makeChip("steamrip", gameTitle)
  }
  if (steamripChip instanceof HTMLElement && enabledBySource.steamrip) {
    steamripChip.setAttribute("data-search-query", gameTitle)
    orderedChips.push(steamripChip)
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

const enabledBySource: Record<SourceKey, boolean> = {
  fitgirl: true,
  dodi: true,
  byxatab: true,
  steamrip: true
}

const syncChipToState = () => {
  if (
    !enabledBySource.fitgirl &&
    !enabledBySource.dodi &&
    !enabledBySource.byxatab &&
    !enabledBySource.steamrip
  ) {
    removeChip()
    return
  }

  injectChips(enabledBySource)
}

const initializeEnabledState = () => {
  chrome.storage.sync.get(
    [FITGIRL_ENABLED_KEY, DODI_ENABLED_KEY, BYXATAB_ENABLED_KEY, STEAMRIP_ENABLED_KEY],
    (result) => {
      const fitgirlStored = result[FITGIRL_ENABLED_KEY]
      const dodiStored = result[DODI_ENABLED_KEY]
      const byxatabStored = result[BYXATAB_ENABLED_KEY]
      const steamripStored = result[STEAMRIP_ENABLED_KEY]

      enabledBySource.fitgirl =
        typeof fitgirlStored === "boolean" ? fitgirlStored : true
      enabledBySource.dodi = typeof dodiStored === "boolean" ? dodiStored : true
      enabledBySource.byxatab =
        typeof byxatabStored === "boolean" ? byxatabStored : true
      enabledBySource.steamrip =
        typeof steamripStored === "boolean" ? steamripStored : true

      syncChipToState()
    }
  )
}

let injectTimeout: ReturnType<typeof setTimeout> | null = null
let lastUrl = window.location.href

const handleDomChange = () => {
  if (
    !enabledBySource.fitgirl &&
    !enabledBySource.dodi &&
    !enabledBySource.byxatab &&
    !enabledBySource.steamrip
  ) {
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

  if (FITGIRL_ENABLED_KEY in changes) {
    const fitgirlNext = changes[FITGIRL_ENABLED_KEY].newValue
    enabledBySource.fitgirl =
      typeof fitgirlNext === "boolean" ? fitgirlNext : true
  }
  if (DODI_ENABLED_KEY in changes) {
    const dodiNext = changes[DODI_ENABLED_KEY].newValue
    enabledBySource.dodi = typeof dodiNext === "boolean" ? dodiNext : true
  }
  if (BYXATAB_ENABLED_KEY in changes) {
    const byxatabNext = changes[BYXATAB_ENABLED_KEY].newValue
    enabledBySource.byxatab =
      typeof byxatabNext === "boolean" ? byxatabNext : true
  }
  if (STEAMRIP_ENABLED_KEY in changes) {
    const steamripNext = changes[STEAMRIP_ENABLED_KEY].newValue
    enabledBySource.steamrip =
      typeof steamripNext === "boolean" ? steamripNext : true
  }

  syncChipToState()
})
