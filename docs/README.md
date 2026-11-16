# 麻雀諗文件

目前發行為 **Version 1 · Release 1（1.0.0／Build 1）**，UAT 於 2026 年 11 月 17 日（香港時間）確認完成。正式原始碼分支為 `main`，標籤為 `v1.0.0`。

麻雀諗是實體牌桌香港麻雀記分工具，名稱第三字為「諗」（U+8AD7），不是可打牌的麻雀遊戲。

| 文件 | 用途 |
|---|---|
| [releases/v1.0.0.md](releases/v1.0.0.md) | 首次發行範圍、來源、版本及驗證紀錄 |
| [deployment.md](deployment.md) | Android APK、免費 iPhone 安裝及續簽、EAS／TestFlight、離線驗證及常見問題（英文） |
| [guide.md](guide.md) | 計分、牌局行為及產品決定；保留影片證據與推論的區別 |
| [product.md](product.md) | 產品規則入口 |
| [features.md](features.md) | 目前已實作的功能及介面操作 |
| [development.md](development.md) | 開發背景及第二次發行的電視顯示方案 |
| [../app/README.md](../app/README.md) | 安裝、Expo Go、驗證及素材產生指令 |
| [../design-system/mjlum/MASTER.md](../design-system/mjlum/MASTER.md) | 已採用的設計系統 |
| [../design-system/mjlum/IMPLEMENTATION.md](../design-system/mjlum/IMPLEMENTATION.md) | 實際頁面及共用元件 |
| [ui-ux-pro-max-skill.md](ui-ux-pro-max-skill.md) | 設計技能安裝及使用背景 |

## 範圍與證據

首版只支援香港麻雀，資料留在單一裝置，無帳號、無廣告、無雲端或資料分享。第二次發行規劃無線電視比分顯示；台灣、日本、碰槓牌及港式台灣等其他玩法在其後考慮。

`guide.md` 仍區分「麻雀諗產品決定」、「參考影片已證實」及「未指定」。發行命名不會把建議公式變成影片證據；現有不支援的計分組合繼續由程式阻止。
