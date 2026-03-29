import { animate } from "animejs"
import { useEffect, useState } from "react"

import "./popup.css"
import mascotCat from "./mascot cat.png"

const FITGIRL_ENABLED_KEY = "fitgirlEnabled"
const DODI_ENABLED_KEY = "dodiEnabled"
const BYXATAB_ENABLED_KEY = "byxatabEnabled"
const STEAMRIP_ENABLED_KEY = "steamripEnabled"
const OVA_GAMES_ENABLED_KEY = "ovaGamesEnabled"

type SourceKey = "fitgirl" | "dodi" | "byxatab" | "steamrip" | "ovagames"

type SourceConfig = {
  avatarClassName: string
  avatarText: string
  label: string
  rowClassName: string
  storageKey: string
  subtitle: string
  tagClassName: string
  trackClassName: string
}

const sourceConfig: Record<SourceKey, SourceConfig> = {
  fitgirl: {
    avatarClassName: "popup-avatar--fitgirl",
    avatarText: "FG",
    label: "FitGirl",
    rowClassName: "anime-row-fitgirl",
    storageKey: FITGIRL_ENABLED_KEY,
    subtitle: "fitgirl-repacks.site",
    tagClassName: "anime-tag-fitgirl",
    trackClassName: "fitgirl-switch"
  },
  dodi: {
    avatarClassName: "popup-avatar--dodi",
    avatarText: "D",
    label: "DODI",
    rowClassName: "anime-row-dodi",
    storageKey: DODI_ENABLED_KEY,
    subtitle: "dodi-repacks.site",
    tagClassName: "anime-tag-dodi",
    trackClassName: "dodi-switch"
  },
  byxatab: {
    avatarClassName: "popup-avatar--byxatab",
    avatarText: "BX",
    label: "ByXatab",
    rowClassName: "anime-row-byxatab",
    storageKey: BYXATAB_ENABLED_KEY,
    subtitle: "byxatab.com",
    tagClassName: "anime-tag-byxatab",
    trackClassName: "byxatab-switch"
  },
  steamrip: {
    avatarClassName: "popup-avatar--steamrip",
    avatarText: "SR",
    label: "SteamRIP",
    rowClassName: "anime-row-steamrip",
    storageKey: STEAMRIP_ENABLED_KEY,
    subtitle: "steamrip.com",
    tagClassName: "anime-tag-steamrip",
    trackClassName: "steamrip-switch"
  },
  ovagames: {
    avatarClassName: "popup-avatar--ovagames",
    avatarText: "OVA",
    label: "OVA Games",
    rowClassName: "anime-row-ovagames",
    storageKey: OVA_GAMES_ENABLED_KEY,
    subtitle: "ovagames.com",
    tagClassName: "anime-tag-ovagames",
    trackClassName: "ovagames-switch"
  }
}

const sourceKeys: SourceKey[] = [
  "fitgirl",
  "dodi",
  "byxatab",
  "steamrip",
  "ovagames"
]

const defaultEnabledBySource: Record<SourceKey, boolean> = {
  fitgirl: true,
  dodi: true,
  byxatab: true,
  steamrip: true,
  ovagames: true
}

const runToggleAnimation = (source: SourceKey, isEnabled: boolean) => {
  animate(`.anime-row-${source}`, {
    scale: [1, 0.96, 1],
    duration: 400,
    easing: "easeOutBack"
  })

  animate(`.anime-tag-${source}`, {
    rotate: isEnabled ? "1turn" : "-1turn",
    scale: isEnabled ? [1, 1.4, 1] : [1, 0.8, 1],
    duration: 800,
    easing: "easeOutElastic(1, .5)"
  })
}

const getStoredEnabledBySource = (
  result: Record<string, unknown>
): Record<SourceKey, boolean> => {
  const nextEnabledBySource = { ...defaultEnabledBySource }

  for (const source of sourceKeys) {
    const storedValue = result[sourceConfig[source].storageKey]
    nextEnabledBySource[source] =
      typeof storedValue === "boolean" ? storedValue : true
  }

  return nextEnabledBySource
}

function PopupIndex() {
  const [enabledBySource, setEnabledBySource] = useState(defaultEnabledBySource)

  useEffect(() => {
    chrome.storage.sync.get(
      sourceKeys.map((source) => sourceConfig[source].storageKey),
      (result) => {
        setEnabledBySource(getStoredEnabledBySource(result))
      }
    )

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "sync") {
        return
      }

      setEnabledBySource((current) => {
        let didChange = false
        const nextEnabledBySource = { ...current }

        for (const source of sourceKeys) {
          const change = changes[sourceConfig[source].storageKey]
          if (!change) {
            continue
          }

          nextEnabledBySource[source] =
            typeof change.newValue === "boolean" ? change.newValue : true
          didChange = true
        }

        return didChange ? nextEnabledBySource : current
      })
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const handleToggle = (source: SourceKey, nextValue: boolean) => {
    setEnabledBySource((current) => ({
      ...current,
      [source]: nextValue
    }))

    chrome.storage.sync.set({ [sourceConfig[source].storageKey]: nextValue })
    runToggleAnimation(source, nextValue)
  }

  return (
    <div className="popup">
      <div className="popup-header">
        <h2 className="popup-title">
          <span className="popup-title-base">Steam</span>
          <span className="popup-title-l">L</span>
          <span className="popup-title-i">I</span>
          <span className="popup-title-b">B</span>
        </h2>

        <div
          aria-label="Steamlib mascot cat"
          className="popup-mascot"
          title="Mascot">
          <img
            alt="Mascot cat"
            className="popup-mascot-image"
            src={mascotCat}
          />
        </div>
      </div>

      <div className="popup-card">
        {sourceKeys.map((source) => {
          const config = sourceConfig[source]
          const isEnabled = enabledBySource[source]

          return (
            <div
              className={[
                "popup-row",
                config.rowClassName,
                !isEnabled ? "popup-row--off" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={source}>
              <div
                className={[
                  "popup-avatar",
                  config.avatarClassName,
                  config.tagClassName
                ].join(" ")}>
                {config.avatarText}
              </div>

              <div className="popup-copy">
                <div className="popup-name">{config.label}</div>
                <div className="popup-subtitle">{config.subtitle}</div>
              </div>

              <label className="popup-toggle">
                <input
                  checked={isEnabled}
                  onChange={(event) =>
                    handleToggle(source, event.currentTarget.checked)
                  }
                  type="checkbox"
                />
                <span
                  className={`popup-toggle-track ${config.trackClassName}`}
                />
              </label>
            </div>
          )
        })}
      </div>

      <div className="popup-footer">
        <button className="popup-action-btn" type="button">
          <span aria-hidden="true" className="popup-action-star">
            *
          </span>
          <span>GitHub</span>
        </button>

        <button className="popup-action-btn" type="button">
          <span>Site</span>
        </button>
      </div>
    </div>
  )
}

export default PopupIndex
