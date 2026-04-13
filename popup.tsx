import { animate } from "animejs"
import { useEffect, useRef, useState } from "react"

import "./popup.css"
import mascotCat from "./mascot cat.png"

const GOG_ENABLED_KEY = "gogEnabled"
const GOG_GAMES_ENABLED_KEY = "gogGamesEnabled"
const EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY = "externalSourcesDisclaimerSeen"
const FITGIRL_ENABLED_KEY = "fitgirlEnabled"
const DODI_ENABLED_KEY = "dodiEnabled"
const BYXATAB_ENABLED_KEY = "byxatabEnabled"
const STEAMRIP_ENABLED_KEY = "steamripEnabled"
const OVA_GAMES_ENABLED_KEY = "ovaGamesEnabled"
const CS_RIN_ENABLED_KEY = "csrinEnabled"

type SourceKey =
  | "gog"
  | "goggames"
  | "fitgirl"
  | "dodi"
  | "byxatab"
  | "steamrip"
  | "ovagames"
  | "csrin"

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
  gog: {
    avatarClassName: "popup-avatar--gog",
    avatarText: "GOG",
    label: "GOG",
    rowClassName: "anime-row-gog",
    storageKey: GOG_ENABLED_KEY,
    subtitle: "www.gog.com/en",
    tagClassName: "anime-tag-gog",
    trackClassName: "gog-switch"
  },
  goggames: {
    avatarClassName: "popup-avatar--goggames",
    avatarText: "GG",
    label: "GOG Games",
    rowClassName: "anime-row-goggames",
    storageKey: GOG_GAMES_ENABLED_KEY,
    subtitle: "gog-games.to",
    tagClassName: "anime-tag-goggames",
    trackClassName: "goggames-switch"
  },
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
  },
  csrin: {
    avatarClassName: "popup-avatar--csrin",
    avatarText: "CS",
    label: "CS.RIN.RU",
    rowClassName: "anime-row-csrin",
    storageKey: CS_RIN_ENABLED_KEY,
    subtitle: "cs.rin.ru/forum",
    tagClassName: "anime-tag-csrin",
    trackClassName: "csrin-switch"
  }
}

const sourceKeys: SourceKey[] = [
  "gog",
  "goggames",
  "fitgirl",
  "dodi",
  "byxatab",
  "steamrip",
  "ovagames",
  "csrin"
]

const defaultEnabledBySource: Record<SourceKey, boolean> = {
  gog: true,
  goggames: false,
  fitgirl: false,
  dodi: false,
  byxatab: false,
  steamrip: false,
  ovagames: false,
  csrin: false
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
      typeof storedValue === "boolean"
        ? storedValue
        : defaultEnabledBySource[source]
  }

  return nextEnabledBySource
}

const hasEnabledAnyOffByDefaultSource = (
  enabledBySource: Record<SourceKey, boolean>
) =>
  sourceKeys.some(
    (source) => !defaultEnabledBySource[source] && enabledBySource[source]
  )

function PopupIndex() {
  const [enabledBySource, setEnabledBySource] = useState(defaultEnabledBySource)
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
  const [disclaimerSource, setDisclaimerSource] = useState<SourceKey | null>(null)
  const disclaimerDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    chrome.storage.sync.get(
      [
        ...sourceKeys.map((source) => sourceConfig[source].storageKey),
        EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY
      ],
      (result) => {
        setEnabledBySource(getStoredEnabledBySource(result))
        setHasSeenDisclaimer(result[EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY] === true)
      }
    )

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "sync") {
        return
      }

      if (EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY in changes) {
        setHasSeenDisclaimer(
          changes[EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY].newValue === true
        )
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
            typeof change.newValue === "boolean"
              ? change.newValue
              : defaultEnabledBySource[source]
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

  useEffect(() => {
    const dialog = disclaimerDialogRef.current
    if (!dialog) {
      return
    }

    if (isDisclaimerOpen) {
      if (!dialog.open) {
        dialog.showModal()
        dialog.scrollTop = 0
      }
      return
    }

    if (dialog.open) {
      dialog.close()
    }
  }, [isDisclaimerOpen])

  const handleDisclaimerClose = () => {
    const action = disclaimerDialogRef.current?.returnValue
    const source = disclaimerSource

    setIsDisclaimerOpen(false)
    setDisclaimerSource(null)

    if (action === "continue" && source) {
      setHasSeenDisclaimer(true)
      chrome.storage.sync.set({
        [EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY]: true,
        [sourceConfig[source].storageKey]: true
      })
      return
    }

    if (!source) {
      return
    }

    setHasSeenDisclaimer(false)
    setEnabledBySource((current) => ({
      ...current,
      [source]: false
    }))
    chrome.storage.sync.set({
      [EXTERNAL_SOURCES_DISCLAIMER_SEEN_KEY]: false,
      [sourceConfig[source].storageKey]: false
    })
    runToggleAnimation(source, false)
  }

  const handleToggle = (source: SourceKey, nextValue: boolean) => {
    const shouldShowDisclaimer =
      source !== "gog" &&
      nextValue &&
      !hasSeenDisclaimer &&
      !hasEnabledAnyOffByDefaultSource(enabledBySource)

    setEnabledBySource((current) => ({
      ...current,
      [source]: nextValue
    }))

    if (shouldShowDisclaimer) {
      setDisclaimerSource(source)
      setIsDisclaimerOpen(true)
      runToggleAnimation(source, nextValue)
      return
    }

    chrome.storage.sync.set({ [sourceConfig[source].storageKey]: nextValue })
    runToggleAnimation(source, nextValue)
  }

  return (
    <div className="popup">
      <dialog
        aria-labelledby="popup-disclaimer-title"
        className="popup-disclaimer"
        onCancel={(event) => {
          event.preventDefault()
          disclaimerDialogRef.current?.close("cancel")
        }}
        onClose={handleDisclaimerClose}
        ref={disclaimerDialogRef}>
        <div className="popup-disclaimer-badge">DISCLAIMER</div>
        <h3 className="popup-disclaimer-title" id="popup-disclaimer-title">
          Proceed at your own risk
        </h3>
        <p className="popup-disclaimer-subtitle">
          SteamLIB is not responsible for anything that happens once you leave.
        </p>
        <p className="popup-disclaimer-copy">
          Turning on extra sources opens third-party websites. SteamLIB only
          creates search links and does not host, verify, or control those
          sites or their content.
        </p>
        <p className="popup-disclaimer-copy popup-disclaimer-copy--tight">
          SteamLIB disclaims all liability for:
        </p>
        <ul className="popup-disclaimer-list">
          <li className="popup-disclaimer-item">
            Any misuse of SteamLIB, including use of third-party sites, search
            links, or content accessed after leaving the extension.
          </li>
          <li className="popup-disclaimer-item">
            Legal issues, including DMCA claims or intellectual property
            disputes, arising from your use of third-party services or content
            reached through SteamLIB.
          </li>
          <li className="popup-disclaimer-item">
            Any damages, losses, or liabilities resulting from your use of
            SteamLIB or external sites, including data loss, device issues, or
            legal consequences.
          </li>
        </ul>
        <p className="popup-disclaimer-copy">
          You are responsible for what you open and for following each site&apos;s
          terms and your local laws.
        </p>
        <form className="popup-disclaimer-actions" method="dialog">
          <button
            className="popup-disclaimer-btn popup-disclaimer-btn--cancel"
            value="cancel">
            Cancel
          </button>
          <button
            className="popup-disclaimer-btn popup-disclaimer-btn--continue"
            value="continue">
            Continue
          </button>
        </form>
      </dialog>

      <div className="popup-header">
        <h2 className="popup-title">
          <span className="popup-title-base">Steam</span>
          <span className="popup-title-l">L</span>
          <span className="popup-title-l">I</span>
          <span className="popup-title-l">B</span>
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
        <div className="popup-footer-help">
          Support me by starring on GitHub and rating it!
        </div>

        <a
          className="popup-action-btn"
          href="https://github.com/NubPlayz/SteamLIB"
          rel="noopener noreferrer"
          target="_blank">
          <span aria-hidden="true" className="popup-action-star">
            ☆
          </span>
          <span>GitHub</span>
        </a>

        <a
          className="popup-action-btn"
          href="https://steamlib-by-nubplayz.vercel.app"
          rel="noopener noreferrer"
          target="_blank">
          <span>Site</span>
        </a>
      </div>
    </div>
  )
}

export default PopupIndex
