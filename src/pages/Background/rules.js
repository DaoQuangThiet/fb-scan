const allResourceTypes = Object.values(
  chrome.declarativeNetRequest.ResourceType
);

export default [
  {
    id: 1,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'origin',
          value: 'https://www.facebook.com',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'sec-fetch-site',
          value: 'same-origin',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'sec-fetch-mode',
          value: 'cors',
        },
      ],
    },
    condition: {
      urlFilter: 'https://www.facebook.com',
      resourceTypes: allResourceTypes,
    },
  },
  {
    id: 2,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'origin',
          value: 'https://business.facebook.com',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'sec-fetch-site',
          value: 'same-origin',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'sec-fetch-mode',
          value: 'cors',
        },
      ],
    },
    condition: {
      urlFilter: 'https://business.facebook.com',
      resourceTypes: allResourceTypes,
    },
  },
  {
    id: 3,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'origin',
          value: 'https://business.facebook.com',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'sec-fetch-site',
          value: 'same-origin',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'sec-fetch-mode',
          value: 'cors',
        },
      ],
    },
    condition: {
      urlFilter: 'https://graph.facebook.com',
      resourceTypes: allResourceTypes,
    },
  },
];
