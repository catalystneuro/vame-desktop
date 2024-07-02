import { ipcRenderer } from "electron"

export type VameActivities = {
  onConnected: (callback: () => void, count?: number) => Promise<void>
  onVAMEReady: (callback: () => void, count?: number) => Promise<void>
}

export const onConnected: VameActivities["onConnected"] = async (callback, count = 0) => {
  const connected = await ipcRenderer.invoke("vame:connected")
  if (connected) {
    callback()
  } else if (count > 3) {
    Promise.reject(new Error("Maximum retries"))
  } else {
    onConnected(callback, count + 1)
  }
}

export const onVAMEReady: VameActivities["onConnected"] = async (callback: () => void, count = 0) => {
  const ready = await ipcRenderer.invoke("vame:ready")
  if (ready) {
    callback()
  } else if (count > 3) {
    Promise.reject(new Error("Maximum retries"))
  } else {
    onVAMEReady(callback, count + 1)
  }
}

ipcRenderer.on("vame:started", () => {
  console.log(`Checking Python server status...`)
  onConnected(() => {

    console.log(`Python server is active...`)

    console.log(`Loading VAME library...`)

    ipcRenderer.invoke("vame:ready")
      .then(() => console.log(`VAME is ready!`))
      .catch(() => console.error(`Failed to connect to VAME`))
  })
    .catch(() => console.error(`Python server is not active...`))
})
