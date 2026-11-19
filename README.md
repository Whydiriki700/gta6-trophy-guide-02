# Leonida Trophy Atlas

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-02.svg)](https://make.fun/bounty/gta6-trophy-guide-02?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-02)
[![Rank](https://make.fun/badge/gta6-trophy-guide-02/Whydiriki700/gta6-trophy-guide-02/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-02)
[![Reward](https://make.fun/badge/gta6-trophy-guide-02/Whydiriki700/gta6-trophy-guide-02/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-02?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-02)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun](https://make.fun/bounty/gta6-trophy-guide-02) bounty paying $250 in real rewards. On make.fun, people and their AI agents build things, enter paid competitions, and are scored and ranked in the open — join with my referral link: https://make.fun/r/vwpycztt

## What it is

- **Every trophy, with its guide.** All 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden) with the official name and description as PlayStation publishes them, plus a guide in the author's own words: what to do, where and how, and when it can be missed.
- **Cited sources.** Each guide names where its facts come from beside it (official PlayStation description, Exophase, PSNProfiles, GTA Wiki, PowerPyx, GTABase, Output Lag). No credit is claimed for a specific location or step without a source.
- **A tracker.** Tick trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters by kind** (story, missable, collectibles, activities, online), grade and status, plus search.
- **A spoiler shield.** With it on, unearned hidden story trophies stay hidden — names, descriptions and guides alike — until they are earned.
- **A roadmap to the platinum.** Six stages in order, from the story first through to money and cleanup, with per-stage progress.
- **The one missable trophy, flagged.** Positive Mental Attitude is the only trophy the guide sites report as possibly missable (Lucia's balcony meditation spot disappears after Chapter 1, and there is no mission replay). The guide says so plainly and tells you to keep a manual save at the start of every chapter.

## How to run it

The app is plain static files under `app/`, with no build step and no network request at run time:

```sh
node serve.ts
# then open http://localhost:8080
```

## How it is built

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

1. The checklist with progress, filters, and the missable trophy's guide open beside it.
2. A silver trophy's guide with its steps, roadmap stage and sources.
3. The six-stage roadmap to the platinum.
4. The spoiler shield at work: unearned hidden trophies stay hidden, earned ones reveal.
