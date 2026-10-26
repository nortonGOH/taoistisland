# 道教宇宙空間更新

本次改善：

1. 中央土一氣改用斜上方聚焦，避開南方火徽章。鏡頭預留側欄或手機底部閱讀區；關閉內容卡後還原全幅投影。
2. 三清勝境仍屬靈寶第五層，改為後方一座、前方兩座的三角境臺，搭配一炁分流、三角輪廓與十二個炁流粒子。三境可分別點選並標示對應內容。三角配置為教學設計，不代表史料記載的方位與尊卑。
3. 參考桃園政策島內容卡片的大標題、摘要、分區卡片與獨立捲動，保留深空藍、紫色星光與金色點綴。手機使用底部閱讀卡。保留三種閱讀模式與專題視窗。
4. 延續東木綠色長方形、南火紅色三角形、西金白色圓形、北水黑色波浪與青藍流光、中土黃色正方形及朱紅天文示意核心。

本次未重新考證原有學術文字；核心為文字與幾何示意，並非古代符篆摹本。

套件已包含 vendor/ 與授權檔，可整包放入靜態網站目錄，不需上傳 node_modules/。本次未發布線上網站。

本機執行 python -m http.server 8000（Windows 可改用 py），再開啟 http://localhost:8000 。請不要使用 file:// 開啟，以免 JSON 載入受阻。

驗證已在 Chromium / SwiftShader 載入完整 WebGL 場景，檢查中央與南方徽章投影不重疊、三角頂點、十二個炁流粒子、三境實際滑鼠點選、桌面與 390px 手機閱讀區、Escape 關閉視窗、關閉側欄還原投影，以及全部 30 個節點的三種閱讀模式；未出現未處理的 JavaScript 例外。

重跑：npm ci，npx playwright install chromium，npm test。可用 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH 指向已安裝的 Chromium。截圖產生於 test-results/；原附件未提供的舊測試未列入驗證。

更新樣式：npm run build:css。

第三方套件：Three.js / OrbitControls 0.128.0、TWEEN 18.6.4、Tailwind CSS 3.4.17，均為 MIT 授權，見 vendor/ 授權檔。
