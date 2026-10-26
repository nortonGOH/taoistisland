# 多層次道教思想史：閱讀與載入修正版

本次修改以 `nortongoh/taoistisland` 原始碼（基準提交 `4bbe124`）為基礎，保留原有 3D 模型及 `islands.json` 的 30 個節點內容。

## 已完成

- 節點文字先行更新，鏡頭控制另行處理；3D 初始化失敗不再阻斷閱讀。
- WebGL 不可用、3D 套件缺失或繪圖環境中斷時，自動提供文字閱讀模式。
- 從資料自動建立完整的 30 節點清單，可搜尋原文、概念、經名及關鍵詞，並依四種主題篩選。
- 節點與閱讀模式寫入網址，例如 `#node=lingbao_daluo&mode=researcher`；可複製網址分享，重新載入仍保留選取狀態。
- 資料載入失敗顯示錯誤及重試按鈕，不再宣稱已載入不存在的備援資料庫。
- 加大閱讀區字體、允許選取複製、改善窄螢幕排版，避免底部模式列遮住最後節點。
- 補上鍵盤焦點、關閉按鈕名稱、搜尋標籤與選取狀態；專題視窗支援 Escape、焦點限制及關閉後返回原控制項。
- 將「文獻已審查」改為「引文與版本待核」，並將原典圖像欄標明為待核線索。
- 樣式、Three.js、OrbitControls 與 TWEEN 均隨網站附帶，不再需要執行時連線至外部 CDN。

## 更新 GitHub Pages

將本套件的 `index.html`、`reader.css`、`islands.json` 與整個 `vendor/` 目錄放在原網站發布目錄的相同位置。先備份原始檔，再提交變更，等待現有 GitHub Pages 發布流程完成。

`index.html` 必須連同上述檔案使用；只替換 HTML 會缺少樣式與 3D 元件。本套件尚未提交至遠端，也尚未變更線上網站。

## 本機檢視

在本目錄啟動靜態伺服器：

```sh
python -m http.server 8000
```

Windows 亦可使用 `py -m http.server 8000`。以瀏覽器開啟 `http://localhost:8000`。請不要直接雙擊 HTML 使用 `file://` 開啟，因為瀏覽器可能阻擋 JSON 資料的讀取。

## 維護與測試

一般發布不需要 Node.js 或安裝套件。修改 Tailwind 類別後，可重新產生隨附樣式：

```sh
npm ci
npm run build:css
```

執行互動回歸測試：

```sh
npx playwright install chromium
npm test
```

測試包括正常 3D、強制停用 WebGL、3D 套件缺失的 390px 窄螢幕、資料載入失敗；逐一檢查 30 個節點、三種閱讀模式、搜尋、主題篩選、網址還原、彈窗與未處理例外，另檢查文字／3D 切換、調整視窗與繪圖環境中斷後的備援。截圖存於 `test-results/`。

若使用已安裝的 Chromium，可設定 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向執行檔。

## 學術內容範圍

本次為程式與介面修正，沒有替原始引文新增未經查證的卷頁、年代、影像、連結或書目。`islands.json` 維持原始內容；既有學術主張仍須另行核對。

空間鄰近、對稱或並置不應直接被解讀為歷史承繼或同一時期的固定體系。後續可為每個節點補入原典版本、定位、來源連結與逐項核對紀錄。

## 第三方套件

- Three.js / OrbitControls：0.128.0，MIT；見 `vendor/THREE-LICENSE.txt`。
- TWEEN：18.6.4，MIT；見 `vendor/TWEEN-LICENSE.txt`。
- Tailwind CSS：3.4.17，MIT；見 `vendor/TAILWIND-LICENSE.txt`。

第三方套件版本延續原站的 3D 相容性，未在本次改版中升級 Three.js API。
