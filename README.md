# <img width="128" height="128" alt="Buzo" src="https://github.com/user-attachments/assets/2331d037-3bba-48b7-8ba4-4c3dbfd121a8" /> SteamLib

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=googlechrome)]()
[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--ons-orange?logo=firefox)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)



**Open any Steam game page on GOG , Fitgirl , Dodi or more in one click.**

SteamLib is a free, open source browser extension that injects source badges directly onto Steam game pages. Making your steam browsing efficient.

Learn more on [Offical site]([https://goodlib.vercel.app](https://steamlib-by-nubplayz.vercel.app))



## Features



<img width="1280" height="800" alt="a" src="https://github.com/user-attachments/assets/137534dc-8369-4c93-a5eb-8fb3bd54dd7c" />





- **One-click access** : badges appear directly on Steam game page linking straight to the searched result
- **No more copying titles and searching manually** 
- **Toggleable sources** : enable or disable individual sources from the popup (e.g. only show Fitgirl and Dodi, hide GOG)
- **Animated UI** : powered by Anime.js v4
- **Zero data collection** : the extension only activates on supported Game pages, collects nothing, and stores only your source toggle preferences locally
- **Cross-browser** : works on Chrome (MV3) and Firefox (MV2)



## Demo 


here i will insert video.







## Install

| Browser | Link |
|---|---|
| Chrome | [Chrome Web Store]() |
| Firefox | [Firefox Add-ons]() |
| Firefox Mobile | [Firefox Add-ons]() |



## Supported Sources


 - GOG
 - Fitgirl
 - Dodi
 - XAtab
 - Steamrip
 - Ovagames
> More sources planned based on feedback.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | [Plasmo](https://docs.plasmo.com/) 0.90.5 |
| Language | TypeScript 5.3.3 |
| UI | React (popup) |
| Animations | Anime.js |
| Package Manager | pnpm |
| Manifest | MV3 (Chrome)  & (MV2) Firefox) |



## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Development

```bash
git clone https://github.com/NubPlayz/SteamLIB
cd SteamLIB
pnpm install

```

### Dev 

Run this command :
```
pnpm dev
```

Then load `build/chrome-mv3-dev` as an unpacked extension in Chrome, or the equivalent Firefox build directory.


## Privacy

SteamLib requests host permissions only for game pages:

- `https://store.steampowered.com/app/*`
- `https://store.steampowered.com/agecheck/app/*`


- No user data is collected or transmitted
- Source toggle preferences are stored locally via the `storage` permission


Approved on both the Chrome Web Store and Firefox Add-ons.



## Contributing

Issues and PRs are welcome. If a source URL has changed or you want a new source added, open an issue.


## Disclaimer

Stemalib is a search tool (Extension ) that displays results from external metadata providers and sources.
It does not host, store, or distribute any content.
The developers are not responsible for how the tool is used or what is accessed through it.

Users are solely responsible for:

- Ensuring they have the legal right to download any material they access
- Complying with copyright laws and intellectual property rights in their jurisdiction
- Understanding and accepting the terms of any sources they configure
- Use of this tool is entirely at your own risk.
 
SteamLIB is not affiliated with, endorsed by, or associated with Steam, GOG, or any third-party distributors.
 

## License

MIT
