# 麻雀諗 App

Version 1 · Release 1：`1.0.0`，iOS build `1`，Android version code `1`，Expo extra release `1`。發行紀錄見 [v1.0.0](../docs/releases/v1.0.0.md)。

## 環境及執行

使用 Node.js 22.13+（22.x）或 24.3+（24.x）及 npm；相依版本以 `package-lock.json` 為準。技術基礎為 Expo SDK 58、React Native 0.88、Expo Router 及 SQLite。

在本目錄執行：

```powershell
npm ci
npx expo start --go --lan
```

手機與電腦連接同一 Wi-Fi，掃描 Terminal 的 QR Code，以 Expo Go 開啟。測試期間保持 Terminal 運行。若介面仍顯示舊版，先確認已更新對應 Git 分支，再使用：

```powershell
npx expo start --go --lan --clear
```

## 驗證

```powershell
npm run lint
npx tsc --noEmit
npm test
```

## 原始碼及資料

- `src/app/`：Expo Router 頁面；牌桌、記分、紀錄、找數及統計共用 `/session` 內部面板。
- `src/session/`、`src/score/`、`src/rules/`：牌局、精確分數及玩法規則。
- `src/storage/`：iOS／Android 本機 SQLite 儲存。
- `src/components/`：表格、數字鍵盤、雙端滑桿、擲骰動畫、載入畫面及共用按鈕。
- 網頁使用記憶體資料庫，只供預覽；重新載入會清除該次網頁資料。

## 品牌素材

修改 `src/constants/brand.ts` 後執行 `npm run generate:brand`，產生 App 圖示、Android adaptive icon、啟動畫面圖案及 favicon。匯出工具只屬開發相依套件。

Expo Go 可測試介面及程式內載入畫面；完整原生啟動畫面及手機桌面圖示需以獨立安裝版驗證。Native build、簽署及商店上架是另外的發佈步驟；今次 `main` 發行不會自動產生或上載安裝檔。
