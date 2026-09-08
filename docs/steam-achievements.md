# PokerStrike — Steam Achievements

---

## Stats

| API Name | Type | Description |
|----------|------|-------------|
| `STAT_WAVES_SURVIVED` | INT | Total waves survived (all runs) |
| `STAT_UNITS_SUMMONED` | INT | Total units summoned |
| `STAT_CARDS_SWAPPED` | INT | Total card swaps used |
| `STAT_SPELLS_CAST` | INT | Total spells cast |
| `STAT_RUNS_COMPLETED` | INT | Total runs completed (any outcome) |
| `STAT_LONGEST_RUN_WAVES` | INT | Longest single run in waves |
| `STAT_ROYAL_FLUSHES` | INT | Royal Flush hands played |

---

## Achievements

| API Name | EN Name | KO Name | How to Unlock |
|----------|---------|---------|---------------|
| `ACH_FIRST_HAND` | Ante Up | 첫 베팅 | Play your first hand |
| `ACH_FIRST_PAIR` | On the Board | 첫 페어 | Summon a unit with a Pair |
| `ACH_FIRST_FLUSH` | Flush Surge | 플러시 서지 | Summon a unit with a Flush |
| `ACH_FIRST_FULL_HOUSE` | Full House Defense | 풀 하우스 방어 | Summon a unit with a Full House |
| `ACH_FIRST_ROYAL_FLUSH` | Royal Deployment | 로얄 배치 | Summon a unit with a Royal Flush |
| `ACH_WAVE_10` | Hold the Line | 방어선 사수 | Survive wave 10 |
| `ACH_WAVE_20` | Fortified | 요새화 | Survive wave 20 |
| `ACH_WAVE_30` | Unbreakable | 철옹성 | Survive wave 30 |
| `ACH_SWAP_MASTER` | Card Sharp | 카드 샤프 | Use 50 card swaps total |
| `ACH_SPELL_CASTER` | Spellslinger | 마법 투척사 | Cast 30 spells total |
| `ACH_PERFECT_WAVE` | Perfect Defense | 완벽한 방어 | Survive a wave without losing any defense point |
| `ACH_NO_SWAP_WIN` | Natural Hand | 자연의 패 | Complete a run without using any card swaps |
| `ACH_SPEED_RUN` | Quickdraw | 속사 | Complete a run in under 20 minutes |
| `ACH_ROYAL_COLLECTOR` | High Roller | 하이 롤러 | Play 5 Royal Flush hands total |
| `ACH_POKER_VETERAN` | Poker Veteran | 포커 베테랑 | Survive 300 waves total across all runs |

---

## Implementation Notes

- Steam API: `ISteamUserStats`
- Track hand rank at the moment a unit is summoned (not at card draw)
- `ACH_NO_SWAP_WIN` requires a "swapped this run" flag, reset at run start
- `ACH_PERFECT_WAVE` fires when wave ends with 0 damage to base
- `STAT_LONGEST_RUN_WAVES` updates only when exceeded
- All achievements unlockable in offline single-player
- Replace App ID 480 with real Steamworks App ID before submission
