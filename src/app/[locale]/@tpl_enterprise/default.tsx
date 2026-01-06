/**
 * @tpl_enterprise 的 fallback 组件
 * 当路由在 @tpl_enterprise 中不存在时使用
 * 返回 null 让全局页面（children）显示
 */
export default function DefaultSlot() {
  return null;
}
