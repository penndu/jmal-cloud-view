const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  lang: state => state.app.lang,
  token: state => state.user.token,
  shareToken: state => state.user.shareToken,
  shareId: state => state.user.shareId,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  showName: state => state.user.showName,
  newVersion: state => state.user.newVersion,
  iframePreviewConfig: state => state.user.iframePreviewConfig,
  userId: state => state.user.userId,
  userInfo: state => state.user.userInfo,
  menuList: state => state.user.menuList,
  fileClipboard: state => state.fileClipboard,
  exactSearch: state => state.user.exactSearch
}
export default getters
