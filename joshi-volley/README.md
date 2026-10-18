# 女子バレー物語 ― 構成説明（外部SE向け）

## 1. ファイル一覧（全部で6つのコード + 補助）
- index.html …… 画面の「入れ物」だけ。ロジックは持たない。最後に3つのJSを順に読み込む。
- css/style.css …… 見た目のすべて。色は先頭の :root 変数で一括変更。
- js/data.js …… 【中身のデータ】部員・実績・台本・数値設定・BGMパス。内容を増やすときは基本ここだけ触る。
- js/engine.js …… 【共通部品】①セーブ(Cfg/Save) ②音とBGM(Snd/Bgm) ③立ち絵(art関数) ④ノベル再生(Novel)。ルールは持たない。
- js/game.js …… 【ゲーム本体】状態S・ルール・画面描画・ボタン操作。
- sw.js / manifest.webmanifest / icons/icon.svg …… アプリ化(PWA)用。ゲームロジックとは無関係。
- audio/ …… BGMファイル置き場（現在は空）。

## 2. 読み込み順と依存関係（上が先、下は上を使う）
data.js → engine.js → game.js
- engine.js は data.js の BGM を読む（Bgm）。ノベルは art() を使う（同じファイル内）。
- game.js は data.js（CFG, CAST, POOL, ACH, SCENES, HAREM）と engine.js（Cfg, Save, Snd, Bgm, art, Novel）を使う。
- data.js と engine.js は game.js を知らない（逆向きの依存なし）。

## 3. 1回の操作で何が起きるか（流れ）
ボタンをクリック → index.html の onclick が game.js の関数を呼ぶ（例 coach(), endWeek()）
→ 状態 S（部員M・卒業生A・年y・月w・行動力ap・実績ach・フラグfl）を書き換える
→ after() が ①恋愛イベント ②ハーレムイベント判定（SCENES→Novel.play） ③実績判定 ④Save.write で自動保存 → draw() で再描画。
- 画面の描画は draw() の1か所だけ。HTMLのidに文字を流し込む方式。
- 月送りは endWeek()：ランダムイベント→嫉妬(jealous)→大会(4か月ごと)→年度末なら graduate()→卒業シーン→banner()（○年目○か月目）→after()。
- 効果音は Snd.play("名前")。全ボタンのクリック音は engine.js 内の1つのリスナーが担当。

## 4. 状態Sの中身（保存される単位。localStorageのキー joshiVolley.save.v1）
S = { y:年, w:月(1-12), ap:行動力, wins:大会勝利数, weeks:通算月数, cur:表示中の部員番号, M:[部員], A:[卒業生], ach:{実績ID:1}, fl:{イベント済みフラグ}, no:背番号の連番 }
部員 = { n名前, g学年(1-3), pos, hair, eye, style, no, s:{srv,rcv,atk,stm}, mood, love(=顧問への愛), ev:[恋愛イベント済み], L:[台詞3つ], img:画像パス }
設定は別キー joshiVolley.cfg（音量・BGM・ミュート）。

## 5. 「これを変えたい」→「触る場所」
- 好感度の上がり方/初期値/イベント閾値/部員上限 → data.js の CFG
- 初期部員の追加・変更 → data.js の CAST（新入部員は game.js の fresh() が POOL から自動生成。好感度は35〜85）
- 立ち絵を画像にする → 部員の img にパス（例 "img/rin.png"）。縦長推奨。未指定なら仮SVG(art)
- BGM追加 → audio/ にファイル置き、data.js の BGM に {main:"audio/xx.mp3", novel:"…"} 。曲の切替は Bgm.play("名前")
- 実績 → data.js の ACH（ok関数で条件を書く）
- ノベル/ハーレムの台本 → data.js の SCENES と HAREM
- 大会の強さ → game.js の endWeek() 内 const o=…
- 見た目 → css/style.css（色は :root）
- 画面構成を変える → index.html（id名は game.js が参照しているので変更時は両方）

## 6. 注意
- ファイルを直接開く(file://)場合、アプリ化(sw.js)は動かない。https か localhost で配信する。
- 画像・BGMを増やしたら sw.js の F 配列に追記するとオフラインでも使える。
