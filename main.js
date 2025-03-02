import { app, BrowserWindow } from "electron";

function createWindow() {
  const win = new BrowserWindow({
    title: "Hamster Run",
    width: 900,
    height: 700,
    icon: "icon.png",
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
