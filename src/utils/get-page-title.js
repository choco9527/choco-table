import defaultSettings from '@/settings'

const title = defaultSettings.title || '有量智投'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
