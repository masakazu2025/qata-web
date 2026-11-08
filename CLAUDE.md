# qata-web

qata の web です。テストケースの一覧・人の確認（承認）・実行と、実行の結果とスクショの表示を受け持ちます。server の REST API だけを使います。

**契約と全体の要件は `../qata/` を見る。** 契約の正は `../qata/contracts/`。全体に関わる issue と idea は `../qata/docs/` に上げる。

- 概要：[README.md](README.md)
- タスク：[docs/tasks.md](docs/tasks.md)
- 決めたこと（この部品だけのもの）：[docs/decisions.md](docs/decisions.md)
- 作業の記録：[docs/log.md](docs/log.md)
- セッションの始めと終わり：親のスキル `../qata/.claude/skills/session-start/SKILL.md`・`../qata/.claude/skills/session-end/SKILL.md` に沿う

親のルール：

@../qata/.claude/rules/general/working.md
@../qata/.claude/rules/general/autonomy.md
@../qata/.claude/rules/general/git.md
@../qata/.claude/rules/general/parent-and-children.md
@../qata/.claude/rules/general/rules-and-skills.md
@../qata/.claude/rules/qata/repos-and-contracts.md
