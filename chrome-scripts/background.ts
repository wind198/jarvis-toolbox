chrome.tabs.onActivated.addListener((...params) => {
  console.log('onActivated', params)
  const [tabInfo] = params
  chrome.tabs.get(tabInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      console.warn('Unable to get tab info', chrome.runtime.lastError)
      return
    }
    chrome.storage.local.set({
      JARVIS_TOOLBOX_LAST_TAB_CHANGE: {
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
      },
    })
  })
})
chrome.tabs.onUpdated.addListener((...params) => {
  console.log('onUpdated', params)
  const [tabId, _, tabStatus] = params
  if (!tabStatus.url || !tabStatus.title) {
    return
  }
  chrome.storage.local.set({
    JARVIS_TOOLBOX_LAST_TAB_CHANGE: {
      tabId,
      url: tabStatus.url,
      title: tabStatus.title,
    },
  })
})

// chrome.runtime.onMessage.addListener((message) => {
//   if (message.type === 'EXTRACT_DOM') {
//     console.log('EXTRACT_DOM')
//     chrome.scripting.executeScript(
//       {
//         target: { tabId: message.tabId },
//         func: () => {
//           return document.body
//         },
//       },
//       (results) => {
//         if (chrome.runtime.lastError) {
//           console.error(chrome.runtime.lastError.message)
//         } else {
//           chrome.runtime.sendMessage({
//             type: 'DOM_EXTRACTED',
//             dom: results[0].result,
//           })
//         }
//       },
//     )
//   }
// })
